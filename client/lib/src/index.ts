// ============ تصدير جميع الخدمات والأنواع والثوابت ============

// 1. تصدير الثوابت
export {
  ACTIVITY_COMPATIBILITY_MAP,
  checkActivityCompatibility,
} from "./constants/activity-map";

export { DEFAULT_PRODUCT_TYPES } from "./constants/product-types";
export { PRODUCT_KINDS, ProductKind } from "./constants/product-kinds";
export { OPTIMIZATION_TIPS } from "./constants/tips";

// 2. تصدير الأنواع
export type {
  // Shared types
  SocialMedia,
  ShippingZone,
  ShippingMethod,
  ShippingAddress,

  // Store types
  Store,
  StoreCustomizationEnhanced,
  BusinessActivities,

  // Product types
  Product,
  ProductInput,
  ProductUpdate,
  ProductSemantics,

  // Compliance types
  ComplianceFlag,
  DetectionMethod,
  ComplianceCheckResult,

  // Category types
  Category,
  CategoryUpdateData,
  CreateCategoryData,
  ImportCategoriesData,
  ExportCategoriesResult,
  MergeCategoriesData,
  SubBusinessCategory,

  // Order types
  Order,
  StoreOrder,
  OrderItem,

  // Customer types
  Customer,
  StoreCustomer,

  // Cart types
  Cart,
  CartItem,
  CustomerCart,

  // Favorites types
  Favorite,
  FavoriteItem,
  CustomerFavorites,
  ProductKindSelectionResult,
  FieldVisibility,
  KindBasedValidation,
  DiscountUpdate,
} from "./types";

export { ProductStatus, ComplianceDecision, ComplianceStatus } from "./types";

export type {
  // Optimization types
  OptimizationTips,
  StockThresholds,
  DiscountPeriods,
  DiscountAnalytics,
} from "./constants/tips";

export type {
  // Product types
  ProductType,
  ProductTypeDetection,
  // Kind types
  ProductKindInfo,
} from "./constants";

// 3. تصدير الخدمات
export {
  storeService,
  productService,
  categoryService,
  orderService,
  customerService,
  cartService,
  favoritesService,
  uploadService,
  subBusinessCategoryService,
  optimizationTipsService,
} from "./services";

// 4. تصدير نظام الامتثال
export { complianceSystem } from "./compliance";
export { complianceService } from "./services/compliance";

// 5. تصدير دوال المساعدة
export {
  cleanFirestoreData,
  ensureStoreCustomer,
  getOrCreateCustomerIdForStore,
  linkVisitorToCustomer,
  suggestSubdomain,
  fixAgricultureComplianceIssues,
  getCategoriesForSubBusinessType,
  saveCustomCategoriesForSubBusinessType,
  initializeStoreCategories,
} from "./utils";

// 6. تصدير Firebase
export { app, auth, db, storage } from "./firebase";

// 7. تصدير دوال التصدير المشتركة (للتوافق مع النظام القديم)
// 7. تصدير دوال التصدير المشتركة (للتوافق مع النظام القديم)
// استيراد من الخدمات الفردية
export {
  createStore,
  getStoreById,
  getStoreBySubdomain,
  updateStore,
  deleteStore,
  getStoreByOwnerId,
  checkSubdomainAvailability,
  updateStoreComplianceSettings,
  updateStoreBusinessActivities,
} from "./services/store/store.service";

export {
  createProduct,
  getProductById,
  getProductsByStoreId,
  updateProduct,
  deleteProduct,
  fixProductsMissingCreatedAt,
  checkProductsMissingCreatedAt,
} from "./services/product/product.service";

export {
  createCategory,
  getCategoryById,
  getStoreCategoriesByStoreId,
  updateCategory,
  deleteCategory,
  deleteCategorySafely,
  toggleCategoryStatus,
  updateCategoriesOrder,
  getAllCategoriesWithDetails,
  createSubCategory,
  mergeCategories,
  importCategories,
  exportCategories,
  mergeCategoriesWithValidation,
  exportCategoriesFormatted,
  importCategoriesWithValidation,
  createCategoryWithValidation,
} from "./services/category/category.service";

export { updateOrderShippingAddressWithGovernorate } from "./services/order/order.service";

export { updateCustomerShippingAddress } from "./services/customer/customer.service";

export {
  checkStoreCompliance,
  getComplianceFlags,
  updateFlagStatus,
  runScheduledComplianceChecks,
  buildProductSemantics,
  makeComplianceDecision,
  detectProductType,
  reviewProduct,
  sanitizeProductData,
} from "./services/compliance/compliance.service";

export {
  getSubBusinessCategories,
  addCategoryToSubBusiness,
  updateCategoryInSubBusiness,
  deleteCategoryFromSubBusiness,
} from "./services/sub-business-category/sub-business-category.service";

// 8. التصديرات الخاصة بالنصائح
export {
  newStoreTips,
  inventoryTips,
  discountTips,
  getOptimizationDashboard,
  executeOptimization,
} from "./services/optimization/optimization.service";

// 9. أنواع خاصة بالنظام
export type { ExtendedStore } from "../../pages/merchant/merchant-dashboard/types";
