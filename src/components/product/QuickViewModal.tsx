'use client';

import Image from 'next/image';
import { Product } from '@/types/product';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/currency';
import { ShoppingBag, ArrowRight } from 'lucide-react';
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
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative aspect-square md:aspect-auto h-full bg-muted">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center gap-6">
            <DialogHeader>
              <Badge variant="secondary" className="w-fit mb-4 rounded-full uppercase tracking-widest font-bold">
                {product.category}
              </Badge>
              <DialogTitle className="text-4xl font-headline font-bold text-foreground leading-tight">
                {product.name}
              </DialogTitle>
            </DialogHeader>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <div className="text-4xl font-headline font-bold text-primary">
              {formatPrice(product.price)}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button 
                onClick={() => { addToCart(product); onClose(); }}
                className="flex-1 rounded-full h-16 text-lg font-bold shadow-lg"
              >
                <ShoppingBag className="mr-2 w-5 h-5" /> Add to Bag
              </Button>
              <Button 
                variant="outline"
                className="flex-1 rounded-full h-16 text-lg font-bold border-2"
                asChild
              >
                <a href={`/products/${product.id}`}>
                  View Details <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
