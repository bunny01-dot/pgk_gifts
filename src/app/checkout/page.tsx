
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
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

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
      // Simulation of Razorpay Order Creation
      // In production: const response = await fetch('/api/create-order', { method: 'POST', body: JSON.stringify({ amount: cartTotal }) });
      
      // Simulating Payment Delay
      setTimeout(async () => {
        const mockPaymentId = "PAY_SUCCESS_" + Math.random().toString(36).substring(7).toUpperCase();
        await saveOrder(mockPaymentId);
      }, 2000);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Payment gateway error",
        description: "Could not connect to Razorpay. Please try again later.",
      });
      setLoading(false);
    }
  };

  const saveOrder = async (paymentId: string) => {
    try {
      const { firestore } = initializeFirebase();
      const orderData = {
        customerName: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        total: cartTotal,
        paymentStatus: 'paid',
        razorpayPaymentId: paymentId,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(firestore, 'orders'), orderData);
      clearCart();
      router.push(`/order-success?id=${docRef.id}`);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Database Error",
        description: "Payment was successful but we couldn't save your order record. Our team has been notified.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-40 pb-32 bg-accent/5">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-12">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 rounded-full group">
            <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Bag
          </Button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <Badge variant="outline" className="mb-2 px-3 border-primary text-primary font-bold">Secure Checkout</Badge>
              <h1 className="text-5xl font-headline font-bold leading-none">Confirm & Pay</h1>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground text-sm font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-600" /> SSL Encrypted</span>
              <span className="flex items-center gap-2"><Truck className="w-4 h-4" /> Express Delivery</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="rounded-[3rem] border-none shadow-xl p-10 bg-card">
                <h3 className="text-3xl font-headline font-bold mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center text-lg">1</div>
                  Shipping Address
                </h3>
                
                <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-4">Full Name</Label>
                    <Input id="name" name="name" required placeholder="John Doe" value={formData.name} onChange={handleInputChange} className="h-16 rounded-full px-8 bg-accent/10 border-none text-lg" />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-4">Phone Number</Label>
                    <Input id="phone" name="phone" required placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleInputChange} className="h-16 rounded-full px-8 bg-accent/10 border-none text-lg" />
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-4">Complete Address</Label>
                    <Input id="address" name="address" required placeholder="Street, Area, Apartment, etc." value={formData.address} onChange={handleInputChange} className="h-16 rounded-full px-8 bg-accent/10 border-none text-lg" />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="city" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-4">City</Label>
                    <Input id="city" name="city" required placeholder="Kallal" value={formData.city} onChange={handleInputChange} className="h-16 rounded-full px-8 bg-accent/10 border-none text-lg" />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="pincode" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-4">Pincode</Label>
                    <Input id="pincode" name="pincode" required placeholder="630305" value={formData.pincode} onChange={handleInputChange} className="h-16 rounded-full px-8 bg-accent/10 border-none text-lg" />
                  </div>
                </form>
              </Card>
            </motion.div>

            <Card className="rounded-[3rem] border-none shadow-soft p-10 bg-card/50 opacity-60">
               <h3 className="text-3xl font-headline font-bold mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center text-lg">2</div>
                  Payment Method
                </h3>
                <p className="ml-14 text-muted-foreground">Razorpay Secure Checkout will open in the next step.</p>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-40"
            >
              <Card className="rounded-[3rem] border-none shadow-2xl p-10 bg-card flex flex-col h-full">
                <h3 className="text-2xl font-headline font-bold mb-8 border-b pb-6">Bag Summary</h3>
                
                <div className="space-y-6 max-h-[350px] overflow-y-auto pr-4 scrollbar-thin mb-8">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center group">
                      <div className="flex gap-4 items-center">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-sm leading-tight line-clamp-1">{item.name}</p>
                          <p className="text-xs text-muted-foreground font-bold">QTY: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-headline font-bold text-lg">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t">
                  <div className="flex justify-between text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-4xl font-headline font-bold text-primary pt-2">
                    <span>Total</span>
                    <span>₹{cartTotal}</span>
                  </div>
                </div>

                <Button 
                  onClick={handlePayment} 
                  disabled={loading} 
                  className="w-full rounded-full h-20 text-2xl font-bold mt-12 shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {loading ? (
                    <>Verifying <Loader2 className="ml-3 w-6 h-6 animate-spin" /></>
                  ) : (
                    <>Pay Now <CreditCard className="ml-3 w-6 h-6" /></>
                  )}
                </Button>
                
                <div className="mt-8 flex items-center justify-center gap-4 grayscale opacity-50">
                   <Image src="https://i.postimg.cc/L5YVf2n0/Google-Pay-QR.png" alt="Razorpay" width={80} height={20} className="object-contain" />
                </div>
                <p className="text-[10px] text-muted-foreground text-center uppercase tracking-[0.2em] font-bold mt-6">Secure Transaction Guaranteed</p>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
