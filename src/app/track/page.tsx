'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Package, Navigation, CheckCircle2, MapPin, Truck, AlertCircle, Loader2 } from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';
import { formatPrice } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { Badge } from '@/components/ui/badge';

const STATUS_STEPS = [
  { id: 'pending', label: 'Order Placed', description: 'We have received your order.' },
  { id: 'processing', label: 'Crafting', description: 'Your custom masterpiece is being created.' },
  { id: 'shipped', label: 'Shipped', description: 'Handed over to our delivery partners.' },
  { id: 'delivered', label: 'Delivered', description: 'Enjoy your masterpiece!' }
];

export default function OrderTrackingPage() {
  const { firestore } = useFirestore() || {};
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim() || !firestore) return;

    setLoading(true);
    setError('');
    
    try {
      const { OrdersService } = await import('@/services/orders.service');
      const svc = new OrdersService(firestore);
      const result = await svc.getOrderByTrackingId(trackingId.trim());
      
      if (result) {
        setOrder(result);
      } else {
        setOrder(null);
        setError("We couldn't find an order matching that Tracking ID. Please double check the ID provided in your SMS or email.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while tracking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order 
    ? STATUS_STEPS.findIndex(s => s.id === order.status) 
    : -1;

  return (
    <div className="min-h-screen pt-40 pb-40 bg-background flex flex-col items-center">
      <div className="container max-w-4xl mx-auto px-6">
        
        <div className="text-center space-y-6 mb-16">
          <Badge variant="secondary" className="bg-primary/10 text-primary font-bold uppercase tracking-widest px-4 py-1.5 border-none">
            Live Tracking
          </Badge>
          <h1 className="text-5xl md:text-7xl font-headline font-bold text-foreground">Track Masterpiece</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Enter your Tracking ID or Razorpay Order ID to see live updates on your custom gift.
          </p>
        </div>

        <Card className="rounded-[3rem] shadow-2xl p-8 md:p-12 border-white/5 bg-card/60 backdrop-blur-xl mb-12">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              <Input
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Tracking ID (e.g., order_XYZ123)"
                className="w-full pl-16 h-20 rounded-full bg-secondary/50 border-none text-xl font-bold font-mono placeholder:font-sans focus-visible:ring-primary shadow-inner"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !trackingId.trim()} 
              className="h-20 px-12 rounded-full text-xl font-bold shadow-xl shadow-primary/20"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Track Order"}
            </Button>
          </form>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 flex items-center gap-3 text-destructive font-bold bg-destructive/10 p-5 rounded-2xl"
              >
                <AlertCircle className="w-6 h-6 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <AnimatePresence>
          {order && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {order.status === 'cancelled' ? (
                <Card className="rounded-[2rem] border-none bg-destructive/10 p-10 text-center">
                  <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                  <h2 className="text-3xl font-headline font-bold text-destructive mb-2">Order Cancelled</h2>
                  <p className="text-destructive/80 font-medium">This order has been cancelled. If you believe this is a mistake, please WhatsApp us.</p>
                </Card>
              ) : (
                <Card className="rounded-[3rem] border-none bg-card shadow-2xl p-10 md:p-16 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Navigation className="w-64 h-64" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-16 relative z-10">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Order Details</p>
                      <h2 className="text-4xl font-headline font-bold text-foreground break-all">#{order.orderId || order.id.slice(0, 8)}</h2>
                      <p className="text-lg font-medium text-muted-foreground mt-2">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Status</p>
                      <p className="text-2xl font-bold text-primary">{order.status.toUpperCase()}</p>
                    </div>
                  </div>

                  {/* Stepper */}
                  <div className="relative z-10 py-8">
                    <div className="absolute left-8 md:left-0 top-[40px] md:top-1/2 w-0.5 md:w-full h-full md:h-0.5 bg-secondary/50 -z-10" />
                    
                    <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-4 relative">
                      {STATUS_STEPS.map((step, index) => {
                        const isCompleted = currentStepIndex >= index;
                        const isCurrent = currentStepIndex === index;
                        
                        return (
                          <div key={step.id} className="flex md:flex-col items-center md:items-center gap-6 md:gap-4 flex-1">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 z-10 transition-all duration-500
                              ${isCompleted ? 'bg-primary border-primary shadow-[0_0_30px_rgba(var(--primary),0.5)]' : 'bg-card border-secondary text-muted-foreground'}
                              ${isCurrent ? 'scale-125' : 'scale-100'}
                            `}>
                              {isCompleted ? <CheckCircle2 className="w-8 h-8 text-primary-foreground" /> : <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />}
                            </div>
                            <div className="md:text-center">
                              <h3 className={`text-xl font-bold mb-1 ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</h3>
                              <p className="text-sm font-medium text-muted-foreground">{step.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Shipping Info */}
                  <div className="mt-16 pt-12 border-t flex flex-col md:flex-row gap-12 relative z-10">
                    <div className="flex-1 space-y-4 text-center md:text-left">
                      <MapPin className="w-8 h-8 text-primary mx-auto md:mx-0 opacity-50" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Delivery Address</p>
                        <p className="text-lg font-bold">{order.customerName}</p>
                        <p className="text-muted-foreground font-medium">{order.address}</p>
                        <p className="text-muted-foreground font-medium">{order.city}, {order.pincode}</p>
                      </div>
                    </div>
                    <div className="w-px bg-border hidden md:block" />
                    <div className="flex-1 space-y-4 text-center md:text-left">
                       <Package className="w-8 h-8 text-primary mx-auto md:mx-0 opacity-50" />
                       <div>
                         <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Items Ordered</p>
                         <div className="space-y-3">
                           {order.items?.map((item, i) => (
                             <div key={i} className="flex items-center justify-between">
                               <p className="font-bold text-lg"><span className="text-primary mr-2">{item.quantity}x</span> {item.name}</p>
                             </div>
                           ))}
                         </div>
                       </div>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Temporary layout shell component needed for Card since we didn't import it at the top
function Card({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={`bg-card text-card-foreground border rounded-lg ${className}`}>{children}</div>;
}
