'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  ArrowRight, 
  MessageSquare, 
  Loader2, 
  Download, 
  Calendar, 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  Package, 
  Truck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CONTACT_INFO } from '@/lib/data';
import { useFirebase } from '@/firebase';
import { OrdersService } from '@/services/orders.service';
import { Order } from '@/types/order';
import { toDate } from '@/utils/date';
import { formatPrice } from '@/utils/currency';
import { addDays, format } from 'date-fns';
import Image from 'next/image';

function SuccessContent() {
  const searchParams = useSearchParams();
  const docId = searchParams.get('id');
  const { firestore } = useFirebase();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!firestore || !docId || !isMounted) return;
      try {
        const ordersService = new OrdersService(firestore);
        const data = await ordersService.getOrderById(docId);
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [docId, firestore, isMounted]);

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-accent/5 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-headline font-semibold text-muted-foreground animate-pulse">Retrieving order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-accent/5">
        <div className="container mx-auto px-4 max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-bounce">
            <Package className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-headline font-bold">Order Not Found</h1>
          <p className="text-muted-foreground">
            We couldn&apos;t find details for order reference <span className="font-mono font-semibold text-foreground">#{docId || 'unknown'}</span>.
          </p>
          <Button asChild size="lg" className="rounded-full w-full">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate estimated delivery date (5 to 7 days from order creation)
  const orderDate = toDate(order.createdAt);
  const minDeliveryDate = addDays(orderDate, 5);
  const maxDeliveryDate = addDays(orderDate, 7);
  const deliveryEstimate = `${format(minDeliveryDate, 'EEEE, MMM dd')} - ${format(maxDeliveryDate, 'EEEE, MMM dd')}`;

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-16 md:pb-24 bg-accent/5">
      <div className="container mx-auto px-4 max-w-5xl space-y-8">
        
        {/* Success Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-20 h-20 md:w-24 md:h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-md"
          >
            <CheckCircle className="w-10 h-10 md:w-12 md:h-12" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-headline font-bold text-foreground">Thank You, {order.customerName}!</h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Your order <span className="font-semibold text-foreground">#{order.orderId}</span> is confirmed and being prepared.
            </p>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns - Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Delivery Estimate */}
            <Card className="p-6 border-none shadow-sm rounded-2xl flex items-start gap-4 bg-primary/5">
              <div className="p-3 bg-primary/10 rounded-xl text-primary mt-0.5 animate-pulse">
                <Truck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-headline font-bold text-lg text-foreground">Estimated Delivery</h3>
                <p className="text-xl md:text-2xl font-headline font-bold text-primary">{deliveryEstimate}</p>
                <p className="text-sm text-muted-foreground">
                  Our artists have started custom crafting your items. We will text you tracking updates once shipped!
                </p>
              </div>
            </Card>

            {/* Items Ordered */}
            <Card className="p-6 border-none shadow-sm rounded-2xl space-y-4">
              <h3 className="font-headline font-bold text-lg border-b pb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Items Ordered ({order.items.reduce((acc, item) => acc + item.quantity, 0)})
              </h3>
              
              <div className="divide-y">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative w-20 h-20 flex-shrink-0 bg-accent rounded-lg overflow-hidden border">
                      <Image
                        src={item.image || '/images/placeholder.jpg'}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-headline font-bold text-sm md:text-base text-foreground line-clamp-1">
                        {item.name}
                      </h4>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {item.selectedSize && (
                          <Badge variant="outline" className="rounded-full px-2 py-0">
                            Size: {item.selectedSize}
                          </Badge>
                        )}
                        <Badge 
                          variant="secondary" 
                          className={`rounded-full px-2 py-0 border-none ${
                            item.deliveryCharge === 'complimentary' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-accent text-muted-foreground'
                          }`}
                        >
                          {item.deliveryCharge === 'complimentary' ? 'Complimentary Shipping' : 'Regular Shipping'}
                        </Badge>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-headline font-bold text-sm md:text-base text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Shipping Address */}
            <Card className="p-6 border-none shadow-sm rounded-2xl space-y-3">
              <h3 className="font-headline font-bold text-lg border-b pb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Shipping Details
              </h3>
              <div className="text-sm space-y-1 text-muted-foreground font-sans">
                <p className="font-bold text-foreground">{order.customerName}</p>
                <p>{order.address}</p>
                <p>{order.city}, {order.state} - {order.pincode}</p>
                <p className="pt-2 text-foreground/80">Phone: {order.phone}</p>
                {order.customerEmail && <p>Email: {order.customerEmail}</p>}
              </div>
            </Card>
          </div>

          {/* Right Column - Summary & Action */}
          <div className="space-y-6">
            
            {/* Payment Summary */}
            <Card className="p-6 border-none shadow-sm rounded-2xl space-y-4">
              <h3 className="font-headline font-bold text-lg border-b pb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Summary
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal || (order.total - (order.shippingFee || 0) - (order.gatewayFee || 0) + (order.discount || 0)))}</span>
                </div>
                {order.discount !== undefined && order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({order.couponCode || 'Promo'})</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Fee</span>
                  <span>
                    {order.shippingFee === 0 ? (
                      <span className="text-green-600 font-bold uppercase tracking-wider text-[10px]">Complimentary</span>
                    ) : (
                      formatPrice(order.shippingFee || 0)
                    )}
                  </span>
                </div>
                {order.gatewayFee !== undefined && order.gatewayFee > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Gateway Charge (2.36%)</span>
                    <span>{formatPrice(order.gatewayFee)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-headline font-bold text-lg text-foreground">
                  <span>Total Amount Paid</span>
                  <span className="text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
            </Card>

            {/* Actions List */}
            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/20 w-full h-12 text-sm font-bold">
                <Link href="/shop">
                  Continue Shopping <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full w-full h-12 text-sm font-bold border-2">
                <Link href={`/order/${docId}`}>
                  Track Your Order <Truck className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full w-full h-12 text-sm font-bold border-2">
                <Link href={`/order/${docId}/invoice`}>
                  Download Invoice <Download className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full w-full h-12 text-sm font-bold border-2">
                <a href={CONTACT_INFO.whatsapp} target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp <MessageSquare className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-accent/5">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
