
import Link from "next/link";
import { Instagram, Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <h3 className="font-headline text-2xl font-bold">PGK Gifts</h3>
          <p className="text-primary-foreground/80 text-sm leading-relaxed">
            Preserving life's most precious moments through expert photography and bespoke personalized gifts that last a lifetime.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-accent-foreground transition-colors"><Instagram /></Link>
            <Link href="#" className="hover:text-accent-foreground transition-colors"><MessageCircle /></Link>
            <Link href="#" className="hover:text-accent-foreground transition-colors"><Mail /></Link>
          </div>
        </div>

        <div>
          <h4 className="font-headline text-xl mb-6">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            <li><Link href="/gifts" className="hover:underline">Personalized Gifts</Link></li>
            <li><Link href="/photography" className="hover:underline">Photography Services</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact & Booking</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline text-xl mb-6">Services</h4>
          <ul className="space-y-3 text-sm">
            <li>Wedding Photography</li>
            <li>Portrait Sessions</li>
            <li>Event Coverage</li>
            <li>Custom Mug Printing</li>
            <li>Canvas & Photo Frames</li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline text-xl mb-6">Get in Touch</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4" />
              <span>+1 (234) 567-890</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4" />
              <span>hello@pgkgifts.com</span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="w-4 h-4" />
              <span>123 Creative Studio, Art District</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/60">
        <p>&copy; {new Date().getFullYear()} PGK Gifts. All rights reserved. Designed for excellence.</p>
      </div>
    </footer>
  );
}
