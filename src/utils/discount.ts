import { DiscountProgress, PromotionalOffer, CustomerCoupon, DiscountCalculationResult } from '@/types/promotions';

// Default tiers in Rupees (and corresponding paise)
export const DEFAULT_AUTOMATIC_OFFERS: PromotionalOffer[] = [
  {
    offerId: 'offer_tier_1_500',
    title: '₹50 OFF on orders ₹500+',
    minimumAmount: 500,
    discountAmount: 50,
    active: true,
  },
  {
    offerId: 'offer_tier_2_700',
    title: '₹100 OFF on orders ₹700+',
    minimumAmount: 700,
    discountAmount: 100,
    active: true,
  },
];

export const LOYALTY_COUPON_DEFAULT_VALUE = 50; // ₹50
export const LOYALTY_COUPON_MIN_PURCHASE = 300; // ₹300
export const LOYALTY_COUPON_EXPIRY_DAYS = 30; // 30 days

/**
 * Converts Rupees to integer Paise to prevent floating point inaccuracies.
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(Number(rupees || 0) * 100);
}

/**
 * Converts integer Paise to Rupees.
 */
export function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

/**
 * Calculates the promotional progress indicator and automatic discount based on product subtotal.
 * All calculations use integer paise.
 */
export function calculateAutomaticDiscount(
  subtotal: number,
  offers: PromotionalOffer[] = DEFAULT_AUTOMATIC_OFFERS,
  isAutomaticDiscountEnabled = true
): {
  discountAmount: number;
  discountPaise: number;
  appliedOffer: PromotionalOffer | null;
  progress: DiscountProgress;
} {
  const subtotalPaise = rupeesToPaise(subtotal);

  if (!isAutomaticDiscountEnabled || subtotalPaise <= 0) {
    const isTier1 = subtotal >= 300 && subtotal < 700;
    const isTier2 = subtotal >= 700;
    const needed = subtotal < 300 ? 300 - subtotal : (subtotal < 700 ? 700 - subtotal : 0);

    let msg = `Add ₹${Math.max(0, 300 - subtotal)} more to unlock coupon PGK15 (₹50 OFF)!`;
    if (isTier1) {
      msg = `Coupon PGK15 (₹50 OFF) available! Add ₹${Math.max(0, 700 - subtotal)} more for PGK100 (₹100 OFF).`;
    } else if (isTier2) {
      msg = `Coupon PGK100 (₹100 OFF) available! Select your coupon at checkout.`;
    }

    return {
      discountAmount: 0,
      discountPaise: 0,
      appliedOffer: null,
      progress: {
        currentSubtotal: subtotal,
        eligibleDiscount: 0,
        nextTierAmount: subtotal < 300 ? 300 : (subtotal < 700 ? 700 : null),
        amountNeeded: needed,
        nextDiscountReward: subtotal < 300 ? 50 : (subtotal < 700 ? 100 : null),
        progressPercent: Math.min(100, Math.max(0, Math.round((subtotal / 700) * 100))),
        message: msg,
        isMaxTier: isTier2,
      },
    };
  }

  // Active offers sorted by minimumAmount ascending
  const activeOffers = (offers && offers.length > 0 ? offers : DEFAULT_AUTOMATIC_OFFERS)
    .filter((o) => o.active !== false)
    .sort((a, b) => a.minimumAmount - b.minimumAmount);

  if (activeOffers.length === 0) {
    return {
      discountAmount: 0,
      discountPaise: 0,
      appliedOffer: null,
      progress: {
        currentSubtotal: subtotal,
        eligibleDiscount: 0,
        nextTierAmount: null,
        amountNeeded: 0,
        nextDiscountReward: null,
        progressPercent: 0,
        message: '',
        isMaxTier: true,
      },
    };
  }

  // Find the highest eligible offer
  let eligibleOffer: PromotionalOffer | null = null;
  for (const offer of activeOffers) {
    const minPaise = rupeesToPaise(offer.minimumAmount);
    if (subtotalPaise >= minPaise) {
      if (!eligibleOffer || offer.discountAmount > eligibleOffer.discountAmount) {
        eligibleOffer = offer;
      }
    }
  }

  const discountAmount = eligibleOffer ? eligibleOffer.discountAmount : 0;
  const discountPaise = rupeesToPaise(discountAmount);

  // Find the next tier to unlock
  const nextTier = activeOffers.find(
    (o) => rupeesToPaise(o.minimumAmount) > subtotalPaise
  );

  let progress: DiscountProgress;

  if (nextTier) {
    const neededPaise = rupeesToPaise(nextTier.minimumAmount) - subtotalPaise;
    const amountNeeded = Math.ceil(paiseToRupees(neededPaise));
    const previousMin = eligibleOffer ? eligibleOffer.minimumAmount : 0;
    const tierSpan = nextTier.minimumAmount - previousMin;
    const progressInTier = Math.max(0, subtotal - previousMin);
    const progressPercent = Math.min(100, Math.max(0, Math.round((progressInTier / (tierSpan || 1)) * 100)));

    progress = {
      currentSubtotal: subtotal,
      eligibleDiscount: discountAmount,
      nextTierAmount: nextTier.minimumAmount,
      amountNeeded,
      nextDiscountReward: nextTier.discountAmount,
      progressPercent,
      message: `Add ₹${amountNeeded} more to unlock ₹${nextTier.discountAmount} OFF!`,
      isMaxTier: false,
    };
  } else {
    // Unlocked highest tier
    progress = {
      currentSubtotal: subtotal,
      eligibleDiscount: discountAmount,
      nextTierAmount: null,
      amountNeeded: 0,
      nextDiscountReward: null,
      progressPercent: 100,
      message: `Congratulations! You've unlocked ₹${discountAmount} OFF.`,
      isMaxTier: true,
    };
  }

  return {
    discountAmount,
    discountPaise,
    appliedOffer: eligibleOffer,
    progress,
  };
}

/**
 * Validates a loyalty coupon or generic coupon against a cart subtotal and customer phone.
 */
export function validateCouponEligibility(
  coupon: CustomerCoupon | {
    code: string;
    active: boolean;
    expiresAt?: string;
    discountAmount?: number;
    value?: number;
    type?: string;
    minimumPurchase?: number;
    minOrderAmount?: number;
    status?: string;
    customerPhone?: string | null;
  },
  subtotal: number,
  phone?: string
): { valid: boolean; error?: string; discountAmount: number; reason?: 'phone_mismatch' | 'phone_required' | 'expired' | 'redeemed' | 'cancelled' | 'inactive' | 'min_purchase' } {
  const subtotalPaise = rupeesToPaise(subtotal);

  // Check active status
  if ('status' in coupon && coupon.status) {
    if (coupon.status === 'redeemed') {
      return { valid: false, error: 'This coupon has already been redeemed.', discountAmount: 0, reason: 'redeemed' };
    }
    if (coupon.status === 'expired') {
      return { valid: false, error: 'This coupon has expired.', discountAmount: 0, reason: 'expired' };
    }
    if (coupon.status === 'cancelled') {
      return { valid: false, error: 'This coupon has been cancelled.', discountAmount: 0, reason: 'cancelled' };
    }
    if (coupon.status !== 'active') {
      return { valid: false, error: 'This coupon is invalid or expired.', discountAmount: 0, reason: 'inactive' };
    }
  } else if ('active' in coupon && !coupon.active) {
    return { valid: false, error: 'This coupon is no longer active.', discountAmount: 0, reason: 'inactive' };
  }

  // Check expiration date
  if (coupon.expiresAt) {
    const expiryTime = typeof coupon.expiresAt === 'string'
      ? new Date(coupon.expiresAt).getTime()
      : (coupon.expiresAt?.toDate ? coupon.expiresAt.toDate().getTime() : 0);

    if (expiryTime > 0 && expiryTime < Date.now()) {
      return { valid: false, error: 'This coupon has expired.', discountAmount: 0, reason: 'expired' };
    }
  }

  // Check phone assignment if specified (strict phone lock anti-fraud)
  if (coupon.customerPhone) {
    const cleanCouponPhone = coupon.customerPhone.replace(/\D/g, '').slice(-10);
    const cleanUserPhone = (phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanUserPhone) {
      return {
        valid: false,
        error: 'Please enter your shipping phone number to apply this exclusive reward.',
        discountAmount: 0,
        reason: 'phone_required',
      };
    }
    if (cleanCouponPhone && cleanCouponPhone !== cleanUserPhone) {
      return {
        valid: false,
        error: 'This exclusive loyalty coupon is reserved for another customer phone number.',
        discountAmount: 0,
        reason: 'phone_mismatch',
      };
    }
  }

  // Check minimum purchase
  const minRequired = (coupon as any).minimumPurchase ?? (coupon as any).minOrderAmount ?? 0;
  if (minRequired > 0) {
    const minPaise = rupeesToPaise(minRequired);
    if (subtotalPaise < minPaise) {
      return {
        valid: false,
        error: `Minimum purchase of ₹${minRequired} is required to apply this coupon.`,
        discountAmount: 0,
        reason: 'min_purchase',
      };
    }
  }

  // Calculate discount value
  let discount = 0;
  if ('discountAmount' in coupon && typeof coupon.discountAmount === 'number') {
    discount = coupon.discountAmount;
  } else if ('value' in coupon && typeof coupon.value === 'number') {
    if ((coupon as any).type === 'percentage') {
      discount = Math.round((subtotal * coupon.value) / 100);
    } else {
      discount = coupon.value;
    }
  }

  // Cap at subtotal
  discount = Math.min(discount, subtotal);

  return {
    valid: true,
    discountAmount: discount,
  };
}

/**
 * Resolves conflict between automatic shopping discount and customer loyalty coupon.
 * NEVER STACKS: Only one promotional discount can be applied per order.
 */
export function resolvePromotionalDiscounts(params: {
  subtotal: number;
  automaticDiscountAmount: number;
  coupon?: { code: string; discountAmount: number } | null | undefined;
  customerPreference?: 'automatic' | 'coupon' | undefined;
}): DiscountCalculationResult {
  const { subtotal, automaticDiscountAmount, coupon, customerPreference } = params;
  const subtotalPaise = rupeesToPaise(subtotal);
  const autoPaise = rupeesToPaise(automaticDiscountAmount);
  const couponPaise = coupon ? rupeesToPaise(coupon.discountAmount) : 0;

  // Case 1: No coupon applied
  if (!coupon || couponPaise <= 0) {
    const finalPaise = Math.max(0, subtotalPaise - autoPaise);
    return {
      subtotal,
      subtotalPaise,
      discountAmount: paiseToRupees(autoPaise),
      discountPaise: autoPaise,
      discountType: autoPaise > 0 ? 'automatic' : 'none',
      couponCode: null,
      finalAmount: paiseToRupees(finalPaise),
      finalAmountPaise: finalPaise,
    };
  }

  // Case 2: Coupon applied, but no automatic discount eligible
  if (autoPaise <= 0) {
    const finalPaise = Math.max(0, subtotalPaise - couponPaise);
    return {
      subtotal,
      subtotalPaise,
      discountAmount: paiseToRupees(couponPaise),
      discountPaise: couponPaise,
      discountType: 'coupon',
      couponCode: coupon.code,
      finalAmount: paiseToRupees(finalPaise),
      finalAmountPaise: finalPaise,
    };
  }

  // Case 3: Both automatic discount and coupon are eligible -> CONFLICT (no stacking)
  let chosenType: 'automatic' | 'coupon' = 'automatic';
  let chosenPaise = autoPaise;

  if (customerPreference === 'coupon') {
    chosenType = 'coupon';
    chosenPaise = couponPaise;
  } else if (customerPreference === 'automatic') {
    chosenType = 'automatic';
    chosenPaise = autoPaise;
  } else {
    // Default to the higher savings for the customer
    if (couponPaise > autoPaise) {
      chosenType = 'coupon';
      chosenPaise = couponPaise;
    } else {
      chosenType = 'automatic';
      chosenPaise = autoPaise;
    }
  }

  const finalPaise = Math.max(0, subtotalPaise - chosenPaise);
  const autoRs = paiseToRupees(autoPaise);
  const couponRs = paiseToRupees(couponPaise);

  let explanation = '';
  if (autoRs > couponRs) {
    explanation = `Automatic cart discount (₹${autoRs} OFF) provides higher savings than coupon ${coupon.code} (₹${couponRs} OFF). Discounts cannot be stacked. Applied ₹${autoRs} OFF.`;
  } else if (couponRs > autoRs) {
    explanation = `Coupon ${coupon.code} (₹${couponRs} OFF) provides higher savings than automatic cart discount (₹${autoRs} OFF). Discounts cannot be stacked. Applied ₹${couponRs} OFF.`;
  } else {
    explanation = `Both automatic discount and loyalty coupon offer ₹${autoRs} OFF. Discounts cannot be combined; ₹${autoRs} OFF is applied.`;
  }

  return {
    subtotal,
    subtotalPaise,
    discountAmount: paiseToRupees(chosenPaise),
    discountPaise: chosenPaise,
    discountType: chosenType,
    couponCode: chosenType === 'coupon' ? coupon.code : null,
    finalAmount: paiseToRupees(finalPaise),
    finalAmountPaise: finalPaise,
    conflictDetails: {
      automaticDiscount: autoRs,
      couponDiscount: couponRs,
      recommendedChoice: autoRs >= couponRs ? 'automatic' : 'coupon',
      explanation,
    },
  };
}

/**
 * Dynamically re-validates and adjusts an applied coupon when cart/order subtotal changes.
 * If order subtotal falls below the coupon requirement:
 * - Switches to a lesser value coupon (₹50 OFF on ₹300+) if eligible.
 * - Removes the coupon if subtotal is below the minimum threshold (₹300).
 * Prevents ₹100 discount from remaining applied on an ineligible order!
 */
export function checkAndAdjustCouponForSubtotal(params: {
  couponCode: string;
  couponDiscount: number;
  minimumPurchase: number;
  subtotal: number;
}): {
  valid: boolean;
  adjusted: boolean;
  removed: boolean;
  couponCode: string;
  discountAmount: number;
  minimumPurchase: number;
  notificationMessage?: string;
} {
  const { couponCode, couponDiscount, minimumPurchase, subtotal } = params;

  // Case 1: Subtotal still qualifies for current coupon
  if (subtotal >= minimumPurchase) {
    const validDiscount = Math.min(couponDiscount, subtotal);
    return {
      valid: true,
      adjusted: false,
      removed: false,
      couponCode,
      discountAmount: validDiscount,
      minimumPurchase,
    };
  }

  // Case 2: Subtotal fell below coupon requirement, but qualifies for lesser value coupon (₹50 OFF on ₹300+)
  if (subtotal >= 300) {
    return {
      valid: true,
      adjusted: true,
      removed: false,
      couponCode: 'PGK15',
      discountAmount: Math.min(50, subtotal),
      minimumPurchase: 300,
      notificationMessage: `Order subtotal changed to ₹${subtotal}. Coupon ${couponCode} (min ₹${minimumPurchase}) was adjusted to PGK15 (₹50 OFF).`,
    };
  }

  // Case 3: Subtotal fell below ₹300 — no coupon is eligible
  return {
    valid: false,
    adjusted: false,
    removed: true,
    couponCode: '',
    discountAmount: 0,
    minimumPurchase: 0,
    notificationMessage: `Coupon ${couponCode} was removed because order subtotal (₹${subtotal}) is below the required minimum of ₹${minimumPurchase}.`,
  };
}

/**
 * Generates a unique, secure, human-readable loyalty coupon code.
 * Format: PGK-XXXX-XXXX (e.g. PGK-REW-8F2K)
 */
export function generateUniqueCouponCode(prefix = 'PGK'): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude ambiguous 0/O, 1/I
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${part1}-${part2}`.toUpperCase();
}

/**
 * Razorpay net retention rate:
 * Razorpay charges 2.0% platform fee + 18% GST on the fee = 2.36% total.
 * Merchant retains 100% - 2.36% = 97.64% (0.9764).
 */
export const RAZORPAY_RETENTION_RATE = 0.9764;

/**
 * Calculates the dynamic gateway buffer required to ensure 100% full net settlement.
 * Formula: finalTotal = Math.ceil(baseAmount / 0.9764)
 * Guarantee: finalTotal * (1 - 0.0236) >= baseAmount
 */
export function calculateRazorpayBufferedTotal(baseAmount: number): {
  finalTotal: number;
  gatewayFee: number;
} {
  if (typeof baseAmount !== 'number' || !Number.isFinite(baseAmount) || baseAmount <= 0) {
    return { finalTotal: 0, gatewayFee: 0 };
  }
  const finalTotal = Math.ceil(baseAmount / RAZORPAY_RETENTION_RATE);
  const gatewayFee = Math.max(0, finalTotal - baseAmount);
  return { finalTotal, gatewayFee };
}

