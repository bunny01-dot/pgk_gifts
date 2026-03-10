
'use client';

import Image from 'next/image';
import { CONTACT_INFO } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, QrCode } from 'lucide-react';

export function PaymentSection() {
  return (
    <section className="py-20 bg-accent/30 rounded-[3rem] overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12 max-w-4xl mx-auto">
          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider mb-2">
              <QrCode className="w-4 h-4" /> Secure Payment
            </div>
            <h2 className="text-4xl font-headline font-bold">Quick & Easy UPI Payment</h2>
            <p className="text-lg text-muted-foreground">
              Scan the QR code to make your payment securely. Once done, click the button below to share your transaction details with us.
            </p>
            <div className="p-4 bg-background rounded-2xl border flex items-center justify-center md:justify-start gap-3">
              <span className="font-bold text-muted-foreground">UPI ID:</span>
              <span className="font-code text-primary font-bold">{CONTACT_INFO.upiId}</span>
            </div>
            <Button asChild size="lg" className="rounded-full gap-2 w-full sm:w-auto">
              <a href={CONTACT_INFO.whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="w-5 h-5" />
                Send Payment Screenshot
              </a>
            </Button>
          </div>
          <div className="w-full max-w-[280px]">
            <Card className="p-6 border-none shadow-2xl bg-white">
              <CardContent className="p-0">
                <div className="relative aspect-square mb-4">
                  <Image
                    src={CONTACT_INFO.qrCode}
                    alt="Payment QR Code"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Powered by Google Pay</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
