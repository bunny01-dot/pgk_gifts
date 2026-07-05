import { NextResponse } from 'next/server';
import { getAdminDb } from '@/firebase/admin';
import { isRateLimited } from '@/utils/security';
import { logger } from '@/utils/logger';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Rate limit check
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    if (isRateLimited(ip, 20, 60000)) { // 20 requests per minute
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { code, subtotal } = await request.json();
    if (!code || typeof code !== 'string' || typeof subtotal !== 'number') {
      return NextResponse.json({ error: 'Invalid validation request data.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const adminDb = getAdminDb();
    const couponRef = adminDb.collection('coupons').doc(cleanCode);
    const couponSnap = await couponRef.get();

    if (!couponSnap.exists) {
      return NextResponse.json({ valid: false, error: 'Coupon code not found.' }, { status: 404 });
    }

    const couponData = couponSnap.data();
    if (!couponData) {
      return NextResponse.json({ valid: false, error: 'Coupon is empty.' }, { status: 400 });
    }

    if (!couponData.active) {
      return NextResponse.json({ valid: false, error: 'This coupon is no longer active.' });
    }

    if (couponData.expiresAt) {
      const expiry = new Date(couponData.expiresAt);
      if (expiry.getTime() < Date.now()) {
        return NextResponse.json({ valid: false, error: 'This coupon has expired.' });
      }
    }

    if (couponData.usageLimit !== undefined && couponData.usageLimit !== null) {
      const count = Number(couponData.usageCount || 0);
      const limit = Number(couponData.usageLimit);
      if (count >= limit) {
        return NextResponse.json({ valid: false, error: 'This coupon has reached its maximum usage limit.' });
      }
    }

    if (couponData.minOrderAmount !== undefined && couponData.minOrderAmount !== null) {
      const minAmount = Number(couponData.minOrderAmount);
      if (subtotal < minAmount) {
        return NextResponse.json({ 
          valid: false, 
          error: `Minimum purchase of Rs. ${minAmount} is required to apply this coupon.` 
        });
      }
    }

    // Calculate discount
    let discount = 0;
    const value = Number(couponData.value || 0);
    if (couponData.type === 'percentage') {
      discount = Math.round((subtotal * value) / 100);
    } else {
      discount = value;
    }

    // Cap discount at subtotal to prevent negative totals
    discount = Math.min(discount, subtotal);

    return NextResponse.json({
      valid: true,
      code: cleanCode,
      type: couponData.type,
      value: couponData.value,
      discount
    });

  } catch (error: any) {
    logger.error('Error in coupon validation route', error);
    return NextResponse.json({ error: 'Failed to validate coupon.' }, { status: 500 });
  }
}
