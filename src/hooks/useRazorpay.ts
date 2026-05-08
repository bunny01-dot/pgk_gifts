
import { useCallback } from 'react';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

interface PaymentOptions {
  amount: number;
  name: string;
  description: string;
  email: string;
  contact: string;
}

export const useRazorpay = () => {
  const loadScript = useCallback((src: string) => {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const initiatePayment = useCallback(async ({ 
    amount, 
    name, 
    description, 
    email, 
    contact 
  }: PaymentOptions) => {
    const isLoaded = await loadScript(RAZORPAY_SCRIPT);

    if (!isLoaded) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      return;
    }

    try {
      // 1. Create order on server
      const orderRes = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const orderData = await orderRes.json();

      if (orderData.error) {
        throw new Error(orderData.error);
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "PGK GIFTS",
        description: description,
        order_id: orderData.id,
        handler: function (response: any) {
          console.log('Payment Successful:', response);
          alert(`Payment Successful! Transaction ID: ${response.razorpay_payment_id}`);
          // You can redirect to a success page or update Firebase here
        },
        prefill: {
          name: name,
          email: email,
          contact: contact,
        },
        notes: {
          address: "PGK GIFTS Studio",
        },
        theme: {
          color: "#c026d3", // Matching your brand primary color
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      
      paymentObject.on('payment.failed', function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
      });

      paymentObject.open();
    } catch (error: any) {
      console.error('Payment Error:', error);
      alert(`Payment Initialization Failed: ${error.message}`);
    }
  }, [loadScript]);

  return { initiatePayment };
};
