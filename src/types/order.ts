import { CartItem } from "./cart";
import { DatabaseDate } from "./common";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface ReturnRequest {
  reason: "damaged" | "wrong_item" | "missing_parts" | "other";
  description: string;
  images: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: DatabaseDate;
}

export interface OrderFeedback {
  rating: number;
  comment: string;
  createdAt: string;
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
  state: string;
  pincode: string;
  items: CartItem[];
  total: number;
  subtotal?: number;
  shippingFee?: number;
  shippingCharge?: number; // Normalized field
  discountAmount?: number; // Normalized discount in Rupees
  discountType?: 'automatic' | 'coupon' | 'none'; // Type of discount applied
  finalAmount?: number; // Normalized payable amount
  paymentStatus: "paid" | "failed" | "pending";
  status: OrderStatus;
  orderStatus?: OrderStatus; // Normalized status
  createdAt: DatabaseDate;
  returnRequest?: ReturnRequest;
  feedback?: OrderFeedback;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  discount?: number;
  gatewayFee?: number;
  couponCode?: string | null;
  appliedCoupon?: {
    code: string;
    type: 'percentage' | 'flat';
    value: number;
    discount: number;
  } | null;
  manuallyApprovedBy?: string;
  verifiedAt?: any;
}

