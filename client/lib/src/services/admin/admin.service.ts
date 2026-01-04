import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  addDoc,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";
import {
  AdminDashboardStats,
  ReviewAction,
  StoreApplication,
} from "../../types/store.types";
import {
  checkSubdomainAvailability,
  storeService,
} from "../store/store.service";

// ============================================
// 👑 خدمة الإدارة الموحدة (دمج adminService و store-approval-system)
// ============================================

export const adminService = {
  // ✅ جلب طلبات المتاجر (دمج من adminService و store-approval-system)
  async getStoreApplications(status?: string): Promise<StoreApplication[]> {
    try {
      console.log(
        "📋 [ADMIN] Getting store applications, status:",
        status || "all",
      );

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
        // ✅ الحل: تحديد نوع البيانات
        const data = doc.data() as Record<string, any>;

        // ✅ بناء تطبيق متجر كامل (دمج الهياكل)
        const application: StoreApplication = {
          id: doc.id,
          merchantId: data.merchantId || data.ownerId || "",

          merchantData: {
            firstName: data.merchantData?.firstName || data.firstName || "",
            lastName: data.merchantData?.lastName || data.lastName || "",
            email: data.merchantData?.email || data.email || "",
            phone: data.merchantData?.phone || data.phone || "",
            city: data.merchantData?.city || data.city || "",
            address: data.merchantData?.address || data.address || "",
            businessName:
              data.merchantData?.businessName || data.businessName || "",
            businessType:
              data.merchantData?.businessType || data.businessType || "retail",
            subBusinessTypes:
              data.merchantData?.subBusinessTypes ||
              data.subBusinessTypes ||
              [],
            emailVerified:
              data.merchantData?.emailVerified || data.emailVerified || false,
          },

          storeConfig: {
            storeName:
              data.storeConfig?.storeName ||
              data.storeName ||
              data.businessName ||
              "متجر بدون اسم",
            templateId:
              data.storeConfig?.templateId ||
              data.template ||
              "modern-comprehensive",

            customization: {
              storeDescription:
                data.storeConfig?.customization?.storeDescription ||
                data.description ||
                `متجر ${data.storeConfig?.storeName || data.businessName}`,
              logo: data.storeConfig?.customization?.logo || data.logo || "",
              entityType:
                data.storeConfig?.customization?.entityType || "individual",
              colors:
                data.storeConfig?.customization?.colors || data.colors || {},
              subdomain:
                data.storeConfig?.customization?.subdomain ||
                data.subdomain ||
                "",
              customDomain:
                data.storeConfig?.customization?.customDomain ||
                data.customDomain ||
                "",
              industry:
                data.storeConfig?.customization?.industry ||
                data.industry ||
                "retail",
            },
          },

          settings: data.settings || {
            currency: data.currency || "YER",
            language: data.language || "ar",
            shipping: {
              enabled: data.shipping?.enabled ?? false,
              freeShippingThreshold: data.shipping?.freeShippingThreshold ?? 0,
              shippingCost: data.shipping?.shippingCost ?? 0,
            },
            payment: {
              cashOnDelivery: data.payment?.cashOnDelivery ?? true,
              bankTransfer: data.payment?.bankTransfer ?? false,
              creditCard: data.payment?.creditCard ?? false,
            },
          },

          status:
            (data.status as
              | "pending"
              | "approved"
              | "rejected"
              | "in_review") || "pending",
          submittedAt: data.submittedAt || Timestamp.now(),
          reviewedAt: data.reviewedAt,
          reviewedBy: data.reviewedBy || data.reviewerId,
          notes: data.notes || data.reviewNotes,
          rejectionReason: data.rejectionReason,
          convertedStoreId: data.storeId,
        };

        applications.push(application);
      });

      console.log(`✅ [ADMIN] Found ${applications.length} store applications`);
      return applications;
    } catch (error) {
      console.error("❌ [ADMIN] Error getting store applications:", error);
      return [];
    }
  },

  // ✅ الموافقة على طلب متجر (دمج كامل مع تحسينات)
  async approveStoreApplication(
    applicationId: string,
    notes?: string,
  ): Promise<string> {
    try {
      console.log("✅ [ADMIN] Approving store application:", applicationId);

      // 1. جلب الطلب
      const applications = await this.getStoreApplications();
      const application = applications.find((app) => app.id === applicationId);

      if (!application) {
        throw new Error("طلب المتجر غير موجود");
      }

      console.log("📋 [ADMIN] Application data:", {
        merchantId: application.merchantId,
        storeName: application.storeConfig.storeName,
        businessType: application.merchantData.businessType,
        subBusinessTypes: application.merchantData.subBusinessTypes,
      });

      // 2. التحقق من البيانات الأساسية
      if (!application.merchantData.email) {
        throw new Error("البريد الإلكتروني مطلوب");
      }

      if (!application.storeConfig.storeName?.trim()) {
        throw new Error("اسم المتجر مطلوب");
      }

      // 3. إنشاء المتجر
      const storeId = await storeService.create({
        ownerId: application.merchantId,
        name: application.storeConfig.storeName,
        description:
          application.storeConfig.customization.storeDescription ||
          `متجر ${application.storeConfig.storeName}`,
        logo: application.storeConfig.customization.logo || "",
        subdomain:
          application.storeConfig.customization.subdomain ||
          storeService.generateSubdomain(application.storeConfig.storeName),
        customDomain: application.storeConfig.customization.customDomain || "",
        template: application.storeConfig.templateId,
        industry: application.merchantData.businessType,

        // ✅ حفظ النشاطات التجارية (لم تكن تُحفظ في النظام القديم)
        businessActivities: {
          mainActivity: application.merchantData.businessType,
          subActivities: application.merchantData.subBusinessTypes || [],
          registrationNumber: "",
          issueDate: undefined,
        },

        settings: {
          currency: application.settings?.currency || "YER",
          language: application.settings?.language || "ar",
          timezone: application.settings?.timezone || "Asia/Aden",

          shipping: {
            enabled: application.settings?.shipping?.enabled ?? true,
            freeShippingThreshold:
              application.settings?.shipping?.freeShippingThreshold ?? 0,
            shippingCost: application.settings?.shipping?.shippingCost ?? 0,
          },

          payment: {
            cashOnDelivery:
              application.settings?.payment?.cashOnDelivery ?? true,
            bankTransfer: application.settings?.payment?.bankTransfer ?? true,
            creditCard: application.settings?.payment?.creditCard ?? false,
          },
        },

        contact: {
          phone: application.merchantData.phone || "",
          email: application.merchantData.email,
          address: application.merchantData.address || "",
          city: application.merchantData.city || "",
          country: "Yemen",
        },

        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 4. تحديث حالة الطلب
      await updateDoc(doc(db, "storeApplications", applicationId), {
        status: "approved",
        reviewedAt: Timestamp.now(),
        reviewerId: "admin",
        reviewNotes: notes || `تمت الموافقة وإنشاء المتجر ${storeId}`,
        storeId: storeId,
        approvedAt: Timestamp.now(),
      });

      // 5. تحديث بيانات المستخدم (ربط المتجر)
      if (application.merchantId) {
        try {
          await updateDoc(doc(db, "users", application.merchantId), {
            storeId: storeId,
            userType: "merchant",
            updatedAt: new Date(),
          });
          console.log("👤 [ADMIN] User updated with store ID");
        } catch (userError) {
          console.warn("⚠️ [ADMIN] Could not update user data:", userError);
        }
      }

      console.log("🎉 [ADMIN] Store approved and created successfully:", {
        applicationId,
        storeId,
        storeName: application.storeConfig.storeName,
        subBusinessTypes:
          application.merchantData.subBusinessTypes?.length || 0,
      });

      return storeId;
    } catch (error: any) {
      console.error("❌ [ADMIN] Error approving store application:", error);
      throw new Error(`فشل في الموافقة على المتجر: ${error.message}`);
    }
  },

  // ✅ رفض طلب متجر (دمج من adminService و store-approval-system)
  async rejectStoreApplication(
    applicationId: string,
    reason: string,
    adminId: string = "admin",
  ): Promise<void> {
    try {
      console.log("❌ [ADMIN] Rejecting store application:", applicationId);

      await updateDoc(doc(db, "storeApplications", applicationId), {
        status: "rejected",
        reviewedAt: Timestamp.now(),
        reviewerId: adminId,
        reviewNotes: reason,
        rejectionReason: reason,
      });

      console.log("✅ [ADMIN] Application rejected successfully");
    } catch (error: any) {
      console.error("❌ [ADMIN] Error rejecting application:", error);
      throw new Error(`فشل في رفض الطلب: ${error.message}`);
    }
  },

  // ✅ جلب إحصائيات لوحة التحكم (دمج من adminService)
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      console.log("📊 [ADMIN] Getting dashboard stats...");

      const stores = await storeService.getAll();
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

      const stats: AdminDashboardStats = {
        totalStores,
        pendingApprovals,
        activeStores,
        suspendedStores,
        todayRegistrations: 0, // يمكن إضافة منطق حسابي لاحقاً
        revenueToday: 0,
        revenueMonth: 0,
        topCategories: [],
      };

      console.log("✅ [ADMIN] Dashboard stats:", stats);
      return stats;
    } catch (error) {
      console.error("❌ [ADMIN] Error getting dashboard stats:", error);
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

  // ✅ جلب طلب واحد بواسطة المعرف (دمج من store-approval-system)
  async getStoreApplicationById(id: string): Promise<StoreApplication | null> {
    try {
      console.log("🔍 [ADMIN] Getting store application by ID:", id);

      const applications = await this.getStoreApplications();
      const application = applications.find((app) => app.id === id);

      if (!application) {
        console.log("📭 [ADMIN] Store application not found:", id);
        return null;
      }

      console.log(
        "✅ [ADMIN] Found store application:",
        application.storeConfig.storeName,
      );
      return application;
    } catch (error) {
      console.error("❌ [ADMIN] Error getting store application by ID:", error);
      return null;
    }
  },

  // ✅ حذف طلب متجر (دمج من adminService)
  async deleteStoreApplication(applicationId: string): Promise<void> {
    try {
      console.log("🗑️ [ADMIN] Deleting store application:", applicationId);

      await deleteDoc(doc(db, "storeApplications", applicationId));

      console.log("✅ [ADMIN] Store application deleted successfully");
    } catch (error: any) {
      console.error("❌ [ADMIN] Error deleting store application:", error);
      throw new Error(`فشل في حذف الطلب: ${error.message}`);
    }
  },

  // ✅ جلب إحصائيات الطلبات (دمج من store-approval-system)
  async getApplicationsStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    try {
      console.log("📈 [ADMIN] Getting applications statistics");

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

      const stats = {
        total: applications.length,
        pending,
        approved,
        rejected,
      };

      console.log("✅ [ADMIN] Applications stats:", stats);
      return stats;
    } catch (error) {
      console.error("❌ [ADMIN] Error getting applications stats:", error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      };
    }
  },

  // ✅ مراجعة متقدمة لتطبيق المتجر (دمج من adminService)
  async reviewStoreApplication(
    actionData: ReviewAction,
  ): Promise<StoreApplication> {
    try {
      console.log(
        "🔍 [ADMIN] Reviewing store application:",
        actionData.applicationId,
      );

      const application = await this.getStoreApplicationById(
        actionData.applicationId,
      );

      if (!application) {
        throw new Error("الطلب غير موجود");
      }

      // تنفيذ الإجراء المطلوب
      if (actionData.action === "approve") {
        await this.approveStoreApplication(
          actionData.applicationId,
          actionData.notes,
        );
      } else if (actionData.action === "reject") {
        await this.rejectStoreApplication(
          actionData.applicationId,
          actionData.notes,
        );
      } else if (actionData.action === "request_changes") {
        await updateDoc(
          doc(db, "storeApplications", actionData.applicationId),
          {
            status: "pending",
            reviewNotes: actionData.notes,
            reviewedAt: Timestamp.now(),
            reviewerId: "admin",
          },
        );
      }

      // جلب التطبيق المحدث
      const updatedApplication = await this.getStoreApplicationById(
        actionData.applicationId,
      );

      if (!updatedApplication) {
        throw new Error("فشل في جلب التطبيق المحدث");
      }

      console.log("✅ [ADMIN] Review completed successfully");
      return updatedApplication;
    } catch (error: any) {
      console.error("❌ [ADMIN] Error reviewing store application:", error);
      throw error;
    }
  },

  // ✅ التحقق من توفر النطاق الفرعي (دمج من adminService)
  async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    return checkSubdomainAvailability(subdomain);
  },

  // ✅ توليد نطاق فرعي فريد (دمج من adminService)
  generateSubdomain(storeName: string): string {
    return storeService.generateSubdomain(storeName);
  },

  // ✅ جلب قوالب المتاجر (دمج من adminService)
  async getStoreTemplates(): Promise<any[]> {
    // قوالب افتراضية (يمكن استبدالها بقوالب حقيقية)
    const defaultTemplates = [
      {
        id: "modern-comprehensive",
        name: "Modern Comprehensive",
        category: "general",
        description: "قالب عصري شامل لجميع أنواع المتاجر",
        customization: {
          colors: {
            primary: "#FF6B35",
            secondary: "#4A90E2",
            background: "#FFFFFF",
            text: "#333333",
          },
        },
      },
      {
        id: "classic-elegant",
        name: "Classic Elegant",
        category: "fashion",
        description: "قالب كلاسيكي أنيق للمتاجر الفاخرة",
        customization: {
          colors: {
            primary: "#2C3E50",
            secondary: "#E74C3C",
            background: "#F9F9F9",
            text: "#34495E",
          },
        },
      },
    ];

    return defaultTemplates;
  },

  // ✅ جلب قالب بواسطة المعرف (دمج من adminService)
  async getTemplateById(templateId: string): Promise<any | null> {
    const templates = await this.getStoreTemplates();
    return templates.find((t) => t.id === templateId) || null;
  },

  // ✅ إنشاء متجر تطوير (دالة جديدة لدعم التطوير)
  async initializeDevStore(
    ownerId: string,
    storeName: string,
  ): Promise<string> {
    if (process.env.NODE_ENV !== "development") {
      throw new Error("This function is only available in development mode");
    }

    try {
      console.log(
        "🔧 [ADMIN-DEV] Initializing development store for:",
        ownerId,
      );

      const storeId = await storeService.create({
        ownerId,
        name: storeName,
        description: "متجر تطويري للاختبار والتصحيح",
        logo: "",
        subdomain: `dev-${ownerId.slice(0, 8)}`,
        customDomain: "",
        template: "modern-comprehensive",
        industry: "development",

        businessActivities: {
          mainActivity: "development",
          subActivities: ["testing", "debugging", "development"],
          registrationNumber: "",
          issueDate: undefined,
        },

        settings: {
          currency: "YER",
          language: "ar",
          timezone: "Asia/Aden",
          shipping: {
            enabled: true,
            freeShippingThreshold: 0,
            shippingCost: 0,
          },
          payment: {
            cashOnDelivery: true,
            bankTransfer: true,
            creditCard: false,
          },
        },

        contact: {
          phone: "+967770000000",
          email: "dev@example.com",
          address: "عنوان تطويري",
          city: "صنعاء",
          country: "Yemen",
        },

        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ [ADMIN-DEV] Development store initialized: ${storeId}`);
      return storeId;
    } catch (error: any) {
      console.error("❌ [ADMIN-DEV] Error initializing dev store:", error);
      throw error;
    }
  },
};

export default adminService;
