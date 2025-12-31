import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from "firebase/auth";
import { ensureStoreCustomer, linkVisitorToCustomer } from "./multi-tenant";

/**
 * ✅ PROBLEM 2 SOLUTION: Get current store context from URL or state
 * Returns storeId if user is in a store-specific context
 */
function getCurrentStoreContext(): string | null {
  try {
    // Try from URL path
    const path = window.location.pathname;
    const match = path.match(/\/store\/([^\/]+)/);
    if (match) return match[1];

    // Try from localStorage
    const pendingStore = localStorage.getItem("pendingStoreInfo");
    if (pendingStore) {
      const storeData = JSON.parse(pendingStore);
      return storeData.storeId || storeData.id || null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * ✅ PROBLEM 2 SOLUTION: Redirect after authentication
 * Keeps user in the same store they logged in from
 */
function redirectAfterAuth(storeId: string | null): void {
  if (storeId) {
    // Store-specific redirect
    localStorage.removeItem("pendingStoreInfo");
    window.location.href = `/store/${storeId}`;
  } else {
    // Generic redirect (shouldn't happen for proper store context)
    window.location.href = "/";
  }
}

/**
 * ✅ Customer login with Firebase Auth
 * Supports optional storeId for store-aware redirect
 */
export const loginCustomer = async (
  email: string,
  password: string,
  storeId?: string,
): Promise<any> => {
  try {
    console.log("🔐 Logging in with Firebase Auth");

    // 1. Firebase Auth login
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    console.log("✅ Firebase login successful:", user.uid);

    // 2. Get store context (explicit param or from URL)
    const targetStoreId = storeId || getCurrentStoreContext();

    // 3. If in a store context, ensure customer record exists
    if (targetStoreId) {
      try {
        await ensureStoreCustomer(targetStoreId, user.uid);
        console.log("✅ Customer linked to store");

        // 4. Migrate guest data if exists
        const visitorKey = `visitor_${targetStoreId}`;
        const oldVisitorId = localStorage.getItem(visitorKey);

        if (oldVisitorId) {
          await linkVisitorToCustomer(
            targetStoreId,
            oldVisitorId,
            user.uid,
          );
          console.log("✅ Guest data migrated");
        }
      } catch (linkError) {
        console.warn("⚠️ Could not link customer:", linkError);
      }
    }

    // 5. ✅ PROBLEM 2 SOLUTION: Redirect to store after login
    redirectAfterAuth(targetStoreId);

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("❌ Login error:", error);

    let errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
    if (error.code === "auth/user-not-found") {
      errorMessage = "الحساب غير موجود";
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "كلمة المرور غير صحيحة";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "محاولات تسجيل دخول كثيرة. حاول لاحقاً";
    } else if (error.code === "auth/user-disabled") {
      errorMessage = "هذا الحساب معطل";
    }

    throw new Error(errorMessage);
  }
};

/**
 * ✅ Register new customer with Firebase Auth
 * Supports optional storeId for store-aware redirect
 */
export const registerCustomer = async (
  email: string,
  password: string,
  fullName: string,
  phone?: string,
  storeId?: string,
): Promise<any> => {
  try {
    console.log("📝 Creating account with Firebase Auth");

    // 1. Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // 2. Update profile with display name
    if (fullName.trim()) {
      await updateProfile(user, {
        displayName: fullName.trim(),
      });
    }

    console.log("✅ Firebase account created:", user.uid);

    // 3. Get store context
    const targetStoreId = storeId || getCurrentStoreContext();

    // 4. If in a store context, link customer to store
    if (targetStoreId) {
      try {
        await ensureStoreCustomer(targetStoreId, user.uid);
        console.log("✅ Customer linked to store");

        // 5. Migrate guest data if exists
        const visitorKey = `visitor_${targetStoreId}`;
        const oldVisitorId = localStorage.getItem(visitorKey);

        if (oldVisitorId) {
          await linkVisitorToCustomer(
            targetStoreId,
            oldVisitorId,
            user.uid,
          );
          console.log("✅ Guest data migrated");
        }
      } catch (linkError) {
        console.warn("⚠️ Could not link customer:", linkError);
      }
    }

    // 6. ✅ PROBLEM 2 SOLUTION: Redirect to store after signup
    redirectAfterAuth(targetStoreId);

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: fullName.trim(),
      },
    };
  } catch (error: any) {
    console.error("❌ Registration error:", error);

    let errorMessage = "حدث خطأ أثناء إنشاء الحساب";
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "البريد الإلكتروني مستخدم بالفعل";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "كلمة المرور ضعيفة (6 أحرف على الأقل)";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "البريد الإلكتروني غير صحيح";
    }

    throw new Error(errorMessage);
  }
};

/**
 * Reset password
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("❌ Password reset error:", error);

    let errorMessage = "حدث خطأ أثناء إرسال رابط إعادة التعيين";
    if (error.code === "auth/user-not-found") {
      errorMessage = "لا يوجد حساب بهذا البريد الإلكتروني";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "البريد الإلكتروني غير صحيح";
    }

    throw new Error(errorMessage);
  }
};

/**
 * Logout customer
 */
export const logoutCustomer = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("✅ Logged out");
  } catch (error) {
    console.error("❌ Logout error:", error);
    throw error;
  }
};

/**
 * Get current customer
 */
export function getCurrentCustomer(): {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
} | null {
  const user = auth.currentUser;
  return user
    ? {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || undefined,
      }
    : null;
}

/**
 * Check if customer is logged in
 */
export function isCustomerLoggedIn(): boolean {
  return !!auth.currentUser;
}

/**
 * Update customer profile
 */
export const updateCustomerProfile = async (
  displayName?: string,
  photoURL?: string,
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("لم يتم تسجيل الدخول");
    }

    await updateProfile(user, {
      displayName: displayName || user.displayName,
      photoURL: photoURL || user.photoURL,
    });

    console.log("✅ Profile updated");
  } catch (error) {
    console.error("❌ Profile update error:", error);
    throw error;
  }
};

/**
 * Get ID token
 */
export const getIdToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    return await user.getIdToken();
  } catch (error) {
    console.error("❌ Token error:", error);
    return null;
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChanged = (
  callback: (user: User | null) => void,
): (() => void) => {
  return auth.onAuthStateChanged(callback);
};
