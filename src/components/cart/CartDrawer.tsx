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
  const { cart, addToCart, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();

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
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-secondary/50 flex-shrink-0 border border-border/50">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-sm leading-tight truncate">{item.name}</h4>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 mb-2 uppercase tracking-widest font-bold">{formatPrice(item.price)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border-2 border-border/50 rounded-full px-2 mt-1 bg-card shadow-sm h-8">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-primary"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-primary"><Plus className="w-3 h-3" /></button>
                      </div>
                      <span className="font-bold text-sm text-primary">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <Separator className="my-6 border-dashed opacity-50" />
              
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Add to Your Masterpiece</p>
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                   {/* Upsell 1: Gift Wrap */}
                   {(() => {
                     const inCart = cart.some(i => i.id === 'upsell_wrap');
                     return (
                       <div className="shrink-0 w-[160px] snap-center rounded-2xl border border-border/50 bg-secondary/20 p-3 flex flex-col gap-3 group transition-colors hover:bg-secondary/40">
                         <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-card">
                           <Image src="/placeholder.png" alt="Gift Wrap" fill className="object-cover opacity-80 mix-blend-multiply" />
                         </div>
                         <div>
                           <p className="font-bold text-xs truncate">Premium Gift Wrap</p>
                           <p className="font-bold text-primary font-headline text-sm mt-1">{formatPrice(199)}</p>
                         </div>
                         <Button 
                           size="sm" 
                           disabled={inCart}
                           variant={inCart ? "secondary" : "default"}
                           onClick={() => addToCart({ id: 'upsell_wrap', name: 'Premium Gift Wrap', price: 199, category: 'Customized Gifts', image: '/placeholder.png', description: 'Make it a surprise.', active: true, quantity: 1 } as any)}
                           className="w-full rounded-full h-8 text-xs font-bold"
                         >
                           {inCart ? "Added" : "Add for ₹199"}
                         </Button>
                       </div>
                     );
                   })()}

                   {/* Upsell 2: Priority Processing */}
                   {(() => {
                     const inCart = cart.some(i => i.id === 'upsell_priority');
                     return (
                       <div className="shrink-0 w-[160px] snap-center rounded-2xl border border-border/50 bg-secondary/20 p-3 flex flex-col gap-3 group transition-colors hover:bg-secondary/40">
                         <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-card flex items-center justify-center bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                           <span className="text-3xl">🚀</span>
                         </div>
                         <div>
                           <p className="font-bold text-xs truncate">Priority Crafting</p>
                           <p className="font-bold text-primary font-headline text-sm mt-1">{formatPrice(299)}</p>
                         </div>
                         <Button 
                           size="sm" 
                           disabled={inCart}
                           variant={inCart ? "secondary" : "default"}
                           onClick={() => addToCart({ id: 'upsell_priority', name: 'Priority Crafting (Skip Line)', price: 299, category: 'Customized Gifts', image: '/placeholder.png', description: 'Skip the standard crafting queue.', active: true, quantity: 1 } as any)}
                           className="w-full rounded-full h-8 text-xs font-bold bg-yellow-500 hover:bg-yellow-600 text-yellow-950"
                         >
                           {inCart ? "Added" : "Add for ₹299"}
                         </Button>
                       </div>
                     );
                   })()}
                </div>
              </div>

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
