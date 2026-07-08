'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Lock, Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { PaymentService } from '@/services/payment.service';
import Image from 'next/image';
import { formatPrice } from '@/utils/currency';
import { useCart } from '@/context/CartContext';
import { getItemDeliveryCharge } from '@/utils/customization';
import { motion } from 'framer-motion';
import { CONTACT_INFO } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (response: unknown) => void) => void;
    };
  }
}

const INDIAN_STATES = [
  'Tamil Nadu',
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Union Territories / Other'
];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, updateQuantity, removeFromCart, deliverySettings } = useCart();
  const { user } = useUser();
  const router = useRouter();
   const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: string; value: number; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal: cartTotal })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
        toast({ title: 'Coupon Applied!', description: `Discount of Rs. ${data.discount} applied to your order.` });
      } else {
        setCouponError(data.error || 'Invalid coupon code.');
      }
    } catch (err) {
      setCouponError('Failed to validate coupon.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  useEffect(() => {
    if (cart.length === 0 && !isPurchased) {
      router.replace('/shop');
    }
  }, [cart.length, router, isPurchased]);

  if (cart.length === 0 && !isPurchased) {
    return null;
  }

  const loadScript = (src: string) => {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill all required fields.' });
      return;
    }

    setLoading(true);

    try {
      const isLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      const paymentService = new PaymentService(async () => user?.getIdToken() ?? null);
      const rpOrder = await paymentService.createRazorpayOrder(cart, formData, appliedCoupon?.code || undefined);

      const options = {
        key: rpOrder.keyId,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: 'PGK GIFTS',
        description: `Order for ${cart.length} handcrafted items`,
        order_id: rpOrder.id,
        handler: async (response: unknown) => {
          try {
            const verified = await paymentService.verifyPayment(response as {
              razorpay_order_id: string;
              razorpay_payment_id: string;
              razorpay_signature: string;
            });
            setIsPurchased(true);
            clearCart(true);
            router.push(`/order-success?id=${verified.orderId}`);
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Payment verification failed.';
            toast({ variant: 'destructive', title: 'Verification Failed', description: message });
            setLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          contact: formData.phone,
          email: user?.email || undefined,
        },
        notes: {
          serverOrderId: rpOrder.id,
        },
        theme: {
          color: '#c026d3',
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: 'Razorpay reported a failed payment. No order was created.',
        });
        setLoading(false);
      });
      rzp.open();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: message,
      });
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && (document.referrer === '' || !document.referrer.includes(window.location.host))) {
      router.push('/cart');
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen pt-24 md:pt-36 pb-16 bg-background transition-colors duration-500">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button variant="ghost" onClick={handleBack} className="mb-4 md:mb-6 rounded-full group font-semibold h-9 md:h-10 px-4 text-xs md:text-sm hover:bg-secondary">
            <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Cart
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-7 space-y-4 md:space-y-6">
            <Card className="rounded-2xl border border-border/50 shadow-md p-6 md:p-8 bg-card transition-all duration-500">
              <header className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md">1</div>
                  <h3 className="text-xl md:text-2xl font-bold">Shipping Details</h3>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">Where should we deliver your handcrafted treasure?</p>
              </header>

              <form onSubmit={handlePayment} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground ml-1">Recipient Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="h-10 md:h-11 rounded-lg border-border bg-secondary/30 focus-visible:ring-primary text-sm px-3 md:px-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground ml-1">Contact Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    required
                    placeholder="+91 00000 00000"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="h-10 md:h-11 rounded-lg border-border bg-secondary/30 focus-visible:ring-primary text-sm px-3 md:px-4"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address" className="text-xs font-semibold text-muted-foreground ml-1">Full Address</Label>
                  <Input
                    id="address"
                    name="address"
                    required
                    placeholder="House No, Street, Landmark"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="h-10 md:h-11 rounded-lg border-border bg-secondary/30 focus-visible:ring-primary text-sm px-3 md:px-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs font-semibold text-muted-foreground ml-1">City</Label>
                  <Input
                    id="city"
                    name="city"
                    required
                    placeholder="Chennai"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="h-10 md:h-11 rounded-lg border-border bg-secondary/30 focus-visible:ring-primary text-sm px-3 md:px-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode" className="text-xs font-semibold text-muted-foreground ml-1">Pincode</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    required
                    placeholder="600001"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="h-10 md:h-11 rounded-lg border-border bg-secondary/30 focus-visible:ring-primary text-sm px-3 md:px-4"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="state" className="text-xs font-semibold text-muted-foreground ml-1">State</Label>
                  <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
                    <SelectTrigger className="h-10 md:h-11 rounded-lg border-border bg-secondary/30 focus-visible:ring-primary text-sm px-3 md:px-4 shadow-none">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 rounded-lg bg-card border border-border p-1">
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state} className="rounded-md h-9 pl-8 pr-4 cursor-pointer hover:bg-accent text-sm">
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </Card>

            <Card className="rounded-2xl border border-border/50 shadow-sm p-4 md:p-6 bg-card/80 backdrop-blur-sm transition-all duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary text-foreground flex items-center justify-center font-bold text-sm shadow-sm border border-border/50">2</div>
                  <h3 className="text-lg md:text-xl font-bold">Secure Payment</h3>
                </div>
                <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full border border-border/30 w-fit">
                  <ShieldCheck className="w-4 h-4 text-green-600 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Razorpay Secure</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card className="rounded-2xl border border-border/50 shadow-md p-6 md:p-8 bg-card lg:sticky lg:top-32 overflow-hidden transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />

              <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 pb-3 border-b border-dashed border-border/50">Order Summary</h3>

              <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center group">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-secondary/50 flex-shrink-0 border border-border/50 shadow-sm transition-transform group-hover:scale-[1.02]">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm leading-tight truncate text-foreground">{item.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border/60 rounded-full px-2 bg-secondary/50 shadow-sm h-7">
                          <button 
                            type="button"
                            onClick={() => {
                              if (item.quantity === 1) {
                                removeFromCart(item.id);
                              } else {
                                updateQuantity(item.id, item.quantity - 1);
                              }
                            }} 
                            className="p-0.5 text-muted-foreground hover:text-primary transition-colors"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-foreground">{item.quantity}</span>
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                            className="p-0.5 text-muted-foreground hover:text-primary transition-colors"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.customPhotos && item.customPhotos.length > 0 && (
                        <div className="flex gap-1 mt-2 overflow-x-auto pb-1 max-w-[200px] hide-scrollbar">
                          {item.customPhotos.map((photo, pIdx) => (
                            <div key={pIdx} className="relative w-6 h-6 rounded border border-border/60 overflow-hidden shrink-0 shadow-sm bg-accent/25">
                              <Image src={photo.imageUrl} alt={`Upload ${pIdx + 1}`} fill className="object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                      {item.customText && (
                        <p className="text-[11px] text-muted-foreground mt-1 truncate">
                          Text: &ldquo;<span className="text-foreground font-semibold">{item.customText}</span>&rdquo;
                        </p>
                      )}
                      <p className="font-bold text-sm mt-1 text-primary">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Input */}
              <div className="py-4 border-t border-dashed border-border/50 space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground ml-1">Promo / Discount Code</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. WELCOME10"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError('');
                    }}
                    disabled={!!appliedCoupon || validatingCoupon}
                    className="h-10 rounded-lg border-border bg-secondary/20 focus-visible:ring-primary text-sm px-3 uppercase font-bold"
                  />
                  {appliedCoupon ? (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={handleRemoveCoupon}
                      className="rounded-lg h-10 px-4 font-bold text-sm shrink-0"
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      onClick={handleApplyCoupon}
                      disabled={!couponCode || validatingCoupon}
                      className="rounded-lg h-10 px-5 font-bold text-sm shrink-0 hover:bg-primary/95"
                    >
                      {validatingCoupon ? '...' : 'Apply'}
                    </Button>
                  )}
                </div>
                {couponError && <p className="text-xs text-destructive font-semibold ml-2">{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-xs text-green-600 font-semibold ml-2">
                    Success! {appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `Rs. ${appliedCoupon.value}`} coupon active.
                  </p>
                )}
              </div>

              {(() => {
                let totalWeight = 0;
                cart.forEach((item) => {
                  if (item.deliveryCharge !== 'complimentary') {
                    const itemWeight = (item.weight && item.weight > 0) ? item.weight : 1;
                    totalWeight += itemWeight * item.quantity;
                  }
                });

                const shippingFee = cart.reduce((sum, item) => sum + getItemDeliveryCharge(item, formData.state, deliverySettings || undefined) * item.quantity, 0);
                const grandTotal = Math.max(0, cartTotal + shippingFee - (appliedCoupon?.discount || 0));

                return (
                  <div className="space-y-3 pt-4 border-t border-dashed border-border/50">
                    <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <span>Delivery ({formData.state}{shippingFee > 0 && totalWeight > 0 ? ` - ${totalWeight.toFixed(2)} Kg` : ''})</span>
                      <span className="text-foreground">{shippingFee > 0 ? formatPrice(shippingFee) : 'Complimentary'}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-xs font-semibold text-green-600 uppercase tracking-wider">
                        <span>Discount ({appliedCoupon.code})</span>
                        <span>-{formatPrice(appliedCoupon.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-end pt-4 border-t border-border/50">
                      <span className="text-sm md:text-base font-semibold">Total Amount</span>
                      <span className="text-2xl md:text-3xl font-bold text-primary leading-none">
                        {formatPrice(grandTotal)}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full rounded-full h-11 md:h-12 text-sm md:text-base font-bold mt-6 shadow-md shadow-primary/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Launching Secure Gateway...</>
                ) : (
                  <>Pay Securely Now</>
                )}
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground opacity-60">
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Secure 256-Bit SSL Checkout</span>
              </div>

              <div className="mt-6 pt-5 border-t border-dashed border-border/50 text-center">
                <p className="font-semibold text-sm mb-1">Need help with your payment?</p>
                <p className="text-xs text-muted-foreground mb-4">Our support team is available to assist you via WhatsApp.</p>
                <Button asChild variant="outline" className="w-full h-10 rounded-full border border-green-500/20 bg-green-500/5 text-green-700 hover:bg-green-500 hover:text-white transition-colors text-xs font-bold dark:text-green-400">
                  <a href={`${CONTACT_INFO.whatsapp}?text=${encodeURIComponent("Hi, I'm trying to checkout but I have a question!")}`} target="_blank" rel="noopener noreferrer">
                    Chat with Support
                  </a>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
