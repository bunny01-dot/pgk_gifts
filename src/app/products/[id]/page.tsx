
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Heart, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCTS } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ToastAction } from '@/components/ui/toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Product not found</h2>
          <Button onClick={() => router.push('/shop')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = (redirect = false) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    });
    
    if (redirect) {
      router.push('/cart');
    } else {
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your shopping bag.`,
        action: (
          <ToastAction altText="Go to cart" onClick={() => router.push('/cart')}>
            View Cart
          </ToastAction>
        ),
      });
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-8 hover:bg-accent/50 rounded-full"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Collection
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-muted shadow-2xl">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-2xl bg-muted overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all">
                   <Image src={product.image} alt="Thumbnail" width={200} height={200} className="object-cover w-full h-full opacity-60" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-8"
          >
            <div className="space-y-4">
              <Badge variant="secondary" className="rounded-full px-4 py-1 uppercase tracking-widest font-bold">{product.category}</Badge>
              <h1 className="text-5xl font-headline font-bold text-foreground">{product.name}</h1>
              <div className="flex items-center gap-4 text-2xl font-bold text-primary">
                ₹{product.price}
                <span className="text-sm text-muted-foreground font-normal ml-2">Inc. all taxes</span>
              </div>
            </div>

            <p className="text-xl text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <div className="space-y-4">
              <h4 className="font-bold flex items-center gap-2"><Check className="text-green-500 w-5 h-5" /> In Stock & Ready to Ship</h4>
              <p className="text-sm text-muted-foreground">Free shipping on orders over ₹1000 across India.</p>
            </div>

            <div className="flex flex-col gap-6 pt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 rounded-full px-4 h-14 bg-card">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 font-bold text-xl">-</button>
                  <span className="w-12 text-center font-bold text-xl">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 font-bold text-xl">+</button>
                </div>
                <div className="flex flex-1 gap-2">
                  <Button variant="outline" size="icon" className="rounded-full h-14 w-14 border-2"><Heart className="w-6 h-6" /></Button>
                  <Button variant="outline" size="icon" className="rounded-full h-14 w-14 border-2"><Share2 className="w-6 h-6" /></Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => handleAddToCart()} variant="outline" className="h-16 rounded-full text-xl font-bold border-2">
                  <ShoppingCart className="mr-2 w-6 h-6" /> Add to Cart
                </Button>
                <Button onClick={() => handleAddToCart(true)} className="h-16 rounded-full text-xl font-bold shadow-xl">
                  Buy Now
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
