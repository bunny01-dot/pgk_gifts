
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Grid, ImageIcon, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CONTACT_INFO } from '@/lib/data';

const NAV_LINKS = [
  { name: 'Home', href: '/', icon: ShoppingBag },
  { name: 'Products', href: '/products', icon: Grid },
  { name: 'Gallery', href: '/gallery', icon: ImageIcon },
  { name: 'Contact', href: '/contact', icon: Phone },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-lg border-b py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 transition-transform group-hover:rotate-12">
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
            <ThemeToggle />
            <Button asChild className="rounded-full px-6">
              <a href={CONTACT_INFO.whatsapp} target="_blank" rel="noopener noreferrer">Order Now</a>
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 md:hidden">
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
        <div className="md:hidden fixed inset-0 top-20 bg-background z-40 p-6 flex flex-col gap-6 animate-in slide-in-from-right duration-300">
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
          <div className="mt-auto space-y-4">
             <Button asChild size="lg" className="w-full rounded-[2rem] h-16 text-xl">
               <a href={CONTACT_INFO.whatsapp} target="_blank" rel="noopener noreferrer">Order on WhatsApp</a>
             </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
