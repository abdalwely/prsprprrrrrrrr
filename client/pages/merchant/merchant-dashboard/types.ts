import {
  Store,
  Product,
  Category,
  Customer,
  ShippingZone,
  ShippingMethod,
} from "@/lib/src";
import { Dispatch, SetStateAction } from "react";
import { NavigateFunction } from "react-router-dom";

export interface ExtendedCustomer extends Customer {
  totalOrders?: number;
  totalSpent?: number;
  storeId: string;
}

export type ExtendedStore = Store;

export interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  activeCustomers: number;
  monthlyRevenue: number;
  conversionRate: number;
  averageOrderValue: number;
  returnRate: number;
  topSellingProducts: Product[];
  salesByMonth: { month: string; sales: number }[];
  visitorsCount: number;
  bounceRate: number;
  newCustomersThisMonth: number;
  averageProcessingTime: number;
  customerSatisfaction: number;
  checklist?: ChecklistItems;
  complianceLevel?: "basic" | "intermediate" | "advanced";
  legalStatus?: "unverified" | "pending" | "verified";
}

export interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  type: "store" | "shipping" | "payment" | "design" | "customer" | "order";
}

export interface SubActiveTabs {
  products: string;
  orders: string;
  customers: string;
  design: string;
  settings: string;
  analytics: string;
}

export interface StoreSettings {
  name: string;
  description: string;
  logo: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  governorate: string;
  country: string;
  originalCity: string;
  zipCode: string;
  currency: string;
  language: string;
  timezone: string;
  taxNumber: string;
  commercialRegistration: string;
  industry?: string;

  // 🔥 إضافة الأنواع المفقوبة من DesignTab.tsx
  customDomain?: string;
  domainStatus?: "active" | "pending" | "not_set";
  autoRedirect?: boolean;
  enableSSL?: boolean;
  wwwRedirect?: string;

  pages?: {
    [key: string]: {
      enabled: boolean;
      title?: string;
      content?: string;
    };
  };

  banner?: {
    enabled: boolean;
    text?: string;
    backgroundColor?: string;
    textColor?: string;
    link?: string;
    buttonText?: string;
    positions?: string[];
  };

  enableCustomLinks?: boolean;
  baseDomain?: string;
  linkPrefix?: string;
  newLink?: {
    original?: string;
    short?: string;
  };

  multiLanguage?: {
    enabled: boolean;
    languages: string[];
    autoTranslate?: boolean;
    autoDetect?: boolean;
    rememberPreference?: boolean;
  };

  multiCurrency?: {
    enabled: boolean;
    currencies: string[];
    exchangeRateSource?: string;
    updateInterval?: string;
    roundPrices?: boolean;
    autoDetect?: boolean;
  };

  maintenanceMode?: {
    enabled: boolean;
    title?: string;
    message?: string;
    image?: string;
    startTime?: string;
    endTime?: string;
    allowedAccess?: string[];
    statusCode?: string;
    noIndex?: boolean;
  };

  debugMode?: boolean;
  eventLogging?: boolean;
  enableAPI?: boolean;
  apiKey?: string;
  caching?: boolean;
  cacheDuration?: string;
  gzipCompression?: boolean;
  fileMinification?: boolean;
  securityProtection?: boolean;
  requestValidation?: boolean;
  csrfProtection?: boolean;
  loginLimiter?: boolean;
  recordsPerPage?: string;
  autoBackup?: string;
  retentionPeriod?: string;
}

export interface ShippingSettings {
  enabled: boolean;
  freeShippingThreshold: number;
  shippingCost: number;
  defaultCost: number;
  shippingZones: ShippingZone[];
  shippingMethods: ShippingMethod[];
}

export interface PaymentSettings {
  cashOnDelivery: boolean;
  bankTransfer: boolean;
  creditCard: boolean;
  paypal: boolean;
  stripe: boolean;
  mada: boolean;
  mobileWallet: boolean;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    iban: string;
    swiftCode: string;
  };
}

export interface DesignSettings {
  // الألوان
  primaryColor: string;
  secondaryColor: string;
  backgroundColor?: string;
  textColor?: string;
  textSecondaryColor?: string;
  borderColor?: string;
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
  linkColor?: string;

  // الخطوط
  fontFamily: string;
  headingFont?: string;
  bodyFont?: string;
  buttonFont?: string;
  baseFontSize?: string;
  headingSize?: string;
  lineHeight?: string;

  // 🔥 إضافة الخاصية المفقودة
  letterSpacing?: string;

  // التخطيط
  headerStyle?: string;
  footerStyle?: string;
  containerWidth?: string;
  productGridColumns?: number;
  borderRadius?: string;
  spacing?: string;

  // 🔥 إضافة مكونات الواجهة المفقودة
  showNavbar?: boolean;
  showFooter?: boolean;
  showSidebar?: boolean;
  showBackToTop?: boolean;
  adminMode?: boolean;

  // الصور
  logo: string;
  favicon: string;
  coverImage?: string;

  // 🔥 إضافة إعدادات الصور المفقودة
  lazyLoadImages?: boolean;
  compressImages?: boolean;
  useWebP?: boolean;

  // أخرى
  theme: string;
}

export interface ChecklistItems {
  addProduct: boolean;
  addCategories: boolean;
  enableShipping: boolean;
  enablePayment: boolean;
  verification: boolean;
  customDomain: boolean;
  seoOptimization: boolean;
}

export interface ProductsTabProps {
  products: Product[];
  categories: Category[];
  subActiveTab: string;
  setSubActiveTab: (tabId: string) => void;
  navigate: NavigateFunction;
  updateChecklistItem?: (itemId: string, completed: boolean) => Promise<void>;
}

export interface SettingsTabProps {
  store: Store;
  shippingSettings: ShippingSettings;
  setShippingSettings: Dispatch<SetStateAction<ShippingSettings>>;
  paymentSettings: PaymentSettings;
  setPaymentSettings: Dispatch<SetStateAction<PaymentSettings>>;
  subActiveTab: string;
  setSubActiveTab: (tabId: string) => void;
  loadMerchantData: () => Promise<void>;
  showConfirmDialog: (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "store" | "shipping" | "payment" | "design" | "customer" | "order",
  ) => void;
  handleSaveShippingSettings: () => Promise<void>;
  handleSavePaymentSettings: () => Promise<void>;
  savingShippingSettings: boolean;
  savingPaymentSettings: boolean;
  YEMENI_GOVERNORATES: string[];
  checklistItems?: ChecklistItems;
  updateChecklistItem?: (itemId: string, completed: boolean) => Promise<void>;
}

export interface AnalyticsTabProps {
  stats: Stats;
  subActiveTab: string;
  setSubActiveTab: (tabId: string) => void;
  checklistItems?: ChecklistItems;
}

// 🔥 إضافة واجهة DesignTabProps
export interface DesignTabProps {
  store: Store;
  storeSettings: StoreSettings;
  setStoreSettings: (settings: StoreSettings) => void;
  designSettings: DesignSettings;
  setDesignSettings: (settings: DesignSettings) => void;
  subActiveTab: string;
  setSubActiveTab: (tabId: string) => void;
  loadMerchantData: () => Promise<void>;
  showConfirmDialog: (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "store" | "shipping" | "payment" | "design" | "customer" | "order",
  ) => void;
  handleSaveStoreSettings: () => Promise<void>;
  handleSaveDesignSettings: () => Promise<void>;
  savingStoreSettings: boolean;
  savingDesignSettings: boolean;
  loading: boolean;
}

export interface DetailedStats {
  // المبيعات
  sales: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
    averageOrderValue: number;
    conversionRate: number;
    refundRate: number;
  };

  // الطلبات
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    returned: number;
    averageProcessingTime: string; // بالأيام
  };

  // المنتجات
  products: {
    total: number;
    active: number;
    outOfStock: number;
    lowStock: number;
    categories: number;
    averagePrice: number;
    inventoryValue: number;
  };

  // العملاء
  customers: {
    total: number;
    newThisMonth: number;
    active: number;
    repeatCustomers: number;
    averageLifetimeValue: number;
    retentionRate: number;
  };

  // المخزون
  inventory: {
    totalValue: number;
    turnoverRate: number;
    stockoutRate: number;
    bestSellers: Array<{
      id: string;
      name: string;
      category: string;
      sold: number;
      revenue: number;
      stock: number;
    }>;
  };

  // الأداء
  performance: {
    storeTraffic: number;
    bounceRate: number;
    averageSessionDuration: string;
    pageViews: number;
    mobileVsDesktop: {
      mobile: number;
      desktop: number;
    };
  };

  // التحليلات الزمنية
  timeAnalysis: {
    revenueByMonth: Array<{ month: string; revenue: number }>;
    ordersByDay: Array<{ day: string; orders: number }>;
    peakHours: Array<{ hour: string; orders: number }>;
  };

  // الفئات
  categories: Array<{
    name: string;
    revenue: number;
    orders: number;
    products: number;
    growth: number;
  }>;
}
