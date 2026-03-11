'use client';

import Image from 'next/image';
import { Product } from '@/lib/data';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/currency';
import { ShoppingBag, Star, Heart, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl bg-card">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Magnification Area */}
          <div className="relative aspect-square bg-muted group overflow-hidden">
            <motion.div 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="relative h-full w-full"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 hover:scale-125 cursor-zoom-in"
              />
            </motion.div>
            <Badge className="absolute top-6 left-6 bg-background/80 backdrop-blur-md text-foreground border-none font-bold">
              High Definition
            </Badge>
          </div>

          {/* Details Area */}
          <div className="p-10 flex flex-col justify-center gap-8 bg-card">
            <DialogHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="rounded-full uppercase tracking-[0.2em] font-bold text-[10px] bg-accent text-primary">
                  {product.category}
                </Badge>
                <div className="flex items-center gap-1.5 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold text-foreground">5.0 Vouched</span>
                </div>
              </div>
              <DialogTitle className="text-4xl font-headline font-bold text-foreground leading-tight">
                {product.name}
              </DialogTitle>
            </DialogHeader>
            
            <p className="text-lg text-muted-foreground leading-relaxed italic font-headline">
              "{product.description}"
            </p>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Investment</p>
              <div className="text-5xl font-headline font-bold text-primary">
                {formatPrice(product.price)}
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <Button 
                onClick={() => { addToCart(product); onClose(); }}
                className="w-full rounded-full h-16 text-xl font-headline font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95"
              >
                <ShoppingBag className="mr-3 w-6 h-6" /> Add to Bag
              </Button>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 rounded-full h-12 font-bold border-2" onClick={onClose}>
                  Continue Browsing
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center mt-4">
              Click the image on the left to zoom
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
