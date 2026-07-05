
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, ArrowRight, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/utils/currency';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 md:pt-32 pb-16 md:pb-20 flex items-center justify-center">
        <div className="text-center max-w-md px-4 space-y-6 md:space-y-8">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold">Your Bag is Empty</h1>
          <p className="text-muted-foreground text-base md:text-lg">Looks like you haven&apos;t added any beautiful gifts to your bag yet.</p>
          <Button asChild size="lg" className="rounded-full px-6 md:px-12 h-11 md:h-16 text-base md:text-xl">
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-16 md:pb-20">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-headline font-bold mb-6 md:mb-12 flex items-center gap-3 md:gap-4">
          <ShoppingBag className="w-7 h-7 md:w-10 md:h-10" /> Your Shopping Bag
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {cart.map((item) => (
              <motion.div layout key={item.id}>
                <Card className="rounded-2xl md:rounded-[2rem] border-none shadow-soft bg-card overflow-hidden">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex gap-4 md:gap-6 items-center">
                      <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-xl md:rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-base md:text-xl leading-tight">{item.name}</h3>
                          <button onClick={() => removeFromCart(item.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-full transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-lg md:text-2xl font-headline font-bold text-primary">{formatPrice(item.price)}</p>
                        
                        {item.customPhotos && item.customPhotos.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Uploaded Photos ({item.customPhotos.length}):</p>
                            <div className="flex gap-2 flex-wrap">
                              {item.customPhotos.map((photo, pIdx) => (
                                <div key={pIdx} className="relative w-12 h-12 rounded-lg border border-border/60 overflow-hidden shadow-sm bg-accent/25">
                                  <Image src={photo.imageUrl} alt={`Custom upload ${pIdx + 1}`} fill className="object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.customText && (
                          <div className="pt-1.5">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Personalization Text:</p>
                            <p className="text-sm font-semibold text-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/40 inline-block mt-0.5 max-w-full break-all">
                              &ldquo;{item.customText}&rdquo;
                            </p>
                          </div>
                        )}

                        <div className="flex flex-col min-[380px]:flex-row justify-between min-[380px]:items-center gap-3 pt-3 md:pt-4">
                          <div className="flex items-center border rounded-full px-3 h-10 bg-accent/20">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-primary transition-colors"><Minus className="w-4 h-4" /></button>
                            <span className="w-10 text-center font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-primary transition-colors"><Plus className="w-4 h-4" /></button>
                          </div>
                          <p className="text-sm md:text-base font-bold">Total: {formatPrice(item.price * item.quantity)}</p>
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
            <Card className="rounded-2xl md:rounded-[2.5rem] border-none shadow-xl bg-card p-5 md:p-8 lg:sticky lg:top-32">
              <h3 className="text-2xl font-headline font-bold mb-6">Order Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-bold text-foreground">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                <Separator className="my-6" />
                <div className="flex justify-between text-2xl md:text-3xl font-headline font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(cartTotal)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest pt-4">Secure Checkout Guaranteed</p>
                
                <Button asChild size="lg" className="w-full rounded-full h-11 md:h-16 text-base md:text-xl font-bold mt-6 md:mt-8 shadow-lg">
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
