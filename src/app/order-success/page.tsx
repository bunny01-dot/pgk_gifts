'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONTACT_INFO } from '@/lib/data';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl text-center space-y-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle className="w-16 h-16" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-5xl font-headline font-bold">Thank You!</h1>
          <p className="text-2xl text-muted-foreground font-headline">Your order has been placed successfully.</p>
        </div>

        <div className="bg-card p-8 rounded-[2.5rem] shadow-xl border-none">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Order ID</span>
            <span className="text-xl font-code font-bold text-primary">{orderId || "MOCK_ORDER_ID"}</span>
          </div>
          <p className="mt-6 text-muted-foreground">
            A confirmation has been sent to your phone. We'll start crafting your beautiful gift right away.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-full px-8 h-14 shadow-xl shadow-primary/20">
            <Link href={`/track`}>Track Order <ArrowRight className="ml-2 w-5 h-5" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-14 border-2">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-14 border-2">
            <a href={CONTACT_INFO.whatsapp} target="_blank" rel="noopener noreferrer">
              Support on WhatsApp <MessageSquare className="ml-2 w-5 h-5" />
            </a>
          </Button>
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
