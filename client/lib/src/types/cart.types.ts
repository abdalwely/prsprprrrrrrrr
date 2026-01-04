import { Product } from "./product.types";

/**
 * عنصر السلة
 */
export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
  product?: Product;
}

/**
 * العنصر المفضل
 */
export interface FavoriteItem {
  id: string;
  productId: string;
  customerId: string;
  storeId: string;
  createdAt: Date;
}

/**
 * السلة
 */
export interface Cart {
  id: string;
  customerId: string;
  storeId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * المفضلة
 */
export interface Favorite {
  id: string;
  customerId: string;
  storeId: string;
  productId: string;
  addedAt: Date;
}

/**
 * سلة العميل
 */
export interface CustomerCart {
  id: string;
  customerId: string;
  storeId: string;
  items: CartItem[];
  updatedAt: Date;
}

/**
 * مفضلات العميل
 */
export interface CustomerFavorites {
  id: string;
  customerId: string;
  storeId: string;
  items: FavoriteItem[];
  updatedAt: Date;
}
