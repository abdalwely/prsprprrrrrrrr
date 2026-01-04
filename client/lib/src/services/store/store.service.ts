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
  limit,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import {
  BusinessActivities,
  ensureEnhancedCustomization,
  Store,
  StoreApplication,
} from "../../types/store.types";
import { ShippingZone, ShippingMethod } from "../../types/shared.types";

import { complianceSystem } from "../../compliance";
import { cleanFirestoreData } from "../../utils/clean-firestore";

/**
 * خدمة إدارة المتاجر
 * مسؤولة عن عمليات CRUD الكاملة للمتاجر وإعداداتها
 */
export const storeService = {
  /**
   * إنشاء متجر جديد
   * @param storeData بيانات المتجر
   * @returns معرف المتجر المنشأ
   */
  async create(
    storeData: Omit<Store, "id" | "createdAt" | "updatedAt"> | Partial<Store>,
  ): Promise<string> {
    try {
      // 🔥 1. القيم الافتراضية الأساسية
      const defaultStore: Omit<Store, "id" | "createdAt" | "updatedAt"> = {
        // الحقول المطلوبة
        ownerId: "",
        name: "",
        description: "",
        logo: "",
        subdomain: "",
        template: "simple",
        industry: "general",

        // 🔥 نظام الامتثال التدريجي (الجديد)
        checklist: {
          addProduct: false,
          addCategories: false,
          enableShipping: false,
          enablePayment: false,
          verification: false,
          customDomain: false,
          seoOptimization: false,
        },
        complianceLevel: "basic",
        legalStatus: "unverified",
        riskScore: 0,

        // الأنشطة التجارية
        businessActivities: {
          mainActivity: "general",
          subActivities: [],
          registrationNumber: `REG-${Date.now()}`,
          taxNumber: "",
          issueDate: new Date(),
          expiryDate: undefined,
          businessType: "retail",
          industry: "general",
          legalStructure: "sole_proprietorship",
        },

        // إعدادات الامتثال
        complianceSettings: {
          autoDetection: true,
          strictMode: false,
          notifyOnViolation: true,
          allowedDeviations: [],
          reviewThreshold: 10,
        },

        // العملة واللغة
        currency: "YER",
        timezone: "Asia/Aden",
        language: "ar",

        // التخصيص
        customization: ensureEnhancedCustomization({
          colors: undefined,
          fonts: undefined,
          layout: undefined,
          homepage: undefined,
          pages: undefined,
          effects: undefined,
          branding: undefined,
        }),

        // الإعدادات التشغيلية
        settings: {
          currency: "YER",
          language: "ar",
          timezone: "Asia/Aden",

          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
          },

          shipping: {
            enabled: false,
            freeShippingThreshold: 0,
            shippingCost: 0,
            defaultCost: 0,
            zones: [],
            methods: [],
          },

          payment: {
            cashOnDelivery: true,
            bankTransfer: false,
            creditCard: false,
            paypal: false,
            stripe: false,
            mada: false,
            mobileWallet: false,
            bankInfo: {
              bankName: "",
              accountNumber: "",
              accountName: "",
            },
          },

          taxes: {
            enabled: false,
            includeInPrice: false,
            rate: 0,
          },
        },

        // بيانات الاتصال
        contact: {
          phone: "",
          email: "",
          address: "",
          city: "",
          governorate: "",
          country: "اليمن",
          zipCode: "",
          originalCity: "",
        },

        // وسائل التواصل
        socialMedia: {},

        // إحصائيات الامتثال
        complianceStats: {
          totalProducts: 0,
          compliantProducts: 0,
          flaggedProducts: 0,
          lastCheck: new Date(),
          complianceRate: 100,
        },

        // حالة المتجر
        status: "pending",
      };

      // 🔥 2. دمج البيانات الواردة مع القيم الافتراضية
      const mergedData: Omit<Store, "id" | "createdAt" | "updatedAt"> = {
        ...defaultStore,
        ...storeData, // البيانات الواردة تتجاوز الافتراضيات

        // 🔥 معالجة businessActivities بشكل خاص
        businessActivities: storeData.businessActivities
          ? {
              ...defaultStore.businessActivities,
              ...storeData.businessActivities,
              // تأكد من أن subActivities هي array
              subActivities: Array.isArray(
                storeData.businessActivities.subActivities,
              )
                ? storeData.businessActivities.subActivities
                : defaultStore.businessActivities.subActivities,
            }
          : defaultStore.businessActivities,

        // 🔥 معالجة customization
        customization: storeData.customization
          ? ensureEnhancedCustomization(storeData.customization)
          : defaultStore.customization,

        // 🔥 معالجة checklist (لنظام الامتثال الجديد)
        checklist: storeData.checklist
          ? { ...defaultStore.checklist, ...storeData.checklist }
          : defaultStore.checklist,

        // 🔥 معالجة complianceSettings
        complianceSettings: storeData.complianceSettings
          ? {
              ...defaultStore.complianceSettings,
              ...storeData.complianceSettings,
            }
          : defaultStore.complianceSettings,

        // 🔥 معالجة settings
        settings: storeData.settings
          ? {
              ...defaultStore.settings,
              ...storeData.settings,
              // دمج payment بشكل خاص
              payment: storeData.settings?.payment
                ? {
                    ...defaultStore.settings.payment,
                    ...storeData.settings.payment,
                  }
                : defaultStore.settings.payment,
              // دمج shipping بشكل خاص
              shipping: storeData.settings?.shipping
                ? {
                    ...defaultStore.settings.shipping,
                    ...storeData.settings.shipping,
                  }
                : defaultStore.settings.shipping,
            }
          : defaultStore.settings,

        // 🔥 معالجة contact
        contact: storeData.contact
          ? { ...defaultStore.contact, ...storeData.contact }
          : defaultStore.contact,
      };

      // 🔥 3. التحقق من الحقول المطلوبة
      if (!mergedData.name || mergedData.name.trim() === "") {
        throw new Error("❌ اسم المتجر مطلوب");
      }

      if (!mergedData.subdomain || mergedData.subdomain.trim() === "") {
        throw new Error("❌ رابط المتجر مطلوب");
      }

      if (!mergedData.ownerId || mergedData.ownerId.trim() === "") {
        throw new Error("❌ معرف المالك مطلوب");
      }

      // 🔥 4. تنظيف البيانات وإضافة التواريخ
      const storeDataToSave = {
        ...mergedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const cleanedData = cleanFirestoreData(storeDataToSave);

      // 🔥 5. الحفظ في Firestore
      const docRef = await addDoc(collection(db, "stores"), cleanedData);

      console.log("✅ تم إنشاء متجر بنظام 3 خطوات:", {
        storeId: docRef.id,
        name: mergedData.name,
        subdomain: mergedData.subdomain,
        checklist: mergedData.checklist,
        status: mergedData.status,
        time: "60-90 ثانية",
      });

      return docRef.id;
    } catch (error) {
      console.error("❌ خطأ في إنشاء المتجر:", error);
      throw error;
    }
  },

  /**
   * ⭐ استخراج وتحديث الأنشطة التجارية
   * @param storeId معرف المتجر
   * @param newData بيانات جديدة للأنشطة
   */
  async extractAndUpdateBusinessActivities(
    storeId: string,
    newData?: {
      mainActivity?: string;
      subActivities?: string[];
      businessType?: string;
      industry?: string;
    },
  ): Promise<void> {
    try {
      const store = await this.getById(storeId);
      if (!store) {
        throw new Error("المتجر غير موجود");
      }

      let businessActivities: BusinessActivities;

      if (store.businessActivities) {
        // تحديث البيانات الحالية
        businessActivities = {
          ...store.businessActivities,
          ...newData,
          subActivities:
            newData?.subActivities ||
            store.businessActivities.subActivities ||
            [],
        };
      } else {
        // إنشاء جديد
        businessActivities = {
          mainActivity: newData?.mainActivity || store.industry || "retail",
          subActivities: newData?.subActivities || [],
          registrationNumber:
            store.businessActivities?.registrationNumber || `REG-${Date.now()}`,
          taxNumber: store.businessActivities?.taxNumber || "",
          issueDate: store.businessActivities?.issueDate || new Date(),
          expiryDate: store.businessActivities?.expiryDate,
          businessType: newData?.businessType || store.industry || "retail",
          industry: newData?.industry || store.industry || "general",
          legalStructure: "sole_proprietorship",
        };
      }

      await this.update(storeId, { businessActivities });

      console.log("✅ تم تحديث الأنشطة التجارية:", {
        storeId,
        mainActivity: businessActivities.mainActivity,
        subActivitiesCount: businessActivities.subActivities.length,
      });
    } catch (error) {
      console.error("❌ خطأ في تحديث الأنشطة التجارية:", error);
      throw error;
    }
  },

  /**
   * تحديث الأنشطة التجارية
   * @param storeId معرف المتجر
   * @param activities الأنشطة الجديدة
   */
  async updateBusinessActivities(
    storeId: string,
    activities: Partial<BusinessActivities>,
  ): Promise<void> {
    try {
      const store = await this.getById(storeId);
      if (!store) {
        throw new Error("المتجر غير موجود");
      }

      const currentActivities = store.businessActivities || {
        mainActivity: "retail",
        subActivities: [],
        registrationNumber: `REG-${Date.now()}`,
        taxNumber: "",
        issueDate: new Date(),
        expiryDate: undefined,
        businessType: "retail",
        industry: "general",
        legalStructure: "sole_proprietorship",
      };

      const updatedActivities: BusinessActivities = {
        ...currentActivities,
        ...activities,
        // تأكد من أن subActivities هي array
        subActivities: Array.isArray(activities.subActivities)
          ? activities.subActivities
          : currentActivities.subActivities,
        // الحفاظ على issueDate ما لم يتم تحديثه
        issueDate: activities.issueDate || currentActivities.issueDate,
      };

      await this.update(storeId, {
        businessActivities: updatedActivities,
      });

      console.log("✅ تم تحديث الأنشطة التجارية:", {
        storeId,
        mainActivity: updatedActivities.mainActivity,
        subActivities: updatedActivities.subActivities,
      });

      // إذا كان هناك نظام امتثال، نفذ فحص الامتثال
      if (complianceSystem) {
        await complianceSystem.batchComplianceCheck(storeId);
      }
    } catch (error) {
      console.error("❌ خطأ في تحديث الأنشطة التجارية:", error);
      throw error;
    }
  },

  /**
   * ⭐ معالجة البيانات القديمة للأنشطة التجارية
   * @param storeId معرف المتجر
   */
  async migrateStoreBusinessData(storeId: string): Promise<void> {
    try {
      const store = await this.getById(storeId);
      if (!store) {
        throw new Error("المتجر غير موجود");
      }

      // التحقق إذا كان يحتاج إلى تحديث
      const needsMigration =
        !store.businessActivities ||
        (store.customization &&
          ("primaryBusinessType" in store.customization ||
            "subBusinessTypes" in store.customization));

      if (needsMigration) {
        console.log(`🔄 جارٍ تحديث بيانات الأنشطة التجارية للمتجر: ${storeId}`);

        // استخراج البيانات من مصادر مختلفة
        let mainActivity = "retail";
        let subActivities: string[] = [];

        // 1. من customization القديم
        if (store.customization) {
          const cust = store.customization;
          if ("primaryBusinessType" in cust) {
            mainActivity = (cust as any).primaryBusinessType;
          }
          if ("subBusinessTypes" in cust) {
            subActivities = (cust as any).subBusinessTypes || [];
          }
        }

        // 2. من industry
        if (store.industry && store.industry !== "general") {
          mainActivity = store.industry;
        }

        // إنشاء/تحديث businessActivities
        const businessActivities: BusinessActivities = {
          mainActivity: mainActivity,
          subActivities: subActivities,
          registrationNumber:
            store.businessActivities?.registrationNumber ||
            `MIGR-${Date.now()}`,
          taxNumber: store.businessActivities?.taxNumber || "",
          issueDate: store.businessActivities?.issueDate || new Date(),
          expiryDate: store.businessActivities?.expiryDate,
          businessType: store.industry || "retail",
          industry: store.industry || "general",
          legalStructure:
            store.businessActivities?.legalStructure || "sole_proprietorship",
        };

        // تنظيف customization (إزالة الخصائص المكررة)
        let cleanedCustomization = store.customization;
        if (
          cleanedCustomization &&
          ("primaryBusinessType" in cleanedCustomization ||
            "subBusinessTypes" in cleanedCustomization)
        ) {
          const { primaryBusinessType, subBusinessTypes, ...rest } =
            cleanedCustomization as any;
          cleanedCustomization = rest;
        }

        // تحديث المتجر
        await this.update(storeId, {
          businessActivities,
          customization: cleanedCustomization,
        });

        console.log(`✅ تم تحديث بيانات الأنشطة التجارية للمتجر: ${storeId}`, {
          mainActivity,
          subActivitiesCount: subActivities.length,
        });
      }
    } catch (error) {
      console.error(
        `❌ خطأ في تحديث بيانات الأنشطة التجارية للمتجر ${storeId}:`,
        error,
      );
    }
  },

  /**
   * جلب متجر بواسطة المعرف
   * @param storeId معرف المتجر
   * @returns بيانات المتجر أو null
   */
  async getById(storeId: string): Promise<Store | null> {
    try {
      const { doc, getDoc } = await import("firebase/firestore");
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
      console.error("Error getting store by id:", error);
      return null;
    }
  },
  /**
   * جلب متجر بواسطة النطاق الفرعي
   * @param subdomain النطاق الفرعي
   * @returns بيانات المتجر أو null
   */
  async getBySubdomain(subdomain: string): Promise<Store | null> {
    try {
      const q = query(
        collection(db, "stores"),
        where("subdomain", "==", subdomain),
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Store;
      }
      return null;
    } catch (error) {
      console.error("Error getting store by subdomain:", error);
      return null;
    }
  },

  /**
   * جلب متاجر المالك
   * @param ownerId معرف المالك
   * @returns قائمة المتاجر
   */
  async getByOwner(ownerId: string): Promise<Store[]> {
    try {
      const storesRef = collection(db, "stores");
      const q = query(storesRef, where("ownerId", "==", ownerId));
      const querySnapshot = await getDocs(q);

      const stores: Store[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stores.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Store);
      });

      return stores;
    } catch (error) {
      console.error("Error getting stores by owner:", error);
      return [];
    }
  },

  /**
   * تحديث بيانات المتجر
   * @param storeId معرف المتجر
   * @param data البيانات الجديدة
   */
  async update(storeId: string, data: Partial<Store>): Promise<void> {
    const cleanedData = cleanFirestoreData({
      ...data,
      updatedAt: new Date(),
    });

    await updateDoc(doc(db, "stores", storeId), cleanedData);
  },

  /**
   * حذف المتجر
   * @param storeId معرف المتجر
   */
  async delete(storeId: string): Promise<void> {
    await deleteDoc(doc(db, "stores", storeId));
  },

  /**
   * جلب جميع المتاجر (مع ترقيم الصفحات)
   * @param page رقم الصفحة
   * @param pageSize حجم الصفحة
   * @returns قائمة المتاجر
   */
  async getAll(): Promise<Store[]> {
    try {
      const storesRef = collection(db, "stores");
      const querySnapshot = await getDocs(storesRef);

      const stores: Store[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // دالة مساعدة لتحويل أي قيمة إلى Date
        const safeToDate = (value: any): Date => {
          if (!value) return new Date();

          if (typeof value === "string") {
            const date = new Date(value);
            return isNaN(date.getTime()) ? new Date() : date;
          }

          if (value.toDate && typeof value.toDate === "function") {
            return value.toDate();
          }

          if (value instanceof Date) {
            return value;
          }

          return new Date();
        };

        stores.push({
          id: doc.id,
          ...data,
          createdAt: safeToDate(data.createdAt),
          updatedAt: safeToDate(data.updatedAt),
        } as Store);
      });

      console.log(`✅ [STORE-SERVICE] Found ${stores.length} total stores`);
      return stores;
    } catch (error) {
      console.error("❌ Error getting all stores:", error);
      return [];
    }
  },

  /**
   * تحديث إعدادات الامتثال
   * @param storeId معرف المتجر
   * @param settings الإعدادات الجديدة
   */
  async updateComplianceSettings(
    storeId: string,
    settings: Partial<Store["complianceSettings"]>,
  ): Promise<void> {
    try {
      const store = await this.getById(storeId);
      if (!store) {
        throw new Error("المتجر غير موجود");
      }

      await updateDoc(doc(db, "stores", storeId), {
        complianceSettings: {
          ...store.complianceSettings,
          ...settings,
        },
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("❌ خطأ في تحديث إعدادات الامتثال:", error);
      throw error;
    }
  },

  /**
   * تحديث بيانات الاتصال مع المحافظة على المحافظة
   * @param storeId معرف المتجر
   * @param contactData بيانات الاتصال الجديدة
   */
  async updateContactWithGovernorate(
    storeId: string,
    contactData: Partial<Store["contact"]>,
  ): Promise<void> {
    try {
      const store = await this.getById(storeId);
      if (!store) {
        throw new Error("المتجر غير موجود");
      }

      await updateDoc(doc(db, "stores", storeId), {
        contact: {
          ...store.contact,
          ...contactData,
        },
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("❌ خطأ في تحديث بيانات الاتصال:", error);
      throw error;
    }
  },

  /**
   * تحديث المعلومات التجارية
   * @param storeId معرف المتجر
   * @param businessInfo المعلومات الجديدة
   */
  async updateBusinessInfo(
    storeId: string,
    businessInfo: {
      taxNumber?: string;
      commercialRegistration?: string;
    },
  ): Promise<void> {
    try {
      await updateDoc(doc(db, "stores", storeId), {
        ...businessInfo,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("❌ خطأ في تحديث المعلومات التجارية:", error);
      throw error;
    }
  },

  /**
   * تحديث إعدادات الدفع اليمنية
   * @param storeId معرف المتجر
   * @param paymentSettings إعدادات الدفع الجديدة
   */
  async updateYemeniPaymentSettings(
    storeId: string,
    paymentSettings: {
      mada?: boolean;
      mobileWallet?: boolean;
      bankInfo?: {
        bankName: string;
        accountNumber: string;
        accountName: string;
        iban?: string;
        swiftCode?: string;
      };
    },
  ): Promise<void> {
    try {
      const store = await this.getById(storeId);
      if (!store) {
        throw new Error("المتجر غير موجود");
      }

      await updateDoc(doc(db, "stores", storeId), {
        settings: {
          ...store.settings,
          payment: {
            ...store.settings.payment,
            ...paymentSettings,
          },
        },
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("❌ خطأ في تحديث إعدادات الدفع:", error);
      throw error;
    }
  },

  /**
   * تحديث إعدادات الشحن
   * @param storeId معرف المتجر
   * @param shippingConfig إعدادات الشحن الجديدة
   */
  async updateShippingConfig(
    storeId: string,
    shippingConfig: {
      zones?: ShippingZone[];
      methods?: ShippingMethod[];
    },
  ): Promise<void> {
    try {
      const store = await this.getById(storeId);
      if (!store) {
        throw new Error("المتجر غير موجود");
      }

      await updateDoc(doc(db, "stores", storeId), {
        settings: {
          ...store.settings,
          shipping: {
            ...store.settings.shipping,
            ...shippingConfig,
          },
        },
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("❌ خطأ في تحديث إعدادات الشحن:", error);
      throw error;
    }
  },

  /**
   * جلب متجر بواسطة معرف التاجر
   * @param merchantId معرف التاجر
   * @returns بيانات المتجر أو null
   */
  async getByMerchantId(merchantId: string): Promise<Store | null> {
    try {
      // ✅ استخدام الإصدار 9 بشكل صحيح
      const storesRef = collection(db, "stores");
      const q = query(storesRef, where("ownerId", "==", merchantId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const docSnap = querySnapshot.docs[0];
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Store;
    } catch (error) {
      console.error("Error getting store by merchant ID:", error);
      throw error;
    }
  },

  // ✅ إنشاء طلب متجر (دمج من store-approval-system)
  async createStoreApplication(
    applicationData: Omit<StoreApplication, "id" | "submittedAt">,
  ): Promise<string> {
    try {
      console.log("📝 [STORE] Creating store application...");

      const appRef = doc(collection(db, "storeApplications"));
      const applicationId = appRef.id;

      const completeApplication: StoreApplication = {
        ...applicationData,
        id: applicationId,
        submittedAt: Timestamp.now(),
      };

      await setDoc(appRef, {
        ...completeApplication,
        submittedAt: serverTimestamp(),
      });

      console.log("✅ [STORE] Store application created:", applicationId);
      return applicationId;
    } catch (error: any) {
      console.error("❌ [STORE] Error creating store application:", error);
      throw new Error(`فشل إنشاء طلب المتجر: ${error.message}`);
    }
  },

  // ✅ توليد نطاق فرعي فريد (دمج من adminService)
  generateSubdomain(storeName: string): string {
    if (!storeName?.trim()) {
      return `store-${Date.now().toString().slice(-6)}`;
    }

    // تنظيف الاسم: إزالة الرموز الخاصة، استبدال المسافات بشرطات
    const cleanName = storeName
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s]/g, "") // إزالة الرموز الخاصة
      .replace(/\s+/g, "-") // استبدال المسافات بشرطات
      .replace(/-+/g, "-") // إزالة الشرطات المكررة
      .substring(0, 20); // تحديد الطول

    const timestamp = Date.now().toString().slice(-4);
    return `${cleanName}-${timestamp}`;
  },
};

export const getStoreByOwnerId = async (
  ownerId: string,
): Promise<Store | null> => {
  const stores = await storeService.getByOwner(ownerId);
  return stores.length > 0 ? stores[0] : null;
};

/**
 * 🔍 التحقق من توفر النطاق الفرعي
 */
export const checkSubdomainAvailability = async (
  subdomain: string,
): Promise<boolean> => {
  try {
    if (!subdomain || subdomain.trim().length < 3) {
      return false;
    }

    // تنظيف النطاق
    const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");

    // التحقق من النطاقات المحجوزة
    const reservedSubdomains = [
      "admin",
      "dashboard",
      "api",
      "support",
      "blog",
      "help",
      "store",
      "shop",
      "merchant",
      "seller",
      "platform",
    ];

    if (reservedSubdomains.includes(cleanSubdomain)) {
      return false;
    }

    // التحقق من Firestore
    const q = query(
      collection(db, "stores"),
      where("subdomain", "==", cleanSubdomain),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // true إذا كان متاحًا
  } catch (error) {
    console.error("❌ خطأ في التحقق من النطاق الفرعي:", error);
    return false;
  }
};

export const createStore = storeService.create;
export const getStoreById = storeService.getById;
export const getStoreBySubdomain = storeService.getBySubdomain;
export const updateStore = storeService.update;
export const deleteStore = storeService.delete;
export const updateStoreComplianceSettings =
  storeService.updateComplianceSettings;
export const updateStoreBusinessActivities =
  storeService.updateBusinessActivities;
