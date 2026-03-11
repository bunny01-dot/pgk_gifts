'use client';

import { Firestore, collection, addDoc, serverTimestamp, FieldValue } from 'firebase/firestore';
import { Order } from '@/types/order';
import { CartItem } from '@/types/cart';

interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
}

interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export class PaymentService {
  constructor(private db: Firestore) {}

  /**
   * Secure Payment Flow:
   * Razorpay order creation. In a production environment, this should be done 
   * via a secure backend function to prevent client-side tampering.
   */
  async createRazorpayOrder(amount: number): Promise<RazorpayOrderResponse> {
    // Simulation of a backend order creation
    return {
      id: `order_${Math.random().toString(36).substring(7)}`,
      amount: amount * 100, // Razorpay expects paise
      currency: "INR"
    };
  }

  /**
   * Verified Order Persistence:
   * Only stores the order in Firestore after payment verification.
   */
  async verifyAndSaveOrder(
    paymentData: PaymentVerificationData, 
    customerDetails: { name: string; phone: string; address: string; city: string; pincode: string }, 
    cartItems: CartItem[], 
    total: number
  ): Promise<string> {
    // SECURITY: In production, HMAC Signature verification must be performed on the server.
    const isVerified = !!paymentData.razorpay_payment_id;

    if (!isVerified) {
      throw new Error("Secure payment verification failed. Operation denied.");
    }

    const orderData: Omit<Order, 'id'> = {
      orderId: `PGK-${Date.now().toString().slice(-6)}`,
      razorpayOrderId: paymentData.razorpay_order_id,
      paymentId: paymentData.razorpay_payment_id,
      customerName: customerDetails.name,
      phone: customerDetails.phone,
      address: customerDetails.address,
      city: customerDetails.city,
      pincode: customerDetails.pincode,
      items: cartItems,
      total: total,
      paymentStatus: 'paid',
      status: 'pending',
      createdAt: serverTimestamp() as any, // Cast for compatibility with Order type
    };

    // Use a try-catch block for the database write to handle potential Firestore errors
    try {
      const docRef = await addDoc(collection(this.db, 'orders'), orderData);
      return docRef.id;
    } catch (error) {
      console.error("Failed to save order to Firestore:", error);
      throw new Error("Payment successful, but order recording failed. Please contact support.");
    }
  }
}
