'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Package, ArrowRight, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Order } from '@/types/order';
import { formatPrice } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { Badge } from '@/components/ui/badge';

export default function TrackOrderPortal() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loadingMyOrders, setLoadingMyOrders] = useState(false);

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!firestore || !user) {
        setMyOrders([]);
        return;
      }
      setLoadingMyOrders(true);
      try {
        const { OrdersService } = await import('@/services/orders.service');
        const svc = new OrdersService(firestore);
        const list = await svc.getMyOrders(user.uid, user.email || undefined);
        setMyOrders(list);
      } catch (err) {
        console.error("Error fetching my orders:", err);
      } finally {
        setLoadingMyOrders(false);
      }
    };
    fetchMyOrders();
  }, [user, firestore]);

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
        router.push(`/order/${result.id}`);
      } else {
        setError("We couldn't find an order matching that Order ID. Please double check the code provided on your invoice or tracking email.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while retrieving tracking details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 md:pt-40 pb-20 md:pb-40 bg-accent/5 flex flex-col items-center">
      <div className="container max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-10 md:mb-16">
          <Badge variant="secondary" className="bg-primary/10 text-primary font-bold uppercase tracking-widest px-4 py-1.5 border-none">
            Live Tracking Portal
          </Badge>
          <h1 className="text-4xl md:text-7xl font-headline font-bold text-foreground tracking-tight">Track Your Gift</h1>
          <p className="text-base md:text-xl text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
            Enter your order reference ID below to view fabrication updates, shipping details, and access post-delivery options.
          </p>
        </div>

        {/* Search Box */}
        <Card className="rounded-3xl md:rounded-[3rem] shadow-premium p-5 md:p-10 border-none bg-card overflow-hidden relative">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary/20" />
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="e.g. PGK-123456"
                className="w-full pl-14 h-16 rounded-full bg-secondary/40 border-none text-base md:text-lg font-bold font-mono placeholder:font-sans focus-visible:ring-primary shadow-inner"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !trackingId.trim()} 
              className="h-16 px-10 rounded-full text-base font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] shrink-0"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track Order"}
            </Button>
          </form>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 flex items-start gap-3.5 text-destructive font-semibold bg-destructive/10 p-5 rounded-2xl border border-destructive/15 text-sm md:text-base"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* User's Order History */}
        {user && (
          <div className="mt-16 md:mt-24 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-2xl md:text-3xl font-headline font-bold text-foreground">Your Order History</h3>
            </div>
            
            {loadingMyOrders ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : myOrders.length === 0 ? (
              <Card className="rounded-[2.5rem] p-10 text-center border-none bg-card shadow-soft">
                <Package className="w-12 h-12 mx-auto text-muted-foreground opacity-40 mb-4" />
                <p className="text-muted-foreground font-medium text-lg">No orders associated with this account yet.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {myOrders.map((myOrder) => (
                  <Card 
                    key={myOrder.id} 
                    onClick={() => router.push(`/order/${myOrder.id}`)}
                    className="rounded-[2rem] p-6 border-none bg-card hover:bg-card/90 cursor-pointer transition-all duration-300 shadow-soft hover:shadow-premium group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-bold text-lg text-foreground font-mono">#{myOrder.orderId || myOrder.id.slice(0, 8)}</span>
                          <Badge className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 border-none rounded-full ${
                            myOrder.status === 'delivered' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
                            myOrder.status === 'shipped' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400' :
                            myOrder.status === 'cancelled' ? 'bg-red-500/10 text-red-700 dark:text-red-400' :
                            'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          }`}>
                            {myOrder.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Placed on {formatDate(myOrder.createdAt)}</p>
                      </div>
                      
                      <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-border/40">
                        <div className="text-left md:text-right">
                          <p className="text-xs text-muted-foreground">Items: {myOrder.items?.reduce((acc, curr) => acc + curr.quantity, 0) || 0}</p>
                          <p className="font-bold text-lg text-primary mt-0.5">{formatPrice(myOrder.total)}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-full font-bold h-10 px-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all flex items-center gap-2"
                        >
                          Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Temporary layout shell component needed for Card since we didn't import it at the top
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={`bg-card text-card-foreground border rounded-lg ${className}`} {...props}>
      {children}
    </div>
  );
}
