
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle2, Clock, MapPin, ArrowLeft, Loader2, MessageSquare, CreditCard, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFirestore } from '@/firebase';
import { OrdersService } from '@/services/orders.service';
import { Order } from '@/types/order';
import { formatPrice } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { CONTACT_INFO } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!firestore || !orderId) return;
      const ordersService = new OrdersService(firestore);
      const data = await ordersService.getOrderById(orderId as string);
      setOrder(data);
      setLoading(false);
    };
    fetchOrder();
  }, [orderId, firestore]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-accent/5 gap-6">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
        <p className="text-xl font-headline font-bold text-muted-foreground">Retrieving Secure Order Data...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-accent/5">
        <div className="w-32 h-32 bg-destructive/10 text-destructive rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl">
          <Package className="w-16 h-16" />
        </div>
        <h1 className="text-6xl font-headline font-bold mb-6">Record Not Found</h1>
        <p className="text-muted-foreground mb-12 text-2xl max-w-md mx-auto">We couldn't locate order reference <span className="font-bold text-foreground font-mono">#{orderId}</span> in our system.</p>
        <Button onClick={() => router.push('/shop')} className="rounded-full h-20 px-12 text-2xl font-bold shadow-xl">Return to Store</Button>
      </div>
    );
  }

  const stages = [
    { id: 'pending', label: 'Order Placed', icon: Clock, description: 'Payment verified successfully.' },
    { id: 'processing', label: 'In Studio', icon: Package, description: 'Our artisans are crafting your gift.' },
    { id: 'shipped', label: 'Out for Delivery', icon: Truck, description: 'Handed over to our courier partners.' },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2, description: 'Package safely reached destination.' },
  ];

  const currentStageIndex = stages.findIndex(s => s.id === order.status);

  return (
    <div className="min-h-screen pt-40 pb-32 bg-accent/5">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-10 rounded-full font-bold text-xl group hover:bg-accent">
          <ArrowLeft className="mr-3 w-6 h-6 group-hover:-translate-x-2 transition-transform" /> Transaction History
        </Button>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-10">
          <div className="space-y-4">
            <Badge variant="outline" className="rounded-full px-6 py-1.5 border-primary text-primary font-bold uppercase tracking-[0.3em] text-[11px]">Real-time Tracking</Badge>
            <h1 className="text-7xl font-headline font-bold leading-none tracking-tighter">#{order.orderId}</h1>
            <p className="text-muted-foreground text-2xl">Authenticated purchase on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-col items-end gap-4">
             <Badge variant="secondary" className="h-16 px-12 rounded-full font-headline font-bold text-3xl border-none bg-primary text-primary-foreground shadow-2xl">
               {order.status.toUpperCase()}
             </Badge>
             <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
               <CreditCard className="w-4 h-4" /> {order.paymentStatus === 'paid' ? 'Transaction Confirmed' : 'Payment Processing'}
             </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-12">
          {/* Progress Timeline */}
          <Card className="rounded-[4rem] border-none shadow-2xl p-16 bg-card relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary/10" />
            <div className="relative flex flex-col md:flex-row justify-between items-center gap-10 md:gap-4 px-4">
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-2 bg-accent/20 -translate-y-1/2 -z-0 rounded-full" />
              <div 
                className="hidden md:block absolute top-1/2 left-0 h-2 bg-primary -translate-y-1/2 transition-all duration-1000 -z-0 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.2)]" 
                style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
              />
              {stages.map((stage, i) => {
                const Icon = stage.icon;
                const isActive = i <= currentStageIndex;
                const isCurrent = i === currentStageIndex;
                return (
                  <div key={stage.id} className="relative z-10 flex flex-col items-center gap-6 bg-card px-4">
                    <motion.div 
                      initial={false}
                      animate={isCurrent ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border-4 transition-all duration-500 ${isActive ? 'bg-primary border-primary text-white shadow-2xl' : 'bg-accent/10 border-accent/20 text-muted-foreground'}`}
                    >
                      <Icon className="w-10 h-10" />
                    </motion.div>
                    <div className="text-center">
                      <span className={`text-xs font-black uppercase tracking-[0.2em] block mb-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {stage.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 hidden md:block max-w-[100px] leading-tight">{stage.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Delivery Info */}
            <Card className="rounded-[4rem] border-none shadow-2xl p-12 bg-card group hover:shadow-primary/5 transition-all">
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-3xl font-headline font-bold flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-accent/50 text-primary flex items-center justify-center">
                    <MapPin className="w-7 h-7" />
                  </div>
                  Destination Details
                </CardTitle>
              </CardHeader>
              <div className="space-y-6 text-muted-foreground text-xl">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-primary/40 mb-2">Recipient</p>
                  <p className="font-headline font-bold text-foreground text-3xl">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-primary/40 mb-2">Shipping To</p>
                  <p className="leading-relaxed">{order.address}</p>
                  <p className="font-bold text-foreground">{order.city} – {order.pincode}</p>
                </div>
                <div className="pt-8 flex items-center gap-4 text-lg font-bold text-primary bg-primary/5 p-6 rounded-3xl border border-primary/10">
                  <Truck className="w-8 h-8 animate-pulse" />
                  <div>
                    <p className="text-xs uppercase tracking-widest opacity-60">Estimated Delivery</p>
                    <p className="font-headline text-xl">3-5 Premium Business Days</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Items */}
            <Card className="rounded-[4rem] border-none shadow-2xl p-12 bg-card group hover:shadow-primary/5 transition-all">
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-3xl font-headline font-bold flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-accent/50 text-primary flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  Treasures Package
                </CardTitle>
              </CardHeader>
              <div className="space-y-6">
                <div className="max-h-[300px] overflow-y-auto pr-4 custom-scrollbar space-y-6">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-dashed border-muted pb-6 last:border-none last:pb-0">
                      <div className="flex gap-6 items-center">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-muted border-2 border-transparent group-hover:border-primary/20 transition-all">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-xl leading-tight">{item.name}</p>
                          <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mt-2">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-headline font-bold text-2xl">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-8 flex justify-between items-center border-t-4 border-primary/10">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Paid</span>
                    <span className="text-4xl font-headline font-bold text-primary">{formatPrice(order.total)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black uppercase tracking-widest text-green-600">Payment Status</span>
                    <p className="font-bold text-xl flex items-center justify-end gap-2 text-green-600">
                       Paid <CheckCircle2 className="w-5 h-5" />
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
            <Button variant="outline" size="lg" className="rounded-full h-20 px-12 border-2 font-bold group text-xl hover:bg-primary hover:text-primary-foreground transition-all" asChild>
              <a href={CONTACT_INFO.whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="mr-3 w-7 h-7 group-hover:scale-110 transition-transform" /> Support Concierge
              </a>
            </Button>
            <Button size="lg" className="rounded-full h-20 px-12 font-bold text-xl shadow-2xl shadow-primary/20" asChild>
              <Link href="/shop">Continue Exploring</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
