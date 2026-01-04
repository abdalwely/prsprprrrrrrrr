// import {
//   checkAdminExists, // ⬅️ استبدل initializePlatform بـ setupAdminUser
//   DEFAULT_ADMIN_EMAIL,
//   DEFAULT_ADMIN_PASSWORD,
// } from "./admin-setup";
// import { initializeFirebaseWrapper, isOfflineMode } from "./firebase-wrapper";
// import { showAvailableCredentials } from "./fallback-auth";

// // Initialize the platform with admin user
// export const initializeApp = async (): Promise<void> => {
//   try {
//     console.log("🚀 Initializing platform...");

//     // Initialize Firebase wrapper first
//     initializeFirebaseWrapper();

//     // Force offline mode in development to prevent errors
//     if (process.env.NODE_ENV === "development") {
//       isOfflineMode();
//     }

//     // Skip Firebase initialization in development
//     if (process.env.NODE_ENV === "development") {
//       console.log("🔧 Development mode: Skipping Firebase initialization");
//       console.log("🔐 Primary Admin Credentials:");
//       console.log(`   Email: ${DEFAULT_ADMIN_EMAIL}`);
//       console.log(`   Password: ${DEFAULT_ADMIN_PASSWORD}`);
//       console.log("");
//       showAvailableCredentials();
//       console.log("");
//       console.log("📧 You can log in with any of the above credentials");
//       return;
//     }

//     // Production initialization
//     const result = await checkAdminExists();

//     if (result.success) {
//       console.log("✅ Platform initialized successfully");
//       console.log("🔐 Admin Credentials:");
//       console.log(`   Email: ${DEFAULT_ADMIN_EMAIL}`);
//       console.log(`   Password: ${DEFAULT_ADMIN_PASSWORD}`);
//       console.log("📧 Please save these credentials securely");
//     } else {
//       console.warn("⚠️ Platform initialization issue:", result.message);
//       console.log(
//         "🔐 Default Admin Credentials (for when connection is restored):",
//       );
//       console.log(`   Email: ${DEFAULT_ADMIN_EMAIL}`);
//       console.log(`   Password: ${DEFAULT_ADMIN_PASSWORD}`);
//     }
//   } catch (error) {
//     console.error("❌ Failed to initialize platform:", error);
//     console.log("🔐 Default Admin Credentials:");
//     console.log(`   Email: ${DEFAULT_ADMIN_EMAIL}`);
//     console.log(`   Password: ${DEFAULT_ADMIN_PASSWORD}`);
//     console.log("💡 Platform running in offline mode");
//   }
// };

// // Call this function once when the app starts
// export const APP_ADMIN_CREDENTIALS = {
//   email: DEFAULT_ADMIN_EMAIL,
//   password: DEFAULT_ADMIN_PASSWORD,
// };

import { initializeFirebaseWrapper } from "./firebase-wrapper";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "./src/firebase/firebase";
import { UserData } from "./src/types/user.types";

export const DEFAULT_ADMIN_EMAIL = "admin@ecommerce-platform.com";
export const DEFAULT_ADMIN_PASSWORD = "AdminPlatform2024!";

// تهيئة المنصة
export const initializeApp = async (): Promise<void> => {
  try {
    console.log("🚀 [INIT] Initializing platform...");

    // تهيئة Firebase wrapper
    initializeFirebaseWrapper();

    // التحقق من اتصال Firebase أولاً
    console.log("🔍 [INIT] Testing Firebase connection...");

    try {
      const testDoc = doc(db, "_test", "init");
      await getDoc(testDoc);
      console.log("✅ [INIT] Firebase connected successfully");
    } catch (error) {
      console.warn(
        "⚠️ [INIT] Firebase connection test failed, continuing with limited functionality",
      );
    }

    // التحقق من وجود مستخدم مسؤول وإنشائه إذا لزم الأمر
    await ensureAdminUser();

    console.log("🎉 [INIT] Platform initialization completed");
  } catch (error) {
    console.error("❌ [INIT] Failed to initialize platform:", error);
    throw error;
  }
};

// التأكد من وجود مستخدم مسؤول
const ensureAdminUser = async (): Promise<void> => {
  try {
    console.log("👑 [INIT] Checking admin user...");

    // التحقق من اتصال Firebase أولاً
    try {
      const testDoc = doc(db, "_test", "test");
      await getDoc(testDoc);
    } catch (error) {
      console.log(
        "📴 [INIT] Firebase not available, skipping admin user check",
      );
      return;
    }

    // البحث عن مستخدم مسؤول في Firestore
    const usersQuery = await getDocs(collection(db, "users"));
    let adminExists = false;

    usersQuery.forEach((doc) => {
      const userData = doc.data() as UserData;
      if (
        userData.userType === "admin" &&
        userData.email === DEFAULT_ADMIN_EMAIL
      ) {
        adminExists = true;
      }
    });

    if (adminExists) {
      console.log("✅ [INIT] Admin user already exists");
      return;
    }

    console.log("👤 [INIT] Creating admin user...");

    // إنشاء مستخدم في Firebase Auth
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(
        auth,
        DEFAULT_ADMIN_EMAIL,
        DEFAULT_ADMIN_PASSWORD,
      );
      console.log("✅ [INIT] Admin user created in Firebase Auth");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        // المستخدم موجود، محاولة تسجيل الدخول
        console.log("🔄 [INIT] Admin user exists in Auth, signing in...");
        userCredential = await signInWithEmailAndPassword(
          auth,
          DEFAULT_ADMIN_EMAIL,
          DEFAULT_ADMIN_PASSWORD,
        );
      } else {
        console.warn(
          "⚠️ [INIT] Could not create admin user in Auth:",
          error.message,
        );
        return;
      }
    }

    // إنشاء وثيقة المستخدم في Firestore
    const adminUserData: UserData = {
      uid: userCredential.user.uid,
      email: DEFAULT_ADMIN_EMAIL,
      firstName: "System",
      lastName: "Administrator",
      userType: "admin",
      role: "admin",
      isActive: true,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, "users", userCredential.user.uid), adminUserData);

    console.log("✅ [INIT] Admin user document created in Firestore");
    console.log("🔐 [INIT] Admin credentials (for development only):");
    console.log(`   📧 Email: ${DEFAULT_ADMIN_EMAIL}`);
    console.log(`   🔑 Password: ${DEFAULT_ADMIN_PASSWORD}`);
    console.log("⚠️  WARNING: Change these credentials in production!");
  } catch (error) {
    console.warn("⚠️ [INIT] Admin user setup skipped:", error);
    console.log("💡 [INIT] You can manually create admin user with:");
    console.log(`   Email: ${DEFAULT_ADMIN_EMAIL}`);
    console.log(`   Password: ${DEFAULT_ADMIN_PASSWORD}`);
  }
};

// بيانات اعتماد المسؤول للتطبيق
export const APP_ADMIN_CREDENTIALS = {
  email: DEFAULT_ADMIN_EMAIL,
  password: DEFAULT_ADMIN_PASSWORD,
};
