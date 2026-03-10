
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, MapPin, Phone, User, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });

  if (cart.length === 0) {
    router.push('/shop');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, you would fetch orderId from your backend/functions
      // Here we simulate the Razorpay Flow
      
      const options = {
        key: 'rzp_test_YOUR_KEY_HERE', // This would come from env
        amount: cartTotal * 100,
        currency: 'INR',
        name: 'PGK GIFTS',
        description: 'Thank you for your purchase',
        handler: async function (response: any) {
          // Success Callback
          await saveOrder(response.razorpay_payment_id);
        },
        prefill: {
          name: formData.name,
          contact: formData.phone,
        },
        theme: {
          color: '#3B0E39',
        },
      };

      // Since we don't have real keys here, we simulate success for the demo
      // In production, you'd use window.Razorpay(options).open()
      
      setTimeout(async () => {
        await saveOrder("PAY_MOCK_" + Date.now());
      }, 1500);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "Something went wrong during checkout. Please try again.",
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
        items: cart,
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
        title: "Order Error",
        description: "Payment was successful but we couldn't save your order. Contact support.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl font-headline font-bold mb-12 text-center">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Billing Form */}
          <form onSubmit={handlePayment} className="space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl p-8 space-y-6">
              <h3 className="text-2xl font-headline font-bold border-b pb-4 mb-6">Delivery Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2"><User className="w-4 h-4" /> Full Name</Label>
                <Input id="name" name="name" required placeholder="John Doe" value={formData.name} onChange={handleInputChange} className="h-12 rounded-full px-6" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-4 h-4" /> Phone Number</Label>
                <Input id="phone" name="phone" required placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleInputChange} className="h-12 rounded-full px-6" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Full Address</Label>
                <Input id="address" name="address" required placeholder="Street, Area, etc." value={formData.address} onChange={handleInputChange} className="h-12 rounded-full px-6" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" required placeholder="Kallal" value={formData.city} onChange={handleInputChange} className="h-12 rounded-full px-6" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" name="pincode" required placeholder="630305" value={formData.pincode} onChange={handleInputChange} className="h-12 rounded-full px-6" />
                </div>
              </div>
            </Card>
          </form>

          {/* Order Summary & Pay */}
          <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-none shadow-xl p-8 bg-card">
              <h3 className="text-2xl font-headline font-bold border-b pb-4 mb-6">Your Order</h3>
              <div className="max-h-60 overflow-y-auto space-y-4 mb-6 pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex gap-3 items-center">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <span className="font-bold">{item.name} x {item.quantity}</span>
                    </div>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <Separator className="mb-6" />
              <div className="space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold uppercase text-xs">Free Delivery</span>
                </div>
                <div className="flex justify-between text-3xl font-headline font-bold pt-4">
                  <span>Total</span>
                  <span className="text-primary">₹{cartTotal}</span>
                </div>
              </div>

              <Button 
                onClick={handlePayment} 
                disabled={loading} 
                className="w-full rounded-full h-16 text-xl font-bold mt-10 shadow-lg"
              >
                {loading ? (
                  <>Processing <Loader2 className="ml-2 w-5 h-5 animate-spin" /></>
                ) : (
                  <>Pay Now <CreditCard className="ml-2 w-5 h-5" /></>
                )}
              </Button>
              <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest pt-4">Encrypted Razorpay Checkout</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
