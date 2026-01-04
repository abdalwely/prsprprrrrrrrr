import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";

// ============ الدوال الأساسية ============

/**
 * 🔥 تأكد من وجود عميل في متجر محدد
 */
export async function ensureStoreCustomer(
  storeId: string,
  uid: string,
): Promise<any> {
  try {
    const customerRef = doc(db, "stores", storeId, "customers", uid);
    const snap = await getDoc(customerRef);

    if (!snap.exists()) {
      // جلب بيانات المستخدم من Firebase Auth أو users collection
      let userEmail = "";
      let userName = "";

      try {
        const user = auth.currentUser;
        if (user) {
          userEmail = user.email || "";
          userName = user.displayName || "";
        } else {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userEmail = userData.email || "";
            userName =
              `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
          }
        }
      } catch (err) {
        console.warn("⚠️ لم يتم جلب بيانات المستخدم:", err);
      }

      const [firstName, ...lastNameParts] = userName.split(" ");
      const lastName = lastNameParts.join(" ") || "";

      const newCustomer: any = {
        uid,
        email: userEmail,
        firstName,
        lastName,
        phone: "",
        storeId,
        isActive: true,
        firstVisit: serverTimestamp(),
        lastVisit: serverTimestamp(),
        shippingAddress: {
          street: "",
          city: "",
          district: "",
          governorate: "",
          zipCode: "",
          country: "اليمن",
          state: "",
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userType: "customer",
      };

      await setDoc(customerRef, newCustomer);

      console.log(`✅ تم إنشاء عميل في المتجر ${storeId}: ${uid}`);
      return { id: uid, ...newCustomer };
    }

    // تحديث آخر زيارة
    await updateDoc(customerRef, {
      lastVisit: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const customerData = snap.data();
    return {
      id: uid,
      ...customerData,
      firstVisit: customerData.firstVisit?.toDate() || new Date(),
      lastVisit: customerData.lastVisit?.toDate() || new Date(),
    };
  } catch (error) {
    console.error("❌ خطأ في ensureStoreCustomer:", error);
    throw error;
  }
}

/**
 * 🔥 الحصول على أو إنشاء معرف العميل للمتجر
 */
export async function getOrCreateCustomerIdForStore(
  storeId: string,
): Promise<string> {
  try {
    const user = auth.currentUser;

    // 1. مستخدم مسجل
    if (user && user.uid) {
      await ensureStoreCustomer(storeId, user.uid);
      return user.uid;
    }

    // 2. ضيف
    const storageKey = `visitor_${storeId}`;
    let visitorId = localStorage.getItem(storageKey);

    if (!visitorId) {
      visitorId = `vis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(storageKey, visitorId);

      // إنشاء سجل الضيف (اختياري)
      try {
        const visitorRef = doc(db, "stores", storeId, "visitors", visitorId);
        await setDoc(visitorRef, {
          visitorId,
          storeId,
          firstVisit: serverTimestamp(),
          lastActivity: serverTimestamp(),
          isGuest: true,
          userAgent: navigator.userAgent.substring(0, 100),
          ipAddress: "", // يمكن إضافته من خلال API
        });
      } catch (err) {
        console.warn("⚠️ لم يتم حفظ بيانات الضيف:", err);
      }
    } else {
      // تحديث آخر نشاط
      try {
        const visitorRef = doc(db, "stores", storeId, "visitors", visitorId);
        await updateDoc(visitorRef, {
          lastActivity: serverTimestamp(),
        });
      } catch (err) {
        console.warn("⚠️ لم يتم تحديث نشاط الضيف:", err);
      }
    }

    return `guest_${visitorId}`;
  } catch (error) {
    console.error("❌ خطأ في getOrCreateCustomerIdForStore:", error);
    return `guest_temp_${Date.now()}`;
  }
}

/**
 * 🔥 ربط الضيف بالمستخدم المسجل
 */
export async function linkVisitorToCustomer(
  storeId: string,
  visitorId: string,
  uid: string,
): Promise<void> {
  try {
    console.log(`🔗 ربط الضيف ${visitorId} بـ ${uid} في المتجر ${storeId}`);

    // 1. إنشاء/تأكيد حساب العميل
    await ensureStoreCustomer(storeId, uid);

    // 2. نقل السلة (إذا كانت cartService موجودة)
    try {
      const guestCustomerId = `guest_${visitorId}`;
      // افتراض أن cartService موجود
      if ((window as any).cartService) {
        const cartService = (window as any).cartService;
        const guestCart = await cartService.getCustomerCart(
          guestCustomerId,
          storeId,
        );

        if (guestCart && guestCart.items.length > 0) {
          const userCart = await cartService.getCustomerCart(uid, storeId);

          if (userCart) {
            // دمج العناصر
            const mergedItems = [...userCart.items];
            guestCart.items.forEach((guestItem: any) => {
              const existingIndex = mergedItems.findIndex(
                (item: any) => item.productId === guestItem.productId,
              );
              if (existingIndex > -1) {
                mergedItems[existingIndex].quantity += guestItem.quantity;
              } else {
                mergedItems.push(guestItem);
              }
            });

            await cartService.updateCart(userCart.id, mergedItems);
          } else {
            await cartService.createCartWithItems(
              uid,
              storeId,
              guestCart.items,
            );
          }

          // مسح سلة الضيف
          await cartService.clearCart(guestCart.id);
        }
      }
    } catch (cartError) {
      console.warn("⚠️ لم يتم نقل السلة:", cartError);
    }

    // 3. تحديث سجل الضيف
    const visitorRef = doc(db, "stores", storeId, "visitors", visitorId);
    await updateDoc(visitorRef, {
      linkedToUid: uid,
      linkedAt: serverTimestamp(),
      isGuest: false,
    });

    // 4. تحديث الطلبات القديمة
    const ordersQuery = query(
      collection(db, "orders"),
      where("storeId", "==", storeId),
      where("customerId", "==", `guest_${visitorId}`),
    );

    const ordersSnapshot = await getDocs(ordersQuery);
    const batch = writeBatch(db);

    ordersSnapshot.docs.forEach((orderDoc) => {
      batch.update(orderDoc.ref, {
        customerId: uid,
        "customerSnapshot.uid": uid,
      });
    });

    if (ordersSnapshot.docs.length > 0) {
      await batch.commit();
      console.log(`✅ تم تحديث ${ordersSnapshot.docs.length} طلب`);
    }

    // 5. نقل المفضلات
    try {
      const favoritesQuery = query(
        collection(db, "customerFavorites"),
        where("customerId", "==", `guest_${visitorId}`),
        where("storeId", "==", storeId),
      );

      const favoritesSnapshot = await getDocs(favoritesQuery);
      const favBatch = writeBatch(db);

      favoritesSnapshot.docs.forEach((favDoc) => {
        favBatch.update(favDoc.ref, {
          customerId: uid,
        });
      });

      if (favoritesSnapshot.docs.length > 0) {
        await favBatch.commit();
        console.log(`✅ تم نقل ${favoritesSnapshot.docs.length} منتج مفضل`);
      }
    } catch (favError) {
      console.warn("⚠️ لم يتم نقل المفضلات:", favError);
    }

    // 6. تنظيف localStorage
    localStorage.removeItem(`visitor_${storeId}`);

    console.log(`✅ تم الربط بنجاح`);
  } catch (error) {
    console.error("❌ خطأ في linkVisitorToCustomer:", error);
    throw error;
  }
}

// 🔍 دالة مساعدة للتحقق من التوافق
import { checkActivityCompatibility } from "../constants/activity-map";

export { checkActivityCompatibility };

// ============ دوال المساعدة للنظام الذكي ============

/**
 * ✨ اقتراح subdomain تلقائي من اسم المتجر
 */
export const suggestSubdomain = (storeName: string): string => {
  if (!storeName || storeName.trim().length === 0) {
    return "";
  }

  return storeName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]/g, "") // السماح بالعربية والإنجليزية
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 25);
};

/**
 * 🔧 معالجة الفئات لنظام النشاط الفرعي
 */
export async function getCategoriesForSubBusinessType(
  storeId: string,
  subBusinessType: string,
): Promise<Array<{ id: string; name: string; description?: string }>> {
  try {
    const { subBusinessCategoryService } = await import(
      "../services/sub-business-category"
    );
    const subBusinessCat =
      await subBusinessCategoryService.getBySubBusinessType(
        storeId,
        subBusinessType,
      );

    if (subBusinessCat && subBusinessCat.categories.length > 0) {
      return subBusinessCat.categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
      }));
    }

    const { categoryService } = await import("../services/category");
    const regularCategories = await categoryService.getByStore(storeId, {
      includeInactive: true,
    });

    if (regularCategories.length > 0) {
      return regularCategories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
      }));
    }

    const defaultCategories: Record<
      string,
      Array<{ name: string; description?: string }>
    > = {
      restaurant: [
        { name: "أطباق رئيسية", description: "الأطباق الرئيسية في المطعم" },
        { name: "مقبلات", description: "مقبلات ووجبات خفيفة" },
        { name: "حلويات", description: "حلويات ومشروبات حلوة" },
        { name: "مشروبات", description: "مشروبات ساخنة وباردة" },
      ],
      cafe: [
        { name: "مشروبات ساخنة", description: "قهوة، شاي، مشروبات ساخنة" },
        { name: "مشروبات باردة", description: "عصائر، مشروبات مثلجة" },
        { name: "حلويات", description: "حلويات وكيكات" },
        { name: "وجبات خفيفة", description: "سناك ومقبلات" },
      ],
      grocery: [
        { name: "معلبات", description: "أغذية معلبة" },
        { name: "مشروبات", description: "مشروبات متنوعة" },
        { name: "سناكات", description: "وجبات خفيفة" },
        { name: "بهارات", description: "بهارات وتوابل" },
      ],
    };

    const categories = defaultCategories[subBusinessType] || [
      { name: "عام", description: "فئة عامة" },
      { name: "مميز", description: "منتجات مميزة" },
      { name: "جديد", description: "منتجات جديدة" },
      { name: "غير مصنف", description: "بدون تصنيف" },
    ];

    return categories.map((cat, index) => ({
      id: `default_${subBusinessType}_${index}`,
      ...cat,
    }));
  } catch (error) {
    console.error("❌ خطأ في جلب الفئات للنشاط الفرعي:", error);
    return [
      { id: "default_1", name: "عام", description: "فئة عامة" },
      { id: "default_2", name: "مميز", description: "منتجات مميزة" },
    ];
  }
}

import { query, collection, where, writeBatch } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

// Export additional functions from the original file
export {
  fixAgricultureComplianceIssues,
  updateCategoryComprehensive,
  createCategoryWithValidation,
  importCategoriesWithValidation,
  exportCategoriesFormatted,
  mergeCategoriesWithValidation,
  copyCategoriesToSubBusiness,
  saveCustomCategoriesForSubBusinessType,
  initializeStoreCategories,
} from "./helpers-extended";
