'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle2, Clock, MapPin, ArrowLeft, Loader2, MessageSquare, CreditCard, ShoppingBag, Download, AlertCircle, Star, Globe, Tag } from 'lucide-react';
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
import { FeedbackModal } from '@/components/order/FeedbackModal';

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-accent/5 gap-6">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
        <p className="text-xl font-headline font-bold text-muted-foreground">Retrieving Transaction Data...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-accent/5">
        <div className="w-20 h-20 md:w-28 md:h-28 bg-destructive/10 text-destructive rounded-3xl flex items-center justify-center mb-6 shadow-xl">
          <Package className="w-10 h-10 md:w-14 md:h-14" />
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-bold mb-3 text-foreground">Order Not Found</h1>
        <p className="text-muted-foreground mb-6 text-base md:text-xl max-w-md mx-auto">Reference <span className="font-bold text-foreground font-mono">#{orderId}</span> is missing.</p>
        <Button onClick={() => router.push('/shop')} className="rounded-full h-12 px-10 text-base font-bold shadow-lg">Return to Shop</Button>
      </div>
    );
  }

  const stages = [
    { id: 'pending', label: 'Placed', icon: Clock },
    { id: 'processing', label: 'Studio', icon: Package },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const currentStageIndex = stages.findIndex(s => s.id === order.status?.toLowerCase());

  const handleBack = () => {
    if (typeof window !== 'undefined' && (document.referrer === '' || !document.referrer.includes(window.location.host))) {
      router.push('/track');
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen pt-24 md:pt-40 pb-20 bg-accent/5">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button variant="ghost" onClick={handleBack} className="mb-4 md:mb-8 rounded-full font-bold text-xs md:text-base group hover:bg-accent h-10 md:h-12 px-4 md:px-6">
          <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Transaction Status
        </Button>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4 md:gap-8">
          <div className="space-y-2">
            <Badge variant="outline" className="rounded-full px-4 py-1 border-primary/50 text-primary font-bold uppercase tracking-wider text-[10px] md:text-xs">Live Status</Badge>
            <h1 className="text-2xl md:text-5xl font-headline font-bold leading-tight tracking-tight text-foreground break-all">#{order.orderId || order.id.slice(0, 6)}</h1>
            <p className="text-muted-foreground text-sm md:text-lg">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 md:gap-3">
             <Badge variant="secondary" className="h-9 md:h-14 px-5 md:px-8 rounded-full font-headline font-bold text-xs md:text-xl border-none bg-primary text-primary-foreground shadow-lg uppercase">
               {order.status || 'PENDING'}
             </Badge>
             <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
               <CreditCard className="w-4 h-4" /> PAYMENT: {order.paymentStatus === 'paid' ? 'CONFIRMED' : 'PENDING'}
             </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 md:gap-8">
          {/* Progress Timeline */}
          <Card className="rounded-2xl md:rounded-3xl border border-border/50 shadow-md p-6 md:p-14 bg-card relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/10" />
            <div className="relative flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 px-2">
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1.5 bg-accent/20 -translate-y-1/2 -z-0 rounded-full" />
              <div 
                className="hidden md:block absolute top-1/2 left-0 h-1.5 bg-primary -translate-y-1/2 transition-all duration-1000 -z-0 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]" 
                style={{ width: `${Math.max(0, currentStageIndex / (stages.length - 1)) * 100}%` }}
              />
              {stages.map((stage, i) => {
                const Icon = stage.icon;
                const isActive = i <= currentStageIndex;
                const isCurrent = i === currentStageIndex;
                return (
                  <div key={stage.id} className="relative z-10 flex flex-col items-center gap-3 bg-card px-4">
                    <motion.div 
                      animate={isCurrent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-[1.75rem] flex items-center justify-center border-2 transition-all duration-500 ${isActive ? 'bg-primary border-primary text-primary-foreground shadow-md' : 'bg-accent/10 border-accent/20 text-muted-foreground'}`}
                    >
                      <Icon className="w-6 h-6 md:w-10 md:h-10" />
                    </motion.div>
                    <div className="text-center">
                      <span className={`text-xs md:text-sm font-bold uppercase tracking-wider block ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {stage.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Courier Tracking Info */}
          {(order.status?.toLowerCase() === 'shipped' || order.status?.toLowerCase() === 'delivered') && order.trackingNumber && (
            <Card className="rounded-2xl md:rounded-3xl border border-primary/10 shadow-md p-5 md:p-8 bg-primary/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <Truck className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-primary/70 mb-0.5">Courier Dispatch Details</p>
                  <p className="text-base md:text-2xl font-bold text-foreground">
                    {order.courierName || 'Partner Courier'} &mdash; <span className="font-mono">{order.trackingNumber}</span>
                  </p>
                </div>
              </div>
              {order.trackingUrl && (
                <Button asChild className="rounded-full h-11 md:h-12 px-6 md:px-8 text-xs md:text-sm font-bold shadow-md shrink-0 w-full md:w-auto">
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                    Track Shipment
                  </a>
                </Button>
              )}
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Recipient details */}
            <Card className="rounded-2xl md:rounded-3xl border border-border/50 shadow-md p-6 md:p-10 bg-card">
              <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent text-primary flex items-center justify-center">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-lg md:text-xl font-headline font-bold text-foreground">Destination</h3>
              </div>
              <div className="space-y-4 text-muted-foreground text-xs md:text-base">
                <div>
                  <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-primary/60 mb-1">RECIPIENT</p>
                  <p className="font-headline font-bold text-foreground text-base md:text-2xl">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-primary/60 mb-1">SHIPPING ADDRESS</p>
                  <p className="leading-relaxed">{order.address}</p>
                  <p className="font-bold text-foreground mt-1.5">{order.city}, {order.state ? `${order.state} – ` : ''}{order.pincode}</p>
                </div>
              </div>
            </Card>

            {/* Package details */}
            <Card className="rounded-2xl md:rounded-3xl border border-border/50 shadow-md p-6 md:p-10 bg-card">
              <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent text-primary flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-lg md:text-xl font-headline font-bold text-foreground">The Package</h3>
              </div>
              <div className="space-y-6">
                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-6">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-start border-b border-dashed border-muted pb-6 last:border-none last:pb-0 gap-4">
                      <div className="flex gap-4 items-start">
                        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-muted border border-border/50 shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-xs md:text-base leading-tight text-foreground">{item.name}</p>
                          <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1.5">QTY: {item.quantity}</p>
                          {item.customPhotos && item.customPhotos.length > 0 && (
                            <div className="mt-3 space-y-1.5">
                              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-primary/60">Customization Photos ({item.customPhotos.length})</p>
                              <div className="flex flex-wrap gap-1.5">
                                {item.customPhotos.map((photo, pIdx) => (
                                  <a key={pIdx} href={photo.imageUrl} target="_blank" rel="noopener noreferrer" className="relative w-10 h-10 rounded-lg overflow-hidden border border-border group bg-secondary/10 cursor-pointer block" title="Click to view full image">
                                    <Image src={photo.imageUrl} alt={photo.fileName || "Customization preview"} fill className="object-cover group-hover:scale-105 transition-transform" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          {item.customText && (
                            <div className="mt-3 space-y-0.5 bg-accent/20 p-2 rounded-xl border border-border/40 max-w-[240px]">
                              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-primary/60">Customization Text</p>
                              <p className="text-xs md:text-sm font-semibold text-foreground break-words">&ldquo;{item.customText}&rdquo;</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="font-headline font-bold text-xs md:text-lg text-foreground shrink-0">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="pt-6 space-y-3 border-t border-primary/10">
                  <div className="flex justify-between items-center text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-foreground">{formatPrice(order.subtotal || ((order.finalAmount || order.total) - (order.shippingFee || 0) + (order.discountAmount || order.discount || 0)))}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Delivery</span>
                    <span className="text-foreground">{(order.shippingCharge ?? order.shippingFee) ? formatPrice(order.shippingCharge ?? order.shippingFee ?? 0) : 'FREE'}</span>
                  </div>
                  {((order.discountAmount !== undefined && order.discountAmount > 0) || (order.discount !== undefined && order.discount > 0)) && (
                    <div className="flex justify-between items-center text-[10px] md:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        {order.discountType === 'coupon' || order.couponCode
                          ? `Loyalty Reward (${order.couponCode || 'Coupon'})`
                          : 'Shopping Discount'}
                      </span>
                      <span>-{formatPrice(order.discountAmount || order.discount || 0)}</span>
                    </div>
                  )}
                  {order.gatewayFee !== undefined && order.gatewayFee > 0 && (
                    <div className="flex justify-between items-center text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <span>Gateway Charge</span>
                      <span className="text-foreground">{formatPrice(order.gatewayFee)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-4 border-t border-dashed">
                    <div className="flex flex-col">
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground">TOTAL PAID</span>
                      <span className="text-xl md:text-2xl font-headline font-bold text-primary">{formatPrice(order.finalAmount || order.total)}</span>
                      {((order.discountAmount || order.discount || 0) > 0) && (
                        <span className="text-[10px] font-bold text-emerald-600">
                          Total Saved: {formatPrice(order.discountAmount || order.discount || 0)}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-green-600">VERIFIED</span>
                      <p className="font-bold text-sm md:text-base flex items-center justify-end gap-1.5 text-green-600">
                         SUCCESS <CheckCircle2 className="w-5 h-5" />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Delivered Order Action Center */}
          {order.status?.toLowerCase() === 'delivered' && (
            <Card className="rounded-2xl md:rounded-3xl border border-primary/10 shadow-md p-6 md:p-8 bg-gradient-to-br from-primary/5 via-accent/5 to-card/50 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
              
              <div className="text-center mb-6">
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-none font-bold uppercase tracking-widest text-[10px] rounded-full px-4 py-1.5 mb-2">
                  Order Completed
                </Badge>
                <h2 className="text-xl md:text-2xl font-headline font-bold text-foreground">Delivered Actions & Support</h2>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">Manage your delivered item, download invoices, submit reviews, or contact studio support.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Feedback / Review */}
                <div className="bg-card border border-border/50 p-5 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-primary/70 block mb-1">Option 1: Experience Feedback</span>
                    <h4 className="text-base md:text-lg font-bold mb-1">Share Your Review</h4>
                    <p className="text-xs text-muted-foreground">Let us and other gift-buyers know how you liked your PGK Gift.</p>
                  </div>
                  {order.feedback ? (
                    <div className="bg-secondary/40 p-3 rounded-xl border border-border/40">
                      <div className="flex items-center gap-0.5 mb-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < order.feedback!.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30 fill-none'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-xs italic text-foreground">&ldquo;{order.feedback.comment}&rdquo;</p>
                      <span className="text-[9px] text-muted-foreground block mt-1.5 uppercase font-bold tracking-widest">Submitted on {new Date(order.feedback.createdAt).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <FeedbackModal orderId={order.id} onSuccess={() => window.location.reload()} />
                  )}
                </div>

                {/* 2. Download Invoice */}
                <div className="bg-card border border-border/50 p-5 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-primary/70 block mb-1">Option 2: Accounting</span>
                    <h4 className="text-base md:text-lg font-bold mb-1">Official Invoice</h4>
                    <p className="text-xs text-muted-foreground">Download, share, or print your order receipt/invoice for record keeping.</p>
                  </div>
                  <Button variant="outline" className="rounded-full h-11 border-primary/30 text-primary hover:bg-primary hover:text-white transition-all font-bold w-full text-xs" asChild>
                    <Link href={`/order/${orderId}/invoice`}>
                      <Download className="w-4 h-4 mr-2" /> Get PDF Invoice
                    </Link>
                  </Button>
                </div>

                {/* 3. Return Order */}
                <div className="bg-card border border-border/50 p-5 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-primary/70 block mb-1">Option 3: Returns & Claims</span>
                    <h4 className="text-base md:text-lg font-bold mb-1">Return Order</h4>
                    <p className="text-xs text-muted-foreground">Request a return, exchange, or refund for your delivered parcel.</p>
                  </div>
                  {!order.returnRequest ? (
                    <ReturnReportModal orderId={order.id} onSuccess={() => window.location.reload()} />
                  ) : (
                    <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-primary shrink-0 animate-pulse" />
                        <div>
                          <p className="text-xs font-bold">Request Pending</p>
                          <p className="text-[10px] text-muted-foreground font-medium">Studio team is reviewing.</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-bold border-none uppercase text-[9px] h-5 px-2">
                        {order.returnRequest.status}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* 4. Having Problem */}
                <div className="bg-card border border-border/50 p-5 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-primary/70 block mb-1">Option 4: Support Help</span>
                    <h4 className="text-base md:text-lg font-bold mb-1">Having a Problem?</h4>
                    <p className="text-xs text-muted-foreground">Talk directly to our studio artisans regarding customizations or transport issues.</p>
                  </div>
                  <Button variant="outline" className="rounded-full h-11 border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-all font-bold w-full text-xs" asChild>
                    <a 
                      href={`${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(`Hi PGK Gifts, I am having a problem with my delivered order #${order.orderId || order.id.slice(0, 6)}.`)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" /> WhatsApp Artisan Support
                    </a>
                  </Button>
                </div>
              </div>

              {/* Official Google Review Card (Independent of any discounts / reward policies) */}
              <div className="mt-4 p-5 rounded-xl border border-primary/20 bg-card/80 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-sm md:text-base text-foreground">Share Your Experience on Google</h4>
                    <p className="text-xs text-muted-foreground">We hope you loved your purchase! Share your honest experience with PGK GIFTS on Google.</p>
                  </div>
                </div>
                <Button asChild className="rounded-full h-10 px-6 font-bold text-xs shrink-0 shadow-sm">
                  <a href={CONTACT_INFO.googleMap || "https://maps.app.goo.gl/8gF9FSyhokzJeakW6"} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" /> Write a Google Review
                  </a>
                </Button>
              </div>
            </Card>
          )}

          {/* General Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Button variant="outline" className="rounded-full h-11 md:h-14 px-8 border font-bold text-xs md:text-sm group transition-all" asChild>
              <Link href={`/order/${orderId}/invoice`}>
                 <Download className="mr-2 w-4 h-4 group-hover:translate-y-0.5 transition-transform" /> Get Invoice
              </Link>
            </Button>
            <Button variant="outline" className="rounded-full h-11 md:h-14 px-8 border font-bold text-xs md:text-sm group transition-all" asChild>
              <a href={CONTACT_INFO.whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" /> WhatsApp Help
              </a>
            </Button>
            <Button className="rounded-full h-11 md:h-14 px-10 font-bold text-xs md:text-sm shadow-md" asChild>
              <Link href="/shop">Browse Store</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
