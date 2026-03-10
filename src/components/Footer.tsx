
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Mail, Phone, MapPin, Youtube, MessageCircle } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/data';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-24 pb-12 rounded-t-[3rem] mt-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="space-y-6">
            <Link href="/" className="flex flex-col gap-6 group">
              <div className="relative w-40 h-40 brightness-0 invert transition-transform group-hover:scale-110">
                <Image
                  src={CONTACT_INFO.footerLogo}
                  alt="PGK GIFTS Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-headline text-3xl font-bold tracking-tighter">PGK GIFTS</h3>
            </Link>
            <p className="text-primary-foreground/70 text-lg leading-relaxed">
              {CONTACT_INFO.tagline}. We bring your memories to life with premium craftsmanship and love.
            </p>
            <div className="flex gap-4">
              <a href={CONTACT_INFO.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all">
                <Instagram className="w-6 h-6" />
              </a>
              <a href={CONTACT_INFO.youtube} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all">
                <Youtube className="w-6 h-6" />
              </a>
              <a href={CONTACT_INFO.whatsapp} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all">
                <MessageCircle className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-headline text-xl mb-8 uppercase tracking-[0.2em] font-bold text-white/50">Quick Links</h4>
            <ul className="space-y-4 text-lg">
              <li><Link href="/" className="hover:translate-x-2 transition-transform inline-block">Home</Link></li>
              <li><Link href="/products" className="hover:translate-x-2 transition-transform inline-block">Our Products</Link></li>
              <li><Link href="/gallery" className="hover:translate-x-2 transition-transform inline-block">Photo Gallery</Link></li>
              <li><Link href="/contact" className="hover:translate-x-2 transition-transform inline-block">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline text-xl mb-8 uppercase tracking-[0.2em] font-bold text-white/50">Collections</h4>
            <ul className="space-y-4 text-lg text-primary-foreground/70">
              <li>Light Lamps</li>
              <li>Customized Gifts</li>
              <li>Cute Gift Toys</li>
              <li>Personalized Frames</li>
              <li>Photo Mugs & Pillows</li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline text-xl mb-8 uppercase tracking-[0.2em] font-bold text-white/50">Reach Us</h4>
            <ul className="space-y-6 text-sm">
              <li className="flex gap-4">
                <Phone className="w-6 h-6 flex-shrink-0 text-white/50" />
                <div>
                  <p className="font-bold text-lg">{CONTACT_INFO.phone}</p>
                  <p className="text-white/50">{CONTACT_INFO.alternateNumbers.join(' / ')}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <Mail className="w-6 h-6 flex-shrink-0 text-white/50" />
                <p className="text-lg">{CONTACT_INFO.email}</p>
              </li>
              <li className="flex gap-4">
                <MapPin className="w-6 h-6 flex-shrink-0 text-white/50" />
                <p className="text-sm leading-relaxed text-white/70">{CONTACT_INFO.address}</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-white/40 font-bold tracking-widest text-[10px] uppercase">
          <p>&copy; {new Date().getFullYear()} PGK GIFTS & STUDIO. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
