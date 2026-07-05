'use client';

import { CartItem } from '@/types/cart';

export type CheckoutShippingDetails = {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
  keyId: string;
};

export type PaymentVerificationData = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type VerifiedPaymentResponse = {
  orderId: string;
  duplicate: boolean;
};

export class PaymentService {
  constructor(private getIdToken?: () => Promise<string | null>) {}

  private async requestHeaders(): Promise<HeadersInit> {
    const token = await this.getIdToken?.();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async createRazorpayOrder(
    cartItems: CartItem[],
    shipping: CheckoutShippingDetails,
    couponCode?: string
  ): Promise<RazorpayOrderResponse> {
    const response = await fetch('/api/razorpay', {
      method: 'POST',
      headers: await this.requestHeaders(),
      body: JSON.stringify({
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          customPhotos: item.customPhotos,
          customText: item.customText,
        })),
        shipping,
        couponCode,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create payment order.');
    }

    return data;
  }

  async verifyPayment(paymentData: PaymentVerificationData): Promise<VerifiedPaymentResponse> {
    const response = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: await this.requestHeaders(),
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Payment verification failed.');
    }

    return data;
  }
}
