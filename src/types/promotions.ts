export type CouponStatus = 'active' | 'redeemed' | 'expired' | 'cancelled';

export interface PromotionalOffer {
  id?: string;
  offerId: string;
  title: string;
  minimumAmount: number; // in Rupees (e.g. 500, 700)
  discountAmount: number; // in Rupees (e.g. 50, 100)
  active: boolean;
  startDate?: string;
  expiryDate?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface CustomerCoupon {
  id?: string;
  couponCode: string; // Document ID and code, uppercase (e.g. "PGK-LOYALTY-AB12CD")
  discountAmount: number; // in Rupees (e.g. 50)
  minimumPurchase: number; // in Rupees (e.g. 300)
  customerPhone?: string | null; // Optional target phone number
  status: CouponStatus;
  issuedAt: any; // ISO string or Firestore Timestamp
  expiresAt: any; // ISO string or Firestore Timestamp (30 days from issue)
  redeemedAt?: any | null;
  redeemedOrderId?: string | null;
  notes?: string | null;
}

export interface DiscountProgress {
  currentSubtotal: number;
  eligibleDiscount: number;
  nextTierAmount: number | null;
  amountNeeded: number;
  nextDiscountReward: number | null;
  progressPercent: number;
  message: string;
  isMaxTier: boolean;
}

export interface DiscountCalculationResult {
  subtotal: number;
  subtotalPaise: number;
  discountAmount: number;
  discountPaise: number;
  discountType: 'automatic' | 'coupon' | 'none';
  couponCode: string | null;
  appliedOfferTitle?: string;
  finalAmount: number;
  finalAmountPaise: number;
  conflictDetails?: {
    automaticDiscount: number;
    couponDiscount: number;
    recommendedChoice: 'automatic' | 'coupon';
    explanation: string;
  };
}

export interface AdminCouponView {
  id: string;
  couponCode: string;
  discountType: 'flat' | 'percentage';
  discountAmount: number;
  minimumPurchase: number;
  customerPhone?: string | null;
  status: 'active' | 'redeemed' | 'expired' | 'cancelled';
  expiresAt?: string | null;
  issuedAt?: string | null;
  redeemedAt?: string | null;
  redeemedOrderId?: string | null;
  notes?: string | null;
  source: 'customer_coupons' | 'coupons';
  usageCount?: number;
  usageLimit?: number | null;
}

export interface AvailableCoupon {
  code: string;
  discountAmount: number;
  type: 'flat' | 'percentage';
  value: number;
  minimumPurchase: number;
  expiresAt?: string | null;
  customerPhone?: string | null;
  isEligible: boolean;
  amountNeeded: number; // 0 if eligible, or minimumPurchase - subtotal
  reason?: string;
  source: 'customer_coupons' | 'coupons';
  description?: string;
}

export interface PromotionsStats {
  activeOffersCount: number;
  totalCouponsIssued: number;
  totalCouponsRedeemed: number;
  totalCouponsActive: number;
  totalSavingsGranted: number; // Total Rs saved by customers
}

export interface LoyaltyQualifier {
  phone: string;
  name: string;
  email?: string | undefined;
  completedOrderCount: number;
  lifetimeSpend: number;
  lastOrderDate?: string | undefined;
  orderIds: string[];
  isEligible: boolean; // completedOrderCount >= 3
  rewardStatus: 'eligible' | 'issued' | 'redeemed' | 'expired';
  issuedCouponCode?: string | null | undefined;
  issuedAt?: string | null | undefined;
  expiresAt?: string | null | undefined;
  redeemedAt?: string | null | undefined;
  redeemedOrderId?: string | null | undefined;
  whatsappUrl?: string | null | undefined;
}

export interface LoyaltyQualifiersResponse {
  qualifiers: LoyaltyQualifier[];
  totalQualifiersCount: number;
  eligibleCount: number;
  issuedCount: number;
  redeemedCount: number;
}

