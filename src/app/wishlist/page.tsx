'use client';

import { useWishlist } from '@/context/WishlistContext';
import { ProductCard } from '@/components/product/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const [isLoaded, setIsLoaded] = useState(false);

  // Prevent hydration flash
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-60" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 md:pt-40 pb-20 md:pb-40 bg-background">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-8 md:mb-16 space-y-3 md:space-y-6"
        >
          <Badge variant="outline" className="px-4 py-1 rounded-full uppercase tracking-widest font-bold border-primary text-primary flex items-center gap-1.5 w-fit mx-auto">
            <Heart className="w-3.5 h-3.5 fill-primary text-primary" /> Saved Items
          </Badge>
          <h1 className="text-3xl md:text-8xl font-headline font-bold leading-tight tracking-tight md:tracking-tighter">
            My Wishlist
          </h1>
          <p className="text-base md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Your collection of curated favorites. Keep track of items you love and add them to your bag when you are ready.
          </p>
        </motion.div>

        {/* Wishlist Grid */}
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="popLayout">
            {wishlist.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center text-center p-10 md:p-20 rounded-[2.5rem] bg-secondary/20 border border-border/50 shadow-soft"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 animate-pulse">
                  <Heart className="w-10 h-10" />
                </div>
                <h3 className="text-2xl md:text-3xl font-headline font-bold text-foreground mb-3">Your wishlist is empty</h3>
                <p className="text-muted-foreground font-medium max-w-md mx-auto mb-8 leading-relaxed">
                  Explore our premium custom gifts, magic lamps, photo frames and find something you love!
                </p>
                <Button asChild className="rounded-full h-14 px-8 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                  <Link href="/shop" className="flex items-center gap-2">
                    Browse Boutique <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10"
              >
                {wishlist.map((item, index) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                      delay: Math.min(index * 0.03, 0.2),
                      layout: { type: "spring", damping: 30, stiffness: 200 }
                    }}
                  >
                    <ProductCard product={item} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
