// ============ أنواع Firebase الأساسية ============
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
  toMillis(): number;
}

// ============ أنواع المتجر ============
export interface Store {
  id: string;
  name: string;
  subdomain: string;
  ownerId: string;
  logo?: string;
  banner?: string;
  description?: string;
  contact: {
    phone: string;
    email: string;
    address: string;
    website?: string;
  };
  settings: {
    currency: string;
    language: string;
    timezone: string;
    taxEnabled: boolean;
    taxRate?: number;
    shippingEnabled: boolean;
    shippingCost?: number;
    freeShippingThreshold?: number;
    paymentMethods: string[];
  };
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  status: "active" | "inactive" | "suspended" | "pending";
  createdAt: Date;
  updatedAt: Date;
}

// ============ تحديث واجهة ShippingAddress ============
export interface ShippingAddress {
  street: string;
  city: string;
  district: string; // ✅ أضف هذا السطر
  state: string;
  governorate: string;
  zipCode: string;
  country: string;
  notes?: string;
  isDefault?: boolean;
}

// ============ تحديث واجهة StoreCustomer ============

export interface StoreCustomer extends Customer {
  id: string;
  totalOrders?: number;
  totalSpent?: number;
  averageOrderValue?: number;
  notes?: string;
  tags?: string[];
  customerType?: "regular" | "vip" | "wholesale";
  loyaltyPoints?: number;
  isVerified?: boolean; // ✅ جعله اختيارياً
}

// ============ تحديث واجهة Customer ============
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
  isVerified?: boolean; // ✅ جعله اختيارياً
  storeId: string;
  preferences?: {
    language?: string;
    currency?: string;
    marketingEmails?: boolean;
    orderNotifications?: boolean;
  };
}

export interface ExtendedCustomer extends StoreCustomer {
  orders?: Order[];
  favoriteProducts?: string[];
  cartItems?: number;
}

// ============ أنواع المنتجات ============
export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  barcode?: string;
  quantity: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  image?: string;
}

export type ProductStatus = "draft" | "published" | "archived";
export type ProductSemantics = {
  primaryAction?: string;
  secondaryAction?: string;
  entityType?: string;
  [key: string]: any;
};

export interface Product {
  // ✅ نفس التعريف بالضبط كما في firestore.ts
  id: string;
  storeId: string;
  ownerId: string;

  name: string;
  description: string;
  shortDescription?: string;

  category?: string;
  subCategory?: string;

  _semantics?: ProductSemantics;

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
    originalPrice: number;
    salePrice: number;
  };

  inventory?: {
    quantity: number;
    sku: string;
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
    shippingClass?: string;
  };

  digitalDelivery?: {
    enabled: boolean;
    files?: string[];
    autoSend?: boolean;
    accessDuration?: number;
  };

  metadata?: {
    agricultureSpecific?: {
      agricultureType?: string;
      isOrganic?: boolean;
      certification?: string;
      usageInstructions?: string;
      shelfLifeMonths?: number;
      addedAt?: string;
      source?: string;
      [key: string]: any;
    };
  };

  serviceDetails?: {
    estimatedDuration: string;
    requiresCustomerInfo: boolean;
    communicationMethod: string;
  };

  tax?: {
    taxable?: boolean;
    taxClass?: string;
  };

  seo: {
    title: string;
    description: string;
    keywords: string[];
  };

  soldIndividually?: boolean;

  warranty?: string;
  returnPolicy?: string;
  sizeGuide?: string;

  reviewsEnabled?: boolean;
  averageRating?: number;
  reviewCount?: number;

  variants?: Array<{
    id?: string;
    name: string;
    options: string[];
    price?: number;
    comparePrice?: number;
    sku?: string;
    quantity?: number;
  }>;

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

// ============ أنواع الطلبات ============
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

export interface Order {
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

export interface StoreOrder extends Order {
  customer?: StoreCustomer;
  store?: Store;
}

// ============ أنواع السلة ============
export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  addedAt: Date;
  priceSnapshot?: number;
}

export interface Cart {
  id: string;
  customerId: string;
  storeId: string;
  items: CartItem[];
  couponCode?: string;
  discount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============ أنواع المفضلة ============
export interface Favorite {
  id: string;
  customerId: string;
  storeId: string;
  productId: string;
  addedAt: Date;
}

// ============ أنواع الفئات ============
export interface Category {
  id: string;
  storeId: string;
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

// ============ أنواع القسائم ============
export interface Coupon {
  id: string;
  storeId: string;
  code: string;
  discountType: "percentage" | "fixed_amount" | "free_shipping";
  discountValue: number;
  minimumPurchase?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableProducts?: string[];
  excludedProducts?: string[];
  applicableCategories?: string[];
  excludedCategories?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============ أنواع المراجعات ============
export interface Review {
  id: string;
  storeId: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  reportedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============ أنواع الإشعارات ============
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "order" | "system" | "promotion" | "security";
  data?: any;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

// ============ أنواع الإحصائيات ============
export interface StoreStats {
  storeId: string;
  date: Date;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts?: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  topCustomers?: Array<{
    customerId: string;
    name: string;
    orders: number;
    revenue: number;
  }>;
}

export interface CustomerStats {
  customerId: string;
  storeId: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  firstOrderDate?: Date;
  lastOrderDate?: Date;
  favoriteCategories?: string[];
  lastVisit: Date;
}

// ============ أنواع الدفع ============
export interface PaymentMethod {
  id: string;
  storeId: string;
  type: "cod" | "bank_transfer" | "online";
  name: string;
  description?: string;
  isActive: boolean;
  settings?: any;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============ أنواع الشحن ============
export interface ShippingMethod {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  cost: number;
  freeThreshold?: number;
  estimatedDays: string;
  isActive: boolean;
  regions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============ أنواع الصفحات ============
export interface Page {
  id: string;
  storeId: string;
  title: string;
  slug: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  isHomepage?: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============ أنواع المدونة ============
export interface BlogPost {
  id: string;
  storeId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  author: string;
  tags: string[];
  categories: string[];
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  likes: number;
  commentsCount: number;
}

// ============ أنواع التعليقات ============
export interface Comment {
  id: string;
  storeId: string;
  postId?: string;
  productId?: string;
  customerId: string;
  customerName: string;
  content: string;
  parentId?: string;
  isApproved: boolean;
  likes: number;
  replies: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============ أنواع الإعدادات ============
export interface AppSettings {
  id: string;
  storeId: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  allowGuestCheckout: boolean;
  requireEmailVerification: boolean;
  cookieConsent: boolean;
  analyticsCode?: string;
  facebookPixel?: string;
  googleTagManager?: string;
  customCSS?: string;
  customJS?: string;
  updatedAt: Date;
}

// ============ أنواع الأنشطة ============
export interface ActivityLog {
  id: string;
  storeId: string;
  userId: string;
  userType: "admin" | "customer" | "system";
  action: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// ============ أنواع الرد على API ============
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

// ============ أنواع المصادقة ============
export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  isAnonymous: boolean;
  providerData: Array<{
    providerId: string;
    uid: string;
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    photoURL?: string;
  }>;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptTerms: boolean;
}

// ============ أنواع البحث ============
export interface SearchParams {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "relevance" | "price_asc" | "price_desc" | "newest" | "popular";
  page?: number;
  limit?: number;
  inStock?: boolean;
  onSale?: boolean;
}

// ============ أنواع التصفية ============
export interface FilterOptions {
  categories?: string[];
  priceRange?: [number, number];
  tags?: string[];
  availability?: "in_stock" | "out_of_stock" | "pre_order";
  sortBy?: string;
  rating?: number;
}

// ============ أنواع التصدير/الاستيراد ============
export interface ExportOptions {
  type: "products" | "orders" | "customers" | "categories";
  format: "csv" | "json" | "excel";
  filters?: any;
  fields?: string[];
}

// ============ أنواع التقارير ============
export interface Report {
  id: string;
  storeId: string;
  type: "sales" | "customers" | "products" | "inventory";
  period: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  startDate: Date;
  endDate: Date;
  data: any;
  generatedAt: Date;
  generatedBy: string;
}

// ============ أنواع البريد الإلكتروني ============
export interface EmailTemplate {
  id: string;
  storeId: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailCampaign {
  id: string;
  storeId: string;
  name: string;
  templateId: string;
  recipientType: "all" | "segment" | "specific";
  recipients?: string[];
  segment?: any;
  scheduledAt?: Date;
  sentAt?: Date;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============ أنواع متفرقة ============
export interface KeyValuePair {
  key: string;
  value: any;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  badge?: number | string;
}

// ============ أنواع التوافق مع النظام القديم ============
export interface LegacyCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  stores?: Array<{
    storeId: string;
    storeName: string;
    joinedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LegacyOrder {
  id: string;
  storeId: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  items: any[];
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
