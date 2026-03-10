'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/utils/currency';

export function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full border-l-0 shadow-2xl">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-headline font-bold flex items-center gap-2">
              <ShoppingBag className="w-6 h-6" /> Your Bag
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <ShoppingBag className="w-16 h-16" />
              <p className="text-lg font-medium">Your shopping bag is empty</p>
              <Button variant="outline" onClick={() => setIsCartOpen(false)} className="rounded-full">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-sm leading-tight truncate">{item.name}</h4>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{formatPrice(item.price)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-full px-2 py-1 bg-accent/10">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1"><Plus className="w-3 h-3" /></button>
                      </div>
                      <span className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-accent/5 border-t space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold text-2xl font-headline">{formatPrice(cartTotal)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center">
              Shipping calculated at checkout
            </p>
            <Button asChild className="w-full h-14 rounded-full text-lg font-bold shadow-lg" onClick={() => setIsCartOpen(false)}>
              <Link href="/checkout">
                Checkout Now <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
