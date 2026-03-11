'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { PaymentService } from '@/services/payment.service';
import Image from 'next/image';
import { formatPrice } from '@/utils/currency';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });

  if (cart.length === 0) {
    if (typeof window !== 'undefined') router.push('/shop');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please fill all required fields." });
      return;
    }
    
    setLoading(true);

    try {
      const paymentService = new PaymentService(firestore);
      const rpOrder = await paymentService.createRazorpayOrder(cartTotal);

      // Simulation of Razorpay interaction
      setTimeout(async () => {
        const mockResponse = {
          razorpay_order_id: rpOrder.id,
          razorpay_payment_id: "pay_" + Math.random().toString(36).substring(7),
          razorpay_signature: "sig_" + Math.random().toString(36).substring(7)
        };

        const firebaseOrderId = await paymentService.verifyAndSaveOrder(
          mockResponse,
          formData,
          cart,
          cartTotal
        );

        clearCart();
        router.push(`/order-success?id=${firebaseOrderId}`);
      }, 1500);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: error.message || "Something went wrong.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-40 pb-20 bg-background transition-colors duration-500">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button variant="ghost" onClick={() => router.back()} className="mb-10 rounded-full group font-bold h-12 px-6 hover:bg-secondary">
            <ArrowLeft className="mr-3 w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Cart
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Checkout Content */}
          <div className="lg:col-span-7 space-y-10">
            <Card className="rounded-[3rem] border-none shadow-premium p-10 md:p-14 bg-card transition-all duration-500">
              <header className="mb-12">
                <div className="flex items-center gap-5 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-headline font-bold text-xl shadow-lg">1</div>
                  <h3 className="text-4xl font-headline font-bold">Shipping Details</h3>
                </div>
                <p className="text-muted-foreground font-medium">Where should we deliver your handcrafted treasure?</p>
              </header>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Recipient Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    placeholder="e.g. Rahul Sharma" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="h-14 rounded-2xl border-border bg-secondary/30 focus-visible:ring-primary text-base px-6" 
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Contact Number</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    required 
                    placeholder="+91 00000 00000" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="h-14 rounded-2xl border-border bg-secondary/30 focus-visible:ring-primary text-base px-6" 
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Full Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    required 
                    placeholder="House No, Street, Landmark" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    className="h-14 rounded-2xl border-border bg-secondary/30 focus-visible:ring-primary text-base px-6" 
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">City</Label>
                  <Input 
                    id="city" 
                    name="city" 
                    required 
                    placeholder="Chennai" 
                    value={formData.city} 
                    onChange={handleInputChange} 
                    className="h-14 rounded-2xl border-border bg-secondary/30 focus-visible:ring-primary text-base px-6" 
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="pincode" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Pincode</Label>
                  <Input 
                    id="pincode" 
                    name="pincode" 
                    required 
                    placeholder="600001" 
                    value={formData.pincode} 
                    onChange={handleInputChange} 
                    className="h-14 rounded-2xl border-border bg-secondary/30 focus-visible:ring-primary text-base px-6" 
                  />
                </div>
              </div>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-premium p-10 bg-card/80 backdrop-blur-sm transition-all duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-secondary text-foreground flex items-center justify-center font-headline font-bold text-xl shadow-inner border border-border/50">2</div>
                  <h3 className="text-3xl font-headline font-bold">Secure Payment</h3>
                </div>
                <div className="flex items-center gap-3 bg-secondary/50 px-6 py-3 rounded-full border border-border/30">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <span className="text-xs font-bold uppercase tracking-widest">Razorpay Secure</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5">
            <Card className="rounded-[3rem] border-none shadow-2xl p-10 md:p-12 bg-card sticky top-32 overflow-hidden transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              
              <h3 className="text-3xl font-headline font-bold mb-10 pb-6 border-b border-dashed border-border/50">Order Summary</h3>
              
              <div className="space-y-8 max-h-[400px] overflow-y-auto mb-10 pr-4 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-6 items-center group">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-secondary/50 flex-shrink-0 border border-border/50 shadow-sm transition-transform group-hover:scale-105">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg leading-tight truncate text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2 font-black">Qty: {item.quantity}</p>
                      <p className="font-headline font-bold text-xl mt-2 text-primary">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-dashed border-border/50">
                <div className="flex justify-between items-center text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <span>Delivery</span>
                  <span className="text-green-600 font-black">Complimentary</span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-lg font-headline font-medium">Final Investment</span>
                  <span className="text-5xl font-headline font-bold text-primary leading-none">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <Button 
                onClick={handlePayment} 
                disabled={loading} 
                className="w-full rounded-full h-20 text-2xl font-headline font-bold mt-12 shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                {loading ? (
                  <><Loader2 className="mr-3 h-8 w-8 animate-spin" /> Confirming...</>
                ) : (
                  <>Complete Purchase</>
                )}
              </Button>
              
              <div className="mt-10 flex items-center justify-center gap-3 text-muted-foreground opacity-40">
                <Lock className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Secure SSL Encryption</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}