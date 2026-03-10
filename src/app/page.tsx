'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Heart, CheckCircle2, Zap, Sparkles, MapPin, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTACT_INFO, PRODUCTS } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { PaymentSection } from '@/components/layout/PaymentSection';
import { Card, CardContent } from '@/components/ui/card';

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
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/5 text-primary text-sm font-bold uppercase tracking-widest border border-primary/10">
              <Sparkles className="w-5 h-5 fill-primary" /> Premium Collections
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-bold leading-[1.1] tracking-tight text-foreground">
              Personalized <br />
              <span className="text-primary italic">Artistry</span> for You.
            </h1>
            <p className="text-2xl text-muted-foreground max-w-xl leading-relaxed font-medium">
              Elevate your gifting experience with bespoke lamps, handcrafted toys, and custom frames that tell your unique story.
            </p>
            <div className="flex flex-wrap gap-6 pt-4">
              <Button asChild size="lg" className="rounded-full px-12 text-xl h-20 shadow-2xl shadow-primary/20">
                <Link href="/shop">Shop Collection <ShoppingBag className="ml-3 w-6 h-6" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-12 text-xl h-20 border-2 bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all">
                <Link href="/gallery" className="flex items-center">
                  <span>Browse Categories</span>
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-16 pt-8 border-t border-muted">
               <div className="flex flex-col">
                  <span className="text-5xl font-headline font-bold text-foreground">1,200+</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Orders Fulfilled</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-5xl font-headline font-bold text-foreground">4.9/5</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Client Happiness</span>
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
                className="absolute top-1/4 -right-4 bg-card p-6 rounded-[2rem] shadow-2xl border-none flex items-center gap-5 z-20"
              >
                <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center text-primary">
                   <Heart className="w-7 h-7 fill-current" />
                </div>
                <div>
                   <p className="font-bold text-base text-foreground">Most Loved</p>
                   <p className="text-sm text-muted-foreground">Panda LED Lamp</p>
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
            <h2 className="text-5xl md:text-7xl font-headline font-bold text-foreground">Featured Treasures</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
            <p className="text-2xl text-muted-foreground leading-relaxed">Handpicked favorites that bring warmth to every corner of your home.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-20">
             <Button asChild size="lg" variant="outline" className="rounded-full px-16 h-20 text-xl border-2 font-bold group">
               <Link href="/shop">
                  Explore Full Catalog <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
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
              <Link key={i} href={cat.link} className="group relative h-[500px] rounded-[3rem] overflow-hidden shadow-xl">
                <Image src={cat.img} alt={cat.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white text-center">
                  <h3 className="text-5xl font-headline font-bold mb-4">{cat.title}</h3>
                  <div className="w-16 h-1.5 bg-white/50 group-hover:w-32 transition-all duration-500 rounded-full" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Map & Find Us Section */}
      <section className="py-32 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-4 px-6 py-2.5 rounded-full bg-accent text-primary text-sm font-bold uppercase tracking-widest">
                <MapPin className="w-5 h-5" /> Visit Our Studio
              </div>
              <h2 className="text-5xl md:text-7xl font-headline font-bold leading-tight text-foreground">Find Us in Tamil Nadu</h2>
              <p className="text-2xl text-muted-foreground leading-relaxed max-w-lg">
                Experience our craft in person. Visit our Kallal studio to see our latest customized gifts and discuss your unique projects.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-4">
                <div className="space-y-3">
                  <p className="text-sm font-bold uppercase tracking-widest text-primary">Studio Address</p>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    PGK Studio, Indira Nagar Church Road,<br />
                    Blessing Complex, Kallal – 630305
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold uppercase tracking-widest text-primary">Contact Info</p>
                  <div className="flex flex-col gap-2 text-base text-muted-foreground">
                    <span className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary" /> {CONTACT_INFO.phone}</span>
                    <span className="flex items-center gap-3"><MessageSquare className="w-4 h-4 text-primary" /> Chat on WhatsApp</span>
                  </div>
                </div>
              </div>

              <Button asChild size="lg" className="rounded-full px-12 h-20 text-xl font-bold shadow-xl">
                <a href={CONTACT_INFO.googleMap} target="_blank" rel="noopener noreferrer">Open Directions</a>
              </Button>
            </div>

            <Card className="rounded-[3rem] overflow-hidden border-none shadow-2xl h-[600px] relative bg-muted">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15712.3023963483!2d78.7061763!3d9.8856143!2m3!1f0!2f0!3f0!3m2!1i1024!2i1026!3m4!1s0x3b0067645601972f%3A0xc6e467d302a24683!2zUEdLIFNUVURJTw!5e0!3m2!1sen!2sin!4v1709400000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                className="transition-opacity dark:opacity-80"
              ></iframe>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            {[
              { icon: Zap, title: "Fast Shipping", desc: "Express delivery nationwide" },
              { icon: CheckCircle2, title: "Premium Quality", desc: "Hand-crafted excellence" },
              { icon: Heart, title: "Personal Care", desc: "Dedicated support team" },
              { icon: ShoppingBag, title: "Beautiful Packaging", desc: "Ready for gifting" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <item.icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-headline font-bold">{item.title}</h3>
                <p className="text-base opacity-70">{item.desc}</p>
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
