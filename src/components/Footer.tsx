
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Mail, Phone, MapPin, Youtube, MessageCircle, ArrowUpRight, Sparkles } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/data';
import { Button } from '@/components/ui/button';

export function Footer() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-primary text-primary-foreground pt-32 pb-20 rounded-t-[5rem] mt-32 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-foreground/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-32">
          <div className="space-y-12 md:col-span-1">
            <Link href="/" className="flex flex-col gap-10 group">
              <div className="relative w-72 h-72 transition-transform duration-700 group-hover:scale-110">
                <Image
                  src={CONTACT_INFO.footerLogo}
                  alt="PGK GIFTS Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="space-y-6">
                <h3 className="font-headline text-6xl font-bold tracking-tighter">PGK GIFTS</h3>
                <p className="text-primary-foreground/70 text-3xl leading-relaxed max-w-sm italic font-headline">
                  "{CONTACT_INFO.tagline}"
                </p>
              </div>
            </Link>
            <div className="flex gap-6">
              {[
                { icon: Instagram, href: CONTACT_INFO.instagram },
                { icon: Youtube, href: CONTACT_INFO.youtube },
                { icon: MessageCircle, href: CONTACT_INFO.whatsapp }
              ].map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="w-20 h-20 rounded-[2rem] bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground hover:text-primary transition-all duration-500 group">
                  <social.icon className="w-10 h-10 transition-transform group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-12">
            <h4 className="font-bold uppercase tracking-[0.4em] text-xs text-primary-foreground/30">Navigation</h4>
            <ul className="space-y-8">
              {[
                { name: 'Home', href: '/' },
                { name: 'Artistic Shop', href: '/shop' },
                { name: 'Photography', href: '/photography' },
                { name: 'Photo Gallery', href: '/gallery' },
                { name: 'Contact Us', href: '/contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-4xl font-headline font-medium hover:text-primary-foreground/60 transition-all flex items-center justify-between group">
                    {link.name} <ArrowUpRight className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-12">
            <h4 className="font-bold uppercase tracking-[0.4em] text-xs text-primary-foreground/30">Specialties</h4>
            <ul className="space-y-8 text-4xl font-headline font-medium text-primary-foreground/50">
              <li className="hover:text-primary-foreground transition-all cursor-default flex items-center gap-5"><Sparkles className="w-8 h-8 opacity-30" /> LED Magic</li>
              <li className="hover:text-primary-foreground transition-all cursor-default flex items-center gap-5"><Sparkles className="w-8 h-8 opacity-30" /> Custom Mugs</li>
              <li className="hover:text-primary-foreground transition-all cursor-default flex items-center gap-5"><Sparkles className="w-8 h-8 opacity-30" /> Plush Toys</li>
              <li className="hover:text-primary-foreground transition-all cursor-default flex items-center gap-5"><Sparkles className="w-8 h-8 opacity-30" /> Photo Frames</li>
              <li className="hover:text-primary-foreground transition-all cursor-default flex items-center gap-5"><Sparkles className="w-8 h-8 opacity-30" /> Studio Arts</li>
            </ul>
          </div>

          <div className="space-y-12">
            <h4 className="font-bold uppercase tracking-[0.4em] text-xs text-primary-foreground/30">Find Us</h4>
            <div className="space-y-10">
              <div className="group">
                <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/20 mb-4">Studio Location</p>
                <p className="text-3xl font-headline leading-relaxed text-primary-foreground/80 group-hover:text-primary-foreground transition-colors">{CONTACT_INFO.address}</p>
              </div>
              <div className="group">
                <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/20 mb-4">Direct Communication</p>
                <p className="text-5xl font-headline font-bold text-primary-foreground mb-2">{CONTACT_INFO.phone}</p>
                <p className="text-xl text-primary-foreground/40 font-bold">{CONTACT_INFO.email}</p>
              </div>
              <Button asChild variant="outline" size="lg" className="rounded-full border-primary-foreground/20 hover:bg-primary-foreground hover:text-primary font-bold px-12 h-20 text-xl transition-all">
                <a href={CONTACT_INFO.googleMap} target="_blank" rel="noopener noreferrer">Get Studio Directions</a>
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-20 border-t border-primary-foreground/5 flex flex-col md:flex-row justify-between items-center gap-10 text-xs font-bold tracking-[0.4em] uppercase text-primary-foreground/20">
          <p className="flex items-center gap-3">&copy; {currentYear} PGK GIFTS & STUDIO <span className="w-2 h-2 bg-primary-foreground/10 rounded-full" /> Handcrafted with Passion.</p>
          <div className="flex gap-12">
            <Link href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary-foreground transition-colors">Service Terms</Link>
            <Link href="#" className="hover:text-primary-foreground transition-colors">Shipping Hub</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
