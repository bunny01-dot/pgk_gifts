import { Firestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Order } from '@/types/order';

export class PaymentService {
  constructor(private db: Firestore) {}

  /**
   * Secure Payment Flow:
   * In a real production app, these methods would call Firebase Functions.
   * We simulate the server-side logic here.
   */

  async createRazorpayOrder(amount: number) {
    // REAL: const response = await httpsCallable(functions, 'createOrder')({ amount });
    // SIMULATED:
    return {
      id: `order_${Math.random().toString(36).substring(7)}`,
      amount: amount * 100, // Razorpay expects paise
      currency: "INR"
    };
  }

  async verifyAndSaveOrder(paymentData: any, customerDetails: any, cartItems: any[], total: number) {
    // REAL: const response = await httpsCallable(functions, 'verifyAndSaveOrder')({ paymentData, ... });
    
    // SIMULATED verification logic
    const isVerified = true; // In production, verify HMAC signature here

    if (!isVerified) throw new Error("Payment verification failed");

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
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(this.db, 'orders'), orderData);
    
    // Trigger notification (Simulated)
    console.log(`New order created: ${orderData.orderId}. Notification sent to admin.`);
    
    return docRef.id;
  }
}
