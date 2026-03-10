
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, ArrowRight, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center max-w-md px-4 space-y-8">
          <div className="w-32 h-32 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-16 h-16 text-muted-foreground" />
          </div>
          <h1 className="text-4xl font-headline font-bold">Your Bag is Empty</h1>
          <p className="text-muted-foreground text-lg">Looks like you haven't added any beautiful gifts to your bag yet.</p>
          <Button asChild size="lg" className="rounded-full px-12 h-16 text-xl">
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-headline font-bold mb-12 flex items-center gap-4">
          <ShoppingBag className="w-10 h-10" /> Your Shopping Bag
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <motion.div layout key={item.id}>
                <Card className="rounded-[2rem] border-none shadow-soft bg-card overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-6 items-center">
                      <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-xl">{item.name}</h3>
                          <button onClick={() => removeFromCart(item.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-full transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-2xl font-headline font-bold text-primary">₹{item.price}</p>
                        
                        <div className="flex justify-between items-center pt-4">
                          <div className="flex items-center border rounded-full px-3 h-10 bg-accent/20">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-primary transition-colors"><Minus className="w-4 h-4" /></button>
                            <span className="w-10 text-center font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-primary transition-colors"><Plus className="w-4 h-4" /></button>
                          </div>
                          <p className="font-bold">Total: ₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-card p-8 sticky top-32">
              <h3 className="text-2xl font-headline font-bold mb-6">Order Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-bold text-foreground">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                <Separator className="my-6" />
                <div className="flex justify-between text-3xl font-headline font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{cartTotal}</span>
                </div>
                <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest pt-4">Secure Checkout Guaranteed</p>
                
                <Button asChild size="lg" className="w-full rounded-full h-16 text-xl font-bold mt-8 shadow-lg">
                  <Link href="/checkout">
                    Secure Checkout <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" className="w-full mt-4 rounded-full font-bold">
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
