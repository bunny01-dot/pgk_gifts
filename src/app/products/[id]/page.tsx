
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Heart, Share2, ZoomIn, ShoppingBag, ShieldCheck, Truck, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCTS } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ToastAction } from '@/components/ui/toast';
import { formatPrice } from '@/utils/currency';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-headline font-bold">Product not found</h2>
          <Button onClick={() => router.push('/shop')} className="rounded-full h-14 px-8">Back to Shop</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = (redirect = false) => {
    addToCart({
      ...product,
      quantity,
    });
    
    if (redirect) {
      router.push('/checkout');
    } else {
      toast({
        title: "Added to Bag",
        description: `${product.name} (x${quantity}) is ready for checkout.`,
        action: (
          <div className="flex gap-2">
            <ToastAction altText="View Bag" onClick={() => setIsCartOpen(true)}>
              View Bag
            </ToastAction>
            <Button size="sm" variant="outline" className="h-8 rounded-full text-[10px] font-bold" onClick={() => router.push('/cart')}>
              Checkout
            </Button>
          </div>
        ),
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="min-h-screen pt-40 pb-40 bg-background">
      <div className="container mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-12 hover:bg-accent/50 rounded-full text-foreground group h-14 px-6 text-xl font-bold"
        >
          <ArrowLeft className="mr-3 w-6 h-6 group-hover:-translate-x-2 transition-transform" /> Back to Catalog
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Image Gallery with High-End Zoom */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div 
              ref={imageRef}
              className="relative aspect-square rounded-[4rem] overflow-hidden bg-muted shadow-2xl cursor-zoom-in group border-none"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className={`object-cover transition-transform duration-200 ${isZoomed ? 'scale-150' : 'scale-100'}`}
                style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                priority
              />
              {!isZoomed && (
                <div className="absolute bottom-10 right-10 bg-white/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-8 h-8 text-primary" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-12"
          >
            <div className="space-y-8">
              <div className="flex items-center gap-5">
                <Badge variant="secondary" className="rounded-full px-6 py-2 uppercase tracking-[0.3em] font-bold text-xs bg-accent text-primary border-none">
                  {product.category}
                </Badge>
                <div className="flex items-center gap-1.5 text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-sm font-bold text-foreground ml-2">5.0 (Vouched)</span>
                </div>
              </div>
              <h1 className="text-7xl font-headline font-bold text-foreground leading-none tracking-tighter">{product.name}</h1>
              <div className="flex items-end gap-6">
                <span className="text-6xl font-headline font-bold text-primary">{formatPrice(product.price)}</span>
                <span className="text-sm text-muted-foreground mb-3 font-bold uppercase tracking-widest">Global Shipping Included</span>
              </div>
            </div>

            <p className="text-3xl text-muted-foreground leading-relaxed max-w-xl font-headline italic">
              "{product.description}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-accent/5 border border-primary/5">
                  <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                    <Truck className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Express Delivery</p>
                    <p className="text-lg font-bold">2-4 Business Days</p>
                  </div>
               </div>
               <div className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-accent/5 border border-primary/5">
                  <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Studio Grade</p>
                    <p className="text-lg font-bold">Quality Inspected</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-10 pt-8 border-t border-dashed">
              <div className="flex items-center gap-8">
                <div className="flex items-center border-2 rounded-full px-8 h-20 bg-card shadow-soft">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 font-bold text-3xl hover:text-primary transition-colors">-</button>
                  <span className="w-20 text-center font-bold text-3xl font-headline">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 font-bold text-3xl hover:text-primary transition-colors">+</button>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" size="icon" className="rounded-full h-20 w-20 border-2"><Heart className="w-8 h-8" /></Button>
                  <Button variant="outline" size="icon" className="rounded-full h-20 w-20 border-2"><Share2 className="w-8 h-8" /></Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Button onClick={() => handleAddToCart()} variant="outline" className="h-24 rounded-full text-3xl font-headline font-bold border-2">
                  <ShoppingBag className="mr-4 w-8 h-8" /> Add to Bag
                </Button>
                <Button onClick={() => handleAddToCart(true)} className="h-24 rounded-full text-3xl font-headline font-bold shadow-2xl shadow-primary/20">
                  Buy Now
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky Mobile Checkout Bar - Higher Visibility */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/90 backdrop-blur-2xl border-t p-6 flex items-center justify-between gap-6 shadow-[0_-15px_50px_rgba(0,0,0,0.15)]">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Investment</span>
          <span className="text-3xl font-headline font-bold text-primary">{formatPrice(product.price * quantity)}</span>
        </div>
        <div className="flex gap-3 flex-1">
          <Button onClick={() => handleAddToCart()} variant="outline" className="flex-1 rounded-full h-16 text-lg font-bold border-2 px-0">
            Bag
          </Button>
          <Button onClick={() => handleAddToCart(true)} className="flex-1 rounded-full h-16 text-lg font-bold shadow-xl px-0">
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
