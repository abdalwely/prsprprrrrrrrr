import { db } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  deleteDoc,
  orderBy,
  DocumentData,
} from "firebase/firestore";
import { storeService } from "./store-service";
import { customerService } from "./src";

// ربط متجر بالعميل (للتوافق مع النظام القديم)
export async function linkStoreToCustomer(
  customerId: string,
  storeId: string,
  storeData: any,
): Promise<void> {
  try {
    console.log("⚠️ linkStoreToCustomer: استخدم ensureStoreCustomer بدلاً مني");

    // استخدام ensureStoreCustomer بدلاً من هذا
    const { ensureStoreCustomer } = await import("./src");
    await ensureStoreCustomer(storeId, customerId);

    console.log(`✅ تم ربط العميل ${customerId} بالمتجر ${storeId}`);
  } catch (error: any) {
    console.error("❌ خطأ:", error);
    throw error;
  }
}

// جلب عملاء المتجر
export async function getStoreCustomers(storeId: string): Promise<any[]> {
  try {
    return await customerService.getByStore(storeId);
  } catch (error) {
    console.error("❌ خطأ في جلب عملاء المتجر:", error);
    return [];
  }
}

// جلب المتاجر المرتبطة بالعميل
export async function getCustomerStores(customerId: string): Promise<any[]> {
  try {
    // في النظام الجديد، نبحث عن المتاجر التي فيها العميل
    const allStores = await storeService.getAll();
    const customerStores = [];

    for (const store of allStores) {
      const customer = await customerService.getStoreCustomer(
        store.id,
        customerId,
      );
      if (customer) {
        customerStores.push({
          storeId: store.id,
          storeName: store.name,
          storeLogo: store.logo,
          storeSubdomain: store.subdomain,
          customerData: customer,
          joinedAt: customer.firstVisit,
          lastVisit: customer.lastVisit,
        });
      }
    }

    return customerStores;
  } catch (error) {
    console.error("❌ خطأ في جلب متاجر العميل:", error);
    return [];
  }
}

// تحديث بيانات العميل في متجر معين
export async function updateCustomerInStore(
  storeId: string,
  customerId: string,
  data: any,
): Promise<void> {
  try {
    await customerService.update(customerId, {
      ...data,
      storeId,
    });

    console.log(`✅ تم تحديث بيانات العميل ${customerId} في المتجر ${storeId}`);
  } catch (error) {
    console.error("❌ خطأ في تحديث بيانات العميل:", error);
    throw error;
  }
}

// إزالة عميل من متجر (تعطيل)
export async function removeCustomerFromStore(
  storeId: string,
  customerId: string,
): Promise<void> {
  try {
    const customerRef = doc(db, "stores", storeId, "customers", customerId);
    await updateDoc(customerRef, {
      isActive: false,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ تم تعطيل العميل ${customerId} في المتجر ${storeId}`);
  } catch (error) {
    console.error("❌ خطأ في إزالة العميل من المتجر:", error);
    throw error;
  }
}

// إعادة تفعيل عميل في متجر
export async function activateCustomerInStore(
  storeId: string,
  customerId: string,
): Promise<void> {
  try {
    const customerRef = doc(db, "stores", storeId, "customers", customerId);
    await updateDoc(customerRef, {
      isActive: true,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ تم تفعيل العميل ${customerId} في المتجر ${storeId}`);
  } catch (error) {
    console.error("❌ خطأ في تفعيل العميل:", error);
    throw error;
  }
}

// البحث عن عميل في متجر
export async function searchCustomerInStore(
  storeId: string,
  searchTerm: string,
): Promise<any[]> {
  try {
    return await customerService.search(storeId, searchTerm);
  } catch (error) {
    console.error("❌ خطأ في البحث عن عميل:", error);
    return [];
  }
}

// جلب إحصائيات العميل في المتجر
export async function getCustomerStoreStats(
  storeId: string,
  customerId: string,
): Promise<{
  totalOrders: number;
  totalSpent: number;
  firstOrderDate?: Date;
  lastOrderDate?: Date;
  averageOrderValue: number;
}> {
  try {
    const { orderService } = await import("./src");
    const orders = await orderService.getByCustomer(customerId);
    const storeOrders = orders.filter((order) => order.storeId === storeId);

    const totalOrders = storeOrders.length;
    const totalSpent = storeOrders.reduce((sum, order) => sum + order.total, 0);
    const firstOrderDate =
      storeOrders.length > 0
        ? storeOrders[storeOrders.length - 1].createdAt
        : undefined;
    const lastOrderDate =
      storeOrders.length > 0 ? storeOrders[0].createdAt : undefined;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    return {
      totalOrders,
      totalSpent,
      firstOrderDate,
      lastOrderDate,
      averageOrderValue,
    };
  } catch (error) {
    console.error("❌ خطأ في إحصائيات العميل:", error);
    return {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
    };
  }
}

// جلب آخر نشاط للعميل في المتجر
export async function getCustomerLastActivity(
  storeId: string,
  customerId: string,
): Promise<{
  lastVisit: Date;
  lastOrder?: Date;
  lastCartUpdate?: Date;
  lastFavoriteAdd?: Date;
}> {
  try {
    const customer = await customerService.getStoreCustomer(
      storeId,
      customerId,
    );
    if (!customer) {
      throw new Error("العميل غير موجود في هذا المتجر");
    }

    const { orderService } = await import("./src");
    const orders = await orderService.getByCustomer(customerId);
    const storeOrders = orders.filter((order) => order.storeId === storeId);

    // جلب آخر طلب
    const lastOrder =
      storeOrders.length > 0 ? storeOrders[0].createdAt : undefined;

    // جلب آخر تحديث للسلة (تخيلي - تحتاج لتطبيق)
    const lastCartUpdate = undefined;

    // جلب آخر إضافة للمفضلة (تخيلي - تحتاج لتطبيق)
    const lastFavoriteAdd = undefined;

    return {
      lastVisit: customer.lastVisit,
      lastOrder,
      lastCartUpdate,
      lastFavoriteAdd,
    };
  } catch (error) {
    console.error("❌ خطأ في جلب آخر نشاط:", error);
    throw error;
  }
}

// دوال التوافق مع النظام القديم
export async function getLinkedStores(customerId: string): Promise<any[]> {
  return getCustomerStores(customerId);
}

export async function unlinkStoreFromCustomer(
  customerId: string,
  storeId: string,
): Promise<void> {
  return removeCustomerFromStore(storeId, customerId);
}

export async function getStoreCustomerData(
  storeId: string,
  customerId: string,
): Promise<any> {
  return customerService.getStoreCustomer(storeId, customerId);
}

// دوال التخزين المحلي القديمة (للتوافق)
export function getStoredStores(): any[] {
  console.warn("⚠️ getStoredStores: لم تعد مستخدمة في النظام الجديد");
  return [];
}

export function saveStoresToStorage(stores: any[]): void {
  console.warn("⚠️ saveStoresToStorage: لم تعد مستخدمة في النظام الجديد");
}

export function clearStoredStores(): void {
  console.warn("⚠️ clearStoredStores: لم تعد مستخدمة في النظام الجديد");
}
