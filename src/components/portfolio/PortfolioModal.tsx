
'use client';

import { PortfolioItem } from '@/lib/portfolio-data';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ArrowRight, MessageCircle, ShoppingBag, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PortfolioModalProps {
  item: PortfolioItem | null;
  onClose: () => void;
}

export function PortfolioModal({ item, onClose }: PortfolioModalProps) {
  if (!item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/90 backdrop-blur-2xl"
        />

        {/* Modal Container */}
        <motion.div
          layoutId={item.id}
          initial={{ opacity: 0, scale: 0.95, y: 60 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 60 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-6xl h-full md:h-auto max-h-[90vh] bg-card border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-background/50 backdrop-blur-md border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Side: Visual Assets */}
          <div className="w-full md:w-3/5 h-[40vh] md:h-auto relative bg-secondary/30">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              priority
            />
            {/* Gallery Hint Indicator (Future Expandability) */}
            <div className="absolute bottom-10 left-10 flex gap-3">
               {item.images.map((img, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full border border-white/50 ${i === 0 ? 'bg-white shadow-lg' : 'bg-white/30'}`} />
               ))}
            </div>
          </div>

          {/* Right Side: Narrative & Strategy */}
          <div className="w-full md:w-2/5 p-8 md:p-12 overflow-y-auto bg-card">
            <div className="space-y-10">
              <header className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Info className="w-4 h-4" />
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Portfolio Showcase</p>
                </div>
                <h2 className="text-4xl md:text-5xl font-headline font-bold leading-tight">{item.title}</h2>
                <div className="flex flex-wrap gap-2 pt-2">
                  {item.tags.map(tag => (
                    <span key={tag} className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 bg-secondary/50 px-3 py-1.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </header>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-3">Project Overview</h4>
                  <p className="text-lg text-muted-foreground leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 py-8 border-y border-border/50">
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Collection</h5>
                    <p className="text-sm font-bold uppercase">{item.category}</p>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Category</h5>
                    <p className="text-sm font-bold uppercase">{item.subcategory}</p>
                  </div>
                </div>
              </div>

              {/* ACTION HUB */}
              <div className="space-y-4 pt-6">
                <Button asChild className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20">
                  <a href={`https://wa.me/6383775476?text=Hi, I saw this in your portfolio: ${item.title}. I'd like to order something similar.`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-6 h-6 mr-3" /> Get This Customized
                  </a>
                </Button>
                
                <Button asChild variant="outline" className="w-full h-14 rounded-2xl border-2 text-muted-foreground hover:text-primary transition-all">
                  <Link href={`/shop?category=${encodeURIComponent(item.category)}`}>
                    <ShoppingBag className="w-5 h-5 mr-3" /> View Similar Products
                  </Link>
                </Button>
              </div>

              <p className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Typically Crafted & Dispatched in 2-3 Business Days
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
