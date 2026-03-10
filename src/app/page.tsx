
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare, Package, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CONTACT_INFO, PRODUCTS } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { PaymentSection } from '@/components/layout/PaymentSection';

export default function Home() {
  const featuredProducts = PRODUCTS.filter(p => p.featured);

  return (
    <div className="flex flex-col gap-0 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-primary text-sm font-bold uppercase tracking-wider">
              <Star className="w-4 h-4 fill-current" /> Premium Gifts & Studio
            </div>
            <h1 className="text-6xl md:text-8xl font-headline font-bold leading-tight">
              {CONTACT_INFO.tagline}
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
              From adorable lamps to custom frames, we turn your cherished memories into physical treasures. High quality, personalized just for you.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full px-8 text-lg h-14">
                <Link href="/products">View Products <Package className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 text-lg h-14 border-2">
                <a href={CONTACT_INFO.whatsapp} target="_blank" rel="noopener noreferrer">
                  Order on WhatsApp <MessageSquare className="ml-2 w-5 h-5" />
                </a>
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative h-[500px] lg:h-[700px]"
          >
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-[100px] -z-10" />
            <Image
              src="https://i.postimg.cc/kG6y8qBj/500-rs-6-colour-lights-panda-light-lamp.png"
              alt="Hero Product"
              fill
              className="object-contain drop-shadow-2xl animate-bounce-slow"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">Featured Collections</h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                Explore our handpicked selection of the most loved personalized gifts and light lamps.
              </p>
            </div>
            <Button asChild variant="ghost" className="text-lg font-bold group">
              <Link href="/products">
                See All Products <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Fast Links */}
      <section className="py-20 bg-accent/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Light Lamps", href: "/products/light-lamps", icon: "✨" },
              { name: "Cute Toys", href: "/products/cute-toys", icon: "🧸" },
              { name: "Customized Gifts", href: "/products/customized-gifts", icon: "🎁" }
            ].map((cat) => (
              <Link key={cat.name} href={cat.href} className="group">
                <Card className="p-8 text-center bg-background border-none shadow-soft hover:shadow-xl transition-all duration-300 rounded-[2rem]">
                  <div className="text-6xl mb-6 group-hover:scale-125 transition-transform duration-500">{cat.icon}</div>
                  <h3 className="text-2xl font-headline font-bold mb-2">{cat.name}</h3>
                  <p className="text-muted-foreground">Browse the full collection</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <div className="container mx-auto px-4 py-12">
        <PaymentSection />
      </div>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-20px); }
          50% { transform: translateY(20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
