export interface PromoVideo {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  productLink: string;   // Navigation target URL e.g. /products/xyz or /shop?category=...
  productName?: string;  // Promoted item title
  active: boolean;
  createdAt?: any;
  updatedAt?: any;
}
