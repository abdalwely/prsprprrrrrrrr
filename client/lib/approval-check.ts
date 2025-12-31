// // نظام التحقق من حالة الموافقة - محدث
// import { getStoreApplicationByMerchantId } from "./store-approval-system";

// export const checkMerchantApproval = async (
//   userId: string,
// ): Promise<{ status: string; storeId?: string; applicationId?: string }> => {
//   try {
//     console.log("🔍 [CHECK] جاري التحقق من موافقة التاجر:", userId);

//     // ✅ التحقق من طلب المتجر
//     const application = await getStoreApplicationByMerchantId(userId);

//     if (application) {
//       console.log("📊 [CHECK] تم العثور على طلب المتجر:", {
//         applicationId: application.id,
//         status: application.status,
//         storeName: application.storeConfig.customization.storeName,
//         activatedStoreId: application.activatedStoreId,
//         hasStoreId: !!application.activatedStoreId,
//       });

//       return {
//         status: application.status,
//         storeId: application.activatedStoreId,
//         applicationId: application.id,
//       };
//     }

//     console.log("📝 [CHECK] لا يوجد طلب متجر للمستخدم:", userId);
//     return { status: "no_application" };
//   } catch (error) {
//     console.error("❌ [CHECK] خطأ في التحقق من موافقة التاجر:", error);
//     return { status: "error" };
//   }
// };

// export const shouldRedirectToPending = async (
//   userId: string,
// ): Promise<boolean> => {
//   try {
//     console.log("🔄 [REDIRECT] التحقق من التوجيه للمستخدم:", userId);

//     const currentPath = window.location.pathname;
//     console.log("📍 [REDIRECT] المسار الحالي:", currentPath);

//     // ⭐⭐ صفحات لا يتم التوجيه فيها
//     const allowedPaths = [
//       "/signup",
//       "/login",
//       "/verify-email",
//       "/forgot-password",
//       "/application-status",
//       "/create-store",
//       "/merchant/dashboard",
//       "/store-builder",
//     ];

//     const isAllowedPath = allowedPaths.some(
//       (path) => currentPath.includes(path) || currentPath === path,
//     );

//     if (isAllowedPath) {
//       console.log("🔒 [REDIRECT] المستخدم في صفحة مسموحة - لا توجيه");
//       return false;
//     }

//     // التحقق من حالة الموافقة
//     const approval = await checkMerchantApproval(userId);
//     console.log("📋 [REDIRECT] حالة الموافقة:", approval);

//     // ✅ إذا لم يكن هناك طلب، لا توجيه
//     if (approval.status === "no_application") {
//       console.log("🎯 [REDIRECT] لا يوجد طلب - لا توجيه");
//       return false;
//     }

//     // ✅ فقط إذا كان الحالة "pending" أو "under_review"
//     const shouldRedirect =
//       approval.status === "pending" || approval.status === "under_review";

//     console.log("🎯 [REDIRECT] هل يجب التوجيه؟", {
//       shouldRedirect,
//       status: approval.status,
//       currentPath,
//     });

//     return shouldRedirect;
//   } catch (error) {
//     console.error("❌ [REDIRECT] خطأ في shouldRedirectToPending:", error);
//     return false;
//   }
// };

// export const isMerchantApproved = async (
//   userId: string,
// ): Promise<{
//   approved: boolean;
//   storeId?: string;
//   applicationId?: string;
// }> => {
//   try {
//     const approval = await checkMerchantApproval(userId);

//     console.log("✅ [APPROVED] تحقق من الموافقة:", {
//       status: approval.status,
//       storeId: approval.storeId,
//       userId,
//     });

//     // ⭐⭐ شرط جديد: يجب أن يكون approved وله storeId
//     const isApproved =
//       approval.status === "approved" &&
//       !!approval.storeId &&
//       approval.storeId !== "undefined";

//     return {
//       approved: isApproved,
//       storeId: approval.storeId,
//       applicationId: approval.applicationId,
//     };
//   } catch (error) {
//     console.error("❌ [APPROVED] خطأ في isMerchantApproved:", error);
//     return { approved: false };
//   }
// };

// // ⭐⭐ دالة جديدة: الحصول على رابط لوحة التحكم
// export const getMerchantDashboardPath = async (
//   userId: string,
// ): Promise<string | null> => {
//   try {
//     const approval = await isMerchantApproved(userId);

//     if (approval.approved && approval.storeId) {
//       const dashboardPath = `/merchant/dashboard/${approval.storeId}`;
//       console.log("🚀 [DASHBOARD] مسار لوحة التحكم:", dashboardPath);
//       return dashboardPath;
//     }

//     return null;
//   } catch (error) {
//     console.error("❌ [DASHBOARD] خطأ في getMerchantDashboardPath:", error);
//     return null;
//   }
// };

// approval-check.ts - الإصدار المحدث
import { getStoreApplicationByMerchantId } from "./store-approval-system";

export const checkMerchantApproval = async (
  userId: string,
): Promise<{ status: string; storeId?: string; applicationId?: string }> => {
  try {
    console.log("🔍 [CHECK] جاري التحقق من موافقة التاجر:", userId);

    // ✅ استخدم any للتفادي من مشاكل النوع
    const application: any = await getStoreApplicationByMerchantId(userId);

    if (application) {
      console.log("📊 [CHECK] تم العثور على طلب المتجر:", {
        applicationId: application.id,
        status: application.status,
        storeName: application.name || "بدون اسم",
        storeId: application.id, // ⭐ استخدم id بدلاً من activatedStoreId
      });

      // ⭐ استخدام customization بدلاً من storeConfig
      const storeConfig = application.customization || {};

      return {
        status: application.status || "pending",
        storeId: application.id, // ⭐ استخدم id بدلاً من activatedStoreId
        applicationId: application.id,
      };
    }

    console.log("📝 [CHECK] لا يوجد طلب متجر للمستخدم:", userId);
    return { status: "no_application" };
  } catch (error) {
    console.error("❌ [CHECK] خطأ في التحقق من موافقة التاجر:", error);
    return { status: "error" };
  }
};

export const shouldRedirectToPending = async (
  userId: string,
): Promise<boolean> => {
  try {
    console.log("🔄 [REDIRECT] التحقق من التوجيه للمستخدم:", userId);

    const currentPath = window.location.pathname;
    console.log("📍 [REDIRECT] المسار الحالي:", currentPath);

    // ⭐⭐ صفحات لا يتم التوجيه فيها
    const allowedPaths = [
      "/signup",
      "/login",
      "/verify-email",
      "/forgot-password",
      "/application-status",
      "/create-store",
      "/merchant/dashboard",
      "/store-builder",
    ];

    const isAllowedPath = allowedPaths.some(
      (path) => currentPath.includes(path) || currentPath === path,
    );

    if (isAllowedPath) {
      console.log("🔒 [REDIRECT] المستخدم في صفحة مسموحة - لا توجيه");
      return false;
    }

    // التحقق من حالة الموافقة
    const approval = await checkMerchantApproval(userId);
    console.log("📋 [REDIRECT] حالة الموافقة:", approval);

    // ✅ إذا لم يكن هناك طلب، لا توجيه
    if (approval.status === "no_application") {
      console.log("🎯 [REDIRECT] لا يوجد طلب - لا توجيه");
      return false;
    }

    // ✅ فقط إذا كان الحالة "pending" أو "under_review"
    const shouldRedirect =
      approval.status === "pending" || approval.status === "under_review";

    console.log("🎯 [REDIRECT] هل يجب التوجيه؟", {
      shouldRedirect,
      status: approval.status,
      currentPath,
    });

    return shouldRedirect;
  } catch (error) {
    console.error("❌ [REDIRECT] خطأ في shouldRedirectToPending:", error);
    return false;
  }
};

export const isMerchantApproved = async (
  userId: string,
): Promise<{
  approved: boolean;
  storeId?: string;
  applicationId?: string;
}> => {
  try {
    const approval = await checkMerchantApproval(userId);

    console.log("✅ [APPROVED] تحقق من الموافقة:", {
      status: approval.status,
      storeId: approval.storeId,
      userId,
    });

    // ⭐⭐ شرط جديد: يجب أن يكون approved وله storeId
    const isApproved = approval.status === "approved" && !!approval.storeId;

    return {
      approved: isApproved,
      storeId: approval.storeId,
      applicationId: approval.applicationId,
    };
  } catch (error) {
    console.error("❌ [APPROVED] خطأ في isMerchantApproved:", error);
    return { approved: false };
  }
};

// ⭐⭐ دالة جديدة: الحصول على رابط لوحة التحكم
export const getMerchantDashboardPath = async (
  userId: string,
): Promise<string | null> => {
  try {
    const approval = await isMerchantApproved(userId);

    if (approval.approved && approval.storeId) {
      const dashboardPath = `/merchant/dashboard/${approval.storeId}`;
      console.log("🚀 [DASHBOARD] مسار لوحة التحكم:", dashboardPath);
      return dashboardPath;
    }

    return null;
  } catch (error) {
    console.error("❌ [DASHBOARD] خطأ في getMerchantDashboardPath:", error);
    return null;
  }
};
