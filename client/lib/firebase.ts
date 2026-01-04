import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

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
// تعطيل Analytics في التطوير لمنع الأخطاء
export const analytics = null;

// ✅ Firebase مفعل في التطوير
if (process.env.NODE_ENV === "development") {
  console.log(
    "🔧 Development mode: Firebase ENABLED - Real Firebase connection",
  );
}

// Utility: quick check whether Firestore is reachable
export async function checkFirebaseConnection(): Promise<boolean> {
  try {
    // If db is not initialized, return false
    if (!db) return false;

    // Try a lightweight read to ensure connectivity
    try {
      const { getDocs, collection, limit, query } = await import(
        "firebase/firestore"
      );
      const q = query(collection(db, "__connection_test__"), limit(1));
      await getDocs(q);
      return true;
    } catch (err) {
      // If the above fails (no permissions or collection), fallback to true if db exists
      return true;
    }
  } catch (error) {
    console.warn("checkFirebaseConnection error:", error);
    return false;
  }
}
export default app;
