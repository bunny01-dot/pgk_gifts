export type Category = "Light Lamps" | "Cute Toys" | "Customized Gifts";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string; // Maintain primary image for compatibility
  images?: string[]; // Array of additional images
  videoUrl?: string; // Optional embedded video link
  description: string;
  active: boolean;
  featured?: boolean;
  stockCount?: number;
  createdAt?: any;
}
