'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Eye, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Product } from '@/types/product';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/currency';
import { QuickViewModal } from './QuickViewModal';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stockCount !== undefined && product.stockCount <= 0) return;
    addToCart(product as any);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const isSoldOut = product.stockCount !== undefined && product.stockCount <= 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`group h-full ${isSoldOut ? 'opacity-70 grayscale-[0.2]' : ''}`}
      >
        <Card className="h-full overflow-hidden border-none shadow-premium hover:shadow-2xl transition-all duration-500 rounded-3xl bg-card flex flex-col relative border border-border/50">
          <div className="relative aspect-[4/5] overflow-hidden bg-muted group-hover:cursor-pointer">
            <Link href={`/products/${product.id}`} className="absolute inset-0">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className={`object-cover transition-transform duration-700 ${!isSoldOut && 'group-hover:scale-105'}`}
              />
            </Link>
            
            {/* Action Buttons Overlay - Simplified and themed */}
            {!isSoldOut && (
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  onClick={handleQuickView}
                  variant="outline" 
                  className="rounded-full h-12 w-12 p-0 shadow-2xl bg-background/90 backdrop-blur-md border border-primary/20 hover:scale-110 transition-transform"
                >
                  <Eye className="w-6 h-6 text-primary" />
                </Button>
              </div>
            )}

            {isSoldOut ? (
              <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground font-bold tracking-widest text-[10px] uppercase h-6 px-3">
                Sold Out
              </Badge>
            ) : product.featured && (
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground font-bold tracking-widest text-[10px] uppercase h-6 px-3">
                Featured
              </Badge>
            )}
            
            <button className="absolute top-4 right-4 h-10 w-10 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all translate-y-[-10px] group-hover:translate-y-0">
              <Heart className="w-5 h-5 text-muted-foreground hover:text-red-500 transition-colors" />
            </button>
          </div>

          <CardContent className="p-4 flex-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{product.category}</span>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-bold text-foreground">5.0</span>
              </div>
            </div>
            
            <Link href={`/products/${product.id}`}>
              <h3 className="font-headline text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
            </Link>
            
            <p className="font-headline text-xl font-bold text-primary font-sans">
              {formatPrice(product.price)}
            </p>
          </CardContent>

          <CardFooter className="px-4 pb-4 pt-0">
             <Button 
               onClick={handleAddToCart} 
               disabled={isSoldOut}
               variant={isSoldOut ? "secondary" : "outline"}
               className={`w-full rounded-full h-10 text-sm font-bold border ${!isSoldOut && 'group-hover:bg-primary group-hover:text-primary-foreground'} transition-all`}
             >
                {isSoldOut ? 'Out of Stock' : 'Add to Bag'}
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
