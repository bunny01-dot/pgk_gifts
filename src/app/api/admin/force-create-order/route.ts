import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/firebase/admin';
import { verifyCsrf } from '@/utils/security';
import { logger } from '@/utils/logger';
import { ADMIN_EMAILS } from '@/lib/data';
import crypto from 'crypto';

export const runtime = 'nodejs';

async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

  if (!token) {
    throw new Error('Unauthorized: No token provided.');
  }

  const decoded = await getAdminAuth().verifyIdToken(token, true);
  const uid = decoded.uid;
  const email = decoded.email;

  const isSuperAdmin = uid === '30S6HkIJXKWWSrmlLD8c8GBskst1';
  const isEmailAdmin = email && ADMIN_EMAILS.includes(email);
  
  if (isSuperAdmin || isEmailAdmin) {
    return { uid, email };
  }

  const adminDb = getAdminDb();
  const adminSnap = await adminDb.collection('roles_admin').doc(uid).get();
  if (adminSnap.exists) {
    return { uid, email };
  }

  throw new Error('Unauthorized: Access denied.');
}

function nextOrderId() {
  return `PGK-${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    // CSRF Protection
    if (!verifyCsrf(request)) {
      return NextResponse.json({ error: 'CSRF verification failed.' }, { status: 403 });
    }

    const { uid: adminUid } = await verifyAdmin(request);
    const body = await request.json();
    const razorpayOrderId = body.razorpayOrderId ? String(body.razorpayOrderId).trim() : '';
    const paymentId = body.paymentId ? String(body.paymentId).trim() : `MANUAL-${Date.now()}`;

    if (!razorpayOrderId) {
      return NextResponse.json({ error: 'Razorpay Order ID is required.' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const razorpayOrderRef = adminDb.collection('razorpayOrders').doc(razorpayOrderId);
    const processedPaymentRef = adminDb.collection('processedPayments').doc(paymentId);

    const result = await adminDb.runTransaction(async (transaction) => {
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
        throw new Error('Razorpay order draft not found.');
      }

      const razorpayOrder = razorpayOrderSnap.data();
      if (!razorpayOrder) {
        throw new Error('Razorpay order draft is empty.');
      }

      if (razorpayOrder.status === 'paid' && razorpayOrder.orderDocId) {
        return {
          orderId: razorpayOrder.orderDocId as string,
          duplicate: true,
        };
      }

      const items = razorpayOrder.items || [];
      const serverCalculatedTotal = Number(razorpayOrder.serverCalculatedTotal);

      if (!Array.isArray(items) || !Number.isFinite(serverCalculatedTotal) || serverCalculatedTotal <= 0) {
        throw new Error('Stored payment order data is invalid.');
      }

      // Fetch product snaps (READ)
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

      // Fetch coupon snap (READ)
      let couponRef = null;
      let couponSnap = null;
      if (razorpayOrder.couponCode) {
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
        customerEmail: razorpayOrder.customerEmail || '',
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
        createdBy: razorpayOrder.createdBy || 'guest',
        verifiedAt,
        createdAt: verifiedAt,
        manuallyApprovedBy: adminUid,
      }));

      // Decrement stock levels
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

      // Increment coupon usage
      if (couponRef && couponSnap && couponSnap.exists) {
        const couponData = couponSnap.data();
        const currentCount = Number(couponData?.usageCount || 0);
        transaction.update(couponRef, { usageCount: currentCount + 1 });
      }

      transaction.set(processedPaymentRef, sanitizeObject({
        razorpayPaymentId: paymentId,
        razorpayOrderId,
        orderDocId: orderRef.id,
        createdBy: razorpayOrder.createdBy || 'guest',
        createdAt: FieldValue.serverTimestamp(),
        manuallyApprovedBy: adminUid,
      }));

      transaction.update(razorpayOrderRef, sanitizeObject({
        status: 'paid',
        paymentId,
        orderDocId: orderRef.id,
        verifiedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        manuallyApprovedBy: adminUid,
      }));

      return {
        orderId: orderRef.id,
        duplicate: false,
      };
      // --- WRITES END ---
    });

    logger.info('Order manually force-created by admin successfully', { orderId: result.orderId, razorpayOrderId, adminUid });

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
        logger.error('Failed to trigger WhatsApp notifications after manual approval', err);
      }
    }

    return NextResponse.json({ success: true, orderId: result.orderId });
  } catch (error: any) {
    logger.error('Error force-creating order', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 400 });
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
