
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Heart, CheckCircle2, Zap, Sparkles, MapPin, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTACT_INFO, PRODUCTS } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { PaymentSection } from '@/components/layout/PaymentSection';
import { Card } from '@/components/ui/card';

export default function Home() {
  const featuredProducts = PRODUCTS.filter(p => p.featured);

  return (
    <div className="flex flex-col gap-0 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden bg-background">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-background to-accent/10" />
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" 
          />
        </div>

        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/5 text-primary text-sm font-bold uppercase tracking-widest border border-primary/10">
              <Sparkles className="w-5 h-5" /> Unique Artistry
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-bold leading-[1.1] tracking-tight">
              Personalized <br />
              <span className="text-primary italic">Treasures</span>
            </h1>
            <p className="text-2xl text-muted-foreground max-w-xl leading-relaxed font-medium">
              Elevate your gifting with bespoke lamps, handcrafted toys, and custom frames that capture every memory.
            </p>
            <div className="flex flex-wrap gap-6 pt-4">
              <Button asChild size="lg" className="rounded-full px-12 h-20 text-2xl font-bold shadow-2xl shadow-primary/20">
                <Link href="/shop">Start Shopping <ShoppingBag className="ml-3 w-6 h-6" /></Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-24 space-y-6">
            <h2 className="text-5xl md:text-7xl font-headline font-bold">Featured Treasures</h2>
            <div className="h-2 w-24 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Find Us Section - High Contrast and Clear */}
      <section className="py-32 bg-accent/10 border-y border-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-4 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold uppercase tracking-widest">
                <MapPin className="w-5 h-5" /> Visit Our Studio
              </div>
              <h2 className="text-5xl md:text-7xl font-headline font-bold leading-tight">Find Us in <br/> Tamil Nadu</h2>
              <p className="text-2xl text-muted-foreground leading-relaxed max-w-lg">
                Experience our craft in person. Visit our Kallal studio to discuss your unique projects.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <p className="text-sm font-bold uppercase tracking-widest text-primary">Studio Address</p>
                  <p className="text-lg text-foreground font-medium leading-relaxed">
                    {CONTACT_INFO.address}
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold uppercase tracking-widest text-primary">Contact Info</p>
                  <div className="flex flex-col gap-2 text-lg text-foreground font-bold">
                    <span className="flex items-center gap-3"><Phone className="w-5 h-5 text-primary" /> {CONTACT_INFO.phone}</span>
                    <span className="flex items-center gap-3 text-green-600"><MessageSquare className="w-5 h-5" /> WhatsApp Available</span>
                  </div>
                </div>
              </div>

              <Button asChild size="lg" className="rounded-full px-12 h-20 text-2xl font-bold shadow-xl">
                <a href={CONTACT_INFO.googleMap} target="_blank" rel="noopener noreferrer">Get Directions</a>
              </Button>
            </div>

            <Card className="rounded-[4rem] overflow-hidden border-none shadow-2xl h-[600px] relative bg-muted group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15712.3023963483!2d78.7061763!3d9.8856143!2m3!1f0!2f0!3f0!3m2!1i1024!2i1026!3m4!1s0x3b0067645601972f%3A0xc6e467d302a24683!2zUEdLIFNUVURJTw!5e0!3m2!1sen!2sin!4v1709400000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                className="transition-opacity dark:opacity-90"
              ></iframe>
            </Card>
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
