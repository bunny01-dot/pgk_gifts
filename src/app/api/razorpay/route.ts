
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import shortid from 'shortid';

export async function POST(request: Request) {
  try {
    const { amount, currency = 'INR' } = await request.json();

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    // DEBUG (Check your terminal)
    console.log('--- Razorpay Auth Check ---');
    console.log('Key ID exists:', !!key_id, key_id?.substring(0, 8));
    console.log('Key Secret exists:', !!key_secret, key_secret?.substring(0, 4));

    if (!key_id || !key_secret || key_id === 'your_key_id_here') {
      return NextResponse.json({ error: 'Razorpay keys are invalid or missing in .env' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });

    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: `receipt_${shortid.generate()}`,
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error: any) {
    console.error('Razorpay Order Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create order' }, 
      { status: 500 }
    );
  }
}
