
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { ProductCard } from '@/components/product/ProductCard';
import { PRODUCTS, CONTACT_INFO } from '@/lib/data';

export default function Home() {
  const [featuredProduct, setFeaturedProduct] = useState(PRODUCTS[0]);
  const featuredProducts = PRODUCTS.slice(0, 8);

  useEffect(() => {
    // Pick a random product on mount to keep the experience fresh
    const randomIndex = Math.floor(Math.random() * PRODUCTS.length);
    setFeaturedProduct(PRODUCTS[randomIndex]);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      
      {/* 1. MASTER HERO: BRAND STORY + RANDOMIZED FEATURED PRODUCT */}
      <section className="relative h-screen flex items-center pt-24 overflow-hidden bg-background">
        
        {/* Infinite Background Collage */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-background via-background/80 to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent z-10" />
          
          <div className="absolute w-[200vw] -left-[50vw] top-[18vh] flex flex-col gap-8 opacity-15 scale-100 z-0 pointer-events-none">
            <motion.div 
               animate={{ x: [0, -1500] }} 
               transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
               className="flex gap-8"
            >
               {[...PRODUCTS, ...PRODUCTS].map((p, i) => (
                 <div key={`row1-${i}`} className="relative w-48 h-56 md:w-60 md:h-72 rounded-[3rem] overflow-hidden shrink-0 border border-white/10">
                    <Image src={p?.image || '/placeholder.png'} alt="background" fill className="object-cover" />
                 </div>
               ))}
            </motion.div>
            <motion.div 
               animate={{ x: [-1500, 0] }} 
               transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
               className="flex gap-8"
            >
               {[...PRODUCTS, ...PRODUCTS].reverse().map((p, i) => (
                 <div key={`row2-${i}`} className="relative w-48 h-56 md:w-60 md:h-72 rounded-[3rem] overflow-hidden shrink-0 border border-white/10">
                    <Image src={p?.image || '/placeholder.png'} alt="background" fill className="object-cover" />
                 </div>
               ))}
            </motion.div>
          </div>
        </div>

        <div className="container relative z-20 mx-auto px-6 h-full flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* LEFT: BRAND STORY */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-10 md:space-y-14 text-center md:text-left relative max-w-3xl"
          >
            <div className="space-y-6">
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-primary/70">
                {CONTACT_INFO.tagline}
              </p>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-bold leading-[1] tracking-tight text-foreground">
                Moments Captured,<br />
                <span className="text-primary italic font-serif">Memories Crafted</span>
              </h1>
            </div>

            <div className="space-y-4">
              <h3 className="text-base md:text-2xl font-black uppercase tracking-[0.15em] text-foreground opacity-90">
                Where Art Meets Heart
              </h3>
              <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed font-light italic opacity-80">
                Your Life, Beautifully Crafted.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-5 pt-4">
              <Button asChild size="lg" className="rounded-full px-12 h-14 md:h-16 text-base md:text-lg font-bold shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto">
                <Link href="/shop" className="flex items-center gap-2">
                  Explore Collection <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-12 h-14 md:h-16 text-base md:text-lg font-bold border-2 border-white/20 bg-white/15 backdrop-blur-2xl hover:bg-white/20 hover:border-white/40 text-foreground w-full sm:w-auto transition-all shadow-lg">
                <Link href="/gallery">Our Portfolio</Link>
              </Button>
            </div>
          </motion.div>

          {/* RIGHT: RANDOMIZED FEATURED PRODUCT (EDITORIAL CROP) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={featuredProduct.id}
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="relative hidden lg:block w-1/2 max-w-sm aspect-[3/4] group cursor-pointer"
            >
              <Link href={featuredProduct.category === 'Night Lamps' ? '/shop?category=Night Lamps' : `/products/${featuredProduct.id}`}>
                {/* Soft Glow Behind */}
                <div className="absolute inset-10 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="relative z-10 w-full h-full rounded-[3rem] overflow-hidden border-2 border-white/20 shadow-[0_50px_100px_rgba(0,0,0,0.3)] bg-background/20 backdrop-blur-sm"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={featuredProduct.image}
                      alt={featuredProduct.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Visual Scrim for Badge */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent opacity-60" />

                    {/* Floating Badge */}
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md text-black px-4 py-2 rounded-2xl shadow-xl border border-primary/20 flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-primary animate-spin-slow" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Selected Detail</span>
                    </div>

                    {/* Product Name Subtle Overlay */}
                    <div className="absolute bottom-6 left-6 right-6">
                       <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white opacity-60 mb-1">Randomized Feature</p>
                       <p className="text-white text-lg font-headline font-bold drop-shadow-lg leading-none">{featuredProduct.name}</p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 2. CATEGORY SHOWCASE */}
      <div className="bg-background">
        <div className="md:hidden px-6 pt-16 pb-4">
           <h2 className="text-3xl font-headline font-bold tracking-tight uppercase italic">Explore Collections</h2>
        </div>
        <CategoryShowcase />
      </div>

      {/* 3. LATEST ARRIVALS */}
      <section className="py-24 md:py-40 bg-white md:bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 md:mb-24 gap-8">
            <div className="space-y-4 md:space-y-6 max-w-2xl w-full text-center md:text-left">
              <h2 className="text-4xl md:text-7xl font-headline font-bold leading-tight uppercase">Latest Arrivals</h2>
            </div>
            <Button variant="link" asChild className="text-lg font-bold group h-auto p-0 hover:no-underline text-primary">
              <Link href="/shop" className="flex items-center gap-3">
                Full Catalog <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
