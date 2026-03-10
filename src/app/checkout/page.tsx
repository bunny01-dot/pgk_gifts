'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, MapPin, Phone, User, CheckCircle, Loader2, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { initializeFirebase } from '@/firebase';
import { PaymentService } from '@/services/payment.service';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/utils/currency';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

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

      // 1. Create Razorpay Order via Service
      const rpOrder = await paymentService.createRazorpayOrder(cartTotal);

      // 2. Simulated Razorpay UI Flow
      setTimeout(async () => {
        const mockResponse = {
          razorpay_order_id: rpOrder.id,
          razorpay_payment_id: "pay_" + Math.random().toString(36).substring(7),
          razorpay_signature: "sig_" + Math.random().toString(36).substring(7)
        };

        // 3. Verify and Save Order securely via Service
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
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 rounded-full group">
            <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Store
          </Button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <Badge variant="outline" className="mb-2 px-3 border-primary text-primary font-bold">Secure Gateway</Badge>
              <h1 className="text-5xl font-headline font-bold leading-none">Checkout</h1>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground text-sm font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2 text-green-600"><ShieldCheck className="w-4 h-4" /> SSL SECURED</span>
              <span className="flex items-center gap-2"><Truck className="w-4 h-4" /> FAST SHIPPING</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-[3rem] border-none shadow-xl p-10 bg-card">
              <h3 className="text-3xl font-headline font-bold mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center text-lg">1</div>
                Shipping Information
              </h3>
              
              <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-4">Full Name</Label>
                  <Input id="name" name="name" required placeholder="Receiver Name" value={formData.name} onChange={handleInputChange} className="h-16 rounded-full px-8 bg-accent/5 border-none text-lg" />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-4">Phone</Label>
                  <Input id="phone" name="phone" required placeholder="Contact Number" value={formData.phone} onChange={handleInputChange} className="h-16 rounded-full px-8 bg-accent/5 border-none text-lg" />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-4">Shipping Address</Label>
                  <Input id="address" name="address" required placeholder="House No, Street, Area" value={formData.address} onChange={handleInputChange} className="h-16 rounded-full px-8 bg-accent/5 border-none text-lg" />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="city" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-4">City</Label>
                  <Input id="city" name="city" required placeholder="Kallal" value={formData.city} onChange={handleInputChange} className="h-16 rounded-full px-8 bg-accent/5 border-none text-lg" />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="pincode" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-4">Pincode</Label>
                  <Input id="pincode" name="pincode" required placeholder="630305" value={formData.pincode} onChange={handleInputChange} className="h-16 rounded-full px-8 bg-accent/5 border-none text-lg" />
                </div>
              </form>
            </Card>

            <Card className="rounded-[3rem] border-none shadow-soft p-10 bg-card/50 opacity-60">
               <h3 className="text-3xl font-headline font-bold mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center text-lg">2</div>
                  Payment Method
                </h3>
                <p className="ml-14 text-muted-foreground">Razorpay Secure Checkout will launch in the next step.</p>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="rounded-[3rem] border-none shadow-2xl p-10 bg-card sticky top-40">
              <h3 className="text-2xl font-headline font-bold mb-8 border-b pb-6">Summary</h3>
              
              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 mb-8">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-xs truncate max-w-[120px]">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">QTY: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t">
                <div className="flex justify-between text-muted-foreground font-bold text-[10px] uppercase tracking-widest">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-4xl font-headline font-bold text-primary pt-2">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <Button 
                onClick={handlePayment} 
                disabled={loading} 
                className="w-full rounded-full h-20 text-2xl font-bold mt-12 shadow-2xl shadow-primary/20 transition-all active:scale-95"
              >
                {loading ? (
                  <>Verifying <Loader2 className="ml-3 w-6 h-6 animate-spin" /></>
                ) : (
                  <>Pay Now <CreditCard className="ml-3 w-6 h-6" /></>
                )}
              </Button>
              
              <div className="mt-8 flex items-center justify-center grayscale opacity-50">
                 <Image src="https://i.postimg.cc/L5YVf2n0/Google-Pay-QR.png" alt="Payment Partners" width={100} height={25} className="object-contain" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
