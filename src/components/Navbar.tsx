"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Camera, Gift, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Personalized Gifts", href: "/gifts", icon: Gift },
  { name: "Photography", href: "/photography", icon: Camera },
  { name: "Contact", href: "/contact", icon: PhoneCall },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground transition-transform group-hover:scale-110">
            <span className="font-headline font-bold text-xl">P</span>
          </div>
          <span className="font-headline font-bold text-2xl tracking-tight">PGK Gifts</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
            >
              {link.name}
            </Link>
          ))}
          <div className="flex items-center gap-2 ml-2">
            <ThemeToggle />
            <Button asChild variant="default" size="sm">
              <Link href="/contact">Book Now</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-4 gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-3 text-lg font-medium p-2 hover:bg-accent rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                <link.icon className="w-5 h-5" />
                {link.name}
              </Link>
            ))}
            <Button asChild variant="default" className="w-full mt-2">
              <Link href="/contact" onClick={() => setIsOpen(false)}>Book a Session</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}