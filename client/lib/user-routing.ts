import { storeService } from "./src/services/store";
import { authService } from "./src/services/auth/auth.service";

export const getRedirectPath = async (userId?: string): Promise<string> => {
  if (!userId) {
    console.log("🔄 [ROUTING] No userId, redirecting to customer dashboard");
    return "/customer/dashboard";
  }

  try {
    console.log("🧭 [ROUTING] Determining redirect path for user:", userId);

    // جلب بيانات المستخدم
    const userData = await authService.getUserData(userId);
    if (!userData) {
      console.log(
        "👤 [ROUTING] No user data found, defaulting to customer dashboard",
      );
      return "/customer/dashboard";
    }

    console.log("🎯 [ROUTING] User type:", userData.userType);

    switch (userData.userType) {
      case "merchant":
        console.log("🏪 [ROUTING] User is merchant, checking store status...");

        // جلب متاجر المستخدم
        const userStores = await storeService.getByOwner(userId);
        console.log(`📊 [ROUTING] User has ${userStores.length} stores`);

        if (userStores.length > 0) {
          const merchantStore = userStores[0];
          console.log("🏪 [ROUTING] Store status:", merchantStore.status);

          // إذا كان المتجر pending، توجيه إلى StoreBuilder لإكمال الإعدادات
          if (merchantStore.status === "pending") {
            console.log(
              "🔄 [ROUTING] Store needs setup, redirecting to store builder",
            );
            return "/merchant/store-builder";
          }

          // إذا كان المتجر active، توجيه إلى Dashboard
          if (merchantStore.status === "active") {
            console.log("✅ [ROUTING] Active store, redirecting to dashboard");
            return "/merchant/dashboard";
          }
        }

        // الافتراضي: توجيه إلى store builder لإنشاء متجر جديد
        console.log(
          "🔄 [ROUTING] No store found, redirecting to store builder",
        );
        return "/merchant/store-builder";

      case "customer":
        console.log("🛒 [ROUTING] Customer, redirecting to dashboard");
        return "/customer/dashboard";

      case "admin":
        console.log("👑 [ROUTING] Admin, redirecting to admin dashboard");
        return "/admin/dashboard";

      default:
        console.log("❓ [ROUTING] Unknown user type, defaulting to customer");
        return "/customer/dashboard";
    }
  } catch (error) {
    console.error("❌ [ROUTING] Error determining redirect path:", error);
    // Fallback to customer dashboard
    return "/customer/dashboard";
  }
};

export const redirectUserAfterLogin = async (
  navigate: any,
  location: any,
  userId?: string,
) => {
  try {
    console.log("🔀 [ROUTING] Redirecting user with ID:", userId);
    console.log("📍 [ROUTING] Starting redirect process...");

    const from =
      location.state?.from?.pathname || (await getRedirectPath(userId));

    console.log("🚀 [ROUTING] Redirecting user after login:", {
      userId: userId,
      redirectTo: from,
      hasFromState: !!location.state?.from?.pathname,
    });

    // حفظ حالة تسجيل الدخول للاستخدام في AuthContext
    sessionStorage.setItem("auth_just_logged_in", "true");
    sessionStorage.setItem("auth_redirect_path", from);

    // تأخير بسيط للتأكد من تحديث السياقات
    setTimeout(() => {
      navigate(from, { replace: true });
    }, 50);
  } catch (error) {
    console.error("❌ [ROUTING] Redirect failed:", error);
    // Fallback to customer dashboard
    navigate("/customer/dashboard", { replace: true });
  }
};
