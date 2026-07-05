export interface Coupon {
  id: string; // Document ID (usually uppercase coupon code)
  code: string; // e.g. "WELCOME10"
  type: 'percentage' | 'flat';
  value: number; // e.g. 10 for 10% or 100 for Rs.100
  minOrderAmount?: number; // Optional: Minimum subtotal required
  active: boolean;
  expiresAt?: string; // Optional: ISO timestamp
  usageLimit?: number; // Optional: Max allowed uses
  usageCount: number; // Current uses count
}
