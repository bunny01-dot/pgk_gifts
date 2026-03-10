
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS, Category } from '@/lib/data';
import { Button } from '@/components/ui/button';

export default function GalleryPage() {
  const [filter, setFilter] = useState<Category | 'All'>('All');

  const galleryImages = filter === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === filter);

  return (
    <div className="min-h-screen pt-32">
      <div className="container mx-auto px-4">
        <header className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <h1 className="text-5xl md:text-7xl font-headline font-bold">Artistic Gallery</h1>
          <p className="text-xl text-muted-foreground">
            A visual showcase of our creations and customized projects. Every piece tells a unique story.
          </p>
        </header>

        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {['All', 'Light Lamps', 'Cute Toys', 'Customized Gifts'].map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f as any)}
              variant={filter === f ? 'default' : 'ghost'}
              className={`rounded-full px-6 py-2 font-bold tracking-widest uppercase text-xs ${filter === f ? 'bg-primary' : 'text-muted-foreground'}`}
            >
              {f}
            </Button>
          ))}
        </div>

        <motion.div 
          layout
          className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
        >
          <AnimatePresence mode="popLayout">
            {galleryImages.map((img) => (
              <motion.div
                layout
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="relative group rounded-[2rem] overflow-hidden break-inside-avoid shadow-soft hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative w-full aspect-[4/5] sm:aspect-auto">
                   <Image
                     src={img.image}
                     alt={img.name}
                     width={600}
                     height={800}
                     className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                   />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                  <span className="text-white/50 text-[10px] uppercase tracking-[0.3em] font-bold mb-2">{img.category}</span>
                  <h3 className="text-white text-2xl font-headline font-bold leading-tight">{img.name}</h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
