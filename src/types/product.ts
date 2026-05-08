export type Category = 
  | "Night Lamps" 
  | "Wall Decor Photo Frames" 
  | "Personalized Gifts" 
  | "Mdf Frames" 
  | "Unique Gifts" 
  | "Car Dashboard Accessories" 
  | "Hamper Boxes";

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
  tags?: string[];
  createdAt?: any;
}
