'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ZoomIn, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Product } from '@/types/product';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/currency';
import { QuickViewModal } from './QuickViewModal';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getRequiredPhotoSlots } from '@/utils/customization';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, setIsCartOpen } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stockCount !== undefined && product.stockCount <= 0) return;
    
    // Redirect if it requires photo uploads
    const requiredSlots = getRequiredPhotoSlots(product as any);
    if (requiredSlots > 0) {
      toast({
        title: "Photo Upload Required",
        description: `This personalized item requires uploading ${requiredSlots} photo(s). Redirecting to details...`,
      });
      router.push(`/products/${product.id}`);
      return;
    }
    
    if (product.sizes && product.sizes.length > 0) {
      setIsQuickViewOpen(true);
      return;
    }
    
    addToCart(product as any);
    toast({
      title: "Added to Bag",
      description: `${product.name} is ready for checkout.`,
      action: (
        <Button size="sm" variant="outline" className="h-8 rounded-full text-[10px] font-bold" onClick={() => setIsCartOpen(true)}>
          View Bag
        </Button>
      ),
    });
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
        className={`group md:h-full ${isSoldOut ? 'opacity-70 grayscale-[0.2]' : ''}`}
      >
        <div className="md:hidden flex h-full flex-col">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-border/50 bg-card shadow-premium">
            <Link href={`/products/${product.id}`} className="absolute inset-0">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </Link>

            {isSoldOut && (
              <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground font-bold tracking-widest text-[9px] uppercase h-5 px-2">
                Sold Out
              </Badge>
            )}
          </div>

          <div className="flex flex-1 flex-col pt-3 text-center">
            <Link href={`/products/${product.id}`}>
              <h3 className="min-h-[2.25rem] font-body text-sm font-bold leading-tight line-clamp-2">{product.name}</h3>
            </Link>
            {product.dimensions && (
              <p className="text-[10px] text-muted-foreground mt-0.5">Size: {product.dimensions}</p>
            )}
            <p className="mt-1 font-sans text-base font-bold text-primary">
              {formatPrice(product.price)}
            </p>
            <div className="mt-2 flex gap-2 w-full">
              <Button
                onClick={handleAddToCart}
                disabled={isSoldOut}
                variant={isSoldOut ? "secondary" : "outline"}
                className="flex-1 rounded-full h-9 text-[11px] font-bold border"
              >
                {isSoldOut ? 'Out of Stock' : 'Add to Bag'}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-9 w-9 border shrink-0 hover:bg-red-50 dark:hover:bg-red-950/25 hover:text-red-500 group/heart"
              >
                <Heart className="w-4 h-4 text-muted-foreground group-hover/heart:text-red-500 group-hover/heart:fill-red-500 transition-colors" />
              </Button>
            </div>
          </div>
        </div>

        <Card className="hidden md:flex h-full overflow-hidden border border-border/40 shadow-premium hover:shadow-2xl transition-all duration-500 rounded-3xl bg-card flex-col relative">
          <div className="relative aspect-square overflow-hidden bg-muted group-hover:cursor-pointer">
            <Link href={`/products/${product.id}`} className="absolute inset-0">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className={`object-cover transition-transform duration-700 ${!isSoldOut && 'group-hover:scale-105'}`}
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
            </Link>
            
            {/* Action Buttons Overlay - Simplified and themed */}
            {!isSoldOut && (
              <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center">
                <button 
                  onClick={handleQuickView}
                  className="text-white hover:scale-125 transition-transform"
                >
                  <ZoomIn className="w-10 h-10 drop-shadow-md" />
                </button>
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

            {product.dimensions && (
              <p className="text-[10px] font-medium text-muted-foreground">Size: {product.dimensions}</p>
            )}
            
            <p className="font-headline text-xl font-bold text-primary font-sans">
              {formatPrice(product.price)}
            </p>
          </CardContent>

          <CardFooter className="px-4 pb-4 pt-0 flex gap-2">
             <Button 
               onClick={handleAddToCart} 
               disabled={isSoldOut}
               variant={isSoldOut ? "secondary" : "outline"}
               className={`flex-1 rounded-full h-10 text-sm font-bold border ${!isSoldOut && 'group-hover:bg-primary group-hover:text-primary-foreground'} transition-all`}
             >
                {isSoldOut ? 'Out of Stock' : 'Add to Bag'}
             </Button>
             <Button
               variant="outline"
               size="icon"
               className="rounded-full h-10 w-10 border shrink-0 hover:bg-red-50 dark:hover:bg-red-950/25 hover:text-red-500 group/heart"
             >
               <Heart className="w-5 h-5 text-muted-foreground group-hover/heart:text-red-500 group-hover/heart:fill-red-500 transition-colors" />
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
