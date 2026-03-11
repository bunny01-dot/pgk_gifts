
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, MapPin, Phone, User, CheckCircle, Loader2, ArrowLeft, ShieldCheck, Truck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { initializeFirebase } from '@/firebase';
import { PaymentService } from '@/services/payment.service';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/utils/currency';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [saveCard, setSaveCard] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });

  if (!mounted) return null;

  if (cart.length === 0) {
    router.push('/shop');
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
      const { firestore } = initializeFirebase();
      const paymentService = new PaymentService(firestore);

      const rpOrder = await paymentService.createRazorpayOrder(cartTotal);

      // Simulate Razorpay verification & Persistence
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
      }, 2000);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-40 pb-32 bg-accent/5">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-12">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 rounded-full group text-lg">
            <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Store
          </Button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <Badge variant="outline" className="mb-2 px-3 border-primary text-primary font-bold text-[10px]">Secure Checkout</Badge>
              <h1 className="text-6xl font-headline font-bold leading-none">Checkout</h1>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground text-sm font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2 text-green-600"><ShieldCheck className="w-5 h-5" /> SSL SECURED</span>
              <span className="flex items-center gap-2"><Truck className="w-5 h-5" /> EXPRESS DELIVERY</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-[3rem] border-2 border-primary/10 shadow-soft p-10 bg-card">
              <h3 className="text-4xl font-headline font-bold mb-8 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center text-xl">1</div>
                Shipping Details
              </h3>
              
              <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-4">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    placeholder="e.g. John Doe" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="h-16 rounded-full px-8 bg-background border-2 border-muted hover:border-primary/50 focus:border-primary transition-all text-xl placeholder:text-muted-foreground/40" 
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-4">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    required 
                    placeholder="e.g. 9876543210" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="h-16 rounded-full px-8 bg-background border-2 border-muted hover:border-primary/50 focus:border-primary transition-all text-xl placeholder:text-muted-foreground/40" 
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <Label htmlFor="address" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-4">Street Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    required 
                    placeholder="House No, Building, Street Name" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    className="h-16 rounded-full px-8 bg-background border-2 border-muted hover:border-primary/50 focus:border-primary transition-all text-xl placeholder:text-muted-foreground/40" 
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="city" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-4">City</Label>
                  <Input 
                    id="city" 
                    name="city" 
                    required 
                    placeholder="e.g. Chennai" 
                    value={formData.city} 
                    onChange={handleInputChange} 
                    className="h-16 rounded-full px-8 bg-background border-2 border-muted hover:border-primary/50 focus:border-primary transition-all text-xl placeholder:text-muted-foreground/40" 
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="pincode" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-4">Pincode</Label>
                  <Input 
                    id="pincode" 
                    name="pincode" 
                    required 
                    placeholder="e.g. 600001" 
                    value={formData.pincode} 
                    onChange={handleInputChange} 
                    className="h-16 rounded-full px-8 bg-background border-2 border-muted hover:border-primary/50 focus:border-primary transition-all text-xl placeholder:text-muted-foreground/40" 
                  />
                </div>
              </form>
            </Card>

            <Card className="rounded-[3rem] border-2 border-primary/5 shadow-soft p-10 bg-card">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-accent text-primary flex items-center justify-center text-xl">2</div>
                    <div>
                      <h3 className="text-3xl font-headline font-bold">Payment Method</h3>
                      <p className="text-muted-foreground text-lg">Cards, UPI, or Netbanking</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-accent/20 px-6 py-4 rounded-3xl border border-primary/5">
                    <Checkbox 
                      id="save-card" 
                      checked={saveCard} 
                      onCheckedChange={(checked) => setSaveCard(!!checked)}
                      className="w-6 h-6"
                    />
                    <Label htmlFor="save-card" className="text-lg font-bold cursor-pointer">Save card for future payments</Label>
                  </div>
               </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="rounded-[3rem] border-2 border-primary/10 shadow-2xl p-10 bg-card sticky top-40">
              <h3 className="text-3xl font-headline font-bold mb-8 border-b pb-6 flex items-center justify-between">
                Order Summary
                <Lock className="w-5 h-5 text-muted-foreground" />
              </h3>
              
              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 mb-8 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted border">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-base truncate max-w-[120px]">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">QTY: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold text-lg">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-dashed">
                <div className="flex justify-between text-muted-foreground font-bold text-[10px] uppercase tracking-widest">
                  <span>Shipping Fee</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-5xl font-headline font-bold text-primary pt-2">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <Button 
                onClick={handlePayment} 
                disabled={loading} 
                className="w-full rounded-full h-20 text-2xl font-bold mt-12 shadow-2xl shadow-primary/20 transition-all active:scale-95 hover:shadow-primary/30"
              >
                {loading ? (
                  <>Verifying <Loader2 className="ml-3 w-8 h-8 animate-spin" /></>
                ) : (
                  <>Complete Order <CreditCard className="ml-3 w-8 h-8" /></>
                )}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
