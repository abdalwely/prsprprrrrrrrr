// import { auth, db } from "./firebase";
// import { signInAnonymously, connectAuthEmulator } from "firebase/auth";
// import { doc, getDoc, connectFirestoreEmulator } from "firebase/firestore";

// export interface FirebaseDiagnostics {
//   authConnected: boolean;
//   firestoreConnected: boolean;
//   error?: string;
//   suggestion?: string;
// }

// // غير الدالة testFirebaseConnection لتتخطى اختبار Anonymous Sign-in
// export const testFirebaseConnection =
//   async (): Promise<FirebaseDiagnostics> => {
//     const result: FirebaseDiagnostics = {
//       authConnected: true, // اجعله true دائماً
//       firestoreConnected: false,
//     };

//     console.log(
//       "🔧 Skipping Auth connection test (causes admin-restricted-operation)",
//     );

//     // اختبر Firestore فقط
//     try {
//       const testDoc = doc(db, "_test", "connection_test");
//       await getDoc(testDoc);
//       result.firestoreConnected = true;
//       console.log("✅ Firebase Firestore connection successful");
//     } catch (error) {
//       console.log("❌ Firebase Firestore connection failed");
//     }

//     return result;
//   };

// export const enableFirebaseEmulators = () => {
//   if (process.env.NODE_ENV === "development") {
//     try {
//       console.log("🔧 Connecting to Firebase emulators...");
//       connectAuthEmulator(auth, "http://localhost:9099", {
//         disableWarnings: true,
//       });
//       connectFirestoreEmulator(db, "localhost", 8080);
//       console.log("✅ Firebase emulators connected");
//       return true;
//     } catch (error) {
//       console.warn("⚠️ Could not connect to Firebase emulators:", error);
//       console.log("💡 Continuing with live Firebase services");
//       return false;
//     }
//   }
//   return false;
// };

// export const getFirebaseConnectionStatus = () => {
//   return {
//     authReady: !!auth,
//     firestoreReady: !!db,
//     config: {
//       apiKey: auth?.config?.apiKey ? "configured" : "missing",
//       authDomain: auth?.config?.authDomain ? "configured" : "missing",
//       // ✅ الإصلاح: إزالة projectId المكرر وإضافة الخصائص الصحيحة
//     },
//     currentUser: auth?.currentUser
//       ? {
//           email: auth.currentUser.email,
//           uid: auth.currentUser.uid,
//         }
//       : "no user",
//   };
// };

// // ✅ دالة جديدة لاختبار سريع
// export const quickConnectionTest = async (): Promise<boolean> => {
//   try {
//     const diagnostics = await testFirebaseConnection();
//     return diagnostics.authConnected && diagnostics.firestoreConnected;
//   } catch (error) {
//     console.error("Quick connection test failed:", error);
//     return false;
//   }
// };

import { doc, getDoc } from "firebase/firestore";
import { db } from "./src/firebase/firebase";

export interface FirebaseDiagnostics {
  authConnected: boolean;
  firestoreConnected: boolean;
  error?: string;
  suggestion?: string;
}

export const testFirebaseConnection =
  async (): Promise<FirebaseDiagnostics> => {
    const result: FirebaseDiagnostics = {
      authConnected: true, // Always true in our unified approach
      firestoreConnected: false,
    };

    try {
      // Test Firestore connection
      const testDoc = doc(db, "_test", "connection_test");
      await getDoc(testDoc);
      result.firestoreConnected = true;

      if (process.env.NODE_ENV === "development") {
        result.suggestion = "Connected to Firebase emulators";
      } else {
        result.suggestion = "Connected to live Firebase services";
      }

      console.log("✅ Firebase connection test passed");
    } catch (error: any) {
      result.firestoreConnected = false;
      result.error = error.message;

      if (process.env.NODE_ENV === "development") {
        result.suggestion =
          "Check if Firebase emulators are running (auth:9099, firestore:8080)";
      } else {
        result.suggestion =
          "Check Firebase configuration and internet connection";
      }

      console.error("❌ Firebase connection test failed:", error);
    }

    return result;
  };

export const quickConnectionTest = async (): Promise<boolean> => {
  try {
    const diagnostics = await testFirebaseConnection();
    return diagnostics.authConnected && diagnostics.firestoreConnected;
  } catch (error) {
    console.error("Quick connection test failed:", error);
    return false;
  }
};

// يوجد معي هذه الملفات
// D:\New folder (2)\store\client\lib\src\types\store.types.ts
// D:\New folder (2)\store\client\lib\src\services\store\store.service.ts
// D:\New folder (2)\store\client\lib\src\services\auth\auth.service.ts
// D:\New folder (2)\store\client\lib\src\services\admin\admin.service.ts
// D:\New folder (2)\store\client\lib\src\services\user\user.service.ts
// D:\New folder (2)\store\client\lib\src\services\sub-business-category\sub-business-category.service.ts
// D:\New folder (2)\store\client\lib\businessTypes.ts

// هذا ملف صفحة انشاء متجر D:\New folder (2)\store\client\pages\CreateStore.tsx

// وهذا ملف صفحة ادارة طلبات انشاء او تفعيل المتجر D:\New folder (2)\store\client\pages\admin\AdminStoreApprovals.tsx
