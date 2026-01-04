/**
 * واجهة الفئة الرئيسية
 */
export interface Category {
  id: string;
  storeId: string;
  name: string;
  description: string;

  uiProperties?: {
    displayOrder?: number;
    isFeatured?: boolean;
    isSeasonal?: boolean;
    isSaleCategory?: boolean;
    showInMenu?: boolean;
    showInFooter?: boolean;
    badgeText?: string;
    badgeColor?: string;
    customSlug?: string;
    seoTitle?: string;
    seoDescription?: string;
  };

  image?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * بيانات تحديث الفئة
 */
export interface CategoryUpdateData {
  name?: string;
  description?: string;
  image?: string;
  order?: number;
  isActive?: boolean;
  parentId?: string;
  uiProperties?: Category["uiProperties"];
}

/**
 * بيانات إنشاء فئة جديدة
 */
export interface CreateCategoryData {
  name: string;
  description?: string;
  storeId: string;
  image?: string;
  order?: number;
  parentId?: string;
  isActive?: boolean;
  uiProperties?: Category["uiProperties"];
}

/**
 * بيانات استيراد الفئات
 */
export interface ImportCategoriesData {
  categories: Array<{
    name: string;
    description?: string;
    order?: number;
    uiProperties?: Category["uiProperties"];
  }>;
}

/**
 * نتيجة تصدير الفئات
 */
export interface ExportCategoriesResult {
  id: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  productCount: number;
  uiProperties?: Category["uiProperties"];
}

/**
 * بيانات دمج الفئات
 */
export interface MergeCategoriesData {
  sourceCategoryId: string;
  targetCategoryId: string;
  moveProducts?: boolean;
}

/**
 * واجهة فئة النشاط التجاري الفرعي
 */
export interface SubBusinessCategory {
  id: string;
  storeId: string;
  subBusinessType: string;
  categories: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    order: number;
    isActive: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
