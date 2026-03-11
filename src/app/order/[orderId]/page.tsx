
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle2, Clock, MapPin, ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFirestore } from '@/firebase';
import { OrdersService } from '@/services/orders.service';
import { Order } from '@/types/order';
import { formatPrice } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { CONTACT_INFO } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const ordersService = new OrdersService(firestore);
      const data = await ordersService.getOrderById(orderId as string);
      setOrder(data);
      setLoading(false);
    };
    fetchOrder();
  }, [orderId, firestore]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mb-8">
          <Package className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-headline font-bold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-8 text-xl">We couldn't find an order with the ID: <span className="font-bold text-foreground">{orderId}</span></p>
        <Button onClick={() => router.push('/shop')} className="rounded-full h-14 px-8 text-lg font-bold">Back to Shop</Button>
      </div>
    );
  }

  const stages = [
    { id: 'pending', label: 'Order Placed', icon: Clock },
    { id: 'processing', label: 'Processing', icon: Package },
    { id: 'shipped', label: 'In Transit', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const currentStageIndex = stages.findIndex(s => s.id === order.status);

  return (
    <div className="min-h-screen pt-40 pb-20 bg-accent/5">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-8 rounded-full font-bold text-lg">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="space-y-2">
            <Badge className="rounded-full px-4 border-primary text-primary font-bold uppercase tracking-widest text-[10px]">Tracking Order</Badge>
            <h1 className="text-5xl font-headline font-bold leading-none">#{order.orderId}</h1>
            <p className="text-muted-foreground text-xl">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <Badge variant="secondary" className="h-12 px-8 rounded-full font-bold text-xl border-none bg-primary text-primary-foreground">
            {order.status.toUpperCase()}
          </Badge>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <Card className="rounded-[3rem] border-none shadow-xl p-10 bg-card">
            <div className="relative flex justify-between items-center px-4">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-accent -translate-y-1/2 -z-0" />
              <div 
                className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 transition-all duration-1000 -z-0" 
                style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
              />
              {stages.map((stage, i) => {
                const Icon = stage.icon;
                const isActive = i <= currentStageIndex;
                return (
                  <div key={stage.id} className="relative z-10 flex flex-col items-center gap-4 bg-card px-2">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isActive ? 'bg-primary border-primary text-white scale-110 shadow-xl' : 'bg-accent/20 border-accent text-muted-foreground'}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="rounded-[3rem] border-none shadow-xl p-8 bg-card">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-primary" /> Delivery Address
                </CardTitle>
              </CardHeader>
              <div className="space-y-2 text-muted-foreground text-lg">
                <p className="font-bold text-foreground text-xl">{order.customerName}</p>
                <p>{order.address}</p>
                <p>{order.city}, {order.pincode}</p>
                <p className="pt-4 flex items-center gap-2 text-base font-bold text-primary"><Truck className="w-4 h-4" /> Estimated Delivery: 3-5 Working Days</p>
              </div>
            </Card>

            <Card className="rounded-[3rem] border-none shadow-xl p-8 bg-card">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-headline font-bold flex items-center gap-3">
                  <Package className="w-6 h-6 text-primary" /> Items Ordered
                </CardTitle>
              </CardHeader>
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-dashed pb-4 last:border-none">
                    <div className="flex gap-4 items-center">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-base">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold text-lg">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
                <div className="pt-4 flex justify-between items-center border-t-2 border-primary/10">
                  <span className="text-xl font-bold">Total Paid</span>
                  <span className="text-3xl font-headline font-bold text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button variant="outline" size="lg" className="rounded-full h-16 px-10 border-2 font-bold group text-xl" asChild>
              <a href={CONTACT_INFO.whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="mr-2 w-6 h-6 group-hover:scale-110 transition-transform" /> Support on WhatsApp
              </a>
            </Button>
            <Button size="lg" className="rounded-full h-16 px-10 font-bold text-xl" asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
