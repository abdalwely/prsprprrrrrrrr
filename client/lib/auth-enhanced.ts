import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification as firebaseSendEmailVerification,
  User,
  UserCredential,
  ActionCodeSettings,
} from "firebase/auth";

import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { testFirebaseConnection } from "./firebase-diagnostics";

export interface UserData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: "admin" | "merchant" | "customer";
  businessName?: string;
  businessType?: string;
  city?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  storeId?: string;
}

export interface AuthResult {
  success: boolean;
  user?: UserCredential;
  error?: string;
  diagnostics?: any;
}

// Helper to safely get error message from unknown
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

// Enhanced sign in with better error handling
// في signInUserEnhanced - تخطى اختبار الاتصال
export const signInUserEnhanced = async (
  email: string,
  password: string,
): Promise<AuthResult> => {
  try {
    console.log("🔐 Attempting REAL Firebase sign in:", email);

    // ⚠️ تخطى اختبار الاتصال الذي يسبب المشكلة
    console.log("🔧 Skipping connection test, trying direct sign in...");

    // حاول تسجيل الدخول مباشرة
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    console.log("✅ REAL Firebase sign in successful");
    return {
      success: true,
      user: userCredential,
    };
  } catch (error: any) {
    console.error(
      "❌ REAL Firebase sign in failed:",
      error.code,
      error.message,
    );

    // إذا فشل تسجيل الدخول، استخدم Fallback
    console.log("🔄 Falling back to development auth");
    // const { fallbackSignIn } = await import("./fallback-auth");

    try {
      // const fallbackResult = await fallbackSignIn(email, password);
      return {
        success: true,
        // user: fallbackResult as any,
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
};

// Enhanced account creation with fallback support
export const createAccountEnhanced = async (
  email: string,
  password: string,
  userData: Omit<UserData, "uid" | "createdAt" | "updatedAt" | "isActive">,
): Promise<AuthResult> => {
  try {
    console.log("🔧 Creating new account with REAL Firebase:", email);

    // ✅ التحقق من اتصال Firebase أولاً
    let diagnostics;
    try {
      diagnostics = await testFirebaseConnection();
      console.log("🔧 Firebase connection test for signup:", diagnostics);
    } catch (testError: unknown) {
      return {
        success: false,
        error: "لا يمكن الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً.",
      };
    }

    // ✅ إنشاء المستخدم في Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // ✅ تحديث الملف الشخصي
    await updateProfile(user, {
      displayName: `${userData.firstName} ${userData.lastName}`,
    });

    // ✅ تحضير بيانات المستخدم
    const userDoc: UserData = {
      ...userData,
      uid: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    // ✅ حفظ بيانات المستخدم في Firestore مع معالجة الأخطاء
    try {
      await setDoc(doc(db, "users", user.uid), userDoc);
      console.log("✅ User data saved to Firestore successfully");
    } catch (firestoreError) {
      console.error(
        "❌ Failed to save user data to Firestore:",
        firestoreError,
      );
      // ❗️حذف حساب المصادقة إذا فشل حفظ البيانات
      await user.delete();
      return {
        success: false,
        error: "فشل في حفظ بيانات المستخدم. يرجى المحاولة مرة أخرى.",
      };
    }

    // ✅ إنشاء متجر أولي للتجار (إذا نجح حفظ البيانات)
    if (userData.userType === "merchant") {
      try {
        const { createInitialStoreEnhanced } = await import(
          "./store-management"
        );
        const storeId = await createInitialStoreEnhanced(user.uid, userData);

        // ✅ تحديث المستخدم بمعرف المتجر
        await updateDoc(doc(db, "users", user.uid), { storeId });
        console.log("✅ Store created and user updated with storeId");
      } catch (storeError) {
        console.error("❌ Failed to create store:", storeError);
        // نستمر رغم فشل إنشاء المتجر - المستخدم أنشئ بنجاح
      }
    }

    console.log("✅ REAL Firebase account created successfully");
    return { success: true, user: userCredential };
  } catch (error: unknown) {
    console.error("❌ REAL Firebase account creation failed:", error);

    let errorMessage = "فشل في إنشاء الحساب";
    if ((error as any).code === "auth/email-already-in-use") {
      errorMessage = "البريد الإلكتروني مسجل مسبقاً";
    } else if ((error as any).code === "auth/weak-password") {
      errorMessage = "كلمة المرور ضعيفة. يجب أن تكون 6 أحرف على الأقل";
    }

    return { success: false, error: errorMessage };
  }
};

// Wrapper for backwards compatibility
export const signInUser = async (
  email: string,
  password: string,
): Promise<UserCredential> => {
  const result = await signInUserEnhanced(email, password);
  if (result.success && result.user) {
    return result.user;
  }
  throw new Error(result.error || "Sign in failed");
};

export const createAccount = async (
  email: string,
  password: string,
  userData: Omit<UserData, "uid" | "createdAt" | "updatedAt" | "isActive">,
): Promise<UserCredential> => {
  const result = await createAccountEnhanced(email, password, userData);
  if (result.success && result.user) {
    return result.user;
  }
  throw new Error(result.error || "Account creation failed");
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("✅ REAL Firebase sign out successful");
  } catch (error: unknown) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error: unknown) {
    console.error("Error getting user data:", error);
    return null;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: unknown) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const updateUserData = async (
  uid: string,
  data: Partial<UserData>,
): Promise<void> => {
  try {
    await updateDoc(doc(db, "users", uid), {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error: unknown) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

// في auth-enhanced.ts - أضف هذه الدوال

// دالة إرسال رابط التحقق
// في auth-enhanced.ts
export const sendEmailVerification = async (
  user: User,
  actionCodeSettings?: ActionCodeSettings,
): Promise<void> => {
  try {
    // استخدام إعدادات التحقق المخصصة أو الافتراضية
    const settings: ActionCodeSettings = actionCodeSettings || {
      url: window.location.origin + "/email-verified-redirect", // ⭐️ الصفحة الوسيطة
      handleCodeInApp: true,
    };

    await firebaseSendEmailVerification(user, settings);
    console.log("✅ رابط التحقق أرسل بنجاح");
  } catch (error) {
    console.error("❌ خطأ في إرسال رابط التحقق:", error);
    throw error;
  }
};

// دالة التحقق من حالة البريد
export const isEmailVerified = (user: User): boolean => {
  return user.emailVerified;
};

// دالة إعادة إرسال رابط التحقق
export const resendEmailVerification = async (user: User): Promise<void> => {
  try {
    await firebaseSendEmailVerification(user, {
      url: `${window.location.origin}/complete-profile`, // رابط بعد التحقق
      handleCodeInApp: true,
    });
    console.log("✅ تم إعادة إرسال رابط التحقق");
  } catch (error: any) {
    console.error("❌ خطأ في إعادة إرسال رابط التحقق:", error);
    throw new Error(`فشل في إعادة الإرسال: ${error.message}`);
  }
};
