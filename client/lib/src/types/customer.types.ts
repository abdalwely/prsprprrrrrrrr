import { ShippingAddress } from "./shared.types";

/**
 * واجهة العميل الأساسية
 */
export interface Customer {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  shippingAddress?: ShippingAddress;
  lastOrderAt?: Date;
  lastVisit: Date;
  firstVisit: Date;
  isActive: boolean;
  storeId: string;
}

/**
 * واجهة عميل المتجر (موسعة)
 */
export interface StoreCustomer extends Customer {
  id: string;
  totalOrders?: number;
  totalSpent?: number;
  notes?: string;
  isVerified?: boolean;
  userType: "customer";
  createdAt: Date;
  updatedAt: Date;
}
