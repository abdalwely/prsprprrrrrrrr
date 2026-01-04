import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from "firebase/auth";
import { ensureStoreCustomer, linkVisitorToCustomer } from "./src";
import { db } from "./firebase";
import { setDoc, doc } from "firebase/firestore";

// تسجيل الدخول
export const loginCustomer = async (
  email: string,
  password: string,
  storeId?: string,
): Promise<any> => {
  try {
    console.log("🔐 تسجيل دخول مع Firebase Auth");

    // 1. تسجيل الدخول مع Firebase Auth
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    console.log("✅ تسجيل دخول Firebase ناجح:", user.uid);

    // 2. إذا كان هناك storeId، ربط العميل بالمتجر
    if (storeId) {
      try {
        await ensureStoreCustomer(storeId, user.uid);
        console.log("✅ تم ربط العميل بالمتجر");

        // 3. التحقق من وجود ضيف سابق وربطه
        const visitorKey = `visitor_${storeId}`;
        const oldVisitorId = localStorage.getItem(visitorKey);

        if (oldVisitorId) {
          await linkVisitorToCustomer(storeId, oldVisitorId, user.uid);
          console.log("✅ تم ربط الضيف السابق");
        }
      } catch (linkError) {
        console.warn("⚠️ لم يتم الربط التلقائي:", linkError);
      }
    }

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
    console.error("❌ خطأ في تسجيل الدخول:", error);

    let errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
    if (error.code === "auth/user-not-found") {
      errorMessage = "الحساب غير موجود";
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "كلمة المرور غير صحيحة";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "تم محاولة تسجيل الدخول مرات كثيرة. حاول مرة أخرى لاحقاً";
    } else if (error.code === "auth/user-disabled") {
      errorMessage = "هذا الحساب معطل";
    }

    throw new Error(errorMessage);
  }
};

// إنشاء حساب جديد
export const registerCustomer = async (
  email: string,
  password: string,
  fullName: string,
  phone?: string,
  country?: string,
  storeId?: string,
): Promise<any> => {
  try {
    console.log("📝 إنشاء حساب مع Firebase Auth");

    // 1. إنشاء حساب في Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // 2. تحديث الاسم في Auth
    if (fullName.trim()) {
      await updateProfile(user, {
        displayName: fullName.trim(),
      });
    }

    // 3. حفظ بيانات إضافية في مجموعة users
    const [firstName, ...lastNameParts] = fullName.split(" ");
    const lastName = lastNameParts.join(" ") || "";

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      firstName: firstName || "",
      lastName: lastName || "",
      phone: phone || "",
      country: country || "اليمن",
      userType: "customer",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ حساب Firebase وبيانات المستخدم أنشئت:", user.uid);

    // 4. إذا كان هناك storeId، ربط العميل بالمتجر
    if (storeId) {
      try {
        await ensureStoreCustomer(storeId, user.uid);
        console.log("✅ تم ربط الحساب الجديد بالمتجر");

        // 5. التحقق من وجود ضيف سابق وربطه
        const visitorKey = `visitor_${storeId}`;
        const oldVisitorId = localStorage.getItem(visitorKey);

        if (oldVisitorId) {
          await linkVisitorToCustomer(storeId, oldVisitorId, user.uid);
          console.log("✅ تم ربط الضيف السابق بالحساب الجديد");
        }
      } catch (linkError) {
        console.warn("⚠️ لم يتم الربط التلقائي:", linkError);
      }
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: fullName.trim(),
      },
    };
  } catch (error: any) {
    console.error("❌ خطأ في إنشاء الحساب:", error);

    let errorMessage = "حدث خطأ أثناء إنشاء الحساب";
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "البريد الإلكتروني مستخدم بالفعل";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "كلمة المرور ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل)";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "البريد الإلكتروني غير صحيح";
    } else if (error.code === "auth/operation-not-allowed") {
      errorMessage = "عملية التسجيل غير مسموحة حالياً";
    }

    throw new Error(errorMessage);
  }
};

// إعادة تعيين كلمة المرور
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("❌ خطأ في إعادة تعيين كلمة المرور:", error);

    let errorMessage = "حدث خطأ أثناء إرسال رابط إعادة التعيين";
    if (error.code === "auth/user-not-found") {
      errorMessage = "لا يوجد حساب مرتبط بهذا البريد الإلكتروني";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "البريد الإلكتروني غير صحيح";
    }

    throw new Error(errorMessage);
  }
};

// تسجيل الخروج
export const logoutCustomer = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("✅ تم تسجيل الخروج");
  } catch (error) {
    console.error("❌ خطأ في تسجيل الخروج:", error);
    throw error;
  }
};

// الحصول على المستخدم الحالي
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

// التحقق إذا كان المستخدم مسجلاً
export function isCustomerLoggedIn(): boolean {
  return !!auth.currentUser;
}

// تحديث الملف الشخصي
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

    console.log("✅ تم تحديث الملف الشخصي");
  } catch (error) {
    console.error("❌ خطأ في تحديث الملف الشخصي:", error);
    throw error;
  }
};

// تحديث البريد الإلكتروني
export const updateCustomerEmail = async (newEmail: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("لم يتم تسجيل الدخول");
    }

    // ملاحظة: تحتاج إلى إعادة المصادقة لتغيير البريد الإلكتروني
    // هذا مثال مبسط
    console.log("📧 تحديث البريد الإلكتروني يتطلب إعادة مصادقة");
    throw new Error("تغيير البريد الإلكتروني يتطلب عملية إعادة مصادقة");
  } catch (error) {
    console.error("❌ خطأ في تحديث البريد الإلكتروني:", error);
    throw error;
  }
};

// تحديث كلمة المرور
export const updateCustomerPassword = async (
  newPassword: string,
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("لم يتم تسجيل الدخول");
    }

    // ملاحظة: في Firebase JS SDK، updatePassword يتطلب إعادة المصادقة الحديثة
    console.log("🔑 تحديث كلمة المرور يتطلب إعادة مصادقة حديثة");
    throw new Error("تغيير كلمة المرور يتطلب إعادة مصادقة حديثة");
  } catch (error) {
    console.error("❌ خطأ في تحديث كلمة المرور:", error);
    throw error;
  }
};

// حذف الحساب
export const deleteCustomerAccount = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("لم يتم تسجيل الدخول");
    }

    // ملاحظة: حذف الحساب يتطلب إعادة المصادقة
    console.log("🗑️ حذف الحساب يتطلب إعادة مصادقة");
    throw new Error("حذف الحساب يتطلب إعادة مصادقة");
  } catch (error) {
    console.error("❌ خطأ في حذف الحساب:", error);
    throw error;
  }
};

// الاستماع لتغيرات حالة المصادقة
export const onAuthStateChanged = (
  callback: (user: User | null) => void,
): (() => void) => {
  return auth.onAuthStateChanged(callback);
};

// الحصول على token المصادقة
export const getIdToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    return await user.getIdToken();
  } catch (error) {
    console.error("❌ خطأ في جلب token المصادقة:", error);
    return null;
  }
};

// التحقق من صلاحية token
export const verifyIdToken = async (token: string): Promise<any> => {
  try {
    // في تطبيقات العميل، نستخدم Firebase Admin SDK في الخادم للتحقق
    // هذه دالة توضيحية
    console.log("🔍 التحقق من token يتطلب الخادم");
    return null;
  } catch (error) {
    console.error("❌ خطأ في التحقق من token:", error);
    throw error;
  }
};

// دوال التوافق مع النظام القديم
export function getCustomerProfile() {
  return getCurrentCustomer();
}

export function setCustomerProfile(profile: any) {
  console.warn("⚠️ setCustomerProfile لم تعد مستخدمة في النظام الجديد");
  return null;
}

export function clearCustomerProfile() {
  // في النظام الجديد، نستخدم signOut
  return logoutCustomer();
}

export function hashPassword(password: string): string {
  console.warn("⚠️ hashPassword لم تعد مستخدمة في النظام الجديد");
  return password;
}
