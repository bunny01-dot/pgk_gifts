'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ArrowLeft, ShieldCheck, Truck, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { PaymentService } from '@/services/payment.service';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/utils/currency';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [loading, setLoading] = useState(false);
  const [saveCard, setSaveCard] = useState(false);

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
    <div className="min-h-screen pt-32 pb-20 bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-6 max-w-5xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-8 rounded-full group font-bold">
          <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Cart
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-3xl border-none shadow-sm p-8 bg-card">
              <h3 className="text-2xl font-headline font-bold mb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">1</div>
                Shipping Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Recipient Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    placeholder="e.g. Rahul Sharma" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="h-12 rounded-xl border-border bg-background" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Contact Number</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    required 
                    placeholder="+91 00000 00000" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="h-12 rounded-xl border-border bg-background" 
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    required 
                    placeholder="House No, Street, Landmark" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    className="h-12 rounded-xl border-border bg-background" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">City</Label>
                  <Input 
                    id="city" 
                    name="city" 
                    required 
                    placeholder="Chennai" 
                    value={formData.city} 
                    onChange={handleInputChange} 
                    className="h-12 rounded-xl border-border bg-background" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Pincode</Label>
                  <Input 
                    id="pincode" 
                    name="pincode" 
                    required 
                    placeholder="600001" 
                    value={formData.pincode} 
                    onChange={handleInputChange} 
                    className="h-12 rounded-xl border-border bg-background" 
                  />
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm p-8 bg-card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-foreground flex items-center justify-center text-sm">2</div>
                  <h3 className="text-2xl font-headline font-bold">Payment Method</h3>
                </div>
                <div className="flex items-center space-x-2 bg-zinc-50 dark:bg-zinc-900 px-4 py-2 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-bold">Razorpay Secure</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="rounded-3xl border-none shadow-premium p-8 bg-card sticky top-24">
              <h3 className="text-xl font-headline font-bold mb-6">Order Summary</h3>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="font-bold text-sm mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-dashed">
                <div className="flex justify-between text-sm text-muted-foreground font-bold">
                  <span>Shipping</span>
                  <span className="text-green-600 uppercase tracking-widest text-[10px]">Free</span>
                </div>
                <div className="flex justify-between text-2xl font-headline font-bold text-primary pt-2">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <Button 
                onClick={handlePayment} 
                disabled={loading} 
                className="w-full rounded-full h-14 text-lg font-bold mt-8 shadow-lg"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                ) : (
                  <>Complete Purchase</>
                )}
              </Button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground opacity-50">
                <Lock className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure 256-Bit SSL Encryption</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}