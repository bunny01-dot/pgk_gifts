
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCTS, CONTACT_INFO } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { useFirestore } from '@/firebase';

export default function Home() {
  const firestore = useFirestore();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>(PRODUCTS.filter(p => p.featured));

  useEffect(() => {
    if (!firestore) return;
    const fetchFeatured = async () => {
      try {
        const { ProductsService } = await import('@/services/products.service');
        const svc = new ProductsService(firestore);
        const dynamic = await svc.getAllProducts();
        if (dynamic && dynamic.length > 0) {
          setFeaturedProducts(dynamic.filter(p => p.featured));
        }
      } catch (e) {
        console.error("Failed to load db products", e);
      }
    };
    fetchFeatured();
  }, [firestore]);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-background">
        
        {/* Background Collage Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Subtle fade edges so the collage blends into the website instead of sharp lines */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent z-10" />
          
          <div className="absolute w-[200vw] -left-[50vw] top-[-5vh] flex flex-col gap-8 opacity-25 scale-105 z-0 pointer-events-none">
            {/* Top row - scrolls left */}
            <motion.div 
               animate={{ x: [0, -1000] }} 
               transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
               className="flex gap-8"
            >
               {[...PRODUCTS, ...PRODUCTS, ...PRODUCTS, ...PRODUCTS].map((p, i) => (
                 <div key={`row1-${i}`} className="relative w-72 h-80 rounded-[3rem] overflow-hidden shrink-0 shadow-2xl border border-white/20">
                    <Image src={p?.image || '/placeholder.png'} alt="background" fill className="object-cover" />
                 </div>
               ))}
            </motion.div>

            {/* Bottom row - scrolls right */}
            <motion.div 
               animate={{ x: [-1000, 0] }} 
               transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
               className="flex gap-8"
            >
               {[...PRODUCTS, ...PRODUCTS, ...PRODUCTS, ...PRODUCTS].reverse().map((p, i) => (
                 <div key={`row2-${i}`} className="relative w-72 h-80 rounded-[3rem] overflow-hidden shrink-0 shadow-2xl border border-white/20">
                    <Image src={p?.image || '/placeholder.png'} alt="background" fill className="object-cover" />
                 </div>
               ))}
            </motion.div>
          </div>
        </div>

        <div className="container relative z-10 mx-auto px-6 flex flex-col items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-10 text-center relative max-w-4xl mx-auto"
          >
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-headline font-bold leading-[0.95] tracking-tight text-foreground drop-shadow-2xl">
              Moments Captured,<br />
              <span className="text-primary italic font-serif opacity-90">Memories Crafted</span>
            </h1>

            <div className="space-y-4 bg-background/40 backdrop-blur-sm p-6 rounded-3xl inline-block border border-white/10 shadow-2xl">
              <p className="text-2xl md:text-3xl font-headline font-bold text-foreground">Where Art Meets Heart</p>
              <p className="text-xl md:text-2xl text-muted-foreground mx-auto leading-relaxed font-medium">
                Your Life, Beautifully Crafted.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <Button asChild size="lg" className="rounded-full px-12 h-16 text-lg font-bold shadow-[0_0_40px_rgba(var(--primary),0.4)] transition-all hover:scale-105 active:scale-95">
                <Link href="/shop" className="flex items-center gap-3">
                  Shop Collection <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-12 h-16 text-lg font-bold border-2 hover:bg-secondary bg-background/80 backdrop-blur-sm">
                <Link href="/gallery">Our Portfolio</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-40 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="space-y-6 max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.5em] text-muted-foreground">The Boutique Catalog</p>
              <h2 className="text-5xl md:text-7xl font-headline font-bold leading-tight text-foreground">Featured Treasures</h2>
            </div>
            <Button variant="link" asChild className="text-lg font-bold group h-auto p-0 hover:no-underline text-primary">
              <Link href="/shop" className="flex items-center gap-3">
                Browse Full Catalog <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
