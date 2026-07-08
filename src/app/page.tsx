
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
import { adjustProductPrice } from '@/utils/currency';
const ADJUSTED_PRODUCTS = PRODUCTS.map(p => adjustProductPrice(p));

import type { Product } from '@/types/product';

export default function Home() {
  const firstProduct = ADJUSTED_PRODUCTS[0];
  if (!firstProduct) {
    throw new Error("No products found in catalog.");
  }
  const [featuredProduct, setFeaturedProduct] = useState<Product>(firstProduct);
  
  // A balanced curated mix of featured products across categories, including the new MDF frames
  const featuredProducts = [
    ...ADJUSTED_PRODUCTS.filter(p => p.category === 'MDF Wall Frames' && p.featured).slice(0, 2),
    ...ADJUSTED_PRODUCTS.filter(p => p.category === 'Wall Decor and Photo Frames' && p.featured).slice(0, 2),
    ...ADJUSTED_PRODUCTS.filter(p => p.category === 'Night Lamps' && p.featured).slice(0, 2),
    ...ADJUSTED_PRODUCTS.filter(p => (p.category === 'Personalized Gifts' || p.category === 'Car Dashboard Accessories') && p.featured).slice(0, 2)
  ];

  useEffect(() => {
    // Pick a random product on mount to keep the experience fresh
    const randomIndex = Math.floor(Math.random() * ADJUSTED_PRODUCTS.length);
    const randomProduct = ADJUSTED_PRODUCTS[randomIndex];
    if (randomProduct) {
      setFeaturedProduct(randomProduct);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      
      {/* 1. MASTER HERO: BRAND STORY + RANDOMIZED FEATURED PRODUCT */}
      <section className="relative md:h-screen flex items-center pt-24 md:pt-24 pb-6 md:pb-0 overflow-hidden bg-background">
        
        {/* Infinite Background Collage */}
        <div className="absolute inset-0 z-0 hidden md:block overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-background via-background/80 to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent z-10" />
          
          <div className="absolute w-[200vw] -left-[50vw] top-[18vh] flex flex-col gap-8 scale-100 z-0 pointer-events-none">
            <motion.div 
               animate={{ x: [0, -1500] }} 
               transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
               className="flex gap-8"
            >
               {[...ADJUSTED_PRODUCTS, ...ADJUSTED_PRODUCTS].map((p, i) => (
                 <Link 
                   key={`row1-${i}`}
                   href={p.category === 'Night Lamps' ? '/shop?category=Night Lamps' : `/products/${p.id}`}
                   className="relative w-48 h-56 md:w-60 md:h-72 rounded-[3rem] overflow-hidden shrink-0 border border-white/10 pointer-events-auto cursor-pointer opacity-15 hover:opacity-100 transition-all duration-500 group/bgitem shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105"
                 >
                    <Image src={p?.image || '/placeholder.png'} alt={p?.name || 'background'} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/bgitem:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-left">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary">{p?.category}</p>
                      <p className="text-white text-sm font-headline font-bold leading-tight mt-1 line-clamp-2">{p?.name}</p>
                    </div>
                 </Link>
               ))}
            </motion.div>
            <motion.div 
               animate={{ x: [-1500, 0] }} 
               transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
               className="flex gap-8"
            >
               {[...ADJUSTED_PRODUCTS, ...ADJUSTED_PRODUCTS].reverse().map((p, i) => (
                 <Link 
                   key={`row2-${i}`}
                   href={p.category === 'Night Lamps' ? '/shop?category=Night Lamps' : `/products/${p.id}`}
                   className="relative w-48 h-56 md:w-60 md:h-72 rounded-[3rem] overflow-hidden shrink-0 border border-white/10 pointer-events-auto cursor-pointer opacity-15 hover:opacity-100 transition-all duration-500 group/bgitem shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105"
                 >
                    <Image src={p?.image || '/placeholder.png'} alt={p?.name || 'background'} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/bgitem:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-left">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary">{p?.category}</p>
                      <p className="text-white text-sm font-headline font-bold leading-tight mt-1 line-clamp-2">{p?.name}</p>
                    </div>
                 </Link>
               ))}
            </motion.div>
          </div>
        </div>

        <div className="container relative z-20 mx-auto px-6 h-full flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          
          {/* LEFT: BRAND STORY */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-7 md:space-y-14 text-center md:text-left relative max-w-3xl"
          >
            <div className="space-y-4 md:space-y-6">
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-primary/70">
                {CONTACT_INFO.tagline}
              </p>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-bold leading-[1] tracking-tight text-foreground">
                Moments Captured,<br />
                <span className="text-primary italic font-serif">Memories Crafted</span>
              </h1>
            </div>

            <div className="space-y-2 md:space-y-4">
              <h3 className="text-base md:text-2xl font-black uppercase tracking-[0.15em] text-foreground opacity-90">
                Where Art Meets Heart
              </h3>
              <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed font-light italic">
                Your Life, Beautifully Crafted.
              </p>
            </div>

            <div className="flex flex-row flex-wrap items-center justify-center md:justify-start gap-3 md:gap-5 pt-1 md:pt-4">
              <Button asChild size="lg" className="rounded-full px-5 md:px-12 h-10 md:h-16 text-sm md:text-lg font-bold shadow-lg md:shadow-xl shadow-primary/20 md:shadow-primary/30 transition-all hover:scale-105 active:scale-95 w-auto">
                <Link href="/shop" className="flex items-center gap-2">
                  Shop Now <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-5 md:px-12 h-10 md:h-16 text-sm md:text-lg font-bold border border-white/20 md:border-2 bg-white/15 backdrop-blur-2xl hover:bg-white/20 hover:border-white/40 text-foreground w-auto transition-all shadow-md md:shadow-lg">
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
              className="relative hidden lg:block w-1/2 max-w-sm group cursor-pointer"
            >
              <Link href={featuredProduct.category === 'Night Lamps' ? '/shop?category=Night Lamps' : `/products/${featuredProduct.id}`}>
                {/* Soft Glow Behind */}
                <div className="absolute inset-10 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="relative z-10 w-full"
                >
                  <div className="relative aspect-square rounded-[3rem] overflow-hidden border-2 border-white/20 shadow-[0_50px_100px_rgba(0,0,0,0.3)] bg-background/20 backdrop-blur-sm">
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

                  </div>
                  <div className="pt-5 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Randomized Feature</p>
                    <p className="mt-2 text-xl font-body font-bold leading-tight text-foreground">{featuredProduct.name}</p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 2. CATEGORY SHOWCASE */}
      <div className="bg-background">
        <div className="md:hidden px-6 pt-6 pb-1">
           <h2 className="text-2xl font-body font-bold tracking-tight">Highlighted Collections</h2>
        </div>
        <CategoryShowcase />
      </div>

      {/* 3. LATEST ARRIVALS */}
      <section className="pt-8 pb-16 md:py-40 bg-background md:bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-6 md:mb-24 gap-3 md:gap-8">
            <div className="space-y-2 md:space-y-6 max-w-2xl w-full text-center md:text-left">
              <h2 className="text-4xl md:text-7xl font-headline font-bold leading-tight uppercase text-foreground">Latest Arrivals</h2>
            </div>
            <Button variant="link" asChild className="text-sm md:text-lg font-bold group h-auto p-0 hover:no-underline text-primary">
              <Link href="/shop" className="flex items-center gap-2 md:gap-3">
                Full Catalog <ArrowRight className="w-4 h-4 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="flex lg:grid lg:grid-cols-4 gap-4 md:gap-10 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scroll-smooth no-scrollbar pb-6 lg:pb-0 -mx-6 px-6 lg:mx-0 lg:px-0">
            {featuredProducts.map((product) => (
              <div key={product.id} className="flex-none w-[calc((100%-16px)/2)] lg:w-auto snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
