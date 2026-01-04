/**
 * الأنواع الأساسية الأربعة للمنتجات (Top-Level Product Kinds)
 */
export enum ProductKind {
  PHYSICAL = "physical",
  SERVICE = "service",
  FOOD = "food",
  DIGITAL = "digital",
}

/**
 * معلومات تفصيلية عن نوع المنتج الأساسي
 */
export interface ProductKindInfo {
  id: ProductKind;
  name: string;
  description: string;
  icon: string;
  color: string;
  requires: {
    inventory: boolean;
    shipping: boolean;
    dimensions: boolean;
    weight: boolean;
    expiryDate: boolean;
    digitalDelivery: boolean;
    customerContact: boolean;
    complianceLevel: "low" | "medium" | "high";
  };
  suggestedActivities: string[];
  validationRules: {
    minPrice?: number;
    maxPrice?: number;
    requireImages: boolean;
    minDescriptionLength: number;
  };
}

/**
 * قاعدة بيانات الأنواع الأساسية للمنتجات
 */
export const PRODUCT_KINDS: Record<ProductKind, ProductKindInfo> = {
  [ProductKind.PHYSICAL]: {
    id: ProductKind.PHYSICAL,
    name: "منتج ملموس",
    description:
      "منتجات جاهزة يمكن شحنها أو استلامها يدويًا (ملابس، أجهزة، أدوات منزلية)",
    icon: "📦",
    color: "blue",
    requires: {
      inventory: true,
      shipping: true,
      dimensions: true,
      weight: true,
      expiryDate: false,
      digitalDelivery: false,
      customerContact: false,
      complianceLevel: "medium",
    },
    suggestedActivities: [
      "electronics",
      "fashion",
      "furniture",
      "automotive",
      "toys",
      "jewelry",
      "home_goods",
      "home-garden",
      "sports",
      "books",
      "agriculture",
      "livestock",
      "fisheries",
    ],
    validationRules: {
      requireImages: true,
      minDescriptionLength: 50,
    },
  },
  [ProductKind.SERVICE]: {
    id: ProductKind.SERVICE,
    name: "خدمة حسب الطلب",
    description: "خدمة تُنفّذ بعد الطلب (تصميم، كتابة، صيانة، طباعة، تدريب)",
    icon: "🔧",
    color: "purple",
    requires: {
      inventory: false,
      shipping: false,
      dimensions: false,
      weight: false,
      expiryDate: false,
      digitalDelivery: true,
      customerContact: true,
      complianceLevel: "low",
    },
    suggestedActivities: [
      "design",
      "writing",
      "printing",
      "maintenance",
      "consulting",
      "training",
      "photography",
      "programming",
      "marketing",
    ],
    validationRules: {
      requireImages: false,
      minDescriptionLength: 100,
    },
  },
  [ProductKind.FOOD]: {
    id: ProductKind.FOOD,
    name: "أكل ومشروبات",
    description: "منتجات غذائية تتطلب شروط خاصة (توصيل، صلاحية، تراخيص صحية)",
    icon: "🍔",
    color: "green",
    requires: {
      inventory: true,
      shipping: true,
      dimensions: false,
      weight: true,
      expiryDate: true,
      digitalDelivery: false,
      customerContact: true,
      complianceLevel: "high",
    },
    suggestedActivities: [
      "restaurant",
      "cafe",
      "bakery",
      "grocery",
      "catering",
      "food_delivery",
      "juice_bar",
      "sweets",
      "food_processing",
      "livestock",
      "fisheries",
    ],
    validationRules: {
      minPrice: 1000,
      requireImages: true,
      minDescriptionLength: 80,
    },
  },
  [ProductKind.DIGITAL]: {
    id: ProductKind.DIGITAL,
    name: "منتج رقمي",
    description:
      "محتوى غير ملموس يُسلّم إلكترونيًا (كتب إلكترونية، دورات، ملفات، برامج)",
    icon: "💾",
    color: "orange",
    requires: {
      inventory: false,
      shipping: false,
      dimensions: false,
      weight: false,
      expiryDate: false,
      digitalDelivery: true,
      customerContact: false,
      complianceLevel: "low",
    },
    suggestedActivities: [
      "education",
      "software",
      "design_files",
      "e-books",
      "digital_art",
      "templates",
      "music",
      "video_content",
    ],
    validationRules: {
      requireImages: false,
      minDescriptionLength: 30,
    },
  },
};

/**
 * واجهات البيانات المشتقة من أنواع المنتجات
 */
export interface ProductKindSelectionResult {
  kind: ProductKind;
  allowed: boolean;
  reason?: string;
  requiredFields: string[];
  hiddenFields: string[];
  suggestedFields: string[];
  complianceLevel: "low" | "medium" | "high";
  validationRules: {
    requireImages: boolean;
    minDescriptionLength: number;
    minPrice?: number;
    maxPrice?: number;
  };
  nextSteps: string[];
}

export interface FieldVisibility {
  showInventory: boolean;
  showShipping: boolean;
  showDimensions: boolean;
  showWeight: boolean;
  showExpiryDate: boolean;
  showDigitalDelivery: boolean;
  showServiceDetails: boolean;
  showWarranty: boolean;
  showSizeGuide: boolean;
}

export interface KindBasedValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}
