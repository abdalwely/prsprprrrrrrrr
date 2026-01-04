// إعادة تصدير من الملف الرئيسي
export {
  productService,
  createProduct,
  getProductById,
  getProductsByStoreId,
  updateProduct,
  deleteProduct,
  fixProductsMissingCreatedAt,
  checkProductsMissingCreatedAt,
} from "./product.service";

// إعادة تصدير الأنواع إذا لزم الأمر
export type { Product } from "../../types/product.types";
