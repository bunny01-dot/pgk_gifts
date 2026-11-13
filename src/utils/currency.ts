import { Product } from "@/types/product";

export const formatPrice = (amount: number): string => {
  return `Rs. ${amount.toLocaleString('en-IN')}`;
};

export const adjustPrice = (price: number): number => {
  return price; // Fee already baked into product prices
};

export function adjustProductPrice(product: Product): Product {
  return product; // Fee already baked into product prices — no adjustment needed
}
