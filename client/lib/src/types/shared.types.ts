// استيراد أنواع المتجر من store.types.ts
import type {
  Store as StoreType,
  StoreCustomization,
  StoreCustomizationEnhanced,
  StoreCustomizationBasic,
  BusinessActivities,
  BasicColors,
  BasicFonts,
  BasicLayout,
  BasicHomepage,
  BasicPages,
  BasicEffects,
} from "./store.types";

/**
 * وسائل التواصل الاجتماعي
 */
export interface SocialMedia {
  whatsapp?: string;
  instagram?: string;
  twitter?: string;
  snapchat?: string;
  tiktok?: string;
  facebook?: string;
  youtube?: string;
  linkedin?: string;
}

/**
 * منطقة الشحن
 */
export interface ShippingZone {
  id: string;
  name: string;
  governorates: string[];
  cost: number;
  estimatedDays: string;
  enabled: boolean;
}

/**
 * طريقة الشحن
 */
export interface ShippingMethod {
  id: string;
  name: string;
  cost: number;
  days: string;
  enabled: boolean;
}

/**
 * عنوان الشحن
 */
export interface ShippingAddress {
  street: string;
  city: string;
  district: string;
  state: string;
  governorate: string;
  zipCode: string;
  country: string;
}

// إعادة تصدير الأنواع المستوردة
export type {
  StoreType as Store,
  StoreCustomization,
  StoreCustomizationEnhanced,
  StoreCustomizationBasic,
  BusinessActivities,
  BasicColors,
  BasicFonts,
  BasicLayout,
  BasicHomepage,
  BasicPages,
  BasicEffects,
};

// Export دوال المساعدة من store.types
export {
  isEnhancedCustomization,
  getBasicCustomization,
  createBasicCustomization,
  createDefaultBusinessActivities,
  updateBusinessActivities,
  migrateOldBusinessData,
  ensureEnhancedCustomization,
} from "./store.types";
