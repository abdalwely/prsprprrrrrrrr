// 📂 client/lib/types/unified-types.ts
/**
 * النظام الموحد لطلبات المتاجر والمتاجر
 * يحل مشكلة التعارض بين الأنظام القديمة والجديدة
 */

import { Timestamp } from "firebase/firestore";

// ============================================
// 📦 واجهات البيانات الأساسية
// ============================================

/**
 * بيانات التاجر الموحدة
 */
export interface MerchantData {
  // ✅ الحقول الأساسية
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  businessName: string;
  businessType: string;

  // ✅ الحقول الجديدة
  address: string;
  emailVerified: boolean;
  subBusinessTypes: string[];

  // ✅ حقول إضافية
  country?: string;
  zipCode?: string;
}

/**
 * إعدادات المتجر الموحدة
 */
export interface StoreConfig {
  storeName?: string;
  storeDescription?: string;
  template?: string;

  customization?: {
    storeName: string;
    storeDescription?: string;
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text?: string;
    };
    subdomain: string;
    customDomain?: string;
    entityType?: string;
    logo?: string;
  };
}

/**
 * الإعدادات التشغيلية الموحدة
 */
export interface StoreSettings {
  currency: string;
  language: string;
  timezone?: string;

  shipping: {
    enabled: boolean;
    freeShippingThreshold: number;
    shippingCost: number;
    defaultCost?: number;
    zones?: any[];
  };

  payment: {
    cashOnDelivery: boolean;
    bankTransfer: boolean;
    creditCard: boolean;
    paypal?: boolean;
    stripe?: boolean;
  };

  notifications?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };

  taxes?: {
    enabled: boolean;
    includeInPrice: boolean;
    rate: number;
  };
}

// ============================================
// 📦 الواجهات الرئيسية
// ============================================

/**
 * طلب إنشاء متجر موحد
 */
export interface UnifiedStoreApplication {
  id: string;
  merchantId: string;
  ownerId: string;

  merchantData: MerchantData;
  storeConfig: StoreConfig;
  settings?: StoreSettings;

  status: "pending" | "approved" | "rejected" | "under_review";
  submittedAt: string | Timestamp;
  reviewedAt?: string | Timestamp;
  reviewedBy?: string;
  notes?: string;
  rejectionReason?: string;

  convertedStoreId?: string;
  convertedAt?: string | Timestamp;

  verification?: {
    status: "not_started" | "pending" | "verified" | "rejected";
    documents?: any;
  };

  metadata?: {
    version: number;
    source: "legacy" | "new" | "migrated";
    migratedAt?: string;
    lastUpdated?: string;
  };
}

/**
 * المتجر النهائي الموحد (متوافق مع firestore.ts)
 */
export interface UnifiedStore {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  logo: string;
  subdomain: string;
  customDomain?: string;
  template: string;
  industry?: string;

  customization: any; // من enhanced-templates.ts

  settings: {
    currency: string;
    language: string;
    timezone?: string;
    notifications?: {
      emailNotifications: boolean;
      pushNotifications: boolean;
      smsNotifications: boolean;
    };
    shipping: {
      enabled: boolean;
      freeShippingThreshold: number;
      shippingCost: number;
      defaultCost?: number;
      zones?: any[];
    };
    payment: {
      cashOnDelivery: boolean;
      bankTransfer: boolean;
      creditCard: boolean;
      paypal?: boolean;
      stripe?: boolean;
    };
    taxes?: {
      enabled: boolean;
      includeInPrice: boolean;
      rate: number;
    };
  };

  contact: {
    phone: string;
    email: string;
    address: string;
    city: string;
    country?: string;
    zipCode?: string;
  };

  socialMedia?: any;
  status: "pending" | "active" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// 📦 التصدير
// ============================================

// تصدير أنواع بشكل صحيح
export type {
  MerchantData as IMerchantData,
  StoreConfig as IStoreConfig,
  UnifiedStoreApplication as IStoreApplication,
  UnifiedStore as IStore,
};
