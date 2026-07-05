
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Instagram, Youtube, MessageCircle, Sparkles, ShoppingBag, Truck, Images, Phone } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/data';
import { Button } from '@/components/ui/button';

export function Footer() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className={`bg-primary text-primary-foreground pt-20 md:pt-28 pb-12 md:pb-16 rounded-t-3xl md:rounded-t-[3rem] mt-24 md:mt-32 relative overflow-hidden ${isHomepage ? 'block' : 'hidden md:block'}`}>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-foreground/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-14 mb-14 md:mb-20">
          <div className="space-y-7 md:space-y-10 md:col-span-1">
            <Link href="/" className="flex flex-col gap-5 md:gap-8 group">
              <div className="relative w-40 h-40 md:w-56 md:h-56 transition-transform duration-700 group-hover:scale-110">
                <Image
                  src={CONTACT_INFO.footerLogo}
                  alt="PGK GIFTS Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="space-y-2 md:space-y-4">
                <h3 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">PGK GIFTS</h3>
                <p className="text-primary-foreground/70 text-xl md:text-2xl leading-relaxed max-w-sm italic font-headline">
                  &ldquo;{CONTACT_INFO.tagline}&rdquo;
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
                  <social.icon className="w-8 h-8 transition-transform group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-5 md:space-y-7">
            <h4 className="font-bold uppercase tracking-[0.3em] text-[10px] text-primary-foreground/40">Navigation</h4>
            <ul className="flex flex-wrap gap-2 md:gap-3">
              {[
                { name: 'Shop', href: '/shop', icon: ShoppingBag },
                { name: 'Track', href: '/track', icon: Truck },
                { name: 'Gallery', href: '/gallery', icon: Images },
                { name: 'Contact', href: '/contact', icon: Phone }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="flex items-center gap-2 rounded-full border border-primary-foreground/10 bg-primary-foreground/5 px-3 py-2 text-sm md:text-base font-sans font-bold text-primary-foreground/75 hover:bg-primary-foreground hover:text-primary transition-all">
                    <link.icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5 md:space-y-7">
            <h4 className="font-bold uppercase tracking-[0.3em] text-[10px] text-primary-foreground/40">Our World</h4>
            <ul className="space-y-3 md:space-y-4 text-lg md:text-xl font-headline font-medium text-primary-foreground/50">
              <li className="flex items-center gap-3"><Sparkles className="w-5 h-5 md:w-6 md:h-6 opacity-20" /> LED Magic</li>
              <li className="flex items-center gap-3"><Sparkles className="w-5 h-5 md:w-6 md:h-6 opacity-20" /> Custom Mugs</li>
              <li className="flex items-center gap-3"><Sparkles className="w-5 h-5 md:w-6 md:h-6 opacity-20" /> Plush Toys</li>
              <li className="flex items-center gap-3"><Sparkles className="w-5 h-5 md:w-6 md:h-6 opacity-20" /> Photo Frames</li>
            </ul>
          </div>

          <div className="space-y-5 md:space-y-7">
            <h4 className="font-bold uppercase tracking-[0.3em] text-[10px] text-primary-foreground/40">Find Us</h4>
            <div className="space-y-5 md:space-y-7">
              <div className="group">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/30 mb-2">Main Office</p>
                <p className="text-lg leading-relaxed text-primary-foreground/80 group-hover:text-primary-foreground transition-colors">{CONTACT_INFO.address}</p>
              </div>
              <div className="group">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/30 mb-2">Connect Directly</p>
                <p className="text-2xl font-sans font-bold text-primary-foreground mb-1">{CONTACT_INFO.phone}</p>
                <p className="text-sm text-primary-foreground/40 font-bold">{CONTACT_INFO.email}</p>
              </div>
              <Button asChild variant="outline" size="lg" className="rounded-full bg-transparent text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground hover:text-primary font-bold px-6 md:px-10 h-10 md:h-14 text-sm md:text-base transition-all">
                <a href={CONTACT_INFO.googleMap} target="_blank" rel="noopener noreferrer">Get Directions</a>
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-8 md:pt-12 border-t border-primary-foreground/5 flex flex-col md:flex-row justify-between items-center gap-5 md:gap-8 text-[10px] font-bold tracking-[0.4em] uppercase text-primary-foreground/20">
          <p className="flex items-center gap-2">&copy; {currentYear} PGK GIFTS <span className="w-1 h-1 bg-primary-foreground/20 rounded-full" /> Handcrafted.</p>
          <div className="flex gap-6 md:gap-10">
            <Link href="#" className="hover:text-primary-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
