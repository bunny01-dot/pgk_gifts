import { NextResponse } from 'next/server';
import { getAdminDb } from '@/firebase/admin';
import { isRateLimited } from '@/utils/security';
import { logger } from '@/utils/logger';
import { validateCouponEligibility } from '@/utils/discount';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Rate limit check
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    if (isRateLimited(ip, 30, 60000)) { // 30 requests per minute
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { code, subtotal, phone } = await request.json();
    if (!code || typeof code !== 'string' || typeof subtotal !== 'number') {
      return NextResponse.json({ error: 'Invalid validation request data.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Reject retired BUNNY15 code and guide user to PGK15
    if (cleanCode === 'BUNNY15') {
      return NextResponse.json({
        valid: false,
        error: 'Coupon BUNNY15 has been retired. Please use coupon code PGK15 for ₹50 OFF.',
      });
    }

    // Direct fallback for PGK15 (flat ₹50 rough amount on ₹300+)
    if (cleanCode === 'PGK15') {
      const minOrder = 300;
      if (subtotal < minOrder) {
        return NextResponse.json({
          valid: false,
          error: `Minimum purchase of ₹${minOrder} is required to apply PGK15.`,
        });
      }
      return NextResponse.json({
        valid: true,
        code: 'PGK15',
        type: 'flat',
        value: 50,
        discount: Math.min(50, subtotal),
        minimumPurchase: minOrder,
        message: 'Congratulations! Your ₹50 reward has been applied.',
      });
    }

    // Direct fallback for PGK100 (flat ₹100 rough amount on ₹700+)
    if (cleanCode === 'PGK100') {
      const minOrder = 700;
      if (subtotal < minOrder) {
        if (subtotal >= 300) {
          return NextResponse.json({
            valid: true,
            code: 'PGK15',
            type: 'flat',
            value: 50,
            discount: Math.min(50, subtotal),
            minimumPurchase: 300,
            message: `Order subtotal is ₹${subtotal} (below ₹700 for PGK100). Adjusted to PGK15 (₹50 OFF)!`,
          });
        }
        return NextResponse.json({
          valid: false,
          error: `Minimum purchase of ₹${minOrder} is required to apply PGK100 (or ₹300 for PGK15).`,
        });
      }
      return NextResponse.json({
        valid: true,
        code: 'PGK100',
        type: 'flat',
        value: 100,
        discount: Math.min(100, subtotal),
        minimumPurchase: minOrder,
        message: 'Congratulations! Your ₹100 reward has been applied.',
      });
    }

    const adminDb = getAdminDb();

    // 1. First check the new `customer_coupons` collection
    const customerCouponRef = adminDb.collection('customer_coupons').doc(cleanCode);
    const customerCouponSnap = await customerCouponRef.get();

    if (customerCouponSnap.exists) {
      const couponData = customerCouponSnap.data();
      if (!couponData) {
        return NextResponse.json({ valid: false, error: 'Coupon is empty.' }, { status: 400 });
      }

      // Check eligibility using our strict integer-safe discount utility
      const eligibility = validateCouponEligibility(
        {
          couponCode: cleanCode,
          discountAmount: Number(couponData.discountAmount || 50),
          minimumPurchase: Number(couponData.minimumPurchase || 300),
          customerPhone: couponData.customerPhone || null,
          status: couponData.status || 'active',
          issuedAt: couponData.issuedAt,
          expiresAt: couponData.expiresAt,
        },
        subtotal,
        phone
      );

      if (!eligibility.valid) {
        return NextResponse.json({
          valid: false,
          error: eligibility.error || 'This coupon is invalid or expired.',
        });
      }

      return NextResponse.json({
        valid: true,
        code: cleanCode,
        type: 'flat',
        value: couponData.discountAmount || 50,
        discount: eligibility.discountAmount,
        minimumPurchase: couponData.minimumPurchase || 300,
        message: `Congratulations! Your ₹${eligibility.discountAmount} reward has been applied.`,
      });
    }

    // 2. Check legacy `coupons` collection for backward compatibility
    const legacyCouponRef = adminDb.collection('coupons').doc(cleanCode);
    const legacyCouponSnap = await legacyCouponRef.get();

    if (legacyCouponSnap.exists) {
      const legacyData = legacyCouponSnap.data();
      if (!legacyData) {
        return NextResponse.json({ valid: false, error: 'Coupon is empty.' }, { status: 400 });
      }

      if (!legacyData.active) {
        return NextResponse.json({ valid: false, error: 'This coupon is no longer active.' });
      }

      if (legacyData.expiresAt) {
        const expiry = new Date(legacyData.expiresAt);
        if (expiry.getTime() < Date.now()) {
          return NextResponse.json({ valid: false, error: 'This coupon has expired.' });
        }
      }

      if (legacyData.usageLimit !== undefined && legacyData.usageLimit !== null) {
        const count = Number(legacyData.usageCount || 0);
        const limit = Number(legacyData.usageLimit);
        if (count >= limit) {
          return NextResponse.json({ valid: false, error: 'This coupon has already been redeemed.' });
        }
      }

      if (legacyData.minOrderAmount !== undefined && legacyData.minOrderAmount !== null) {
        const minAmount = Number(legacyData.minOrderAmount);
        if (subtotal < minAmount) {
          if (subtotal >= 300) {
            return NextResponse.json({
              valid: true,
              code: 'PGK15',
              type: 'flat',
              value: 50,
              discount: Math.min(50, subtotal),
              minimumPurchase: 300,
              message: `Order subtotal is ₹${subtotal} (below ₹${minAmount} for ${cleanCode}). Adjusted to PGK15 (₹50 OFF)!`,
            });
          }
          return NextResponse.json({
            valid: false,
            error: `Minimum purchase of ₹${minAmount} is required to apply ${cleanCode} (or ₹300 for PGK15).`,
          });
        }
      }

      let discount = 0;
      const value = Number(legacyData.value || 0);
      if (legacyData.type === 'percentage') {
        // Enforce rough amount cap: percentage discount cannot exceed ₹100
        discount = Math.min(Math.round((subtotal * value) / 100), 100);
      } else {
        discount = value;
      }
      discount = Math.min(discount, subtotal);

      return NextResponse.json({
        valid: true,
        code: cleanCode,
        type: legacyData.type || 'flat',
        value: legacyData.value,
        discount,
        minimumPurchase: legacyData.minOrderAmount || 0,
        message: `Congratulations! Your discount of ₹${discount} has been applied.`,
      });
    }

    return NextResponse.json({ valid: false, error: 'This coupon is invalid or expired.' }, { status: 404 });
  } catch (error: any) {
    logger.error('Error in coupon validation route', error);
    return NextResponse.json({ error: 'Failed to validate coupon.' }, { status: 500 });
  }
}
