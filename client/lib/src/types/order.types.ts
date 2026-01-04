import { StoreCustomer } from "./customer.types";
import { ShippingAddress } from "./shared.types";
import { Store } from "./store.types";

/**
 * عنصر الطلب
 */
export interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  weight?: number;
  digitalFileUrl?: string;
}

/**
 * واجهة الطلب الرئيسية
 */
export interface Order {
  storeContact: any;
  storeName: any;
  id: string;
  storeId: string;
  customerId: string;
  customerSnapshot: {
    uid?: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    shippingAddress: ShippingAddress;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount?: number;
  discountCode?: string;
  total: number;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: "cod" | "bank_transfer" | "online" | "wallet";
  paymentStatus:
    | "pending"
    | "paid"
    | "failed"
    | "refunded"
    | "partially_refunded";
  paymentDetails?: {
    transactionId?: string;
    paymentGateway?: string;
    paidAt?: Date;
  };
  orderStatus:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  fulfillmentStatus?: "unfulfilled" | "partially_fulfilled" | "fulfilled";
  notes?: string;
  customerNotes?: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  firestoreId?: string;
}

/**
 * واجهة طلب المتجر (موسعة)
 */
export interface StoreOrder extends Order {
  customer?: StoreCustomer;
  store?: Store;
}
