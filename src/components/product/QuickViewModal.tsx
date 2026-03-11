'use client';

import Image from 'next/image';
import { Product } from '@/types/product';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/currency';
import { ShoppingBag, ArrowRight, Star, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative aspect-square md:aspect-auto bg-muted">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
            <button className="absolute top-4 left-4 h-10 w-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <div className="p-8 flex flex-col justify-center gap-6">
            <DialogHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="rounded-full uppercase tracking-[0.2em] font-bold text-[10px]">
                  {product.category}
                </Badge>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold text-foreground">5.0</span>
                </div>
              </div>
              <DialogTitle className="text-3xl font-headline font-bold text-foreground">
                {product.name}
              </DialogTitle>
            </DialogHeader>
            
            <p className="text-base text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <div className="text-3xl font-headline font-bold text-primary">
              {formatPrice(product.price)}
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <Button 
                onClick={() => { addToCart(product); onClose(); }}
                className="w-full rounded-full h-14 text-lg font-bold shadow-lg"
              >
                <ShoppingBag className="mr-2 w-5 h-5" /> Add to Bag
              </Button>
              <Button 
                variant="outline"
                className="w-full rounded-full h-14 font-bold border-2"
                asChild
              >
                <a href={`/products/${product.id}`}>
                  Product Details <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}