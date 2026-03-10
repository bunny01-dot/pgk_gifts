export type Category = "Light Lamps" | "Cute Toys" | "Customized Gifts";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string;
  description: string;
  active: boolean;
  featured?: boolean;
  createdAt?: any;
}
