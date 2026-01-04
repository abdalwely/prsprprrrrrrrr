import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { Order } from "../../types";

export const orderService = {
  // إنشاء طلب جديد
  async create(orderData: Omit<Order, "id">): Promise<string> {
    try {
      const orderWithTimestamp = {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderWithTimestamp);
      console.log("✅ تم إنشاء الطلب:", docRef.id);

      // تحديث آخر طلب للعميل
      if (orderData.customerId && !orderData.customerId.startsWith("guest_")) {
        try {
          const customerRef = doc(
            db,
            "stores",
            orderData.storeId,
            "customers",
            orderData.customerId,
          );
          await updateDoc(customerRef, {
            lastOrderAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (custError) {
          console.warn("⚠️ لم يتم تحديث تاريخ آخر طلب للعميل:", custError);
        }
      }

      return docRef.id;
    } catch (error) {
      console.error("❌ خطأ في إنشاء الطلب:", error);
      throw error;
    }
  },

  // جلب طلب بواسطة ID
  async getById(orderId: string): Promise<Order | null> {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        const data = orderSnap.data();
        // ✅ بناء كامل لكائن Order
        const order: Order = {
          id: orderSnap.id,
          storeId: data.storeId || "",
          customerId: data.customerId || "",
          customerSnapshot: data.customerSnapshot || {
            email: "",
            firstName: "",
            lastName: "",
            phone: "",
            shippingAddress: {
              street: "",
              city: "",
              district: "",
              governorate: "",
              zipCode: "",
              country: "اليمن",
            },
          },
          items: data.items || [],
          subtotal: data.subtotal || 0,
          shipping: data.shipping || 0,
          tax: data.tax || 0,
          discount: data.discount || 0, // ✅ تم إضافته
          total: data.total || 0,
          shippingAddress: data.shippingAddress || {
            street: "",
            city: "",
            district: "",
            governorate: "",
            zipCode: "",
            country: "اليمن",
          },
          billingAddress: data.billingAddress,
          paymentMethod: data.paymentMethod || "cod",
          paymentStatus: data.paymentStatus || "pending",
          orderStatus: data.orderStatus || "pending",
          notes: data.notes || "",
          trackingNumber: data.trackingNumber || "",
          estimatedDelivery: data.estimatedDelivery?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          // الخصائص الاختيارية
          discountCode: data.discountCode,
          paymentDetails: data.paymentDetails,
          fulfillmentStatus: data.fulfillmentStatus,
          customerNotes: data.customerNotes,
          deliveredAt: data.deliveredAt?.toDate(),
          cancelledAt: data.cancelledAt?.toDate(),
          refundedAt: data.refundedAt?.toDate(),
          firestoreId: orderSnap.id,
          storeName: undefined,
          storeContact: undefined,
        };
        return order; // ✅ لا حاجة لـ "as Order"
      }
      return null;
    } catch (error) {
      console.error("❌ خطأ في جلب الطلب:", error);
      return null;
    }
  },

  // جلب طلبات المتجر
  async getByStore(storeId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, "orders"),
        where("storeId", "==", storeId),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      // ✅ الحل: بناء كائن Order بشكل صريح وكامل
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // قم ببناء كائن الطلب مع كل الخصائص المطلوبة في واجهتك
        const order: Order = {
          id: doc.id,
          // استخرج جميع الخصائص المطلوبة من data أو عيّن قيم افتراضية
          storeId: data.storeId || "",
          customerId: data.customerId || "",
          customerSnapshot: data.customerSnapshot || {
            email: "",
            firstName: "",
            lastName: "",
            phone: "",
            shippingAddress: {
              street: "",
              city: "",
              district: "",
              governorate: "",
              zipCode: "",
              country: "",
            },
          },
          items: data.items || [],
          subtotal: data.subtotal || 0,
          shipping: data.shipping || 0,
          tax: data.tax || 0,
          discount: data.discount || 0,
          total: data.total || 0,
          shippingAddress: data.shippingAddress || {
            street: "",
            city: "",
            district: "",
            governorate: "",
            zipCode: "",
            country: "",
          },
          paymentMethod: data.paymentMethod || "cod",
          paymentStatus: data.paymentStatus || "pending",
          orderStatus: data.orderStatus || "pending",
          notes: data.notes || "",
          trackingNumber: data.trackingNumber || "",
          // تحويل الطوابع الزمنية
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          estimatedDelivery: data.estimatedDelivery?.toDate(),
          storeName: undefined,
          storeContact: undefined,
        };
        return order;
      });
    } catch (error) {
      console.error("❌ خطأ في جلب طلبات المتجر:", error);
      return [];
    }
  },

  // جلب طلبات العميل
  async getByCustomer(customerId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, "orders"),
        where("customerId", "==", customerId),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      // ✅ الحل: بناء كائن Order بشكل صريح وكامل
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // قم ببناء كائن الطلب مع كل الخصائص المطلوبة في واجهتك
        const order: Order = {
          id: doc.id,
          // استخرج جميع الخصائص المطلوبة من data أو عيّن قيم افتراضية
          storeId: data.storeId || "",
          customerId: data.customerId || "",
          customerSnapshot: data.customerSnapshot || {
            email: "",
            firstName: "",
            lastName: "",
            phone: "",
            shippingAddress: {
              street: "",
              city: "",
              district: "",
              governorate: "",
              zipCode: "",
              country: "",
            },
          },
          items: data.items || [],
          subtotal: data.subtotal || 0,
          shipping: data.shipping || 0,
          tax: data.tax || 0,
          discount: data.discount || 0,
          total: data.total || 0,
          shippingAddress: data.shippingAddress || {
            street: "",
            city: "",
            district: "",
            governorate: "",
            zipCode: "",
            country: "",
          },
          paymentMethod: data.paymentMethod || "cod",
          paymentStatus: data.paymentStatus || "pending",
          orderStatus: data.orderStatus || "pending",
          notes: data.notes || "",
          trackingNumber: data.trackingNumber || "",
          // تحويل الطوابع الزمنية
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          estimatedDelivery: data.estimatedDelivery?.toDate(),
          storeName: undefined,
          storeContact: undefined,
        };
        return order;
      });
    } catch (error) {
      console.error("❌ خطأ في جلب طلبات العميل:", error);
      return [];
    }
  },

  // تحديث الطلب
  async update(orderId: string, data: Partial<Order>): Promise<void> {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("❌ خطأ في تحديث الطلب:", error);
      throw error;
    }
  },

  // حذف الطلب
  async delete(orderId: string): Promise<void> {
    try {
      const orderRef = doc(db, "orders", orderId);
      await deleteDoc(orderRef);
    } catch (error) {
      console.error("❌ خطأ في حذف الطلب:", error);
      throw error;
    }
  },

  // إحصائيات الطلبات
  async getStats(storeId: string): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    averageOrderValue: number;
  }> {
    try {
      const orders = await this.getByStore(storeId);

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const pendingOrders = orders.filter(
        (o) => o.orderStatus === "pending",
      ).length;
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        totalOrders,
        totalRevenue,
        pendingOrders,
        averageOrderValue,
      };
    } catch (error) {
      console.error("❌ خطأ في إحصائيات الطلبات:", error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        averageOrderValue: 0,
      };
    }
  },

  // إعدادات الطلبات
  async getOrderSettings(storeId: string): Promise<any> {
    try {
      const settingsRef = doc(db, "stores", storeId, "settings", "orders");
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        return settingsSnap.data();
      }

      // إرجاع الإعدادات الافتراضية
      return {
        autoConfirmOrders: false,
        allowGuestCheckout: true,
        // ... إلخ
      };
    } catch (error) {
      console.error("❌ خطأ في جلب إعدادات الطلبات:", error);
      throw error;
    }
  },

  async saveOrderSettings(storeId: string, settings: any): Promise<void> {
    try {
      const settingsRef = doc(db, "stores", storeId, "settings", "orders");
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("❌ خطأ في حفظ إعدادات الطلبات:", error);
      throw error;
    }
  },

  // تخصيص الفواتير
  async getInvoiceSettings(storeId: string): Promise<any> {
    try {
      const settingsRef = doc(db, "stores", storeId, "settings", "invoice");
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        return settingsSnap.data();
      }

      return {};
    } catch (error) {
      console.error("❌ خطأ في جلب إعدادات الفواتير:", error);
      throw error;
    }
  },

  async saveInvoiceSettings(storeId: string, settings: any): Promise<void> {
    try {
      const settingsRef = doc(db, "stores", storeId, "settings", "invoice");
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("❌ خطأ في حفظ إعدادات الفواتير:", error);
      throw error;
    }
  },
};
export const updateOrderShippingAddressWithGovernorate = orderService.update;
