import { Product } from "@/types/product";

export const formatPrice = (amount: number): string => {
  return `Rs. ${amount.toLocaleString('en-IN')}`;
};

export const adjustPrice = (price: number): number => {
  return Math.round(price * 1.03);
};

export function adjustProductPrice(product: Product): Product {
  return {
    ...product,
    price: Math.round(product.price * 1.03),
    sizes: product.sizes?.map(s => ({
      ...s,
      price: Math.round(s.price * 1.03)
    }))
  };
}
