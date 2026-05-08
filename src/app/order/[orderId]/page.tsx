'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle2, Clock, MapPin, ArrowLeft, Loader2, MessageSquare, CreditCard, ShoppingBag, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { ReturnReportModal } from '@/components/order/ReturnReportModal';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!firestore || !orderId || !isMounted) return;
      const ordersService = new OrdersService(firestore);
      const data = await ordersService.getOrderById(orderId as string);
      setOrder(data);
      setLoading(false);
    };
    fetchOrder();
  }, [orderId, firestore, isMounted]);

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-accent/5 gap-8">
        <Loader2 className="w-20 h-20 animate-spin text-primary" />
        <p className="text-2xl font-headline font-bold text-muted-foreground">Retrieving Transaction Data...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-accent/5">
        <div className="w-40 h-40 bg-destructive/10 text-destructive rounded-[3rem] flex items-center justify-center mb-12 shadow-2xl">
          <Package className="w-20 h-20" />
        </div>
        <h1 className="text-6xl font-headline font-bold mb-8 text-foreground">Order Not Found</h1>
        <p className="text-muted-foreground mb-12 text-2xl max-w-md mx-auto">Reference <span className="font-bold text-foreground font-mono">#{orderId}</span> is missing.</p>
        <Button onClick={() => router.push('/shop')} className="rounded-full h-20 px-16 text-2xl font-bold shadow-xl">Return to Shop</Button>
      </div>
    );
  }

  const stages = [
    { id: 'pending', label: 'Placed', icon: Clock },
    { id: 'processing', label: 'Studio', icon: Package },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const currentStageIndex = stages.findIndex(s => s.id === order.status);

  return (
    <div className="min-h-screen pt-40 pb-32 bg-accent/5">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-12 rounded-full font-bold text-2xl group hover:bg-accent h-16 px-8">
          <ArrowLeft className="mr-4 w-8 h-8 group-hover:-translate-x-2 transition-transform" /> Transaction Status
        </Button>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-10">
          <div className="space-y-6">
            <Badge variant="outline" className="rounded-full px-8 py-2 border-primary text-primary font-bold uppercase tracking-[0.4em] text-xs">Live Status</Badge>
            <h1 className="text-8xl font-headline font-bold leading-none tracking-tighter text-foreground">#{order.orderId || order.id.slice(0, 6)}</h1>
            <p className="text-muted-foreground text-3xl">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-col items-end gap-6">
             <Badge variant="secondary" className="h-20 px-16 rounded-full font-headline font-bold text-4xl border-none bg-primary text-primary-foreground shadow-2xl uppercase">
               {order.status || 'PENDING'}
             </Badge>
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-4">
               <CreditCard className="w-5 h-5" /> PAYMENT: {order.paymentStatus === 'paid' ? 'CONFIRMED' : 'PENDING'}
             </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-16">
          {/* Progress Timeline */}
          <Card className="rounded-[4rem] border-none shadow-2xl p-20 bg-card relative overflow-hidden">
            <div className="absolute top-0 left-0 w-3 h-full bg-primary/10" />
            <div className="relative flex flex-col md:flex-row justify-between items-center gap-12 px-6">
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-3 bg-accent/20 -translate-y-1/2 -z-0 rounded-full" />
              <div 
                className="hidden md:block absolute top-1/2 left-0 h-3 bg-primary -translate-y-1/2 transition-all duration-1000 -z-0 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.15)]" 
                style={{ width: `${Math.max(0, currentStageIndex / (stages.length - 1)) * 100}%` }}
              />
              {stages.map((stage, i) => {
                const Icon = stage.icon;
                const isActive = i <= currentStageIndex;
                const isCurrent = i === currentStageIndex;
                return (
                  <div key={stage.id} className="relative z-10 flex flex-col items-center gap-8 bg-card px-6">
                    <motion.div 
                      animate={isCurrent ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-24 h-24 rounded-[2rem] flex items-center justify-center border-4 transition-all duration-500 ${isActive ? 'bg-primary border-primary text-primary-foreground shadow-2xl' : 'bg-accent/10 border-accent/20 text-muted-foreground'}`}
                    >
                      <Icon className="w-12 h-12" />
                    </motion.div>
                    <div className="text-center">
                      <span className={`text-sm font-black uppercase tracking-[0.3em] block ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {stage.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <Card className="rounded-[4rem] border-2 border-primary/5 shadow-2xl p-16 bg-card">
              <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-accent/50 text-primary flex items-center justify-center">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <h3 className="text-4xl font-headline font-bold text-foreground">Destination</h3>
              </div>
              <div className="space-y-8 text-muted-foreground text-2xl">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 mb-3">RECIPIENT</p>
                  <p className="font-headline font-bold text-foreground text-4xl">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 mb-3">SHIPPING ADDRESS</p>
                  <p className="leading-relaxed">{order.address}</p>
                  <p className="font-bold text-foreground mt-2">{order.city} – {order.pincode}</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[4rem] border-2 border-primary/5 shadow-2xl p-16 bg-card">
              <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-accent/50 text-primary flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-4xl font-headline font-bold text-foreground">The Package</h3>
              </div>
              <div className="space-y-8">
                <div className="max-h-[300px] overflow-y-auto pr-6 custom-scrollbar space-y-8">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-dashed border-muted pb-8 last:border-none last:pb-0">
                      <div className="flex gap-8 items-center">
                        <div className="relative w-24 h-24 rounded-3xl overflow-hidden bg-muted border-2 border-transparent">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-2xl leading-tight text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mt-3">QTY: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-headline font-bold text-3xl text-foreground">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-10 flex justify-between items-center border-t-4 border-primary/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">TOTAL PAID</span>
                    <span className="text-5xl font-headline font-bold text-primary">{formatPrice(order.total)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-green-600">VERIFIED</span>
                    <p className="font-bold text-2xl flex items-center justify-end gap-3 text-green-600">
                       SUCCESS <CheckCircle2 className="w-6 h-6" />
                    </p>
                </div>
              </div>
            </div>
          </Card>
          </div>

          {/* Issue Reporting Section */}
          {order.status === 'delivered' && (
            <div className="flex flex-col items-center gap-6 mt-8">
              {!order.returnRequest ? (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground font-medium">Something not right with your order?</p>
                  <ReturnReportModal orderId={order.id} onSuccess={() => window.location.reload()} />
                </div>
              ) : (
                <Card className="w-full rounded-[3rem] border-none shadow-premium p-10 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-headline font-bold">Issue Report Submitted</h4>
                      <p className="text-muted-foreground">Our studio team is reviewing your report.</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="h-12 px-8 rounded-full font-bold bg-background shadow-sm border-primary/20 text-primary">
                    STATUS: {order.returnRequest.status.toUpperCase()}
                  </Badge>
                </Card>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-8 justify-center mt-12">
            <Button variant="outline" size="lg" className="rounded-full h-24 px-16 border-2 font-bold text-2xl group transition-all" asChild>
              <Link href={`/order/${orderId}/invoice`}>
                 <Download className="mr-4 w-8 h-8 group-hover:translate-y-1 transition-transform" /> Get Invoice
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full h-24 px-16 border-2 font-bold text-2xl group transition-all" asChild>
              <a href={CONTACT_INFO.whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="mr-4 w-8 h-8 group-hover:scale-110 transition-transform" /> WhatsApp Help
              </a>
            </Button>
            <Button size="lg" className="rounded-full h-24 px-16 font-bold text-2xl shadow-2xl" asChild>
              <Link href="/shop">Browse Store</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
