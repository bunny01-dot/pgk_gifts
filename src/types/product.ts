import { DatabaseDate } from "./common";

export type Category = 
  | "Night Lamps" 
  | "Cute Toys"
  | "Customized Gifts"
  | "Wall Decor and Photo Frames" 
  | "Personalized Gifts" 
  | "MDF Wall Frames" 
  | "Unique Gifts" 
  | "Car Dashboard Accessories" 
  | "Hamper Boxes"
  | "Keychains"
  | (string & {});

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string; // Maintain primary image for compatibility
  images?: string[] | undefined; // Array of additional images
  videoUrl?: string | undefined; // Optional embedded video link
  description: string;
  dimensions?: string | undefined;
  active: boolean;
  featured?: boolean | undefined;
  stockCount?: number | undefined;
  tags?: string[] | undefined;
  createdAt?: DatabaseDate | undefined;
  sizes?: { name: string; price: number }[] | undefined;
  requiredPhotoSlots?: number | null | undefined;
  needsMainImage?: boolean | undefined;
  deliveryCharge?: 'complimentary' | 'regular' | number | undefined;
  weight?: number | null | undefined;
}
