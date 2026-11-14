import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/firebase/admin';
import { verifyCsrf } from '@/utils/security';
import { logger } from '@/utils/logger';
import { ADMIN_EMAILS } from '@/lib/data';
import { generateUniqueCouponCode } from '@/utils/discount';
import { LoyaltyQualifier, LoyaltyQualifiersResponse } from '@/types/promotions';

export const runtime = 'nodejs';

async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

  if (!token) {
    throw new Error('Unauthorized: No authentication token provided.');
  }

  const decoded = await getAdminAuth().verifyIdToken(token, true);
  const uid = decoded.uid;
  const email = decoded.email;

  const isSuperAdmin = uid === '30S6HkIJXKWWSrmlLD8c8GBskst1';
  const isEmailAdmin = Boolean(email && ADMIN_EMAILS.includes(email));

  if (isSuperAdmin || isEmailAdmin) {
    return { uid, email };
  }

  const adminDoc = await getAdminDb().collection('roles_admin').doc(uid).get();
  if (adminDoc.exists) {
    return { uid, email };
  }

  throw new Error('Unauthorized: Admin access required.');
}

function cleanPhone(raw: string | null | undefined): string {
  if (!raw) return '';
  return String(raw).replace(/\D/g, '').slice(-10);
}

function buildWhatsAppRewardUrl(phone: string, name: string, code: string, discount: number, minPurchase: number, expiryDays: number): string {
  const customerName = (name || 'Valued Customer').trim();
  const text = 
`🎉 Congratulations ${customerName}!

As a special thank-you for your loyalty with PGK GIFTS (3+ completed orders), here is your exclusive VIP Loyalty Reward:

🎟️ Your Secret Code: ${code}
💰 Value: Flat ₹${discount} OFF (on orders above ₹${minPurchase})
🔒 Note: This code is exclusively linked to your phone (+91 ${phone}) and valid for ${expiryDays} days. It cannot be shared.

Shop your next handcrafted gift here:
https://pgkgifts.com/shop

Thank you for choosing PGK GIFTS! ❤️`;

  return `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`;
}

export async function GET(request: Request) {
  try {
    await verifyAdmin(request);
    const adminDb = getAdminDb();

    // 1. Fetch all completed/paid orders
    const ordersSnap = await adminDb
      .collection('orders')
      .where('paymentStatus', '==', 'paid')
      .get();

    // 2. Fetch all issued customer_coupons
    const couponsSnap = await adminDb.collection('customer_coupons').get();
    const phoneToCouponMap = new Map<string, any>();

    couponsSnap.docs.forEach((doc) => {
      const data = doc.data();
      const ph = cleanPhone(data.customerPhone);
      if (ph) {
        // Keep the latest/most active coupon for this phone
        const existing = phoneToCouponMap.get(ph);
        if (!existing || data.status === 'active' || (existing.status !== 'active' && doc.id > existing.id)) {
          phoneToCouponMap.set(ph, { id: doc.id, ...data });
        }
      }
    });

    // 3. Aggregate customer orders by clean phone number
    const customerAggregations = new Map<string, {
      phone: string;
      name: string;
      email?: string;
      orderCount: number;
      lifetimeSpend: number;
      lastOrderDate?: string;
      orderIds: string[];
    }>();

    ordersSnap.docs.forEach((doc) => {
      const data = doc.data();
      const ph = cleanPhone(data.phone || data.shipping?.phone || data.shippingPhone);
      if (!ph) return;

      const orderAmount = Number(data.finalAmount ?? data.total ?? data.serverCalculatedTotal ?? 0);
      const orderDate = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
      const custName = data.customerName || data.shipping?.name || '';
      const custEmail = data.customerEmail || data.email || '';

      const agg = customerAggregations.get(ph) || {
        phone: ph,
        name: custName,
        email: custEmail,
        orderCount: 0,
        lifetimeSpend: 0,
        lastOrderDate: orderDate,
        orderIds: [] as string[],
      };

      agg.orderCount += 1;
      agg.lifetimeSpend += orderAmount;
      agg.orderIds.push(data.orderId || doc.id);
      if (custName && !agg.name) agg.name = custName;
      if (custEmail && !agg.email) agg.email = custEmail;
      if (orderDate && (!agg.lastOrderDate || orderDate > agg.lastOrderDate)) {
        agg.lastOrderDate = orderDate;
      }

      customerAggregations.set(ph, agg);
    });

    // 4. Build qualifier list
    const qualifiers: LoyaltyQualifier[] = [];
    let eligibleCount = 0;
    let issuedCount = 0;
    let redeemedCount = 0;

    customerAggregations.forEach((agg) => {
      const isEligible = agg.orderCount >= 3;
      const existingCoupon = phoneToCouponMap.get(agg.phone);

      let rewardStatus: 'eligible' | 'issued' | 'redeemed' | 'expired' = 'eligible';
      let issuedCouponCode: string | null = null;
      let issuedAt: string | null = null;
      let expiresAt: string | null = null;
      let redeemedAt: string | null = null;
      let redeemedOrderId: string | null = null;
      let whatsappUrl: string | null = null;

      if (existingCoupon) {
        issuedCouponCode = existingCoupon.couponCode || existingCoupon.id;
        issuedAt = existingCoupon.issuedAt?.toDate ? existingCoupon.issuedAt.toDate().toISOString() : existingCoupon.issuedAt;
        expiresAt = existingCoupon.expiresAt?.toDate ? existingCoupon.expiresAt.toDate().toISOString() : existingCoupon.expiresAt;
        redeemedAt = existingCoupon.redeemedAt?.toDate ? existingCoupon.redeemedAt.toDate().toISOString() : existingCoupon.redeemedAt;
        redeemedOrderId = existingCoupon.redeemedOrderId || null;

        if (existingCoupon.status === 'redeemed') {
          rewardStatus = 'redeemed';
          redeemedCount += 1;
        } else if (existingCoupon.status === 'expired') {
          rewardStatus = 'expired';
        } else {
          rewardStatus = 'issued';
          issuedCount += 1;
          whatsappUrl = buildWhatsAppRewardUrl(
            agg.phone,
            agg.name,
            issuedCouponCode!,
            Number(existingCoupon.discountAmount || 50),
            Number(existingCoupon.minimumPurchase || 300),
            30
          );
        }
      } else if (isEligible) {
        rewardStatus = 'eligible';
        eligibleCount += 1;
      }

      qualifiers.push({
        phone: agg.phone,
        name: agg.name || 'PGK Customer',
        email: agg.email,
        completedOrderCount: agg.orderCount,
        lifetimeSpend: agg.lifetimeSpend,
        lastOrderDate: agg.lastOrderDate,
        orderIds: agg.orderIds,
        isEligible,
        rewardStatus,
        issuedCouponCode,
        issuedAt,
        expiresAt,
        redeemedAt,
        redeemedOrderId,
        whatsappUrl,
      });
    });

    // Sort: 3+ order qualifiers first (descending by orderCount, then spend)
    qualifiers.sort((a, b) => {
      if (a.completedOrderCount !== b.completedOrderCount) {
        return b.completedOrderCount - a.completedOrderCount;
      }
      return b.lifetimeSpend - a.lifetimeSpend;
    });

    const response: LoyaltyQualifiersResponse = {
      qualifiers,
      totalQualifiersCount: qualifiers.filter((q) => q.isEligible).length,
      eligibleCount,
      issuedCount,
      redeemedCount,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    logger.error('Error fetching loyalty qualifiers', { error: error.message });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch loyalty qualifiers.' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const adminUser = await verifyAdmin(request);
    const adminDb = getAdminDb();
    const body = await request.json();

    const rawPhone = body.customerPhone;
    const phone = cleanPhone(rawPhone);
    const customerName = (body.customerName || '').trim();
    const discountAmount = Number(body.discountAmount || 50);
    const minimumPurchase = Number(body.minimumPurchase || 300);
    const expiryDays = Number(body.expiryDays || 30);
    const customCode = body.customCode ? String(body.customCode).trim().toUpperCase() : '';

    if (!phone || phone.length < 10) {
      return NextResponse.json({ error: 'Valid 10-digit customer phone number is required.' }, { status: 400 });
    }

    // Generate unique non-ambiguous code locked to this phone
    const couponCode = customCode || generateUniqueCouponCode('PGK');

    // Calculate expiration timestamp
    const now = Date.now();
    const expiresAt = new Date(now + expiryDays * 24 * 60 * 60 * 1000).toISOString();

    const couponDoc = {
      couponCode,
      discountAmount,
      minimumPurchase,
      customerPhone: phone,
      customerName: customerName || 'PGK VIP Customer',
      source: 'loyalty_3_orders',
      status: 'active',
      singleUse: true,
      issuedAt: FieldValue.serverTimestamp(),
      expiresAt,
      redeemedAt: null,
      redeemedOrderId: null,
      notes: `VIP Loyalty Reward for 3+ orders (${customerName || phone})`,
      createdBy: adminUser.uid,
    };

    // Save to Firestore
    await adminDb.collection('customer_coupons').doc(couponCode).set(couponDoc);

    const whatsappUrl = buildWhatsAppRewardUrl(phone, customerName, couponCode, discountAmount, minimumPurchase, expiryDays);

    logger.info('Loyalty reward coupon issued successfully', {
      couponCode,
      phone,
      customerName,
      discountAmount,
      adminUid: adminUser.uid,
    });

    return NextResponse.json({
      success: true,
      coupon: {
        ...couponDoc,
        issuedAt: new Date(now).toISOString(),
      },
      whatsappUrl,
      message: `VIP Reward coupon ${couponCode} created and locked to phone +91 ${phone}.`,
    });
  } catch (error: any) {
    logger.error('Error generating loyalty coupon', { error: error.message });
    return NextResponse.json(
      { error: error.message || 'Failed to generate loyalty coupon.' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
