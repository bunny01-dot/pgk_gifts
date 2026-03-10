'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Heart, Share2, Check, ZoomIn, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
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
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Product not found</h2>
          <Button onClick={() => router.push('/shop')} className="rounded-full">Back to Shop</Button>
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
        description: `${product.name} has been added.`,
        action: (
          <ToastAction altText="View Bag" onClick={() => setIsCartOpen(true)}>
            View Bag
          </ToastAction>
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
    <div className="min-h-screen pt-32 pb-40 bg-background">
      <div className="container mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-8 hover:bg-accent/50 rounded-full text-foreground group"
        >
          <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Collection
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery with Zoom */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div 
              ref={imageRef}
              className="relative aspect-square rounded-[3rem] overflow-hidden bg-muted shadow-2xl cursor-zoom-in group"
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
                <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-6 h-6 text-primary" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-2xl bg-muted overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all shadow-md">
                   <Image src={product.image} alt="Thumbnail" width={200} height={200} className="object-cover w-full h-full opacity-60 hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-10"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="rounded-full px-4 py-1 uppercase tracking-widest font-bold text-[10px]">
                  {product.category}
                </Badge>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold text-foreground ml-1">5.0 (42 Reviews)</span>
                </div>
              </div>
              <h1 className="text-6xl font-headline font-bold text-foreground leading-tight">{product.name}</h1>
              <div className="flex items-end gap-4">
                <span className="text-5xl font-headline font-bold text-primary">{formatPrice(product.price)}</span>
                <span className="text-sm text-muted-foreground mb-2 font-medium">Inclusive of all taxes</span>
              </div>
            </div>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              {product.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="flex items-center gap-4 p-4 rounded-2xl bg-accent/5 border border-primary/5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest">Free Shipping</p>
                    <p className="text-[10px] text-muted-foreground">Orders above ₹1000</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 p-4 rounded-2xl bg-accent/5 border border-primary/5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest">Quality Check</p>
                    <p className="text-[10px] text-muted-foreground">100% Hand-crafted</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-8 pt-6 border-t border-dashed">
              <div className="flex items-center gap-6">
                <div className="flex items-center border-2 rounded-full px-6 h-16 bg-card shadow-soft">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 font-bold text-2xl text-foreground hover:text-primary transition-colors">-</button>
                  <span className="w-16 text-center font-bold text-2xl text-foreground">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 font-bold text-2xl text-foreground hover:text-primary transition-colors">+</button>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="icon" className="rounded-full h-16 w-16 border-2"><Heart className="w-7 h-7" /></Button>
                  <Button variant="outline" size="icon" className="rounded-full h-16 w-16 border-2"><Share2 className="w-7 h-7" /></Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button onClick={() => handleAddToCart()} variant="outline" className="h-20 rounded-full text-xl font-bold border-2">
                  <ShoppingBag className="mr-3 w-6 h-6" /> Add to Bag
                </Button>
                <Button onClick={() => handleAddToCart(true)} className="h-20 rounded-full text-xl font-bold shadow-2xl shadow-primary/20">
                  Buy Now
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky Mobile Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/80 backdrop-blur-xl border-t p-4 flex items-center justify-between gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</span>
          <span className="text-xl font-bold text-primary">{formatPrice(product.price * quantity)}</span>
        </div>
        <div className="flex gap-2 flex-1">
          <Button onClick={() => handleAddToCart()} variant="outline" className="flex-1 rounded-full h-14 text-sm font-bold border-2 px-0">
            Add to Bag
          </Button>
          <Button onClick={() => handleAddToCart(true)} className="flex-1 rounded-full h-14 text-sm font-bold shadow-lg px-0">
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
