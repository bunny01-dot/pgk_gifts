'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Mail, Phone, MapPin, Youtube, MessageCircle, ArrowUpRight, Sparkles } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/data';
import { Button } from '@/components/ui/button';

export function Footer() {
  const [currentYear, setCurrentYear] = useState(2024);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-primary text-primary-foreground pt-32 pb-16 rounded-t-[4rem] mt-32 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-foreground/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-24">
          <div className="space-y-10 md:col-span-1">
            <Link href="/" className="flex flex-col gap-8 group">
              <div className="relative w-64 h-64 transition-transform duration-500 group-hover:scale-110">
                <Image
                  src={CONTACT_INFO.footerLogo}
                  alt="PGK GIFTS Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-headline text-5xl font-bold tracking-tighter">PGK GIFTS</h3>
                <p className="text-primary-foreground/60 text-xl leading-relaxed max-w-xs italic font-medium">
                  "{CONTACT_INFO.tagline}"
                </p>
              </div>
            </Link>
            <div className="flex gap-5">
              {[
                { icon: Instagram, href: CONTACT_INFO.instagram },
                { icon: Youtube, href: CONTACT_INFO.youtube },
                { icon: MessageCircle, href: CONTACT_INFO.whatsapp }
              ].map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="w-16 h-16 rounded-2xl bg-primary-foreground/5 flex items-center justify-center hover:bg-primary-foreground hover:text-primary transition-all duration-500 group">
                  <social.icon className="w-7 h-7 transition-transform group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-10">
            <h4 className="font-bold uppercase tracking-[0.3em] text-xs text-primary-foreground/40">Navigation</h4>
            <ul className="space-y-6">
              {[
                { name: 'Home', href: '/' },
                { name: 'Artistic Shop', href: '/shop' },
                { name: 'Photography', href: '/photography' },
                { name: 'Photo Gallery', href: '/gallery' },
                { name: 'Contact Us', href: '/contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-2xl font-headline font-medium hover:text-primary-foreground/60 transition-all flex items-center justify-between group">
                    {link.name} <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-10">
            <h4 className="font-bold uppercase tracking-[0.3em] text-xs text-primary-foreground/40">Our World</h4>
            <ul className="space-y-6 text-2xl font-headline font-medium text-primary-foreground/60">
              <li className="hover:text-primary-foreground transition-colors cursor-default flex items-center gap-3"><Sparkles className="w-5 h-5 opacity-30" /> LED Light Lamps</li>
              <li className="hover:text-primary-foreground transition-colors cursor-default flex items-center gap-3"><Sparkles className="w-5 h-5 opacity-30" /> Personalized Mugs</li>
              <li className="hover:text-primary-foreground transition-colors cursor-default flex items-center gap-3"><Sparkles className="w-5 h-5 opacity-30" /> Cute Plush Toys</li>
              <li className="hover:text-primary-foreground transition-colors cursor-default flex items-center gap-3"><Sparkles className="w-5 h-5 opacity-30" /> Bespoke Frames</li>
              <li className="hover:text-primary-foreground transition-colors cursor-default flex items-center gap-3"><Sparkles className="w-5 h-5 opacity-30" /> Studio Services</li>
            </ul>
          </div>

          <div className="space-y-10">
            <h4 className="font-bold uppercase tracking-[0.3em] text-xs text-primary-foreground/40">Find Us</h4>
            <div className="space-y-8">
              <div className="group">
                <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/30 mb-2">Main Office</p>
                <p className="text-xl leading-relaxed text-primary-foreground/80 group-hover:text-primary-foreground transition-colors">{CONTACT_INFO.address}</p>
              </div>
              <div className="group">
                <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/30 mb-2">Connect Directly</p>
                <p className="text-3xl font-headline font-bold text-primary-foreground mb-1">{CONTACT_INFO.phone}</p>
                <p className="text-base text-primary-foreground/40">{CONTACT_INFO.email}</p>
              </div>
              <Button asChild variant="outline" size="lg" className="rounded-full border-primary-foreground/20 hover:bg-primary-foreground hover:text-primary font-bold px-10 h-14">
                <a href={CONTACT_INFO.googleMap} target="_blank" rel="noopener noreferrer">Get Directions</a>
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-primary-foreground/5 flex flex-col md:flex-row justify-between items-center gap-8 text-xs font-bold tracking-[0.3em] uppercase text-primary-foreground/30">
          <p className="flex items-center gap-2">&copy; {currentYear} PGK GIFTS & STUDIO <span className="w-1 h-1 bg-primary-foreground/20 rounded-full" /> All Rights Reserved.</p>
          <div className="flex gap-10">
            <Link href="#" className="hover:text-primary-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary-foreground transition-colors">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
