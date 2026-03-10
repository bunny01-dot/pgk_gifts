
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Grid, ImageIcon, Phone, User, Camera, Sparkles, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CONTACT_INFO } from '@/lib/data';
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
  { name: 'Photography', href: '/photography', icon: Camera },
  { name: 'Gallery', href: '/gallery', icon: ImageIcon },
  { name: 'Contact', href: '/contact', icon: Phone },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { itemCount } = useCart();
  const { user } = useUser();
  const auth = useAuth();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!mounted) return null;

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled ? 'bg-background/80 backdrop-blur-xl border-b py-2 shadow-soft' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-4 h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-5 group shrink-0">
          <div className="relative w-24 h-24 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
            <Image
              src={CONTACT_INFO.headerLogo}
              alt="PGK GIFTS Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-3xl leading-none tracking-tighter text-foreground">PGK GIFTS</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Sparkles className="w-2.5 h-2.5 text-primary" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground">The Art of Gifting</span>
            </div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-12 ml-auto">
          <div className="flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-lg font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-all relative group/link"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover/link:w-full" />
              </Link>
            ))}
          </div>
          
          <div className="h-8 w-[1px] bg-muted mx-2" />

          <div className="flex items-center gap-6">
            <Link href="/cart" className="relative group p-3 rounded-full hover:bg-accent transition-colors">
              <ShoppingBag className="w-8 h-8 text-foreground group-hover:text-primary transition-colors" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground border-2 border-background shadow-lg font-bold">
                      {itemCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
            
            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0 overflow-hidden border-2 border-primary/10">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-2xl p-2" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">{user.displayName || 'My Account'}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-xl h-12 px-4 cursor-pointer">
                    <Link href="/admin">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Admin Portal</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl h-12 px-4 cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline" size="icon" className="rounded-full h-12 w-12 border-2 hover:bg-primary hover:text-primary-foreground transition-all">
                <Link href="/login"><User className="w-6 h-6" /></Link>
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link href="/cart" className="relative p-3 rounded-full hover:bg-accent">
            <ShoppingBag className="w-8 h-8 text-foreground" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground border-2 border-background font-bold shadow-lg">
                {itemCount}
              </Badge>
            )}
          </Link>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full h-12 w-12"
          >
            {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="md:hidden fixed inset-0 top-[96px] bg-background z-40 p-8 flex flex-col gap-8 shadow-2xl"
          >
            <div className="flex flex-col gap-4">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={link.name}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-6 text-4xl font-headline font-bold p-4 hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <link.icon className="w-8 h-8 opacity-20" />
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-auto space-y-4">
               {user ? (
                 <>
                   <Button asChild size="lg" className="w-full rounded-[2rem] h-20 text-2xl font-bold">
                     <Link href="/admin" onClick={() => setIsOpen(false)}>Admin Portal</Link>
                   </Button>
                   <Button variant="outline" size="lg" onClick={handleLogout} className="w-full rounded-[2rem] h-20 text-2xl font-bold border-2 border-destructive text-destructive">
                     Log Out
                   </Button>
                 </>
               ) : (
                 <Button asChild size="lg" className="w-full rounded-[2rem] h-20 text-2xl font-bold shadow-xl shadow-primary/20">
                   <Link href="/login" onClick={() => setIsOpen(false)}>Login / Sign Up</Link>
                 </Button>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
