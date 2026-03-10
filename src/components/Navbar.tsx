
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, Grid, ImageIcon, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CONTACT_INFO } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';

const NAV_LINKS = [
  { name: 'Home', href: '/', icon: Grid },
  { name: 'Shop', href: '/shop', icon: ShoppingCart },
  { name: 'Gallery', href: '/gallery', icon: ImageIcon },
  { name: 'Contact', href: '/contact', icon: Phone },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-lg border-b py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative w-16 h-16 transition-transform group-hover:rotate-6">
            <Image
              src={CONTACT_INFO.headerLogo}
              alt="PGK GIFTS Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-xl leading-none tracking-tighter">PGK GIFTS</span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Personalized Art</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="flex items-center gap-4 ml-4">
            <Link href="/cart" className="relative group p-2">
              <ShoppingCart className="w-6 h-6 group-hover:text-primary transition-colors" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-white">
                  {itemCount}
                </Badge>
              )}
            </Link>
            <ThemeToggle />
            <Button asChild variant="outline" size="icon" className="rounded-full">
              <Link href="/admin"><User className="w-5 h-5" /></Link>
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <Link href="/cart" className="relative p-2">
            <ShoppingCart className="w-6 h-6" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-white">
                {itemCount}
              </Badge>
            )}
          </Link>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full"
          >
            {isOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-24 bg-background z-40 p-6 flex flex-col gap-6 animate-in slide-in-from-right duration-300">
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-4 text-2xl font-headline font-bold p-4 hover:bg-accent rounded-[2rem]"
                onClick={() => setIsOpen(false)}
              >
                <link.icon className="w-6 h-6" />
                {link.name}
              </Link>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-4">
             <Button asChild size="lg" className="w-full rounded-[2rem] h-16 text-xl">
               <Link href="/shop" onClick={() => setIsOpen(false)}>Shop Now</Link>
             </Button>
             <Button asChild variant="outline" size="lg" className="w-full rounded-[2rem] h-16 text-xl">
               <Link href="/admin" onClick={() => setIsOpen(false)}>Admin Login</Link>
             </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
