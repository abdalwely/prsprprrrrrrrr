// تعريفات المستخدم الموحدة
export interface UserData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: "admin" | "merchant" | "customer" | "pending_merchant";
  role?: string; // للحفاظ على التوافق
  businessName?: string;
  businessType?: string;
  city?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  status?: "active" | "pending" | "suspended";
  storeId?: string;
  stores?: string[];
  lastLogin?: Date;
  avatar?: string;
}

export interface Store {
  id: string;
  name: string;
  ownerId: string;
  subdomain: string;
  status: "draft" | "pending" | "active" | "suspended";
  settings: {
    theme: string;
    currency: string;
    language: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreCustomer {
  id: string;
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  storeId: string;
  firstVisit: Date;
  lastVisit: Date;
  totalOrders?: number;
  totalSpent?: number;
  shippingAddress?: any;
}

export interface AuthResult {
  success: boolean;
  user?: any;
  userData?: UserData;
  error?: string;
}

export interface FirebaseDiagnostics {
  authConnected: boolean;
  firestoreConnected: boolean;
  error?: string;
  suggestion?: string;
}
