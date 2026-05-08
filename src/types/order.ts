import { CartItem } from "./cart";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface ReturnRequest {
  reason: "damaged" | "wrong_item" | "missing_parts" | "other";
  description: string;
  images: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: any;
}

export interface Order {
  id: string;
  orderId: string; // Internal readable ID
  razorpayOrderId: string;
  paymentId: string;
  customerName: string;
  phone: string;
  customerEmail?: string;
  address: string;
  city: string;
  pincode: string;
  items: CartItem[];
  total: number;
  paymentStatus: "paid" | "failed" | "pending";
  status: OrderStatus;
  createdAt: any;
  returnRequest?: ReturnRequest;
}
