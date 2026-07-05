import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/firebase/admin';
import { isRateLimited, verifyCsrf, verifyAppCheck } from '@/utils/security';
import { logger } from '@/utils/logger';

export const runtime = 'nodejs';

type VerifyPayload = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function timingSafeEqualHex(a: string, b: string) {
  const first = Buffer.from(a, 'hex');
  const second = Buffer.from(b, 'hex');
  return first.length === second.length && crypto.timingSafeEqual(first, second);
}

function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error('Razorpay secret is not configured.');
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return timingSafeEqualHex(generatedSignature, signature);
}

async function getCreatedBy(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

  if (!token) {
    return { uid: 'guest', email: undefined };
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token, true);
    return { uid: decoded.uid, email: decoded.email };
  } catch (error) {
    logger.warn('Token verification failed or session revoked', { error });
    throw new Error('Invalid authentication token.');
  }
}

function nextOrderId() {
  return `PGK-${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    // 1. CSRF Protection
    if (!verifyCsrf(request)) {
      return NextResponse.json({ error: 'CSRF verification failed.' }, { status: 403 });
    }

    // 2. API Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    if (isRateLimited(ip, 10, 60000)) { // 10 requests per minute
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    // 3. Firebase App Check Protection
    const isAppCheckValid = await verifyAppCheck(request);
    if (!isAppCheckValid) {
      return NextResponse.json({ error: 'Unauthorized application environment.' }, { status: 401 });
    }

    const body = (await request.json()) as VerifyPayload;
    const razorpayOrderId = cleanString(body.razorpay_order_id, 100);
    const paymentId = cleanString(body.razorpay_payment_id, 100);
    const signature = cleanString(body.razorpay_signature, 200);

    if (!razorpayOrderId || !paymentId || !signature) {
      return NextResponse.json({ error: 'Payment verification data is incomplete.' }, { status: 400 });
    }

    const isAuthentic = verifyRazorpaySignature(razorpayOrderId, paymentId, signature);
    if (!isAuthentic) {
      logger.warn('Razorpay signature verification failed', { razorpayOrderId, paymentId });
      return NextResponse.json({ error: 'Payment signature verification failed.' }, { status: 400 });
    }

    const requestUser = await getCreatedBy(request);
    const adminDb = getAdminDb();
    const result = await adminDb.runTransaction(async (transaction) => {
      const razorpayOrderRef = adminDb.collection('razorpayOrders').doc(razorpayOrderId);
      const processedPaymentRef = adminDb.collection('processedPayments').doc(paymentId);

      // --- READS START ---
      const existingPaymentSnap = await transaction.get(processedPaymentRef);

      if (existingPaymentSnap.exists) {
        const existing = existingPaymentSnap.data();
        return {
          orderId: existing?.orderDocId as string,
          duplicate: true,
        };
      }

      const razorpayOrderSnap = await transaction.get(razorpayOrderRef);
      if (!razorpayOrderSnap.exists) {
        throw new Error('Razorpay order was not created by this server.');
      }

      const razorpayOrder = razorpayOrderSnap.data();
      if (!razorpayOrder) {
        throw new Error('Stored payment order is empty.');
      }
      if (razorpayOrder.status === 'paid' && razorpayOrder.orderDocId) {
        transaction.set(processedPaymentRef, {
          razorpayPaymentId: paymentId,
          razorpayOrderId,
          orderDocId: razorpayOrder.orderDocId,
          createdAt: FieldValue.serverTimestamp(),
        });
        return {
          orderId: razorpayOrder.orderDocId as string,
          duplicate: true,
        };
      }

      const trustedCreatedBy = (razorpayOrder?.createdBy as string) || requestUser.uid;
      if (trustedCreatedBy !== 'guest' && requestUser.uid !== trustedCreatedBy) {
        throw new Error('Payment order does not belong to the authenticated user.');
      }

      const items = razorpayOrder?.items || [];
      const serverCalculatedTotal = Number(razorpayOrder?.serverCalculatedTotal);

      if (!Array.isArray(items) || !Number.isFinite(serverCalculatedTotal) || serverCalculatedTotal <= 0) {
        throw new Error('Stored payment order is invalid.');
      }

      // Fetch all product documents in the transaction (READ)
      const productSnaps: { ref: any; snap: any; quantity: number }[] = [];
      for (const item of items) {
        if (!item.productId) continue;
        const productRef = adminDb.collection('products').doc(item.productId);
        const productSnap = await transaction.get(productRef);
        productSnaps.push({
          ref: productRef,
          snap: productSnap,
          quantity: Number(item.quantity || 1),
        });
      }

      // Fetch coupon document in the transaction (READ)
      let couponRef = null;
      let couponSnap = null;
      if (razorpayOrder?.couponCode) {
        couponRef = adminDb.collection('coupons').doc(razorpayOrder.couponCode);
        couponSnap = await transaction.get(couponRef);
      }
      // --- READS END ---

      // --- WRITES START ---
      const orderRef = adminDb.collection('orders').doc();
      const verifiedAt = FieldValue.serverTimestamp();

      transaction.set(orderRef, sanitizeObject({
        orderId: nextOrderId(),
        razorpayOrderId,
        paymentId,
        customerName: razorpayOrder.shipping?.name || '',
        phone: razorpayOrder.shipping?.phone || '',
        customerEmail: razorpayOrder.customerEmail || requestUser.email,
        address: razorpayOrder.shipping?.address || '',
        city: razorpayOrder.shipping?.city || '',
        state: razorpayOrder.shipping?.state || '',
        pincode: razorpayOrder.shipping?.pincode || '',
        items: items,
        total: serverCalculatedTotal,
        serverCalculatedTotal,
        subtotal: razorpayOrder.subtotal,
        shippingFee: razorpayOrder.shippingFee,
        discount: Number(razorpayOrder.discount || 0),
        couponCode: razorpayOrder.couponCode || null,
        appliedCoupon: razorpayOrder.appliedCoupon || null,
        paymentStatus: 'paid',
        status: 'pending',
        paymentIdempotencyKey: paymentId,
        createdBy: trustedCreatedBy,
        verifiedAt,
        createdAt: verifiedAt,
      }));

      // Decrement stock levels for purchased items
      for (const prod of productSnaps) {
        if (prod.snap.exists) {
          const productData = prod.snap.data();
          const currentStock = productData?.stockCount !== undefined ? Number(productData.stockCount) : undefined;
          if (currentStock !== undefined && !isNaN(currentStock)) {
            const newStock = Math.max(0, currentStock - prod.quantity);
            transaction.update(prod.ref, { stockCount: newStock });
          }
        }
      }

      // Increment coupon usage count
      if (couponRef && couponSnap && couponSnap.exists) {
        const couponData = couponSnap.data();
        const currentCount = Number(couponData?.usageCount || 0);
        transaction.update(couponRef, { usageCount: currentCount + 1 });
      }

      transaction.set(processedPaymentRef, sanitizeObject({
        razorpayPaymentId: paymentId,
        razorpayOrderId,
        orderDocId: orderRef.id,
        createdBy: trustedCreatedBy,
        createdAt: FieldValue.serverTimestamp(),
      }));

      transaction.update(razorpayOrderRef, sanitizeObject({
        status: 'paid',
        paymentId,
        orderDocId: orderRef.id,
        verifiedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }));

      return {
        orderId: orderRef.id,
        duplicate: false,
      };
      // --- WRITES END ---
    });

    logger.info('Razorpay payment verified successfully', { orderId: result.orderId, isDuplicate: result.duplicate });

    if (!result.duplicate) {
      try {
        const createdOrderSnap = await adminDb.collection('orders').doc(result.orderId).get();
        const createdOrder = createdOrderSnap.data();
        if (createdOrder) {
          const { WhatsappService } = await import('@/services/whatsapp.service');
          const whatsapp = new WhatsappService();
          
          whatsapp.sendAdminOrderNotification({
            id: result.orderId,
            orderId: createdOrder.orderId,
            customerName: createdOrder.customerName,
            phone: createdOrder.phone,
            total: createdOrder.total,
            city: createdOrder.city,
            state: createdOrder.state,
          }).catch(err => logger.error('WhatsApp admin notification failed', err));

          whatsapp.sendCustomerOrderConfirmation({
            id: result.orderId,
            orderId: createdOrder.orderId,
            customerName: createdOrder.customerName,
            phone: createdOrder.phone,
            total: createdOrder.total,
          }).catch(err => logger.error('WhatsApp customer confirmation failed', err));
        }
      } catch (err) {
        logger.error('Failed to trigger WhatsApp notifications after order verification', err);
      }
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Payment verification failed.';
    const status = message.includes('does not belong') ? 403 : 400;
    logger.error('Error in razorpay payment verification endpoint', error, { status });
    return NextResponse.json({ error: message }, { status });
  }
}

function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof FieldValue) return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  const sanitized: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      sanitized[key] = sanitizeObject(val);
    }
  }
  return sanitized;
}
