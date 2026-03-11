
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
            <span className="font-headline font-bold text-4xl leading-none tracking-tighter text-foreground">PGK GIFTS</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[11px] uppercase tracking-[0.4em] font-bold text-muted-foreground/60">The Art of Gifting</span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-16 ml-auto">
          <div className="flex items-center gap-14">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xl font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all relative group/link"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover/link:w-full" />
              </Link>
            ))}
          </div>
          
          <div className="h-10 w-[1px] bg-muted/30" />

          <div className="flex items-center gap-10">
            <Link href="/cart" className="relative group p-3 rounded-full hover:bg-accent/50 transition-colors">
              <ShoppingBag className="w-10 h-10 text-foreground group-hover:text-primary transition-colors" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge className="h-8 w-8 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground border-2 border-background shadow-xl font-black rounded-full">
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
                  <Button variant="ghost" className="relative h-16 w-16 rounded-full p-0 overflow-hidden border-2 border-primary/10 hover:border-primary/30 transition-all">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 rounded-[2rem] p-3 shadow-2xl border-none bg-card/95 backdrop-blur-xl" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-6">
                    <div className="flex flex-col space-y-2">
                      <p className="text-xl font-headline font-bold leading-none">{user.displayName || 'Member'}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-muted/30" />
                  <DropdownMenuItem asChild className="rounded-2xl h-16 px-6 cursor-pointer focus:bg-primary/5">
                    <Link href="/admin">
                      <LayoutDashboard className="mr-4 h-6 w-6 text-primary" />
                      <span className="text-lg font-bold">Admin Portal</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-muted/30" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-2xl h-16 px-6 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5">
                    <LogOut className="mr-4 h-6 w-6" />
                    <span className="text-lg font-bold">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline" size="icon" className="rounded-full h-16 w-16 border-2 hover:bg-primary hover:text-primary-foreground transition-all group">
                <Link href="/login"><User className="w-8 h-8 group-hover:scale-110 transition-transform" /></Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="flex items-center gap-4 md:hidden">
          <Link href="/cart" className="relative p-3 rounded-full hover:bg-accent/50">
            <ShoppingBag className="w-9 h-9 text-foreground" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-7 w-7 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground border-2 border-background font-bold shadow-lg rounded-full">
                {itemCount}
              </Badge>
            )}
          </Link>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full h-14 w-14"
          >
            {isOpen ? <X className="w-9 h-9" /> : <Menu className="w-9 h-9" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="md:hidden fixed inset-0 top-[96px] bg-background z-40 p-10 flex flex-col gap-10 shadow-2xl"
          >
            <div className="flex flex-col gap-6">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={link.name}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-8 text-5xl font-headline font-bold p-4 hover:text-primary transition-colors border-b border-muted/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <link.icon className="w-10 h-10 text-primary/30" />
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
