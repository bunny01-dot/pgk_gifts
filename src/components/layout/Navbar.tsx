
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Grid, ImageIcon, Phone, User, Camera, LogOut, LayoutDashboard, Truck } from 'lucide-react';
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled ? 'glass h-20 shadow-lg' : 'bg-transparent h-28'}`}>
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 shrink-0 group">
          <div className="relative w-14 h-14 transition-transform duration-700 group-hover:scale-110">
            <Image
              src={CONTACT_INFO.headerLogo}
              alt="PGK GIFTS"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-2xl tracking-tighter text-foreground leading-none uppercase">PGK GIFTS</span>
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground mt-1 whitespace-nowrap">
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
                <DropdownMenuContent className="w-64 mt-4 rounded-[1.5rem] p-3 shadow-2xl border-border/50" align="end">
                  <DropdownMenuLabel className="font-normal px-3 pb-3">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-bold leading-none">{user.displayName || 'Distinguished Member'}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="mx-2 mb-2" />
                  <DropdownMenuItem asChild className="cursor-pointer rounded-xl h-11 px-3">
                    <Link href="/admin">
                      <LayoutDashboard className="mr-3 h-4 w-4" /> Management Portal
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-2 my-2" />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer rounded-xl h-11 px-3 hover:bg-destructive/10">
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

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center gap-4">
          <button onClick={() => setIsCartOpen(true)} className="relative p-2">
            <ShoppingBag className="w-6 h-6" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground rounded-full border-2 border-background">
                {itemCount}
              </Badge>
            )}
          </button>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="rounded-xl">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-full left-0 w-full bg-background border-b p-8 flex flex-col gap-6 shadow-2xl overflow-hidden"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-5 text-2xl font-headline font-bold py-2 group"
                onClick={() => setIsOpen(false)}
              >
                <link.icon className="w-7 h-7 text-primary transition-transform group-hover:scale-110" />
                {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
