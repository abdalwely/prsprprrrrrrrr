// Helper functions for user routing based on authentication state
import { shouldRedirectToPending, isMerchantApproved } from "./approval-check";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { storeService } from "./firestore";

// ✅ دالة جديدة تقرأ مباشرة من Firebase
export const getUserTypeFromFirebase = async (
  userId: string,
): Promise<string> => {
  try {
    if (!userId) {
      console.warn("⚠️ No userId provided");
      return "customer";
    }

    console.log("🔍 Fetching user data from Firebase for:", userId);
    const userDoc = await getDoc(doc(db, "users", userId));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("📊 User data from Firebase:", userData);
      const userType = userData?.userType || "customer";
      console.log("🎯 Determined user type:", userType);
      return userType;
    }

    console.warn("⚠️ User document not found in Firebase for userId:", userId);
    return "customer";
  } catch (error) {
    console.error("❌ Error reading from Firebase:", error);
    return "customer";
  }
};

export const getRedirectPath = async (userId?: string): Promise<string> => {
  if (!userId) {
    console.log("🔄 No userId, redirecting to customer dashboard");
    return "/customer/dashboard";
  }

  const actualUserType = await getUserTypeFromFirebase(userId);
  console.log("🔄 Determining redirect path for user type:", actualUserType);

  switch (actualUserType) {
    case "merchant":
      console.log("🎯 User is merchant, checking store status...");

      try {
        // ✅ تحقق من متاجر المستخدم
        const userStores = await storeService.getByOwner(userId);
        console.log("📊 User stores found:", userStores.length);

        if (userStores.length > 0) {
          const merchantStore = userStores[0];
          console.log("🏪 Store status:", merchantStore.status);

          // ✅ إذا كان المتجر pending، توجيه إلى StoreBuilder لإكمال الإعدادات
          if (merchantStore.status === "pending") {
            console.log("🔄 Store needs setup, redirecting to store builder");
            return "/merchant/store-builder";
          }

          // ✅ إذا كان المتجر active، توجيه إلى Dashboard
          if (merchantStore.status === "active") {
            console.log("✅ Active store, redirecting to dashboard");
            return "/merchant/dashboard";
          }
        }

        // ✅ الافتراضي: توجيه إلى store builder لإنشاء متجر جديد
        console.log("🔄 No store found, redirecting to store builder");
        return "/merchant/store-builder";
      } catch (error) {
        console.error("❌ Error checking store status:", error);
        console.log("🔄 Error fallback: redirecting to store builder");
        return "/merchant/store-builder";
      }

    case "customer":
      console.log("🛒 Customer, redirecting to dashboard");
      return "/customer/dashboard";

    case "admin":
      console.log("👑 Admin, redirecting to admin dashboard");
      return "/admin/dashboard";

    default:
      console.log("❓ Unknown user type, defaulting to customer");
      return "/customer/dashboard";
  }
};

export const redirectUserAfterLogin = async (
  navigate: any,
  location: any,
  userId?: string,
) => {
  try {
    console.log("🔀 Redirecting user with ID:", userId);
    console.log("📍 Starting redirect process...");
    const from =
      location.state?.from?.pathname || (await getRedirectPath(userId));

    console.log("🚀 Redirecting user after login:", {
      userId: userId,
      redirectTo: from,
      hasFromState: !!location.state?.from?.pathname,
    });

    navigate(from, { replace: true });
  } catch (error) {
    console.error("❌ Redirect failed:", error);
    // Fallback to customer dashboard
    navigate("/customer/dashboard", { replace: true });
  }
};
