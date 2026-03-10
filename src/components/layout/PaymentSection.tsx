
'use client';

import Image from 'next/image';
import { CONTACT_INFO } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, QrCode, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function PaymentSection() {
  return (
    <section className="py-24 bg-accent/10 rounded-[4rem] overflow-hidden border border-primary/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-20 max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 text-center lg:text-left space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-primary/10">
              <QrCode className="w-4 h-4" /> Fast Checkout
            </div>
            <h2 className="text-5xl md:text-6xl font-headline font-bold leading-tight">Instant UPI <br />Payments</h2>
            <p className="text-xl text-muted-foreground leading-relaxed font-medium">
              We've made transactions seamless. Scan our unique QR code to pay instantly via Google Pay, PhonePe, or any UPI app. 
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
               <div className="p-6 bg-background rounded-3xl border-2 border-muted flex flex-col gap-2">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">UPI ID</p>
                  <p className="font-headline text-xl font-bold text-primary truncate">{CONTACT_INFO.upiId}</p>
               </div>
               <div className="p-6 bg-background rounded-3xl border-2 border-muted flex flex-col gap-2">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Speed</p>
                  <p className="font-headline text-xl font-bold text-primary">Instant Verification</p>
               </div>
            </div>

            <Button asChild size="lg" className="rounded-full gap-3 px-10 h-16 text-lg font-bold w-full sm:w-auto shadow-2xl shadow-primary/20 transition-transform active:scale-95">
              <a href={CONTACT_INFO.whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="w-6 h-6" />
                Share Payment Screenshot
              </a>
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-[320px] relative"
          >
            <div className="absolute -inset-10 bg-primary/5 rounded-full blur-[80px] -z-10" />
            <Card className="p-8 border-none shadow-2xl bg-white rounded-[3rem]">
              <CardContent className="p-0">
                <div className="relative aspect-square mb-6 bg-accent/5 rounded-[2rem] p-4">
                  <Image
                    src={CONTACT_INFO.qrCode}
                    alt="Payment QR Code"
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em]">Verified Merchant</p>
                  <p className="font-headline text-2xl font-bold text-primary">PGK GIFTS</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
