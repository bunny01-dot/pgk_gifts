'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Package, Star, Heart, CheckCircle2, Camera, Gift, Users, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTACT_INFO, PRODUCTS } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { PaymentSection } from '@/components/layout/PaymentSection';

export default function Home() {
  const featuredProducts = PRODUCTS.filter(p => p.featured);

  return (
    <div className="flex flex-col gap-0 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden bg-background">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-background to-accent/10" />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-24 -left-24 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px]" 
          />
        </div>

        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest border border-primary/10">
              <Sparkles className="w-4 h-4 fill-primary" /> Premium Collections
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-bold leading-[1.1] tracking-tight text-foreground">
              Personalized <br />
              <span className="text-primary italic">Artistry</span> for You.
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-medium">
              Elevate your gifting experience with bespoke lamps, handcrafted toys, and custom frames that tell your unique story.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="rounded-full px-10 text-lg h-16 shadow-2xl shadow-primary/20">
                <Link href="/shop">Shop Collection <ShoppingBag className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-10 text-lg h-16 border-2 bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-white hover:border-primary transition-all">
                <Link href="/gallery" className="flex items-center">
                  <span>Browse Categories</span>
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-12 pt-8 border-t border-muted">
               <div className="flex flex-col">
                  <span className="text-4xl font-headline font-bold">1,200+</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Orders Fulfilled</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-4xl font-headline font-bold">4.9/5</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Client Happiness</span>
               </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative h-[500px] lg:h-[700px] flex items-center justify-center"
          >
            <div className="relative w-full h-full max-w-[550px]">
              <Image
                src="https://i.postimg.cc/kG6y8qBj/500-rs-6-colour-lights-panda-light-lamp.png"
                alt="Main Product"
                fill
                className="object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)]"
                priority
              />
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 -right-4 bg-card p-5 rounded-3xl shadow-2xl border-none flex items-center gap-4 z-20"
              >
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-primary">
                   <Heart className="w-6 h-6 fill-current" />
                </div>
                <div>
                   <p className="font-bold text-sm">Most Loved</p>
                   <p className="text-xs text-muted-foreground">Panda LED Lamp</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Treasures */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-24 space-y-6">
            <h2 className="text-5xl md:text-6xl font-headline font-bold">Featured Treasures</h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            <p className="text-xl text-muted-foreground">Handpicked favorites that bring warmth to every corner of your home.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-20">
             <Button asChild size="lg" variant="outline" className="rounded-full px-12 h-16 text-lg border-2 font-bold group">
               <Link href="/shop">
                  Explore Full Catalog <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
               </Link>
             </Button>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-32 bg-accent/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Light Lamps", img: "https://i.postimg.cc/QtnbHHxf/unicorn.png", link: "/products/light-lamps" },
              { title: "Cute Toys", img: "https://i.postimg.cc/2j1pTWv5/BREATHING-TEDDY-350-RS.jpg", link: "/products/cute-toys" },
              { title: "Personalized", img: "https://i.postimg.cc/VLtxPcDT/Mug-print-199-rs.png", link: "/products/customized-gifts" }
            ].map((cat, i) => (
              <Link key={i} href={cat.link} className="group relative h-[450px] rounded-[3rem] overflow-hidden shadow-xl">
                <Image src={cat.img} alt={cat.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white text-center">
                  <h3 className="text-4xl font-headline font-bold mb-4">{cat.title}</h3>
                  <div className="w-12 h-1 bg-white/50 group-hover:w-24 transition-all duration-500 rounded-full" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { icon: Zap, title: "Fast Shipping", desc: "Express delivery nationwide" },
              { icon: CheckCircle2, title: "Premium Quality", desc: "Hand-crafted excellence" },
              { icon: Users, title: "Personal Care", desc: "Dedicated support team" },
              { icon: Gift, title: "Beautiful Packaging", desc: "Ready for gifting" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-headline font-bold">{item.title}</h3>
                <p className="text-sm opacity-70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <div className="container mx-auto px-4 py-32">
        <PaymentSection />
      </div>
    </div>
  );
}
