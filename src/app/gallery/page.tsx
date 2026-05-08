
'use client';

import { useState } from 'react';
import { PORTFOLIO_ITEMS, PortfolioItem } from '@/lib/portfolio-data';
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid';
import { PortfolioModal } from '@/components/portfolio/PortfolioModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Camera, PenTool, Sparkles, Truck, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function GalleryPage() {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const steps = [
    { icon: Camera, title: "Share Your Vision", desc: "Send us your favorite high-quality photos and special quotes." },
    { icon: PenTool, title: "Curated Design", desc: "Our skilled artists craft a digital preview of your custom masterpiece." },
    { icon: Sparkles, title: "Precision Crafting", desc: "We use premium materials and modern tech to create your gift." },
    { icon: Truck, title: "Safe Delivery", desc: "Carefully packed and shipped directly to your doorstep." }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* 1. CINEMATIC HERO */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-xs font-black uppercase tracking-[0.5em] text-primary">The Art of Gifting</p>
            <h1 className="text-6xl md:text-9xl font-headline font-bold tracking-tighter leading-tight italic">
              Portfolio <span className="text-primary not-italic">Showcase</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              Crafting Memories Into Beautiful Personalized Gifts. Explore our collection of custom masterpieces.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-8"
          >
            <Button size="lg" className="rounded-full px-12 h-16 text-lg font-bold shadow-2xl shadow-primary/20" onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' })}>
              Explore Our Work
            </Button>
            <Button variant="ghost" size="lg" className="rounded-full px-8 h-16 text-lg font-bold" asChild>
              <a href="https://wa.me/message/VXHAM4LMXFOSB1" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-6 h-6 mr-2" /> Chat with us
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 2. THE PORTFOLIO ENGINE */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-6">
          <PortfolioGrid 
            items={PORTFOLIO_ITEMS} 
            onItemClick={(item) => setSelectedItem(item)} 
          />
        </div>
      </section>

      {/* 3. HOW IT WORKS - REDUCING FRICTION */}
      <section className="py-40 bg-secondary/30 relative">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6 mb-24">
            <h2 className="text-4xl md:text-6xl font-headline font-bold">How We Create Magic</h2>
            <p className="text-xl text-muted-foreground/80 max-w-2xl mx-auto italic">
              Simple steps to turn your moments into lasting masterpieces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative space-y-6 text-center"
              >
                <div className="w-24 h-24 rounded-[2rem] bg-background shadow-xl flex items-center justify-center mx-auto border-2 border-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <step.icon className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-headline font-bold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 -right-6 text-primary/20">
                    <ArrowRight className="w-12 h-12" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FINAL CLOSING CTA */}
      <section className="py-40 bg-primary/5">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto rounded-[4rem] bg-primary p-12 md:p-24 text-center space-y-12 shadow-2xl shadow-primary/40 relative overflow-hidden">
             {/* Decorative Background Accents */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
             
             <div className="relative z-10 space-y-6">
                <h2 className="text-5xl md:text-8xl font-headline font-bold text-white tracking-tighter">
                  Ready to Start Your <br />
                  <span className="italic opacity-80">Custom Gift Today?</span>
                </h2>
                <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-light">
                  Join thousands of satisfied customers who trust PGK GIFTS with their most precious memories.
                </p>
             </div>

             <div className="relative z-10 flex flex-wrap justify-center gap-6 pt-6">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-secondary h-20 px-12 rounded-full text-xl font-bold transition-all shadow-xl hover:scale-105 active:scale-95">
                  <Link href="/shop">Browse Catalog <ArrowRight className="ml-3 w-6 h-6" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-2 border-white/50 bg-white/10 backdrop-blur-md text-white hover:bg-white h-20 px-12 rounded-full text-xl font-bold transition-all">
                  <a href="https://wa.me/message/VXHAM4LMXFOSB1" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-3 w-6 h-6" /> WhatsApp Support
                  </a>
                </Button>
             </div>
          </div>
        </div>
      </section>

      {/* 5. MODAL SHOWCASE */}
      <PortfolioModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
}
