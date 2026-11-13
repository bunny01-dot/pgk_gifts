export interface Offer {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  originalPrice?: number;
  offerPrice: number;
  startDate: string; // ISO timestamp (e.g. 2026-07-20T00:00)
  endDate: string;   // ISO timestamp (e.g. 2026-07-31T23:59)
  linkUrl?: string;  // Target URL e.g. /shop or /products/123
  linkText?: string; // CTA text e.g. "Grab Offer Now"
  badgeText?: string;// e.g. "FLAT 50% OFF" or "LIMITED TIME"
  active: boolean;
  createdAt?: any;
  updatedAt?: any;
}
