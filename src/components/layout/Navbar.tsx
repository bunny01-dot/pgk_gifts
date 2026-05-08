
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Grid, ImageIcon, Phone, User, Camera, LogOut, LayoutDashboard, Truck, Package, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CONTACT_INFO, ADMIN_EMAILS } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
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
  
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

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
        <div className="hidden lg:flex items-center gap-12">
          <div className="flex items-center gap-10">
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

          <div className="flex items-center gap-6">
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

                  <DropdownMenuItem asChild className="cursor-pointer rounded-xl h-11 transition-colors hover:bg-secondary">
                    <Link href="/contact" className="flex items-center w-full">
                      <Settings className="mr-3 h-4 w-4 opacity-70" /> Studio Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="opacity-50 my-1" />

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
            className="lg:hidden absolute top-full left-0 w-full bg-card border-b p-8 flex flex-col gap-6 shadow-2xl overflow-hidden backdrop-blur-3xl"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-5 text-2xl font-headline font-bold py-2 group border-b border-border/30 pb-4 last:border-0"
                onClick={() => setIsOpen(false)}
              >
                <div className="p-3 rounded-2xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                   <link.icon className="w-6 h-6" />
                </div>
                {link.name}
              </Link>
            ))}
            {!user && (
               <Button asChild className="w-full h-14 rounded-2xl text-lg font-bold mt-4">
                 <Link href="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
               </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
