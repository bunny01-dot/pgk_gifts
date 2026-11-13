import { NextResponse } from 'next/server';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/firebase/admin';
import { verifyCsrf } from '@/utils/security';
import { logger } from '@/utils/logger';
import { ADMIN_EMAILS } from '@/lib/data';
import { DEFAULT_AUTOMATIC_OFFERS, generateUniqueCouponCode, LOYALTY_COUPON_DEFAULT_VALUE, LOYALTY_COUPON_MIN_PURCHASE, LOYALTY_COUPON_EXPIRY_DAYS } from '@/utils/discount';
import { AdminCouponView, PromotionalOffer } from '@/types/promotions';

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

  const adminDb = getAdminDb();
  const adminSnap = await adminDb.collection('roles_admin').doc(uid).get();
  if (adminSnap.exists) {
    return { uid, email };
  }

  throw new Error('Unauthorized: Admin access required.');
}

export async function GET(request: Request) {
  try {
    await verifyAdmin(request);
    const adminDb = getAdminDb();

    // 1. Fetch promotional offers
    const offersSnap = await adminDb.collection('promotional_offers').get();
    let offers: PromotionalOffer[] = [];
    if (!offersSnap.empty) {
      offers = offersSnap.docs.map((doc) => ({
        offerId: doc.id,
        ...(doc.data() as any),
      }));
    } else {
      // Seed default offers into collection if empty
      for (const defOffer of DEFAULT_AUTOMATIC_OFFERS) {
        await adminDb.collection('promotional_offers').doc(defOffer.offerId).set({
          ...defOffer,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      offers = [...DEFAULT_AUTOMATIC_OFFERS];
    }

    offers.sort((a, b) => (a.minimumAmount || 0) - (b.minimumAmount || 0));

    // 2. Auto-migration: Replace BUNNY15 with PGK15 and ensure rough flat amounts (₹50, ₹100)
    try {
      // Remove any legacy BUNNY15 coupons
      const bunnyRef = adminDb.collection('coupons').doc('BUNNY15');
      const bunnySnap = await bunnyRef.get();
      if (bunnySnap.exists) {
        await bunnyRef.delete();
      }

      const custBunnyRef = adminDb.collection('customer_coupons').doc('BUNNY15');
      const custBunnySnap = await custBunnyRef.get();
      if (custBunnySnap.exists) {
        await custBunnyRef.delete();
      }

      // Remove percentage-based WELCOME10 if present
      const welcomeRef = adminDb.collection('coupons').doc('WELCOME10');
      const welcomeSnap = await welcomeRef.get();
      if (welcomeSnap.exists) {
        await welcomeRef.delete();
      }

      // Ensure PGK15 exists as a rough amount flat coupon (₹50 OFF on ₹300+)
      const pgk15Ref = adminDb.collection('coupons').doc('PGK15');
      const pgk15Snap = await pgk15Ref.get();
      if (!pgk15Snap.exists) {
        await pgk15Ref.set({
          code: 'PGK15',
          type: 'flat',
          value: 50,
          minOrderAmount: 300,
          active: true,
          usageCount: 0,
          createdAt: FieldValue.serverTimestamp(),
          description: 'Special PGK Reward - ₹50 OFF',
        });
      } else {
        // If it was stored as percentage previously, update to flat ₹50
        const data = pgk15Snap.data();
        if (data?.type === 'percentage') {
          await pgk15Ref.update({
            type: 'flat',
            value: 50,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }

      // Ensure PGK50 exists as a flat rough amount (₹50 OFF on ₹300+)
      const pgk50Ref = adminDb.collection('coupons').doc('PGK50');
      const pgk50Snap = await pgk50Ref.get();
      if (!pgk50Snap.exists) {
        await pgk50Ref.set({
          code: 'PGK50',
          type: 'flat',
          value: 50,
          minOrderAmount: 300,
          active: true,
          usageCount: 0,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      // Ensure PGK100 exists as a rough amount flat coupon (₹100 OFF on ₹700+)
      const pgk100Ref = adminDb.collection('coupons').doc('PGK100');
      const pgk100Snap = await pgk100Ref.get();
      if (!pgk100Snap.exists) {
        await pgk100Ref.set({
          code: 'PGK100',
          type: 'flat',
          value: 100,
          minOrderAmount: 700,
          active: true,
          usageCount: 0,
          createdAt: FieldValue.serverTimestamp(),
          description: 'High Value Order Discount - ₹100 OFF',
        });
      }
    } catch (migErr) {
      logger.warn('Coupon migration notice:', migErr);
    }

    // 3. Fetch all coupons from both customer_coupons & coupons collections
    const unifiedCoupons: AdminCouponView[] = [];

    // 3a. Customer loyalty coupons
    const custSnap = await adminDb.collection('customer_coupons').limit(200).get();
    custSnap.docs.forEach((doc) => {
      const data = doc.data();
      const code = doc.id.toUpperCase();
      if (code === 'BUNNY15') return; // Ignore removed BUNNY15

      unifiedCoupons.push({
        id: doc.id,
        couponCode: code,
        discountType: 'flat',
        discountAmount: Number(data.discountAmount || LOYALTY_COUPON_DEFAULT_VALUE),
        minimumPurchase: Number(data.minimumPurchase || LOYALTY_COUPON_MIN_PURCHASE),
        customerPhone: data.customerPhone || null,
        status: data.status || 'active',
        issuedAt: data.issuedAt?.toDate ? data.issuedAt.toDate().toISOString() : data.issuedAt,
        expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate().toISOString() : data.expiresAt,
        redeemedAt: data.redeemedAt?.toDate ? data.redeemedAt.toDate().toISOString() : data.redeemedAt,
        redeemedOrderId: data.redeemedOrderId || null,
        notes: data.notes || (data.customerPhone ? 'Exclusive Loyalty Reward' : 'PGK Loyalty Coupon'),
        source: 'customer_coupons',
      });
    });

    // 3b. Generic store promo coupons
    const legacySnap = await adminDb.collection('coupons').limit(100).get();
    legacySnap.docs.forEach((doc) => {
      const data = doc.data();
      const code = doc.id.toUpperCase();
      if (code === 'BUNNY15' || code === 'WELCOME10') return; // Ignore removed BUNNY15 & WELCOME10

      // Don't duplicate if already in customer_coupons
      if (!unifiedCoupons.some((c) => c.couponCode === code)) {
        // Enforce rough flat amount (never percentage)
        const flatVal = data.type === 'percentage'
          ? Math.min(Number(data.value || 50), 100)
          : Number(data.value || 50);

        unifiedCoupons.push({
          id: doc.id,
          couponCode: code,
          discountType: 'flat',
          discountAmount: flatVal,
          minimumPurchase: Number(data.minOrderAmount || 0),
          customerPhone: null,
          status: data.active === false ? 'cancelled' : 'active',
          expiresAt: data.expiresAt || null,
          issuedAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          notes: data.description || `₹${flatVal} OFF Store Coupon`,
          source: 'coupons',
          usageCount: Number(data.usageCount || 0),
          usageLimit: data.usageLimit !== undefined ? Number(data.usageLimit) : null,
        });
      }
    });

    unifiedCoupons.sort((a, b) => {
      const timeA = a.issuedAt ? new Date(a.issuedAt).getTime() : 0;
      const timeB = b.issuedAt ? new Date(b.issuedAt).getTime() : 0;
      return timeB - timeA;
    });

    // 4. Fetch global settings for automatic discount toggle
    let isAutomaticDiscountEnabled = true;
    const settingsSnap = await adminDb.collection('settings').doc('global').get();
    if (settingsSnap.exists) {
      const sData = settingsSnap.data();
      if (typeof sData?.automaticDiscountsEnabled === 'boolean') {
        isAutomaticDiscountEnabled = sData.automaticDiscountsEnabled;
      }
    }

    // 5. Calculate statistics
    const totalCouponsIssued = unifiedCoupons.length;
    const totalCouponsRedeemed = unifiedCoupons.filter((c) => c.status === 'redeemed' || (c.usageCount && c.usageCount > 0)).length;
    const totalCouponsActive = unifiedCoupons.filter((c) => c.status === 'active').length;
    const activeOffersCount = offers.filter((o) => o.active !== false).length;

    let totalSavingsGranted = 0;
    try {
      const ordersSnap = await adminDb
        .collection('orders')
        .where('paymentStatus', '==', 'paid')
        .limit(500)
        .get();

      ordersSnap.docs.forEach((doc) => {
        const orderData = doc.data();
        const discountVal = Number(orderData.discountAmount ?? orderData.discount ?? 0);
        if (discountVal > 0) {
          totalSavingsGranted += discountVal;
        }
      });
    } catch (e) {
      logger.warn('Could not aggregate total savings from orders', e);
    }

    return NextResponse.json({
      offers,
      coupons: unifiedCoupons,
      isAutomaticDiscountEnabled,
      stats: {
        activeOffersCount,
        totalCouponsIssued,
        totalCouponsRedeemed,
        totalCouponsActive,
        totalSavingsGranted,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching admin promotions:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const adminUser = await verifyAdmin(request);
    const body = await request.json();
    const action = body.action;
    const adminDb = getAdminDb();

    // 1. SAVE OR UPDATE AUTOMATIC DISCOUNT OFFER
    if (action === 'save_offer') {
      const offer = body.offer as Partial<PromotionalOffer>;
      if (!offer || !offer.title || typeof offer.minimumAmount !== 'number' || typeof offer.discountAmount !== 'number') {
        return NextResponse.json({ error: 'Invalid offer parameters.' }, { status: 400 });
      }

      const offerId = offer.offerId || `offer_${Date.now()}`;
      const offerRef = adminDb.collection('promotional_offers').doc(offerId);

      const offerData = {
        offerId,
        title: offer.title.trim(),
        minimumAmount: Math.max(0, Math.round(offer.minimumAmount)),
        discountAmount: Math.max(0, Math.round(offer.discountAmount)),
        active: offer.active !== false,
        startDate: offer.startDate || new Date().toISOString(),
        expiryDate: offer.expiryDate || null,
        updatedAt: FieldValue.serverTimestamp(),
      };

      await offerRef.set(offerData, { merge: true });
      return NextResponse.json({ success: true, offer: offerData });
    }

    // 2. TOGGLE AUTOMATIC DISCOUNTS
    if (action === 'toggle_automatic') {
      const enabled = Boolean(body.enabled);
      await adminDb.collection('settings').doc('global').set(
        {
          automaticDiscountsEnabled: enabled,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return NextResponse.json({ success: true, enabled });
    }

    // 3. CREATE COUPON (Supports loyalty or generic coupon)
    if (action === 'create_coupon') {
      let code = body.couponCode ? String(body.couponCode).trim().toUpperCase() : '';
      if (!code) {
        code = generateUniqueCouponCode('PGK');
      }

      // Strict flat rough amount enforcement: percentage discounts are not permitted
      const discountType = 'flat';
      const discountAmount = Math.max(1, Math.round(Number(body.discountAmount || LOYALTY_COUPON_DEFAULT_VALUE)));
      const minimumPurchase = Math.max(0, Math.round(Number(body.minimumPurchase ?? LOYALTY_COUPON_MIN_PURCHASE)));
      const customerPhone = body.customerPhone ? String(body.customerPhone).trim() : null;
      const expiresInDays = Number(body.expiresInDays || LOYALTY_COUPON_EXPIRY_DAYS);
      const notes = body.notes ? String(body.notes).trim() : null;
      const isGeneric = Boolean(body.isGeneric); // If true, store in generic `coupons` collection

      const now = new Date();
      const expiresAt = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000);

      if (isGeneric) {
        const couponRef = adminDb.collection('coupons').doc(code);
        await couponRef.set({
          code,
          type: 'flat',
          value: discountAmount,
          minOrderAmount: minimumPurchase,
          active: true,
          expiresAt: expiresAt.toISOString(),
          usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
          usageCount: 0,
          createdAt: FieldValue.serverTimestamp(),
          createdByAdmin: adminUser.email || adminUser.uid,
          description: notes || `₹${discountAmount} OFF Store Coupon`,
        });
      } else {
        const couponRef = adminDb.collection('customer_coupons').doc(code);
        await couponRef.set({
          couponCode: code,
          discountAmount,
          minimumPurchase,
          customerPhone,
          status: 'active',
          issuedAt: FieldValue.serverTimestamp(),
          expiresAt: Timestamp.fromDate(expiresAt),
          redeemedAt: null,
          redeemedOrderId: null,
          notes,
          createdByAdmin: adminUser.email || adminUser.uid,
        });
      }

      return NextResponse.json({
        success: true,
        couponCode: code,
      });
    }

    // 4. MODIFY / UPDATE EXISTING COUPON (Change prices, value, threshold, expiry, status)
    if (action === 'update_coupon') {
      const code = body.couponCode ? String(body.couponCode).trim().toUpperCase() : '';
      if (!code) {
        return NextResponse.json({ error: 'Coupon code is required.' }, { status: 400 });
      }

      const source = body.source || 'customer_coupons';
      const discountAmount = Math.max(1, Math.round(Number(body.discountAmount)));
      const minimumPurchase = Math.max(0, Math.round(Number(body.minimumPurchase ?? 0)));
      const status = body.status || 'active';
      const discountType = 'flat'; // Enforce flat rough amount
      const customerPhone = body.customerPhone ? String(body.customerPhone).trim() : null;
      const notes = body.notes ? String(body.notes).trim() : null;
      const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

      if (source === 'customer_coupons') {
        const docRef = adminDb.collection('customer_coupons').doc(code);
        const updateData: any = {
          discountAmount,
          minimumPurchase,
          status,
          customerPhone,
          notes,
          updatedAt: FieldValue.serverTimestamp(),
        };
        if (expiresAt && !isNaN(expiresAt.getTime())) {
          updateData.expiresAt = Timestamp.fromDate(expiresAt);
        }
        await docRef.set(updateData, { merge: true });
      } else {
        // generic coupons collection
        const docRef = adminDb.collection('coupons').doc(code);
        const updateData: any = {
          value: discountAmount,
          type: discountType,
          minOrderAmount: minimumPurchase,
          active: status === 'active',
          updatedAt: FieldValue.serverTimestamp(),
        };
        if (expiresAt && !isNaN(expiresAt.getTime())) {
          updateData.expiresAt = expiresAt.toISOString();
        }
        await docRef.set(updateData, { merge: true });
      }

      return NextResponse.json({ success: true, couponCode: code });
    }

    // 5. CANCEL / DELETE COUPON
    if (action === 'cancel_coupon' || action === 'delete_coupon') {
      const couponCode = body.couponCode ? String(body.couponCode).trim().toUpperCase() : '';
      const source = body.source || 'customer_coupons';
      if (!couponCode) {
        return NextResponse.json({ error: 'Coupon code is required.' }, { status: 400 });
      }

      if (action === 'delete_coupon') {
        if (source === 'customer_coupons') {
          await adminDb.collection('customer_coupons').doc(couponCode).delete();
        } else {
          await adminDb.collection('coupons').doc(couponCode).delete();
        }
      } else {
        if (source === 'customer_coupons') {
          await adminDb.collection('customer_coupons').doc(couponCode).update({
            status: 'cancelled',
            cancelledAt: FieldValue.serverTimestamp(),
          });
        } else {
          await adminDb.collection('coupons').doc(couponCode).update({
            active: false,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }

      return NextResponse.json({ success: true, couponCode });
    }

    // 6. QUICK MODIFY PRODUCT PRICE
    if (action === 'update_product_price') {
      const productId = String(body.productId || '').trim();
      const newPrice = Number(body.price);

      if (!productId || isNaN(newPrice) || newPrice < 0) {
        return NextResponse.json({ error: 'Invalid product ID or price.' }, { status: 400 });
      }

      const prodRef = adminDb.collection('products').doc(productId);
      const snap = await prodRef.get();
      if (!snap.exists) {
        return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
      }

      await prodRef.update({
        price: Math.round(newPrice),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true, productId, newPrice: Math.round(newPrice) });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    logger.error('Error handling admin promotion action:', error);
    return NextResponse.json({ error: error.message || 'Action failed.' }, { status: 400 });
  }
}
