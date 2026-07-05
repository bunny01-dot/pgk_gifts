
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { OrdersService } from '@/services/orders.service';
import { Order } from '@/types/order';
import { InvoiceView } from '@/components/order/InvoiceView';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Loader2, Download } from 'lucide-react';

export default function InvoicePage() {
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-10 text-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">Order Not Found</h1>
          <Button onClick={() => router.push('/shop')}>Return to Shop</Button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (typeof window !== 'undefined' && (document.referrer === '' || !document.referrer.includes(window.location.host))) {
      router.push(`/order/${orderId}`);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-accent/5 py-20 px-4">
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center no-print">
        <Button variant="ghost" onClick={handleBack} className="rounded-full">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Order
        </Button>
        <div className="flex gap-4">
          <Button onClick={handlePrint} className="rounded-full shadow-lg">
            <Printer className="mr-2 w-4 h-4" /> Print Invoice
          </Button>
        </div>
      </div>
      
      <InvoiceView order={order} />
    </div>
  );
}
