import { NextResponse } from 'next/server';
import { getAdminDb } from '@/firebase/admin';
import { isRateLimited } from '@/utils/security';
import { logger } from '@/utils/logger';
import { AvailableCoupon } from '@/types/promotions';
import { rupeesToPaise, paiseToRupees } from '@/utils/discount';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    if (isRateLimited(ip, 60, 60000)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const subtotal = Number(body.subtotal || 0);
    const subtotalPaise = rupeesToPaise(subtotal);
    const rawPhone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const cleanUserPhone = rawPhone.replace(/\D/g, '').slice(-10);

    const adminDb = getAdminDb();
    const now = Date.now();
    const availableList: AvailableCoupon[] = [];
    const seenCodes = new Set<string>();

    // 1. Fetch active loyalty coupons from `customer_coupons`
    try {
      const custSnap = await adminDb
        .collection('customer_coupons')
        .where('status', '==', 'active')
        .limit(100)
        .get();

      custSnap.docs.forEach((doc) => {
        const data = doc.data();
        const code = doc.id.toUpperCase();
        if (seenCodes.has(code)) return;

        // Expiry check
        if (data.expiresAt) {
          const expiryTime = typeof data.expiresAt === 'string'
            ? new Date(data.expiresAt).getTime()
            : (data.expiresAt.toDate ? data.expiresAt.toDate().getTime() : 0);
          if (expiryTime > 0 && expiryTime < now) {
            return;
          }
        }

        // Phone check: if customerPhone is set, only show if user's phone matches
        if (data.customerPhone) {
          const cleanCouponPhone = String(data.customerPhone).replace(/\D/g, '').slice(-10);
          if (!cleanUserPhone || cleanCouponPhone !== cleanUserPhone) {
            return; // Not for this customer
          }
        }

        const minPurchase = Number(data.minimumPurchase || 300);
        const minPaise = rupeesToPaise(minPurchase);
        const discountAmount = Number(data.discountAmount || 50);
        const isEligible = subtotalPaise >= minPaise;
        const amountNeeded = isEligible ? 0 : Math.ceil(paiseToRupees(minPaise - subtotalPaise));

        seenCodes.add(code);
        availableList.push({
          code,
          discountAmount: Math.min(discountAmount, subtotal > 0 ? subtotal : discountAmount),
          type: 'flat',
          value: discountAmount,
          minimumPurchase: minPurchase,
          expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate().toISOString() : data.expiresAt,
          customerPhone: data.customerPhone || null,
          isEligible,
          amountNeeded,
          source: 'customer_coupons',
          reason: isEligible
            ? `Save ₹${discountAmount} with this loyalty reward`
            : `Add ₹${amountNeeded} more to unlock this reward`,
          description: data.notes || (data.customerPhone ? 'Exclusive reward for your phone number' : 'PGK Loyalty Reward'),
        });
      });
    } catch (err) {
      logger.warn('Error fetching customer_coupons in available route:', err);
    }

    // 2. Fetch active generic coupons from `coupons`
    try {
      const legacySnap = await adminDb
        .collection('coupons')
        .where('active', '==', true)
        .limit(50)
        .get();

      legacySnap.docs.forEach((doc) => {
        const data = doc.data();
        const code = doc.id.toUpperCase();
        if (code === 'BUNNY15' || code === 'WELCOME10') return; // Ignore removed BUNNY15 & WELCOME10
        if (seenCodes.has(code)) return;

        // Expiry check
        if (data.expiresAt) {
          const expiryTime = new Date(data.expiresAt).getTime();
          if (expiryTime > 0 && expiryTime < now) {
            return;
          }
        }

        // Usage limit check
        if (data.usageLimit !== undefined && data.usageLimit !== null) {
          const count = Number(data.usageCount || 0);
          const limit = Number(data.usageLimit);
          if (count >= limit) {
            return;
          }
        }

        const minPurchase = Number(data.minOrderAmount || 0);
        const minPaise = rupeesToPaise(minPurchase);
        const val = Number(data.value || 0);
        const isEligible = subtotalPaise >= minPaise;
        const amountNeeded = isEligible ? 0 : Math.ceil(paiseToRupees(minPaise - subtotalPaise));

        let disc = 0;
        if (data.type === 'percentage') {
          // Cap any legacy percentage discount so it never exceeds rough amount ₹100
          disc = subtotal > 0 ? Math.min(Math.round((subtotal * val) / 100), 100) : Math.min(val, 100);
        } else {
          disc = val;
        }
        disc = Math.min(disc, subtotal > 0 ? subtotal : disc);

        seenCodes.add(code);
        availableList.push({
          code,
          discountAmount: disc,
          type: 'flat',
          value: disc,
          minimumPurchase: minPurchase,
          expiresAt: data.expiresAt || null,
          customerPhone: null,
          isEligible,
          amountNeeded,
          source: 'coupons',
          reason: isEligible
            ? `Save ₹${disc} on this order`
            : `Add ₹${amountNeeded} more to unlock ₹${disc} OFF`,
          description: data.description || `Special ₹${disc} OFF reward`,
        });
      });
    } catch (err) {
      logger.warn('Error fetching generic coupons in available route:', err);
    }

    // Ensure PGK15 is always in available coupons (₹50 OFF on ₹300+)
    if (!seenCodes.has('PGK15')) {
      const minPurchase = 300;
      const minPaise = rupeesToPaise(minPurchase);
      const isEligible = subtotalPaise >= minPaise;
      const amountNeeded = isEligible ? 0 : Math.ceil(paiseToRupees(minPaise - subtotalPaise));
      seenCodes.add('PGK15');
      availableList.push({
        code: 'PGK15',
        discountAmount: Math.min(50, subtotal > 0 ? subtotal : 50),
        type: 'flat',
        value: 50,
        minimumPurchase: minPurchase,
        isEligible,
        amountNeeded,
        source: 'coupons',
        reason: isEligible ? 'Save ₹50 on this order' : `Add ₹${amountNeeded} more to unlock ₹50 OFF`,
        description: 'Special PGK Reward — ₹50 OFF',
      });
    }

    // Ensure PGK100 is always in available coupons (₹100 OFF on ₹700+)
    if (!seenCodes.has('PGK100')) {
      const minPurchase = 700;
      const minPaise = rupeesToPaise(minPurchase);
      const isEligible = subtotalPaise >= minPaise;
      const amountNeeded = isEligible ? 0 : Math.ceil(paiseToRupees(minPaise - subtotalPaise));
      seenCodes.add('PGK100');
      availableList.push({
        code: 'PGK100',
        discountAmount: Math.min(100, subtotal > 0 ? subtotal : 100),
        type: 'flat',
        value: 100,
        minimumPurchase: minPurchase,
        isEligible,
        amountNeeded,
        source: 'coupons',
        reason: isEligible ? 'Save ₹100 on this order' : `Add ₹${amountNeeded} more to unlock ₹100 OFF`,
        description: 'High Value Order Reward — ₹100 OFF',
      });
    }

    // 3. Sort: Eligible first (highest discount desc), then ineligible (least amount needed asc)
    availableList.sort((a, b) => {
      if (a.isEligible && !b.isEligible) return -1;
      if (!a.isEligible && b.isEligible) return 1;
      if (a.isEligible && b.isEligible) {
        return b.discountAmount - a.discountAmount;
      }
      return a.amountNeeded - b.amountNeeded;
    });

    return NextResponse.json({
      coupons: availableList,
      totalCount: availableList.length,
      eligibleCount: availableList.filter((c) => c.isEligible).length,
    });
  } catch (error: any) {
    logger.error('Error in /api/coupon/available:', error);
    return NextResponse.json({ error: 'Failed to fetch available coupons.' }, { status: 500 });
  }
}

