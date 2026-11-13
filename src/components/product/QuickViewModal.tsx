'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/utils/currency';
import { ShoppingBag, Star, Heart, CreditCard, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getRequiredPhotoSlots } from '@/utils/customization';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    const firstSize = product?.sizes?.[0];
    if (firstSize) {
      setSelectedSize(firstSize.name);
    } else {
      setSelectedSize('');
    }
  }, [product]);

  if (!product) return null;

  const currentPrice = product.sizes && selectedSize
    ? (product.sizes.find(s => s.name === selectedSize)?.price || product.price)
    : product.price;

  const requiredSlots = getRequiredPhotoSlots(product as any);

  const handleBuyNow = () => {
    addToCart({
      ...product,
      price: currentPrice,
      selectedSize: product.sizes ? selectedSize : undefined,
      requiredPhotoSlots: requiredSlots,
    });
    router.push('/checkout');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl md:rounded-[3rem] border-none shadow-2xl bg-card">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-2"
        >
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
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
            <Badge className="absolute top-6 left-6 bg-background/80 backdrop-blur-md text-foreground border-none font-bold">
              High Definition
            </Badge>
          </div>

          {/* Details Area */}
          <div className="p-5 md:p-10 flex flex-col justify-center gap-4 md:gap-6 bg-card">
            <DialogHeader className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="rounded-full uppercase tracking-[0.2em] font-bold text-[10px] bg-accent text-primary">
                  {product.category}
                </Badge>
                <div className="flex items-center gap-1.5 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold text-foreground">5.0 Vouched</span>
                </div>
              </div>
              <DialogTitle className="text-2xl md:text-4xl font-headline font-bold text-foreground leading-tight">
                {product.name}
              </DialogTitle>
            </DialogHeader>
            
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed italic font-headline line-clamp-2">
              &ldquo;{product.description}&rdquo;
            </p>

            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Select Size</span>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz.name}
                      onClick={() => setSelectedSize(sz.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-300 ${
                        selectedSize === sz.name
                          ? 'border-primary bg-primary/10 text-primary shadow-sm scale-105'
                          : 'border-border bg-card hover:border-primary/50 text-foreground'
                      }`}
                    >
                      {sz.name} ({formatPrice(sz.price)})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Investment</p>
              <div className="text-3xl md:text-5xl font-headline font-bold text-primary">
                {formatPrice(currentPrice)}
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <Button 
                onClick={handleBuyNow}
                className="w-full rounded-full h-11 md:h-16 text-base md:text-xl font-headline font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95 bg-primary hover:bg-primary/90"
              >
                <CreditCard className="mr-3 w-6 h-6" /> Buy Now
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => { 
                  addToCart({
                    ...product,
                    price: currentPrice,
                    selectedSize: product.sizes ? selectedSize : undefined,
                    requiredPhotoSlots: requiredSlots,
                  }); 
                  toast({
                    title: "Added to Bag",
                    description: `${product.name} has been added to your shopping bag.`,
                  });
                  onClose(); 
                }}
                className="w-full rounded-full h-10 md:h-12 text-sm font-bold border md:border-2"
              >
                <ShoppingBag className="mr-2 w-4 h-4" /> Add to Bag
              </Button>

              {requiredSlots > 0 && (
                <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1.5">
                  <Camera className="w-3 h-3 shrink-0" />
                  Photos needed — you can upload them on the product page or we&apos;ll remind you at checkout.
                </p>
              )}
              
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1 rounded-full h-10 text-xs font-bold opacity-60 hover:opacity-100" onClick={onClose}>
                  Continue Browsing
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => toggleWishlist(product)}
                  className={`rounded-full h-10 w-10 ${isInWishlist(product.id) ? 'text-red-500 hover:text-red-600' : 'opacity-60 hover:opacity-100'}`}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
