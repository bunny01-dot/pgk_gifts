'use client';

import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { PromotionalOffer, CustomerCoupon, PromotionsStats, AvailableCoupon, AdminCouponView, LoyaltyQualifiersResponse } from '@/types/promotions';
import { DEFAULT_AUTOMATIC_OFFERS } from '@/utils/discount';

export class PromotionsService {
  constructor(
    private db?: Firestore | null,
    private getIdToken?: () => Promise<string | null>
  ) {}

  private async requestHeaders(): Promise<HeadersInit> {
    const token = await this.getIdToken?.();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Fetch available, eligible and near-eligible coupons for the customer to select from.
   */
  async getAvailableCoupons(subtotal: number, phone?: string): Promise<{
    coupons: AvailableCoupon[];
    totalCount: number;
    eligibleCount: number;
  }> {
    const res = await fetch('/api/coupon/available', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subtotal, phone }),
    });
    if (!res.ok) {
      return { coupons: [], totalCount: 0, eligibleCount: 0 };
    }
    return res.json();
  }

  /**
   * Listen to active promotional offers from Firestore in real-time.
   */
  subscribeToActiveOffers(callback: (offers: PromotionalOffer[]) => void) {
    if (!this.db) {
      callback(DEFAULT_AUTOMATIC_OFFERS);
      return () => {};
    }

    const offersRef = collection(this.db, 'promotional_offers');
    return onSnapshot(
      offersRef,
      (snapshot) => {
        if (snapshot.empty) {
          callback(DEFAULT_AUTOMATIC_OFFERS);
          return;
        }
        const offers = snapshot.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) } as PromotionalOffer))
          .filter((o) => o.active !== false)
          .sort((a, b) => a.minimumAmount - b.minimumAmount);

        callback(offers.length > 0 ? offers : DEFAULT_AUTOMATIC_OFFERS);
      },
      (err) => {
        console.warn('Could not read promotional_offers, fallback to defaults:', err);
        callback(DEFAULT_AUTOMATIC_OFFERS);
      }
    );
  }

  /**
   * Fetch active offers once.
   */
  async getActiveOffers(): Promise<PromotionalOffer[]> {
    if (!this.db) return DEFAULT_AUTOMATIC_OFFERS;
    try {
      const offersRef = collection(this.db, 'promotional_offers');
      const snap = await getDocs(offersRef);
      if (snap.empty) return DEFAULT_AUTOMATIC_OFFERS;
      const offers = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as PromotionalOffer))
        .filter((o) => o.active !== false)
        .sort((a, b) => a.minimumAmount - b.minimumAmount);
      return offers.length > 0 ? offers : DEFAULT_AUTOMATIC_OFFERS;
    } catch (e) {
      console.warn('Error fetching promotional offers:', e);
      return DEFAULT_AUTOMATIC_OFFERS;
    }
  }

  /**
   * Validate a coupon code server-side before checkout.
   */
  async validateCoupon(code: string, subtotal: number, phone?: string): Promise<{
    valid: boolean;
    error?: string;
    code?: string;
    discount?: number;
    discountAmount?: number;
    type?: string;
    minimumPurchase?: number;
    message?: string;
  }> {
    const res = await fetch('/api/coupon/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal, phone }),
    });
    return res.json();
  }

  // --- ADMIN METHODS (Protected by Admin Token) ---

  /**
   * Get all promotional offers, coupons, and stats for the admin dashboard.
   */
  async getAdminPromotions(): Promise<{
    offers: PromotionalOffer[];
    coupons: AdminCouponView[];
    stats: PromotionsStats;
    isAutomaticDiscountEnabled: boolean;
  }> {
    const res = await fetch('/api/admin/promotions', {
      headers: await this.requestHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch admin promotions data.');
    }
    return res.json();
  }

  /**
   * Save or update an automatic discount tier.
   */
  async savePromotionalOffer(offer: Partial<PromotionalOffer>): Promise<{ success: boolean; offer: PromotionalOffer }> {
    const res = await fetch('/api/admin/promotions', {
      method: 'POST',
      headers: await this.requestHeaders(),
      body: JSON.stringify({
        action: 'save_offer',
        offer,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save promotional offer.');
    }
    return res.json();
  }

  /**
   * Enable or disable global automatic cart discounts.
   */
  async toggleAutomaticDiscounts(enabled: boolean): Promise<{ success: boolean }> {
    const res = await fetch('/api/admin/promotions', {
      method: 'POST',
      headers: await this.requestHeaders(),
      body: JSON.stringify({
        action: 'toggle_automatic',
        enabled,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update automatic discount status.');
    }
    return res.json();
  }

  /**
   * Create and issue an individual customer loyalty coupon or generic store coupon.
   */
  async createLoyaltyCoupon(params: {
    couponCode: string;
    discountAmount: number;
    minimumPurchase: number;
    discountType?: 'flat' | 'percentage';
    customerPhone?: string | null | undefined;
    expiresInDays?: number | undefined;
    notes?: string | undefined;
    isGeneric?: boolean;
    usageLimit?: number | null;
  }): Promise<{ success: boolean; couponCode: string }> {
    const res = await fetch('/api/admin/promotions', {
      method: 'POST',
      headers: await this.requestHeaders(),
      body: JSON.stringify({
        action: 'create_coupon',
        ...params,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create coupon.');
    }
    return res.json();
  }

  /**
   * Update an existing coupon (amount, minimum purchase, status, phone, expiry, etc.).
   */
  async updateCoupon(params: {
    couponCode: string;
    source?: 'customer_coupons' | 'coupons';
    discountAmount: number;
    minimumPurchase: number;
    discountType?: 'flat' | 'percentage';
    status?: 'active' | 'cancelled' | 'redeemed' | 'expired';
    customerPhone?: string | null;
    notes?: string | null;
    expiresAt?: string | null;
  }): Promise<{ success: boolean; couponCode: string }> {
    const res = await fetch('/api/admin/promotions', {
      method: 'POST',
      headers: await this.requestHeaders(),
      body: JSON.stringify({
        action: 'update_coupon',
        ...params,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update coupon.');
    }
    return res.json();
  }

  /**
   * Cancel an active coupon.
   */
  async cancelCoupon(couponCode: string, source: 'customer_coupons' | 'coupons' = 'customer_coupons'): Promise<{ success: boolean }> {
    const res = await fetch('/api/admin/promotions', {
      method: 'POST',
      headers: await this.requestHeaders(),
      body: JSON.stringify({
        action: 'cancel_coupon',
        couponCode,
        source,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to cancel coupon.');
    }
    return res.json();
  }

  /**
   * Permanently delete a coupon.
   */
  async deleteCoupon(couponCode: string, source: 'customer_coupons' | 'coupons' = 'customer_coupons'): Promise<{ success: boolean }> {
    const res = await fetch('/api/admin/promotions', {
      method: 'POST',
      headers: await this.requestHeaders(),
      body: JSON.stringify({
        action: 'delete_coupon',
        couponCode,
        source,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete coupon.');
    }
    return res.json();
  }

  /**
   * Modify product price directly from admin management.
   */
  async updateProductPrice(productId: string, price: number): Promise<{ success: boolean; productId: string; newPrice: number }> {
    const res = await fetch('/api/admin/promotions', {
      method: 'POST',
      headers: await this.requestHeaders(),
      body: JSON.stringify({
        action: 'update_product_price',
        productId,
        price,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update product price.');
    }
    return res.json();
  }

  /**
   * Fetch customer loyalty qualifiers (customers grouped by phone with 3+ completed orders)
   */
  async getLoyaltyQualifiers(): Promise<LoyaltyQualifiersResponse> {
    const res = await fetch('/api/admin/loyalty-qualifiers', {
      method: 'GET',
      headers: await this.requestHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch loyalty qualifiers.');
    }
    return res.json();
  }

  /**
   * Generate and issue a phone-locked loyalty reward coupon
   */
  async generateLoyaltyReward(params: {
    customerPhone: string;
    customerName?: string | undefined;
    discountAmount?: number | undefined;
    minimumPurchase?: number | undefined;
    expiryDays?: number | undefined;
    customCode?: string | undefined;
  }): Promise<{ success: boolean; coupon: any; whatsappUrl: string; message: string }> {
    const res = await fetch('/api/admin/loyalty-qualifiers', {
      method: 'POST',
      headers: await this.requestHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to issue loyalty reward.');
    }
    return res.json();
  }
}
