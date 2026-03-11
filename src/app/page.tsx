'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCTS } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';

export default function Home() {
  const featuredProducts = PRODUCTS.filter(p => p.featured);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-background">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary),0.03),transparent_60%)]" />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1] 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"
          />
        </div>

        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-10 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-secondary text-primary text-xs font-bold uppercase tracking-widest border border-border">
              <Sparkles className="w-4 h-4" /> The PGK Heritage
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-headline font-bold leading-[0.95] tracking-tight text-foreground relative">
              Artistry
              <motion.span 
                animate={{ y: [0, -15, 0], rotate: [5, 0, 5] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="inline-block align-middle mx-3 md:mx-6"
              >
                <div className="relative w-16 h-16 md:w-28 md:h-28 rounded-3xl overflow-hidden border-4 border-card shadow-2xl rotate-6 group cursor-pointer hover:rotate-0 transition-transform">
                   <Image 
                    src="https://i.postimg.cc/kG6y8qBj/500-rs-6-colour-lights-panda-light-lamp.png"
                    alt="Panda Hero Icon"
                    fill
                    className="object-cover scale-125"
                   />
                </div>
              </motion.span>
              in <br />
              <span className="text-muted-foreground/60 italic font-serif">Detail</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              Bespoke lamps, handcrafted toys, and legacy frames designed to turn fleeting moments into physical treasures.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-6">
              <Button asChild size="lg" className="rounded-full px-12 h-16 text-lg font-bold shadow-xl transition-all hover:scale-105 active:scale-95">
                <Link href="/shop" className="flex items-center gap-3">
                  Shop Collection <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-12 h-16 text-lg font-bold border-2 hover:bg-secondary">
                <Link href="/gallery">Our Portfolio</Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-12 pt-10">
              <div className="text-center lg:text-left">
                <p className="text-4xl font-headline font-bold">12k+</p>
                <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-black mt-1">Global Clients</p>
              </div>
              <div className="w-px h-12 bg-border/50" />
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-yellow-500 mb-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-black">Vouched Studio</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative h-[500px] lg:h-[750px] flex items-center justify-center"
          >
            <div className="relative w-full h-full max-w-[600px] animate-float">
              <Image
                src="https://i.postimg.cc/kG6y8qBj/500-rs-6-colour-lights-panda-light-lamp.png"
                alt="Bespoke Panda Lamp"
                fill
                className="object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.1)]"
                priority
              />
            </div>

            {/* Floating Contextual Badges */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 right-0 bg-card p-6 rounded-[2rem] shadow-premium border border-border/50 flex items-center gap-5 hidden sm:flex"
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Certified Quality</p>
                <p className="text-sm font-bold">Studio Inspected</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-20 left-0 bg-card p-6 rounded-[2rem] shadow-premium border border-border/50 flex items-center gap-5 hidden sm:flex"
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary">
                <Truck className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Express Transit</p>
                <p className="text-sm font-bold">Priority Shipping</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-40 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="space-y-6 max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.5em] text-muted-foreground">The Boutique Catalog</p>
              <h2 className="text-5xl md:text-7xl font-headline font-bold leading-tight">Featured Treasures</h2>
            </div>
            <Button variant="link" asChild className="text-lg font-bold group h-auto p-0 hover:no-underline">
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

      {/* Trust Grid */}
      <section className="py-32 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <TrustItem 
              icon={<ShoppingBag className="w-9 h-9" />} 
              title="Secure Commerce" 
              desc="Fully encrypted payments via Razorpay for a safe and reliable shopping experience."
            />
            <TrustItem 
              icon={<Star className="w-9 h-9" />} 
              title="Bespoke Quality" 
              desc="Every item is hand-selected and inspected in our studio for material perfection."
            />
            <TrustItem 
              icon={<Truck className="w-9 h-9" />} 
              title="Statewide Delivery" 
              desc="Swift and tracked shipping to every corner of Tamil Nadu and beyond."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function TrustItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 group">
      <div className="w-20 h-20 rounded-[2rem] bg-secondary text-primary flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm">
        {icon}
      </div>
      <div className="space-y-3">
        <h3 className="text-2xl font-headline font-bold">{title}</h3>
        <p className="text-muted-foreground leading-relaxed font-light">{desc}</p>
      </div>
    </div>
  );
}