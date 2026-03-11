'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Sparkles, Star, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCTS } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const featuredProducts = PRODUCTS.filter(p => p.featured);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center pt-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary),0.05),transparent_50%)]" />
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.4, 0.3] 
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]"
          />
        </div>

        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest border border-primary/10">
              <Sparkles className="w-4 h-4" /> Crafted with Love
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-bold leading-[1.05] tracking-tight text-foreground">
              Artistry in <br />
              <span className="text-muted-foreground italic font-serif">Every Detail</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
              Bespoke lamps, handcrafted toys, and custom frames designed to turn your moments into lasting legacies.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Button asChild size="lg" className="rounded-full px-10 h-16 text-lg font-bold shadow-lg">
                <Link href="/shop">Explore Collection <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-10 h-16 text-lg font-bold border-2">
                <Link href="/gallery">View Portfolio</Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-8">
              <div className="text-center lg:text-left">
                <p className="text-3xl font-headline font-bold">12k+</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Happy Clients</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center lg:text-left">
                <p className="text-3xl font-headline font-bold">4.9/5</p>
                <div className="flex items-center gap-0.5 text-yellow-500">
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative h-[400px] lg:h-[650px] flex items-center justify-center"
          >
            <div className="relative w-full h-full max-w-[500px] lg:max-w-none">
              <Image
                src="https://i.postimg.cc/kG6y8qBj/500-rs-6-colour-lights-panda-light-lamp.png"
                alt="Bespoke Panda Lamp"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
            {/* Floating Card UI */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 right-0 lg:right-10 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-premium border flex items-center gap-4 hidden sm:flex"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest">Quality Guaranteed</p>
                <p className="text-[10px] text-muted-foreground">Studio Inspected</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Grid */}
      <section className="py-32 bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="space-y-4 max-w-xl">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary/40">Our Best Sellers</p>
              <h2 className="text-4xl md:text-6xl font-headline font-bold">Featured Treasures</h2>
            </div>
            <Button variant="link" asChild className="text-lg font-bold group">
              <Link href="/shop" className="flex items-center gap-2">
                View All Catalog <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 border-y">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <TrustItem 
              icon={<Truck className="w-8 h-8" />} 
              title="Fast Shipping" 
              desc="Reliable delivery to your doorstep across Tamil Nadu."
            />
            <TrustItem 
              icon={<Star className="w-8 h-8" />} 
              title="Premium Quality" 
              desc="Handcrafted with attention to every single detail."
            />
            <TrustItem 
              icon={<ShieldCheck className="w-8 h-8" />} 
              title="Secure Payments" 
              desc="Fully encrypted transactions via Razorpay."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function TrustItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-2">
        {icon}
      </div>
      <h3 className="text-xl font-headline font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{desc}</p>
    </div>
  );
}