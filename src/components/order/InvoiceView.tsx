
'use client';

import { Order } from '@/types/order';
import { CONTACT_INFO } from '@/lib/data';
import { formatPrice } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import Image from 'next/image';

interface InvoiceViewProps {
  order: Order;
}

export function InvoiceView({ order }: InvoiceViewProps) {
  return (
    <div className="bg-white text-black p-10 max-w-4xl mx-auto border shadow-sm font-sans" id="invoice-content">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-primary pb-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16">
            <Image src={CONTACT_INFO.headerLogo} alt="PGK GIFTS" fill className="object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter uppercase">{CONTACT_INFO.businessName}</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{CONTACT_INFO.tagline}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-bold uppercase text-primary mb-2">Invoice</h2>
          <p className="font-bold text-sm">#{order.orderId || order.id.slice(0, 8)}</p>
          <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">From</h3>
          <p className="font-bold text-sm">{CONTACT_INFO.studioName}</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1 max-w-[250px]">
            {CONTACT_INFO.address}
          </p>
          <p className="text-xs mt-2">Phone: {CONTACT_INFO.phone}</p>
          <p className="text-xs">Email: {CONTACT_INFO.email}</p>
        </div>
        <div className="text-right">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Bill To</h3>
          <p className="font-bold text-sm">{order.customerName}</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1 ml-auto max-w-[250px]">
            {order.address}<br />
            {order.city}, {order.pincode}<br />
            India
          </p>
          <p className="text-xs mt-2">Mobile: {order.phone}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-12">
        <thead>
          <tr className="bg-muted/50 border-y border-border">
            <th className="text-left py-4 px-4 text-[10px] uppercase font-bold">Item Description</th>
            <th className="text-center py-4 px-4 text-[10px] uppercase font-bold">Price</th>
            <th className="text-center py-4 px-4 text-[10px] uppercase font-bold">Qty</th>
            <th className="text-right py-4 px-4 text-[10px] uppercase font-bold">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item, i) => (
            <tr key={i} className="border-b border-border/50">
              <td className="py-4 px-4">
                <p className="font-bold text-sm">{item.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase">{item.category}</p>
              </td>
              <td className="py-4 px-4 text-center text-sm">{formatPrice(item.price)}</td>
              <td className="py-4 px-4 text-center text-sm">{item.quantity}</td>
              <td className="py-4 px-4 text-right font-bold text-sm">{formatPrice(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(order.total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-green-600 font-bold">FREE</span>
          </div>
          <div className="flex justify-between border-t-2 border-primary pt-3">
            <span className="font-bold uppercase tracking-widest text-xs">Final Amount</span>
            <span className="font-bold text-xl text-primary">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer / Payment Info */}
      <div className="border-t pt-8 grid grid-cols-2 gap-8 items-end">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Payment Info</h3>
          <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            Status: <span className="text-green-600">CONFIRMED (PAID)</span>
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">Transaction ID: {order.paymentId || 'INTERNAL_RAZORPAY_TXN'}</p>
        </div>
        <div className="text-right italic text-sm text-muted-foreground">
          "Your life, beautifully crafted."
        </div>
      </div>

      <div className="mt-16 text-center">
        <p className="text-xs text-muted-foreground">This is a system-generated invoice for your PGK GIFTS order.</p>
        <p className="text-xs font-bold mt-1 uppercase tracking-widest text-primary">Thank you for choosing PGK Studio!</p>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
