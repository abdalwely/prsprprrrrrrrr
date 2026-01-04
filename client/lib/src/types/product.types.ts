import {
  ProductStatus,
  ProductSemantics,
  ComplianceStatus,
  DetectionMethod,
} from "./compliance.types";
import { ShippingAddress } from "./shared.types";

/**
 * واجهة المنتج الرئيسية
 */
export interface Product {
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

/**
 * 🔥 واجهة جزئية للمنتج (للإدخال)
 */
export interface ProductInput
  extends Omit<Product, "id" | "createdAt" | "updatedAt"> {
  // يمكن إضافة حقول إضافية للإدخال
}

/**
 * 🔥 واجهة جزئية لتحديث المنتج
 */
export interface ProductUpdate
  extends Partial<
    Omit<Product, "id" | "storeId" | "ownerId" | "createdAt" | "updatedAt">
  > {
  // حقول التحديث
}

/**
 * تحديث الخصم
 */
export interface DiscountUpdate {
  type: "percentage" | "fixed" | "none";
  value: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}
