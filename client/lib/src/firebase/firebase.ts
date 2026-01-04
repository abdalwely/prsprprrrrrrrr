import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  getDoc,
} from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// ✅ Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBB2N2zAuf4kDf3j5x263tI9mwVXiVf92A",
  authDomain: "house-2fbd2.firebaseapp.com",
  databaseURL: "https://house-2fbd2-default-rtdb.firebaseio.com",
  projectId: "house-2fbd2",
  storageBucket: "house-2fbd2.appspot.com",
  messagingSenderId: "482292708652",
  appId: "1:482292708652:web:f6050742a012b2720c2889",
  measurementId: "G-VRW7LE4V7B",
};

// ✅ Singleton instances
let app;
let auth;
let db;
let storage;
let analytics = null;
let usingEmulators = false;

// ✅ اختبار ما إذا كانت المحاكيات شغالة
const testEmulatorConnection = async (port: number): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:${port}`, {
      method: "HEAD",
      mode: "no-cors",
    });
    return true;
  } catch {
    return false;
  }
};

// ✅ Initialize Firebase only once
if (!getApps().length) {
  console.log("🚀 Initializing Firebase...");

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // ✅ Development Mode: التحقق من المحاكيات أولاً
  if (process.env.NODE_ENV === "development") {
    console.log("🔧 Development mode: Checking for Firebase Emulators...");

    // اختبار جميع منافذ المحاكيات
    const authEmulatorRunning = await testEmulatorConnection(9099);
    const firestoreEmulatorRunning = await testEmulatorConnection(8080);
    const storageEmulatorRunning = await testEmulatorConnection(9199);

    const allEmulatorsRunning =
      authEmulatorRunning && firestoreEmulatorRunning && storageEmulatorRunning;

    if (allEmulatorsRunning) {
      console.log("✅ All Firebase emulators detected, connecting...");

      // Auth Emulator (localhost:9099)
      connectAuthEmulator(auth, "http://localhost:9099", {
        disableWarnings: true,
      });

      // Firestore Emulator (localhost:8080)
      connectFirestoreEmulator(db, "localhost", 8080);

      // Storage Emulator (localhost:9199)
      connectStorageEmulator(storage, "localhost", 9199);

      usingEmulators = true;

      console.log("✅ Firebase emulators connected successfully");
      console.log("📊 Emulators Info:");
      console.log("   🔐 Auth: http://localhost:9099");
      console.log("   📁 Firestore: localhost:8080");
      console.log("   💾 Storage: localhost:9199");
    } else {
      console.log(
        "🌐 Development mode: Emulators not running, using live Firebase",
      );
      console.log("💡 Tip: Run 'firebase emulators:start' to use emulators");
      console.log("💡 Status:", {
        auth: authEmulatorRunning ? "✅ Running" : "❌ Not running",
        firestore: firestoreEmulatorRunning ? "✅ Running" : "❌ Not running",
        storage: storageEmulatorRunning ? "✅ Running" : "❌ Not running",
      });
    }
  } else {
    console.log("🌐 Production mode: Using live Firebase services");
  }

  // ✅ Initialize Analytics in production only
  if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
    analytics = getAnalytics(app);
    console.log("📈 Analytics initialized for production");
  }
} else {
  // Use existing app if already initialized
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log("♻️ Using existing Firebase instance");
}

// ✅ Export initialized instances
export { app, auth, db, storage, analytics, usingEmulators };

// ✅ Utility functions
export async function checkFirebaseConnection(): Promise<boolean> {
  try {
    if (!db) return false;

    // Simple ping to Firestore
    const testDoc = doc(db, "_test", "connection");
    await getDoc(testDoc);
    return true;
  } catch (error) {
    console.warn("⚠️ checkFirebaseConnection error:", error);
    return false;
  }
}

export async function getCurrentStoreId(): Promise<string | null> {
  try {
    // Try localStorage first
    const pendingStore = localStorage.getItem("pendingStoreInfo");
    if (pendingStore) {
      const storeData = JSON.parse(pendingStore);
      return storeData.storeId || storeData.id || null;
    }

    // Try URL path
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const match = path.match(/\/store\/([^\/]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    console.warn("⚠️ getCurrentStoreId error:", error);
    return null;
  }
}

export default app;
