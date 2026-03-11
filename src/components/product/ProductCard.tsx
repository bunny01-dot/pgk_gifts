
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ShoppingBag, Eye, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Product } from '@/lib/data';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/currency';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="group"
      >
        <Card className="overflow-hidden border-none shadow-soft hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 rounded-[3rem] bg-card flex flex-col h-full relative">
          <div className="block relative aspect-square overflow-hidden bg-muted m-6 rounded-[2rem] cursor-pointer">
            <Link href={`/products/${product.id}`}>
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
            </Link>
            
            <div className="absolute top-5 right-5 flex flex-col gap-3 translate-x-16 group-hover:translate-x-0 transition-all duration-500 delay-75">
              <Button variant="secondary" size="icon" className="rounded-full shadow-xl bg-white/95 backdrop-blur-sm h-12 w-12 border-none">
                <Heart className="w-6 h-6 text-primary" />
              </Button>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 translate-y-20 group-hover:translate-y-0 transition-all duration-500 w-[85%]">
              <Button 
                onClick={handleQuickView}
                variant="secondary" 
                className="w-full rounded-full shadow-2xl bg-white/95 backdrop-blur-md h-14 font-bold gap-3 text-lg border-none"
              >
                <Eye className="w-5 h-5" /> Quick Preview
              </Button>
            </div>
          </div>

          <CardContent className="px-10 pb-4 flex-1 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em] font-bold">{product.category}</p>
              <div className="flex items-center gap-1.5 text-yellow-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-bold text-foreground">5.0</span>
              </div>
            </div>
            
            <Link href={`/products/${product.id}`}>
              <h3 className="font-headline text-3xl font-bold line-clamp-1 hover:text-primary transition-colors tracking-tight">{product.name}</h3>
            </Link>
            
            <p className="font-headline text-4xl font-bold text-primary mt-2">
              {formatPrice(product.price)}
            </p>
          </CardContent>

          <CardFooter className="px-10 pb-10">
            <Button onClick={handleAddToCart} className="w-full rounded-full gap-4 h-16 text-lg font-bold shadow-xl transition-all group/btn active:scale-95">
              <ShoppingBag className="w-6 h-6 transition-transform group-hover/btn:-rotate-12" />
              Add to Bag
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <QuickViewModal 
        product={product as any} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </>
  );
}
