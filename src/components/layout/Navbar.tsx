
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, ShoppingBag, Grid, ImageIcon, Phone, User, Camera, LogOut, LayoutDashboard, Truck, Package, Bell, BellRing, Star, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CONTACT_INFO, ADMIN_EMAILS } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { formatPrice } from '@/utils/currency';
import { toDate, formatDate } from '@/utils/date';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NAV_LINKS = [
  { name: 'Home', href: '/', icon: Grid },
  { name: 'Shop', href: '/shop', icon: ShoppingBag },
  { name: 'Track', href: '/track', icon: Truck },
  { name: 'Photography', href: '/photography', icon: Camera },
  { name: 'Gallery', href: '/gallery', icon: ImageIcon },
  { name: 'Contact', href: '/contact', icon: Phone },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemCount, setIsCartOpen } = useCart();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  
  const adminDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user]);
  const { data: adminRole } = useDoc(adminDocRef);
  const isSuperAdmin = user?.uid === '30S6HkIJXKWWSrmlLD8c8GBskst1';
  const isAdmin = Boolean(
    adminRole ||
    isSuperAdmin ||
    (user?.email && ADMIN_EMAILS.includes(user.email))
  );

  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  // Load and save read notification IDs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_read_notifications');
      if (saved) {
        try {
          setReadNotificationIds(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!firestore || !isAdmin) return;
    
    let unsubscribe: () => void;
    
    const initSub = async () => {
      const { OrdersService } = await import('@/services/orders.service');
      const ordersService = new OrdersService(firestore);
      unsubscribe = ordersService.subscribeToOrders((data) => {
        setOrders(data);
      });
    };
    
    initSub();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [firestore, isAdmin]);

  const markAsRead = (id: string) => {
    setReadNotificationIds(prev => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem('admin_read_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const notifications = useMemo(() => {
    const list: any[] = [];
    orders.forEach(order => {
      const orderIdShort = order.orderId || order.id.slice(0, 6);
      const orderDate = toDate(order.createdAt);
      
      list.push({
        id: `new_order_${order.id}`,
        type: 'new_order',
        title: 'New Order Placed',
        description: `Order #${orderIdShort} placed by ${order.customerName} for ${formatPrice(order.total)}.`,
        timestamp: orderDate,
        orderId: order.id,
        order: order,
        read: readNotificationIds.includes(`new_order_${order.id}`)
      });

      if (order.feedback) {
        const feedbackDate = new Date(order.feedback.createdAt);
        list.push({
          id: `feedback_${order.id}`,
          type: 'feedback',
          title: 'New Feedback Received',
          description: `${order.feedback.rating} ★ review by ${order.customerName} on #${orderIdShort}: "${order.feedback.comment.slice(0, 40)}${order.feedback.comment.length > 40 ? '...' : ''}"`,
          timestamp: feedbackDate,
          orderId: order.id,
          order: order,
          read: readNotificationIds.includes(`feedback_${order.id}`)
        });
      }

      if (order.returnRequest) {
        const returnDate = toDate(order.returnRequest.createdAt);
        list.push({
          id: `return_${order.id}`,
          type: 'return_request',
          title: 'Return Request Submitted',
          description: `Return (${order.returnRequest.status}) requested by ${order.customerName} for #${orderIdShort}.`,
          timestamp: returnDate,
          orderId: order.id,
          order: order,
          read: readNotificationIds.includes(`return_${order.id}`)
        });
      }
    });

    return list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [orders, readNotificationIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotificationIds(allIds);
    localStorage.setItem('admin_read_notifications', JSON.stringify(allIds));
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled ? 'glass h-16 md:h-20 shadow-lg' : 'bg-transparent h-20 md:h-28'}`}>
      <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        
        {/* Logo Section - Scaled for Mobile */}
        <Link href="/" className="flex items-center gap-2 md:gap-4 shrink-0 group">
          <div className="relative w-10 h-10 md:w-14 md:h-14 transition-transform duration-700 group-hover:scale-110">
            <Image
              src={CONTACT_INFO.headerLogo}
              alt="PGK GIFTS"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-headline font-bold text-xl md:text-2xl tracking-tighter text-foreground leading-none uppercase">PGK GIFTS</span>
            <span className="hidden sm:inline-block text-[8px] md:text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground mt-0.5 md:mt-1 whitespace-nowrap">
              {CONTACT_INFO.tagline}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all relative group/link"
              >
                {link.name}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-primary transition-all duration-500 group-hover/link:w-full" />
              </Link>
            ))}
          </div>

          <div className="h-8 w-px bg-border/50" />

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 hover:bg-secondary rounded-2xl transition-all group"
            >
              <ShoppingBag className="w-6 h-6 transition-transform group-hover:scale-110" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge className="h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground rounded-full border-2 border-background">
                      {itemCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <ThemeToggle />

            {isAdmin && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-2xl h-12 w-12 hover:bg-secondary border border-border/50 shadow-sm relative flex items-center justify-center"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                >
                  {unreadCount > 0 ? (
                    <BellRing className="w-5 h-5 text-primary animate-bounce" />
                  ) : (
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full shadow-lg" />
                  )}
                </Button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-4 w-80 md:w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-border/40 flex justify-between items-center bg-secondary/20">
                      <h3 className="font-headline font-bold text-xs md:text-sm text-foreground flex items-center gap-2">
                        <Bell className="w-4 h-4 text-primary" /> Activity Center
                      </h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto divide-y divide-border/30 custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-xs">
                          No activity notifications.
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => {
                              markAsRead(notif.id);
                              setIsNotifOpen(false);
                              router.push(`/admin?viewOrder=${notif.orderId}`);
                            }}
                            className="p-4 hover:bg-secondary/40 cursor-pointer transition-colors flex gap-3 items-start text-left bg-card"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              notif.type === 'new_order' ? 'bg-green-500/10 text-green-600' :
                              notif.type === 'feedback' ? 'bg-amber-500/10 text-amber-600' :
                              'bg-blue-500/10 text-blue-600'
                            }`}>
                              {notif.type === 'new_order' ? <ShoppingBag className="w-4 h-4" /> :
                               notif.type === 'feedback' ? <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> :
                               <AlertCircle className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between items-start gap-1">
                                <p className="text-xs font-bold text-foreground truncate">{notif.title}</p>
                                {!notif.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug break-words">{notif.description}</p>
                              <span className="text-[9px] text-muted-foreground/60 block mt-1">
                                {formatDate(notif.timestamp)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-2xl p-0 hover:bg-secondary border border-border/50 shadow-sm">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mt-4 rounded-[2rem] p-4 shadow-2xl border-border/50 bg-card" align="end">
                  <DropdownMenuLabel className="font-normal px-2 pb-3">
                    <div className="flex flex-col space-y-2">
                       <p className="text-sm font-bold leading-none">{user.displayName || 'Distinguished Member'}</p>
                       <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="opacity-50" />
                  
                  <DropdownMenuItem asChild className="cursor-pointer rounded-xl h-11 transition-colors hover:bg-secondary">
                    <Link href="/track" className="flex items-center w-full">
                      <Package className="mr-3 h-4 w-4 opacity-70" /> My Orders
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl h-12 mt-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      <Link href="/admin" className="flex items-center w-full">
                        <LayoutDashboard className="mr-3 h-4 w-4" /> Management Portal
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator className="opacity-50 my-1" />
                  
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer rounded-xl h-11 hover:bg-destructive/10">
                    <LogOut className="mr-3 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline" size="icon" className="rounded-2xl h-12 w-12 border-2 border-border shadow-sm hover:bg-secondary transition-all">
                <Link href="/login"><User className="w-5 h-5" /></Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Toggle & Actions */}
        <div className="lg:hidden flex items-center gap-1 md:gap-4">
          <ThemeToggle />

          {isAdmin && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-10 w-10 hover:bg-secondary border border-border/50 shadow-sm relative flex items-center justify-center"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                {unreadCount > 0 ? (
                  <BellRing className="w-5 h-5 text-primary animate-bounce" />
                ) : (
                  <Bell className="w-5 h-5 text-muted-foreground" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full shadow-lg" />
                )}
              </Button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 border-b border-border/40 flex justify-between items-center bg-secondary/20">
                    <h3 className="font-headline font-bold text-xs text-foreground flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" /> Activity Center
                    </h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[280px] overflow-y-auto divide-y divide-border/30 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground text-xs">
                        No activity notifications.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => {
                            markAsRead(notif.id);
                            setIsNotifOpen(false);
                            router.push(`/admin?viewOrder=${notif.orderId}`);
                          }}
                          className="p-3 hover:bg-secondary/40 cursor-pointer transition-colors flex gap-2.5 items-start text-left bg-card"
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            notif.type === 'new_order' ? 'bg-green-500/10 text-green-600' :
                            notif.type === 'feedback' ? 'bg-amber-500/10 text-amber-600' :
                            'bg-blue-500/10 text-blue-600'
                          }`}>
                            {notif.type === 'new_order' ? <ShoppingBag className="w-3.5 h-3.5" /> :
                             notif.type === 'feedback' ? <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> :
                             <AlertCircle className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-start gap-1">
                              <p className="text-xs font-bold text-foreground truncate">{notif.title}</p>
                              {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug break-words">{notif.description}</p>
                            <span className="text-[8px] text-muted-foreground/60 block mt-1">
                              {formatDate(notif.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0 hover:bg-secondary border border-border/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 mt-3 rounded-2xl p-3 shadow-2xl border-border/50 bg-card" align="end">
                <DropdownMenuLabel className="font-normal px-2 pb-2">
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-bold leading-none">{user.displayName || 'Member'}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="opacity-50" />
                <DropdownMenuItem asChild className="cursor-pointer rounded-xl h-10">
                  <Link href="/track" className="flex items-center w-full">
                    <Package className="mr-3 h-4 w-4 opacity-70" /> My Orders
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="cursor-pointer rounded-xl h-10 bg-primary/10 text-primary">
                    <Link href="/admin" className="flex items-center w-full">
                      <LayoutDashboard className="mr-3 h-4 w-4" /> Management
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="opacity-50 my-1" />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer rounded-xl h-10 hover:bg-destructive/10">
                  <LogOut className="mr-3 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-secondary">
              <Link href="/login"><User className="w-5 h-5" /></Link>
            </Button>
          )}
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 md:p-3 hover:bg-secondary rounded-xl transition-all">
            <ShoppingBag className="w-6 h-6" />
            {itemCount > 0 && (
              <Badge className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground rounded-full border-2 border-background shadow-sm">
                {itemCount}
              </Badge>
            )}
          </button>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="rounded-xl h-11 w-11 hover:bg-secondary">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-full left-0 w-full bg-card border-b px-5 py-5 flex flex-col gap-3 shadow-2xl overflow-hidden backdrop-blur-3xl"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-4 text-xl font-headline font-bold py-2 group border-b border-border/30 pb-3 last:border-0"
                onClick={() => setIsOpen(false)}
              >
                <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                   <link.icon className="w-5 h-5" />
                </div>
                {link.name}
              </Link>
            ))}
            {!user && (
               <Button asChild className="w-full h-12 rounded-xl text-base font-bold mt-2">
                 <Link href="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
               </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
