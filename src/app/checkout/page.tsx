
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ArrowLeft, ShieldCheck, Truck, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
      const paymentService = new PaymentService(firestore);
      const rpOrder = await paymentService.createRazorpayOrder(cartTotal);

      // Simulate secure Razorpay verification & Persistence
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
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 rounded-full group text-xl font-bold hover:bg-accent">
            <ArrowLeft className="mr-3 w-6 h-6 group-hover:-translate-x-2 transition-transform" /> Return to Bag
          </Button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <Badge variant="outline" className="mb-4 px-4 py-1 border-primary text-primary font-bold text-xs uppercase tracking-[0.3em]">Checkout Protocol</Badge>
              <h1 className="text-7xl font-headline font-bold leading-none">Complete Order</h1>
            </div>
            <div className="flex items-center gap-8 text-muted-foreground text-sm font-bold uppercase tracking-widest">
              <span className="flex items-center gap-3 text-green-600"><ShieldCheck className="w-6 h-6" /> SSL ENCRYPTED</span>
              <span className="flex items-center gap-3"><Truck className="w-6 h-6" /> PRIORITY SHIPPING</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-10">
            {/* Outlined Shipping Card */}
            <Card className="rounded-[3rem] border-2 border-primary/20 shadow-soft p-12 bg-card">
              <h3 className="text-4xl font-headline font-bold mb-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-headline">1</div>
                Shipping Destination
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-6">Customer Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    placeholder="e.g. Rahul Sharma" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="h-20 rounded-full px-10 bg-accent/5 border-2 border-muted hover:border-primary/40 focus:border-primary transition-all text-2xl placeholder:text-muted-foreground/30 text-foreground" 
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-6">Mobile Number</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    required 
                    placeholder="+91 00000 00000" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="h-20 rounded-full px-10 bg-accent/5 border-2 border-muted hover:border-primary/40 focus:border-primary transition-all text-2xl placeholder:text-muted-foreground/30 text-foreground" 
                  />
                </div>

                <div className="md:col-span-2 space-y-4">
                  <Label htmlFor="address" className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-6">Detailed Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    required 
                    placeholder="House/Office Number, Street, Area" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    className="h-20 rounded-full px-10 bg-accent/5 border-2 border-muted hover:border-primary/40 focus:border-primary transition-all text-2xl placeholder:text-muted-foreground/30 text-foreground" 
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="city" className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-6">Town / City</Label>
                  <Input 
                    id="city" 
                    name="city" 
                    required 
                    placeholder="e.g. Chennai" 
                    value={formData.city} 
                    onChange={handleInputChange} 
                    className="h-20 rounded-full px-10 bg-accent/5 border-2 border-muted hover:border-primary/40 focus:border-primary transition-all text-2xl placeholder:text-muted-foreground/30 text-foreground" 
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="pincode" className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/80 ml-6">Area Pincode</Label>
                  <Input 
                    id="pincode" 
                    name="pincode" 
                    required 
                    placeholder="600001" 
                    value={formData.pincode} 
                    onChange={handleInputChange} 
                    className="h-20 rounded-full px-10 bg-accent/5 border-2 border-muted hover:border-primary/40 focus:border-primary transition-all text-2xl placeholder:text-muted-foreground/30 text-foreground" 
                  />
                </div>
              </div>
            </Card>

            <Card className="rounded-[3rem] border-2 border-primary/10 shadow-soft p-12 bg-card">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-accent text-primary flex items-center justify-center text-2xl font-headline">2</div>
                    <div>
                      <h3 className="text-4xl font-headline font-bold">Payment Gateway</h3>
                      <p className="text-muted-foreground text-xl">Powered by Razorpay Secure</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 bg-accent/20 px-8 py-6 rounded-[2rem] border-2 border-primary/10 transition-colors hover:bg-accent/30">
                    <Checkbox 
                      id="save-card" 
                      checked={saveCard} 
                      onCheckedChange={(checked) => setSaveCard(!!checked)}
                      className="w-7 h-7 border-2 border-primary"
                    />
                    <Label htmlFor="save-card" className="text-xl font-bold cursor-pointer text-foreground">Save details for 1-click checkout</Label>
                  </div>
               </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="rounded-[3rem] border-2 border-primary/20 shadow-2xl p-12 bg-card sticky top-40 overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Lock className="w-32 h-32 rotate-12" />
              </div>
              <h3 className="text-4xl font-headline font-bold mb-10 border-b-2 border-dashed pb-8 flex items-center justify-between">
                Summary
                <Badge variant="secondary" className="font-bold text-xs">{cart.length} Items</Badge>
              </h3>
              
              <div className="space-y-8 max-h-[350px] overflow-y-auto pr-4 mb-10 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center group">
                    <div className="flex gap-5 items-center">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-muted border-2 border-muted group-hover:border-primary/20 transition-all">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-xl truncate max-w-[140px]">{item.name}</p>
                        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mt-1">QTY: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-headline font-bold text-2xl">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-6 pt-8 border-t-2 border-muted">
                <div className="flex justify-between text-muted-foreground font-bold text-xs uppercase tracking-[0.2em]">
                  <span>Shipping Fee</span>
                  <span className="text-green-600">INCLUDED</span>
                </div>
                <div className="flex justify-between text-6xl font-headline font-bold text-primary pt-4">
                  <span className="text-2xl text-muted-foreground font-body self-center mr-2">Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <Button 
                onClick={handlePayment} 
                disabled={loading} 
                className="w-full rounded-full h-24 text-3xl font-headline font-bold mt-12 shadow-2xl shadow-primary/20 transition-all active:scale-95 hover:shadow-primary/40 hover:-translate-y-1"
              >
                {loading ? (
                  <>Verifying <Loader2 className="ml-4 w-10 h-10 animate-spin" /></>
                ) : (
                  <>Pay Securely <CreditCard className="ml-4 w-10 h-10" /></>
                )}
              </Button>
              
              <div className="mt-8 flex items-center justify-center gap-3 text-muted-foreground/60 text-xs font-bold uppercase tracking-widest">
                <CheckCircle2 className="w-5 h-5 text-green-500/50" /> Fully Secured 256-bit SSL
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
