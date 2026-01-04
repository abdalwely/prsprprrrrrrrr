import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { StoreCustomer } from "../../types";

export const customerService = {
  // جلب عميل محدد من متجر محدد
  async getStoreCustomer(
    storeId: string,
    uid: string,
  ): Promise<StoreCustomer | null> {
    try {
      const customerRef = doc(db, "stores", storeId, "customers", uid);
      const snap = await getDoc(customerRef);

      if (snap.exists()) {
        const data = snap.data();
        return {
          id: snap.id,
          uid: snap.id,
          ...data,
          firstVisit: data.firstVisit?.toDate() || new Date(),
          lastVisit: data.lastVisit?.toDate() || new Date(),
        } as StoreCustomer;
      }
      return null;
    } catch (error) {
      console.error("❌ خطأ في getStoreCustomer:", error);
      return null;
    }
  },

  // جلب جميع عملاء المتجر
  async getByStore(storeId: string): Promise<StoreCustomer[]> {
    try {
      const customersRef = collection(db, "stores", storeId, "customers");
      const q = query(customersRef, orderBy("lastVisit", "desc"));
      const querySnapshot = await getDocs(q);

      const customers: StoreCustomer[] = [];

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        customers.push({
          id: docSnap.id,
          uid: docSnap.id,
          ...data,
          firstVisit: data.firstVisit?.toDate() || new Date(),
          lastVisit: data.lastVisit?.toDate() || new Date(),
        } as StoreCustomer);
      }

      // جلب إحصائيات الطلبات (إذا توفر service الطلبات)
      try {
        const { orderService } = await import("../order");
        const orders = await orderService.getByStore(storeId);
        customers.forEach((customer) => {
          const customerOrders = orders.filter(
            (o: any) => o.customerId === customer.uid,
          );
          customer.totalOrders = customerOrders.length;
          customer.totalSpent = customerOrders.reduce(
            (sum: number, o: any) => sum + o.total,
            0,
          );
        });
      } catch (ordersError) {
        console.warn("⚠️ لم يتم جلب إحصائيات الطلبات:", ordersError);
      }

      return customers;
    } catch (error) {
      console.error("❌ خطأ في getByStore:", error);
      return [];
    }
  },

  // تحديث بيانات العميل
  async update(
    customerId: string,
    data: Partial<StoreCustomer>,
  ): Promise<void> {
    try {
      const storeId = data.storeId;
      if (!storeId) throw new Error("storeId مطلوب");

      const customerRef = doc(db, "stores", storeId, "customers", customerId);
      await updateDoc(customerRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      // إذا كان هناك عنوان شحن، تحديثه أيضاً
      if (data.shippingAddress) {
        await updateDoc(customerRef, {
          shippingAddress: data.shippingAddress,
        });
      }
    } catch (error) {
      console.error("❌ خطأ في تحديث العميل:", error);
      throw error;
    }
  },

  // دالة التوافق مع النظام القديم
  async getByUid(uid: string): Promise<StoreCustomer | null> {
    try {
      // محاولة العثور في أي متجر
      const { storeService } = await import("../store");
      const stores = await storeService.getAll();

      for (const store of stores) {
        const customer = await this.getStoreCustomer(store.id, uid);
        if (customer) return customer;
      }

      return null;
    } catch (error) {
      console.error("❌ خطأ في getByUid:", error);
      return null;
    }
  },

  // البحث عن عملاء
  async search(storeId: string, searchTerm: string): Promise<StoreCustomer[]> {
    try {
      const customers = await this.getByStore(storeId);

      return customers.filter(
        (customer) =>
          customer.firstName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.includes(searchTerm),
      );
    } catch (error) {
      console.error("❌ خطأ في البحث:", error);
      return [];
    }
  },
};

export const updateCustomerShippingAddress = customerService.update;
