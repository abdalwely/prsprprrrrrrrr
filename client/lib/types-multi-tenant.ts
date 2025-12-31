/**
 * 🔒 MULTI-TENANT TYPES
 * - No password fields (stored in Firebase Auth only)
 * - All entities include storeId for per-store isolation
 * - Guest support with guest_{visitorId} pattern
 */

// ============ CUSTOMER TYPES (No Password) ============

export interface ShippingAddress {
  street: string;
  city: string;
  district: string;
  governorate: string;
  zipCode: string;
  country: string;
  notes?: string;
  isDefault?: boolean;
}

/**
 * ✅ Customer base type - used across the platform
 * Password is NEVER stored here (only in Firebase Auth)
 */
export interface Customer {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  shippingAddress?: ShippingAddress;
  billingAddress?: ShippingAddress;
  lastOrderAt?: Date;
  lastVisit: Date;
  firstVisit: Date;
  isActive: boolean;
  isVerified?: boolean;
  storeId: string; // ✅ Each customer record is per-store
  preferences?: {
    language?: string;
    currency?: string;
    marketingEmails?: boolean;
    orderNotifications?: boolean;
  };
}

/**
 * ✅ Store-specific customer record
 * Located at: /stores/{storeId}/customers/{uid}
 */
export interface StoreCustomer extends Customer {
  id: string;
  totalOrders?: number;
  totalSpent?: number;
  averageOrderValue?: number;
  notes?: string;
  tags?: string[];
  customerType?: "regular" | "vip" | "wholesale";
  loyaltyPoints?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ✅ Auth user from Firebase (never exposes password)
 */
export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  isAnonymous: boolean;
}

// ============ PRODUCT TYPES ============

export enum ProductStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export interface ProductVariant {
  id?: string;
  name: string;
  options: string[];
  price?: number;
  comparePrice?: number;
  sku?: string;
  quantity?: number;
  image?: string;
}

/**
 * ✅ Product with storeId isolation
 * Located at: /stores/{storeId}/products/{productId}
 */
export interface Product {
  id: string;
  storeId: string; // ✅ Per-store isolation
  ownerId: string;

  name: string;
  description: string;
  shortDescription?: string;
  category?: string;
  subCategory?: string;

  brand?: string;
  sku: string;

  price: number;
  comparePrice?: number;
  costPrice?: number;

  discount?: {
    type: "percentage" | "fixed" | "none";
    value: number;
    startDate?: Date;
    endDate?: Date;
    isActive: boolean;
  };

  inventory?: {
    quantity: number;
    trackInventory: boolean;
    lowStockThreshold?: number;
    backorders?: boolean;
  };

  images: string[];
  specifications?: Record<string, string>;
  tags: string[];

  featured: boolean;
  status: ProductStatus;
  visibility?: "visible" | "hidden" | "catalog" | "search";

  shipping?: {
    weight?: number;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
    requiresShipping?: boolean;
  };

  digitalDelivery?: {
    enabled: boolean;
    files?: string[];
    autoSend?: boolean;
    accessDuration?: number;
  };

  seo: {
    title: string;
    description: string;
    keywords: string[];
  };

  reviewsEnabled?: boolean;
  averageRating?: number;
  reviewCount?: number;

  variants?: ProductVariant[];

  stats?: {
    views: number;
    sales: number;
    wishlistCount: number;
  };

  expiryInfo?: {
    hasExpiryDate: boolean;
    expiryDate?: Date;
    shelfLife?: string;
    storageInstructions?: string;
    allergens?: string[];
  };

  createdAt: Date;
  updatedAt: Date;
}

// ============ CART TYPES ============

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  addedAt: Date;
  priceSnapshot?: number;
}

/**
 * ✅ Cart with per-store isolation
 * Located at: /stores/{storeId}/carts/{customerId}
 * customerId = uid OR guest_{visitorId}
 */
export interface Cart {
  id: string;
  customerId: string; // ✅ uid OR guest_{visitorId}
  storeId: string; // ✅ Per-store isolation
  items: CartItem[];
  couponCode?: string;
  discount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============ ORDER TYPES ============

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

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

/**
 * ✅ Snapshot of customer at order time (immutable)
 * Prevents issues if customer data is deleted
 */
export interface CustomerSnapshot {
  uid?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  shippingAddress: ShippingAddress;
}

/**
 * ✅ Order with per-store isolation and customer snapshot
 * Located at: /stores/{storeId}/orders/{orderId}
 * Maintains historical customer/product data
 */
export interface Order {
  id: string;
  storeId: string; // ✅ Per-store isolation
  customerId: string; // ✅ uid OR guest_{visitorId}
  
  // ✅ Immutable snapshot of customer data at order time
  customerSnapshot: CustomerSnapshot;
  
  // ✅ Snapshot of product data at order time
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
  paymentStatus: PaymentStatus;
  paymentDetails?: {
    transactionId?: string;
    paymentGateway?: string;
    paidAt?: Date;
  };

  orderStatus: OrderStatus;
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
}

// ============ STORE TYPES ============

export interface Store {
  id: string;
  ownerId: string; // ✅ Merchant's UID
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  subdomain: string;
  customDomain?: string;

  contact: {
    phone: string;
    email: string;
    address: string;
    city?: string;
    governorate?: string;
    country?: string;
    zipCode?: string;
  };

  settings: {
    currency: string;
    language: string;
    timezone?: string;

    shipping: {
      enabled: boolean;
      freeShippingThreshold: number;
      shippingCost: number;
      zones?: Array<{
        id: string;
        name: string;
        governorates: string[];
        cost: number;
      }>;
    };

    payment: {
      cashOnDelivery: boolean;
      bankTransfer: boolean;
      creditCard: boolean;
      bankInfo?: {
        bankName: string;
        accountNumber: string;
        accountName: string;
        iban?: string;
      };
    };

    taxes?: {
      enabled: boolean;
      rate: number;
    };
  };

  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    whatsapp?: string;
  };

  status: "pending" | "active" | "suspended" | "under_review";
  createdAt: Date;
  updatedAt: Date;
}

// ============ CATEGORY TYPES ============

export interface Category {
  id: string;
  storeId: string; // ✅ Per-store isolation
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============ VISITOR TYPES (Analytics Only) ============

export interface Visitor {
  visitorId: string;
  storeId: string;
  firstVisit: Date;
  lastActivity: Date;
  isGuest: boolean;
  linkedToUid?: string;
  linkedAt?: Date;
  userAgent?: string;
  pageViews?: number;
}

// ============ API RESPONSE TYPES ============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============ INPUT/UPDATE TYPES ============

export interface ProductInput
  extends Omit<Product, "id" | "createdAt" | "updatedAt"> {}

export interface ProductUpdate
  extends Partial<
    Omit<Product, "id" | "storeId" | "ownerId" | "createdAt" | "updatedAt">
  > {}

export interface OrderInput
  extends Omit<Order, "id" | "createdAt" | "updatedAt"> {}

export interface CustomerUpdate
  extends Partial<Omit<Customer, "uid" | "storeId" | "firstVisit">> {}
