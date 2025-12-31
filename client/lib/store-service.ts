import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
} from "firebase/firestore";
import { Store } from "./firestore";

export const storeService = {
  // جلب متجر بواسطة ID
  async getById(storeId: string): Promise<Store | null> {
    try {
      const storeDoc = await getDoc(doc(db, "stores", storeId));
      if (storeDoc.exists()) {
        const data = storeDoc.data();
        return {
          id: storeDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Store;
      }
      return null;
    } catch (error) {
      console.error("❌ خطأ في جلب المتجر:", error);
      return null;
    }
  },

  // جلب متجر بواسطة النطاق الفرعي
  async getBySubdomain(subdomain: string): Promise<Store | null> {
    try {
      const q = query(
        collection(db, "stores"),
        where("subdomain", "==", subdomain),
        where("status", "==", "active"),
        limit(1),
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Store;
      }
      return null;
    } catch (error) {
      console.error("❌ خطأ في جلب المتجر بالنطاق الفرعي:", error);
      return null;
    }
  },

  // جلب جميع المتاجر
  async getAll(page: number = 1, itemsPerPage: number = 20): Promise<Store[]> {
    try {
      const storesRef = collection(db, "stores");
      const q = query(storesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      return querySnapshot.docs.slice(startIndex, endIndex).map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Store;
      });
    } catch (error) {
      console.error("❌ خطأ في جلب جميع المتاجر:", error);
      return [];
    }
  },

  // جلب متاجر المالك
  async getByOwner(ownerId: string): Promise<Store[]> {
    try {
      const q = query(
        collection(db, "stores"),
        where("ownerId", "==", ownerId),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Store;
      });
    } catch (error) {
      console.error("❌ خطأ في جلب متاجر المالك:", error);
      return [];
    }
  },

  // البحث في المتاجر
  async search(searchTerm: string): Promise<Store[]> {
    try {
      const stores = await this.getAll(1, 50);

      return stores.filter(
        (store) =>
          store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.contact.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    } catch (error) {
      console.error("❌ خطأ في البحث عن المتاجر:", error);
      return [];
    }
  },

  // جلب المتاجر النشطة فقط
  async getActiveStores(): Promise<Store[]> {
    try {
      const q = query(
        collection(db, "stores"),
        where("status", "==", "active"),
        orderBy("createdAt", "desc"),
        limit(50),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Store;
      });
    } catch (error) {
      console.error("❌ خطأ في جلب المتاجر النشطة:", error);
      return [];
    }
  },

  // التحقق من توفر النطاق الفرعي
  async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    try {
      const store = await this.getBySubdomain(subdomain);
      return !store; // متاح إذا لم يتم العثور على متجر
    } catch (error) {
      console.error("❌ خطأ في التحقق من النطاق الفرعي:", error);
      return false;
    }
  },

  // إنشاء متجر جديد
  async create(storeData: Omit<Store, "id">): Promise<string> {
    try {
      const { addDoc, serverTimestamp } = await import("firebase/firestore");

      const storeRef = await addDoc(collection(db, "stores"), {
        ...storeData,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ تم إنشاء المتجر:", storeRef.id);
      return storeRef.id;
    } catch (error) {
      console.error("❌ خطأ في إنشاء المتجر:", error);
      throw error;
    }
  },

  // تحديث متجر
  async update(storeId: string, data: Partial<Store>): Promise<void> {
    try {
      const { updateDoc, serverTimestamp } = await import("firebase/firestore");

      const storeRef = doc(db, "stores", storeId);
      await updateDoc(storeRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("❌ خطأ في تحديث المتجر:", error);
      throw error;
    }
  },

  // حذف متجر
  async delete(storeId: string): Promise<void> {
    try {
      const { deleteDoc } = await import("firebase/firestore");

      const storeRef = doc(db, "stores", storeId);
      await deleteDoc(storeRef);
    } catch (error) {
      console.error("❌ خطأ في حذف المتجر:", error);
      throw error;
    }
  },

  // إحصائيات المتجر
  async getStats(storeId: string): Promise<{
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    totalRevenue: number;
  }> {
    try {
      // جلب المنتجات
      const { getDocs, query, collection, where } = await import(
        "firebase/firestore"
      );
      const productsQuery = query(
        collection(db, "products"),
        where("storeId", "==", storeId),
      );
      const productsSnapshot = await getDocs(productsQuery);
      const totalProducts = productsSnapshot.size;

      // جلب العملاء
      const customersQuery = query(
        collection(db, "stores", storeId, "customers"),
      );
      const customersSnapshot = await getDocs(customersQuery);
      const totalCustomers = customersSnapshot.size;

      // جلب الطلبات والإيرادات
      const { orderService } = await import("./firestore");
      const orders = await orderService.getByStore(storeId);
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

      return {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
      };
    } catch (error) {
      console.error("❌ خطأ في إحصائيات المتجر:", error);
      return {
        totalProducts: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalRevenue: 0,
      };
    }
  },
};
