// adminService.ts - مصحح بالكامل بدون تكرار
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  deleteDoc,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { storeService } from "./firestore";
import {
  EnhancedStoreTemplate,
  enhancedStoreTemplates,
} from "./enhanced-templates";

// تعريف واجهة بيانات Firestore - بدون تكرار
interface FirestoreApplicationData {
  id: string;

  // 🔹 بيانات التاجر
  merchantData?: {
    businessName: string;
    businessType: string;
    city: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;

    // النشاطات الفرعية
    subBusinessTypes?: string[];

    // معلومات إضافية
    userId?: string;
    address?: string;
    country?: string;
    postalCode?: string;
    emailVerified?: boolean;
  };

  merchantId?: string;

  // 🔹 إعدادات المتجر (من الطلب)
  settings?: {
    currency?: string;
    language?: string;
    timezone?: string;

    notifications?: {
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      smsNotifications?: boolean;
    };

    shipping?: {
      enabled?: boolean;
      freeShippingThreshold?: number;
      shippingCost?: number;
      defaultCost?: number;
      zones?: any[];
    };

    payment?: {
      cashOnDelivery?: boolean;
      bankTransfer?: boolean;
      creditCard?: boolean;
      paypal?: boolean;
      stripe?: boolean;
    };

    taxes?: {
      enabled: boolean;
      includeInPrice: boolean;
      rate: number;
    };
  };

  // 🔹 تكوين المتجر (الجزء الأساسي)
  storeConfig?: {
    // المعلومات الأساسية
    storeName?: string;
    templateId?: string;

    // التخصيصات (كل شيء في مكان واحد)
    customization?: {
      // الوصف والشعار ونوع الكيان
      storeDescription?: string;
      logo?: string;
      entityType?: string;

      // النطاقات
      subdomain?: string;
      customDomain?: string;
      industry?: string;

      // الألوان
      colors?: {
        primary?: string;
        secondary?: string;
        background?: string;
        text?: string;
      };

      // العلامة التجارية
      branding?: {
        tagline?: string;
        vision?: string;
        mission?: string;
        brandColors?: {
          primary?: string;
          secondary?: string;
          background?: string;
          text?: string;
        };
      };

      // الصفحات
      pages?: {
        about?: string;
        terms?: string;
        privacy?: string;
        returnPolicy?: string;
      };
    };
  };

  // 🔹 حالة الطلب
  status?: "pending" | "approved" | "rejected" | "in_review";
  submittedAt?: string;
  reviewedAt?: string;
  reviewerId?: string;
  reviewNotes?: string;
  storeId?: string;
}

// واجهة طلب المتجر المحدثة - بدون تكرار
export interface StoreApplication {
  id: string;

  merchantData: {
    businessName: string;
    businessType: string;
    city: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    subBusinessTypes?: string[];
    address?: string;
    emailVerified?: boolean;
    userId?: string;
    country?: string;
    postalCode?: string;
  };

  merchantId: string;

  // ⭐⭐ تبسيط storeConfig بدون storeDescription في المستوى العلوي
  storeConfig: {
    storeName: string;
    templateId: string;
    customization: {
      // الوصف هنا وليس في المستوى العلوي
      storeDescription?: string;
      logo?: string;
      entityType?: string;

      colors: {
        primary?: string;
        secondary?: string;
        background?: string;
        text?: string;
      };
      industry?: string;
    };
  };

  status: "pending" | "approved" | "rejected" | "in_review";
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  reviewNotes?: string;
  storeId?: string;
  selectedTemplate?: EnhancedStoreTemplate;
}

// أنواع جديدة للنظام الموحد
export interface AdminDashboardStats {
  totalStores: number;
  pendingApprovals: number;
  activeStores: number;
  suspendedStores: number;
  todayRegistrations: number;
  revenueToday: number;
  revenueMonth: number;
  topCategories: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
}

export interface ReviewAction {
  applicationId: string;
  action: "approve" | "reject" | "request_changes";
  notes: string;
  templateChanges?: Partial<EnhancedStoreTemplate>;
}

// دالة مساعدة لتحويل بيانات Firestore إلى StoreApplication
const mapFirestoreDataToApplication = (
  docId: string,
  data: FirestoreApplicationData,
): StoreApplication => {
  const merchantData = data.merchantData || {
    businessName: "",
    businessType: "retail",
    city: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    subBusinessTypes: [],
    address: "",
    emailVerified: false,
    userId: "",
    country: "",
    postalCode: "",
  };

  const storeConfig = data.storeConfig || {
    storeName: "",
    templateId: "modern-comprehensive",
    customization: {
      storeDescription: "",
      logo: "",
      entityType: "individual",
      colors: {},
    },
  };

  return {
    id: docId,
    merchantData: {
      ...merchantData,
      subBusinessTypes: merchantData.subBusinessTypes || [],
    },
    merchantId: data.merchantId || merchantData.userId || "",

    // ⭐⭐ التصحيح: storeDescription في customization فقط
    storeConfig: {
      storeName:
        storeConfig.storeName || merchantData.businessName || "متجر بدون اسم",
      templateId: storeConfig.templateId || "modern-comprehensive",
      customization: {
        colors: storeConfig.customization?.colors || {},
        industry: storeConfig.customization?.industry,
        storeDescription: storeConfig.customization?.storeDescription || "",
        logo: storeConfig.customization?.logo || "",
        entityType: storeConfig.customization?.entityType || "individual",
      },
    },

    status: data.status || "pending",
    submittedAt: data.submittedAt || new Date().toISOString(),
    reviewedAt: data.reviewedAt,
    reviewerId: data.reviewerId,
    reviewNotes: data.reviewNotes,
    storeId: data.storeId,
  };
};

export const adminService = {
  // === إحصائيات لوحة التحكم ===
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const stores = await storeService.getAll(1, 1000);
      const applications = await this.getStoreApplications();

      const totalStores = stores.length;
      const pendingApprovals = applications.filter(
        (app) => app.status === "pending",
      ).length;
      const activeStores = stores.filter(
        (store) => store.status === "active",
      ).length;
      const suspendedStores = stores.filter(
        (store) => store.status === "suspended",
      ).length;

      return {
        totalStores,
        pendingApprovals,
        activeStores,
        suspendedStores,
        todayRegistrations: 0,
        revenueToday: 0,
        revenueMonth: 0,
        topCategories: [],
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return {
        totalStores: 0,
        pendingApprovals: 0,
        activeStores: 0,
        suspendedStores: 0,
        todayRegistrations: 0,
        revenueToday: 0,
        revenueMonth: 0,
        topCategories: [],
      };
    }
  },

  // === جلب جميع طلبات المتاجر مع دمج القوالب ===
  async getStoreApplications(status?: string): Promise<StoreApplication[]> {
    try {
      let q;
      if (status && status !== "all") {
        q = query(
          collection(db, "storeApplications"),
          where("status", "==", status),
          orderBy("submittedAt", "desc"),
        );
      } else {
        q = query(
          collection(db, "storeApplications"),
          orderBy("submittedAt", "desc"),
        );
      }

      const querySnapshot = await getDocs(q);
      const applications: StoreApplication[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreApplicationData;
        const application = mapFirestoreDataToApplication(doc.id, data);

        // دمج القالب المختار
        if (application.storeConfig.templateId) {
          application.selectedTemplate =
            enhancedStoreTemplates.find(
              (t) => t.id === application.storeConfig.templateId,
            ) || undefined;
        }

        applications.push(application);
      });

      console.log(`📊 [ADMIN-SERVICE] تم جلب ${applications.length} طلب`);
      return applications;
    } catch (error) {
      console.error("Error getting store applications:", error);
      return [];
    }
  },

  // جلب طلبات في انتظار الموافقة فقط
  async getPendingApplications(): Promise<StoreApplication[]> {
    return this.getStoreApplications("pending");
  },

  // === الموافقة على طلب متجر - بدون تكرار ===
  async approveStoreApplication(
    applicationId: string,
    applicationData: StoreApplication,
    notes?: string,
  ): Promise<string> {
    try {
      console.log("✅ [ADMIN-APPROVE] بدء الموافقة على الطلب:", applicationId);

      // ⭐⭐ الخطوة 1: جلب البيانات الكاملة من Firestore (المصدر الوحيد)
      const appDoc = await getDoc(doc(db, "storeApplications", applicationId));
      if (!appDoc.exists()) {
        throw new Error("طلب المتجر غير موجود في Firestore");
      }

      const fullAppData = appDoc.data() as FirestoreApplicationData;

      // ⭐⭐ الخطوة 2: استخراج البيانات مرة واحدة فقط من المصدر الصحيح
      // 🔹 البيانات الأساسية
      const storeName =
        fullAppData.storeConfig?.storeName ||
        applicationData.storeConfig.storeName ||
        "متجر بدون اسم";

      const merchantId =
        fullAppData.merchantData?.userId ||
        fullAppData.merchantId ||
        applicationData.merchantId ||
        "";

      // 🔹 النشاطات
      const subBusinessTypes = fullAppData.merchantData?.subBusinessTypes || [];
      const businessType =
        fullAppData.merchantData?.businessType || "electronics";

      // 🔹 البيانات المطلوبة (الشعار، الوصف، العملة، نوع الكيان)
      const storeDescription =
        fullAppData.storeConfig?.customization?.storeDescription ||
        `متجر ${storeName}`;

      const logo = fullAppData.storeConfig?.customization?.logo || "";

      const currency = fullAppData.settings?.currency || "YER";

      const entityType =
        fullAppData.storeConfig?.customization?.entityType || "individual";

      console.log("📦 [ADMIN-APPROVE] البيانات المستخرجة من Firestore:", {
        storeName,
        merchantId,
        storeDescription,
        hasLogo: !!logo,
        currency,
        entityType,
        subBusinessTypes,
        businessType,
      });

      // ⭐⭐ الخطوة 3: التحقق من البيانات الأساسية
      if (!storeName.trim()) {
        throw new Error("لا يوجد اسم للمتجر");
      }
      if (!merchantId.trim()) {
        throw new Error("لا يوجد معرف للتاجر (merchantId)");
      }

      // ⭐⭐ الخطوة 4: تحديد القالب (مرة واحدة)
      const selectedTemplate =
        enhancedStoreTemplates.find(
          (t) =>
            t.id ===
            (fullAppData.storeConfig?.templateId ||
              applicationData.storeConfig.templateId),
        ) || enhancedStoreTemplates[0];

      console.log("🎨 [ADMIN-APPROVE] القالب المحدد:", selectedTemplate.id);

      // ⭐⭐ الخطوة 5: إنشاء تخصيص المتجر (بدون تكرار)
      const storeCustomization = {
        ...selectedTemplate.customization,

        // 🔹 البيانات الأساسية (مرة واحدة فقط)
        storeName,
        storeDescription,
        logo,
        entityType,
        subdomain: fullAppData.storeConfig?.customization?.subdomain || "",
        customDomain:
          fullAppData.storeConfig?.customization?.customDomain || "",

        // 🔹 النشاطات
        subBusinessTypes,
        primaryBusinessType: businessType,

        // 🔹 التخصيصات الأخرى
        branding: {
          ...selectedTemplate.customization.branding,
          brandName: storeName,
          brandDescription: {
            ar: storeDescription,
            en: storeDescription || `${storeName} Store`,
          },
          logo,
          tagline:
            fullAppData.storeConfig?.customization?.branding?.tagline || "",
          vision:
            fullAppData.storeConfig?.customization?.branding?.vision || "",
          mission:
            fullAppData.storeConfig?.customization?.branding?.mission || "",
        },
        colors: {
          ...selectedTemplate.customization.colors,
          ...fullAppData.storeConfig?.customization?.colors,
        },
        pages: {
          ...selectedTemplate.customization.pages,
          primaryBusinessType: businessType,
          ...fullAppData.storeConfig?.customization?.pages,
        },
      };

      // ⭐⭐ الخطوة 6: إنشاء payload المتجر (مركزية البيانات)
      // ⭐⭐ الخطوة 6: إنشاء payload المتجر (مركزية البيانات) - مصحح
      const storePayload = {
        ownerId: merchantId,
        name: storeName,

        // 🔹 البيانات الأساسية (مرجع واحد)
        description: storeDescription,
        logo: logo,

        // 🔹 النطاقات
        subdomain:
          fullAppData.storeConfig?.customization?.subdomain ||
          this.generateSubdomain(storeName),
        customDomain:
          fullAppData.storeConfig?.customization?.customDomain || "",

        // 🔹 القالب
        template: selectedTemplate.id,
        templateData: selectedTemplate,

        // 🔹 النشاطات
        industry: businessType,
        subBusinessTypes,
        primaryBusinessType: businessType,

        // 🔹 التصنيف والتخصيص
        category: selectedTemplate.category,
        customization: storeCustomization,

        // 🔹 الإعدادات - مصححة مع قيم افتراضية مطلوبة
        settings: {
          currency: currency,
          language: fullAppData.settings?.language || "ar",
          timezone: fullAppData.settings?.timezone || "Asia/Aden",
          notifications: {
            emailNotifications:
              fullAppData.settings?.notifications?.emailNotifications ?? true,
            pushNotifications:
              fullAppData.settings?.notifications?.pushNotifications ?? false,
            smsNotifications:
              fullAppData.settings?.notifications?.smsNotifications ?? false,
          },
          // ⭐⭐ إصلاح shipping مع قيم مطلوبة
          shipping: {
            enabled: fullAppData.settings?.shipping?.enabled ?? true,
            freeShippingThreshold:
              fullAppData.settings?.shipping?.freeShippingThreshold ?? 200,
            shippingCost: fullAppData.settings?.shipping?.shippingCost ?? 15,
            defaultCost: fullAppData.settings?.shipping?.defaultCost ?? 15,
            zones: fullAppData.settings?.shipping?.zones || [],
          },
          payment: {
            cashOnDelivery:
              fullAppData.settings?.payment?.cashOnDelivery ?? true,
            bankTransfer: fullAppData.settings?.payment?.bankTransfer ?? true,
            creditCard: fullAppData.settings?.payment?.creditCard ?? false,
            paypal: fullAppData.settings?.payment?.paypal ?? false,
            stripe: fullAppData.settings?.payment?.stripe ?? false,
          },
          taxes: fullAppData.settings?.taxes || {
            enabled: false,
            includeInPrice: false,
            rate: 0,
          },
        },

        // 🔹 معلومات الاتصال
        contact: {
          phone: fullAppData.merchantData?.phone || "",
          email: fullAppData.merchantData?.email || "",
          address: fullAppData.merchantData?.address || "",
          city: fullAppData.merchantData?.city || "",
          country: fullAppData.merchantData?.country || "Yemen",
          postalCode: fullAppData.merchantData?.postalCode || "",
        },

        // 🔹 البيانات الإدارية
        applicationId,
        approvedAt: new Date().toISOString(),
        approvedBy: "admin",

        status: "active" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // ⭐⭐ الخطوة 7: التحقق النهائي
      console.log("🔍 [ADMIN-CHECK] تحقق من نقل البيانات:", {
        source: "Firestore (storeApplications)",
        target: "storePayload",
        fields: {
          description: {
            source: storeDescription,
            target: storePayload.description,
          },
          logo: { source: !!logo, target: !!storePayload.logo },
          currency: {
            source: currency,
            target: storePayload.settings.currency,
          },
          entityType: {
            source: entityType,
            target: storePayload.customization.entityType,
          },
        },
      });

      // التحقق من البيانات المطلوبة
      console.log("🔍 [ADMIN-BEFORE-STORE] تحقق نهائي:", {
        subBusinessTypes: storePayload.subBusinessTypes,
        isArray: Array.isArray(storePayload.subBusinessTypes),
        length: storePayload.subBusinessTypes?.length || 0,
        descriptionExists: !!storePayload.description,
        logoExists: !!storePayload.logo,
        currencyValue: storePayload.settings.currency,
        entityTypeValue: storePayload.customization.entityType,
      });

      // ⭐⭐ إنشاء المتجر
      console.log("🛠️ [ADMIN-APPROVE] جاري إنشاء المتجر في Firestore...");
      const storeId = await storeService.create(storePayload);
      console.log("✅ [ADMIN-APPROVE] تم إنشاء المتجر بنجاح:", storeId);

      // ⭐⭐ تحديث حالة الطلب إلى approved مع حفظ النشاطات
      console.log("📝 [ADMIN-APPROVE] جاري تحديث حالة الطلب...");
      await updateDoc(doc(db, "storeApplications", applicationId), {
        status: "approved",
        reviewedAt: new Date().toISOString(),
        reviewedBy: "admin",
        reviewerId: "admin",
        reviewNotes:
          notes || `تم الموافقة على المتجر وإنشائه بنجاح (${storeId})`,
        storeId: storeId,
        activatedStoreId: storeId,
        templateApplied: selectedTemplate.id,

        // ⭐⭐ حفظ النشاطات الفرعية في الطلب
        "merchantData.subBusinessTypes": subBusinessTypes,
        "merchantData.businessType": businessType,

        // ⭐⭐ حفظ بيانات المتجر النهائية للرجوع إليها
        "finalStoreData.description": storeDescription,
        "finalStoreData.logo": logo,
        "finalStoreData.currency": currency,
        "finalStoreData.entityType": entityType,
        "finalStoreData.createdAt": new Date().toISOString(),
      });

      // ⭐⭐ تحديث حالة المستخدم
      console.log("👤 [ADMIN-APPROVE] جاري تحديث بيانات المستخدم...");
      if (merchantId) {
        await updateDoc(doc(db, "users", merchantId), {
          "storeId.isActive": true,
          "storeId.status": "active",
          "storeId.storeId": storeId,
          "storeId.name": storeName,
          "storeId.template": selectedTemplate.id,
          "storeId.updatedAt": new Date().toISOString(),

          // ⭐⭐ إضافة النشاطات إلى بيانات المستخدم
          "storeId.subBusinessTypes": subBusinessTypes,
          "storeId.primaryBusinessType": businessType,
          "storeId.industry": businessType,

          // ⭐⭐ بيانات المتجر النهائية
          "storeId.description": storeDescription,
          "storeId.logo": logo,
          "storeId.currency": currency,
          "storeId.entityType": entityType,
        });
      }

      // ⭐⭐ إنشاء وثيقة لتتبع القالب المطبق
      console.log("📋 [ADMIN-APPROVE] جاري حفظ تتبع القالب...");
      await addDoc(collection(db, "storeTemplatesApplied"), {
        storeId: storeId,
        templateId: selectedTemplate.id,
        applicationId: applicationId,
        appliedAt: new Date().toISOString(),
        appliedBy: "admin",
        customization: storeCustomization,
        subBusinessTypes: subBusinessTypes,
        primaryBusinessType: businessType,

        // ⭐⭐ البيانات المطلوبة
        storeDescription: storeDescription,
        logo: logo ? "موجود" : "غير موجود",
        currency: currency,
        entityType: entityType,
      });

      console.log("🎉 [ADMIN-APPROVE] تمت الموافقة بنجاح:", {
        applicationId,
        storeId,
        storeName,
        storeDescription: storePayload.description,
        hasLogo: !!storePayload.logo,
        currency: storePayload.settings.currency,
        entityType: storePayload.customization.entityType,
        subBusinessTypesCount: subBusinessTypes.length,
        businessType,
      });

      return storeId;
    } catch (error) {
      console.error("❌ [ADMIN-APPROVE] خطأ في الموافقة على المتجر:", {
        applicationId,
        error: error instanceof Error ? error.message : "خطأ غير معروف",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        `فشل في الموافقة على المتجر: ${error instanceof Error ? error.message : "خطأ غير معروف"}`,
      );
    }
  },

  // === رفض طلب متجر ===
  async rejectStoreApplication(
    applicationId: string,
    reason: string,
    adminId: string = "admin",
  ): Promise<void> {
    try {
      console.log("❌ [ADMIN-REJECT] رفض الطلب:", applicationId);
      await updateDoc(doc(db, "storeApplications", applicationId), {
        status: "rejected",
        reviewedAt: new Date().toISOString(),
        reviewerId: adminId,
        reviewNotes: reason,
        rejectionReason: reason,
      });
      console.log("✅ [ADMIN-REJECT] تم رفض الطلب بنجاح");
    } catch (error) {
      console.error("❌ [ADMIN-REJECT] خطأ في رفض الطلب:", error);
      throw new Error("فشل في رفض الطلب");
    }
  },

  // === إجراء مراجعة متقدمة ===
  async reviewStoreApplication(
    actionData: ReviewAction,
  ): Promise<StoreApplication> {
    try {
      console.log("🔍 [ADMIN-REVIEW] مراجعة الطلب:", actionData.applicationId);
      const applications = await this.getStoreApplications();
      const application = applications.find(
        (app) => app.id === actionData.applicationId,
      );

      if (!application) {
        throw new Error("الطلب غير موجود");
      }

      if (actionData.action === "approve") {
        await this.approveStoreApplication(
          actionData.applicationId,
          application,
          actionData.notes,
        );
      } else if (actionData.action === "reject") {
        await this.rejectStoreApplication(
          actionData.applicationId,
          actionData.notes,
        );
      }

      // جلب التطبيق المحدث
      const updatedApplications = await this.getStoreApplications();
      const updatedApp = updatedApplications.find(
        (app) => app.id === actionData.applicationId,
      );

      if (!updatedApp) {
        throw new Error("فشل في جلب التطبيق المحدث");
      }

      return updatedApp;
    } catch (error) {
      console.error("❌ [ADMIN-REVIEW] خطأ في مراجعة الطلب:", error);
      throw error;
    }
  },

  // === جلب طلب واحد ===
  async getStoreApplicationById(id: string): Promise<StoreApplication> {
    try {
      console.log("🔍 [ADMIN-GET] جلب الطلب:", id);
      const applications = await this.getStoreApplications();
      const application = applications.find((app) => app.id === id);

      if (!application) {
        throw new Error("الطلب غير موجود");
      }

      return application;
    } catch (error) {
      console.error("❌ [ADMIN-GET] خطأ في جلب الطلب:", error);
      throw error;
    }
  },

  // === حذف طلب متجر ===
  async deleteStoreApplication(applicationId: string): Promise<void> {
    try {
      console.log("🗑️ [ADMIN-DELETE] حذف الطلب:", applicationId);
      await deleteDoc(doc(db, "storeApplications", applicationId));
      console.log("✅ [ADMIN-DELETE] تم حذف الطلب بنجاح");
    } catch (error) {
      console.error("❌ [ADMIN-DELETE] خطأ في حذف الطلب:", error);
      throw new Error("فشل في حذف الطلب");
    }
  },

  // === جلب إحصائيات الطلبات ===
  async getApplicationsStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    try {
      console.log("📊 [ADMIN-STATS] جلب إحصائيات الطلبات");
      const applications = await this.getStoreApplications();

      const pending = applications.filter(
        (app) => app.status === "pending",
      ).length;
      const approved = applications.filter(
        (app) => app.status === "approved",
      ).length;
      const rejected = applications.filter(
        (app) => app.status === "rejected",
      ).length;

      console.log("📈 [ADMIN-STATS] النتائج:", {
        total: applications.length,
        pending,
        approved,
        rejected,
      });

      return {
        total: applications.length,
        pending,
        approved,
        rejected,
      };
    } catch (error) {
      console.error("❌ [ADMIN-STATS] خطأ في جلب الإحصائيات:", error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      };
    }
  },

  // === توليد نطاق فرعي فريد ===
  generateSubdomain(storeName: string): string {
    if (!storeName) {
      return `store-${Date.now().toString().slice(-6)}`;
    }

    const cleanName = storeName
      .replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();

    const timestamp = Date.now().toString().slice(-4);
    return `${cleanName}-${timestamp}`.substring(0, 30);
  },

  // === التحقق من توفر النطاق الفرعي ===
  async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    try {
      console.log("🔗 [ADMIN-CHECK] التحقق من النطاق:", subdomain);
      const stores = await storeService.getAll(1, 1000);
      const available = !stores.some((store) => store.subdomain === subdomain);
      console.log("✅ [ADMIN-CHECK] النطاق متاح:", available);
      return available;
    } catch (error) {
      console.error("❌ [ADMIN-CHECK] خطأ في التحقق من النطاق:", error);
      return false;
    }
  },

  // === الحصول على القوالب ===
  async getStoreTemplates(): Promise<EnhancedStoreTemplate[]> {
    console.log("🎨 [ADMIN-TEMPLATES] جلب القوالب");
    return enhancedStoreTemplates;
  },

  async getTemplateById(
    templateId: string,
  ): Promise<EnhancedStoreTemplate | null> {
    console.log("🔍 [ADMIN-TEMPLATE] جلب القالب:", templateId);
    const template =
      enhancedStoreTemplates.find((t) => t.id === templateId) || null;
    console.log("✅ [ADMIN-TEMPLATE] تم العثور على القالب:", !!template);
    return template;
  },
};

export default adminService;
