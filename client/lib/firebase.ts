import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Development logging
if (process.env.NODE_ENV === "development") {
  console.log("🔧 Development mode: Firebase ENABLED");
}

// Utility: check Firebase connectivity
export async function checkFirebaseConnection(): Promise<boolean> {
  try {
    if (!db) return false;

    try {
      const { getDocs, collection, limit, query } = await import(
        "firebase/firestore"
      );
      const q = query(collection(db, "__connection_test__"), limit(1));
      await getDocs(q);
      return true;
    } catch {
      return !!db;
    }
  } catch (error) {
    console.warn("Firebase connection check error:", error);
    return false;
  }
}

/**
 * ✅ Get current store ID from URL or localStorage
 * Used by components to detect which store they're in
 */
export async function getCurrentStoreId(): Promise<string | null> {
  try {
    // Try from URL first
    const path = window.location.pathname;
    const match = path.match(/\/store\/([^\/]+)/);
    if (match) {
      return match[1];
    }

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

export default app;
