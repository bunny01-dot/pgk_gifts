
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Package, Star, Heart, CheckCircle2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CONTACT_INFO, PRODUCTS } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { PaymentSection } from '@/components/layout/PaymentSection';

export default function Home() {
  const featuredProducts = PRODUCTS.filter(p => p.featured);

  return (
    <div className="flex flex-col gap-0 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/30 via-background to-background" />
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest border border-primary/10">
              <Star className="w-4 h-4 fill-primary" /> Premium Gift Collection 2024
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-bold leading-[1.1] tracking-tight text-foreground">
              Crafting <span className="text-primary italic">Memories</span> into Art.
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-medium">
              Discover our exclusive selection of personalized lamps, cuddly toys, and custom frames designed to stay with you forever.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full px-10 text-lg h-16 shadow-2xl">
                <Link href="/shop">Shop Collection <ShoppingBag className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-10 text-lg h-16 border-2 bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                <Link href="/photography" className="flex items-center">Book Photography <Camera className="ml-2 w-5 h-5" /></Link>
              </Button>
            </div>
            <div className="flex items-center gap-8 pt-4">
               <div className="flex flex-col">
                  <span className="text-3xl font-headline font-bold">1k+</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Orders Delivered</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-3xl font-headline font-bold">4.9/5</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Customer Rating</span>
               </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative h-[600px] lg:h-[750px] flex items-center justify-center"
          >
            <div className="relative w-full h-full max-w-[550px]">
              <Image
                src="https://i.postimg.cc/kG6y8qBj/500-rs-6-colour-lights-panda-light-lamp.png"
                alt="Featured Product"
                fill
                className="object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)] animate-float"
                priority
              />
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 -right-8 bg-card p-4 rounded-2xl shadow-xl border-none flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-primary">
                   <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                   <p className="font-bold text-sm">Best Seller</p>
                   <p className="text-xs text-muted-foreground">Panda Lamp</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-20 space-y-6">
            <h2 className="text-5xl md:text-6xl font-headline font-bold">Featured Treasures</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
            <p className="text-xl text-muted-foreground">Handpicked favorites that bring joy and warmth to any home.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-20">
             <Button asChild size="lg" variant="outline" className="rounded-full px-12 h-16 text-lg border-2 font-bold group">
               <Link href="/shop">
                  Browse Full Catalog <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
               </Link>
             </Button>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-20 bg-primary text-primary-foreground overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: CheckCircle2, title: "Quality Guarantee", desc: "Hand-crafted with premium materials" },
              { icon: ShoppingBag, title: "Secure Payments", desc: "Trusted Razorpay checkout" },
              { icon: Package, title: "Fast Delivery", desc: "Express shipping across India" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-4">
                <item.icon className="w-10 h-10 opacity-50" />
                <h3 className="text-2xl font-headline font-bold">{item.title}</h3>
                <p className="opacity-70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <div className="container mx-auto px-4 py-32">
        <PaymentSection />
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
