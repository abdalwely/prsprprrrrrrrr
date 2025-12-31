// Firebase wrapper that gracefully handles network failures and switches to offline mode

import { auth, db } from "./firebase";

let isFirebaseAvailable = true;
let lastConnectionTest = 0;
const CONNECTION_TEST_INTERVAL = 30000; // 30 seconds

// Test Firebase connectivity
export const testFirebaseConnectivity = async (): Promise<boolean> => {
  const now = Date.now();

  // Don't test too frequently
  if (now - lastConnectionTest < CONNECTION_TEST_INTERVAL) {
    return isFirebaseAvailable;
  }

  lastConnectionTest = now;

  try {
    // Simple connectivity test - just check if we can access Firebase config
    if (!auth || !db) {
      isFirebaseAvailable = false;
      return false;
    }

    // ✅ الإصلاح: السماح لـ Firebase بالعمل في التطوير
    if (process.env.NODE_ENV === "development") {
      isFirebaseAvailable = true; // ⬅️ تغيير من false إلى true
      console.log(
        "🔧 Development mode: Firebase enabled with connectivity testing",
      );
      return true;
    }

    isFirebaseAvailable = true;
    return true;
  } catch (error) {
    console.warn("⚠️ Firebase connectivity test failed:", error);
    isFirebaseAvailable = false;
    return false;
  }
};

// Safe Firebase operation wrapper
export const safeFirebaseOperation = async <T>(
  operation: () => Promise<T>,
  fallback: () => T | Promise<T>,
  operationName: string = "Firebase operation",
): Promise<T> => {
  try {
    // Check if Firebase is available
    if (!isFirebaseAvailable) {
      console.log(`📴 ${operationName}: Using fallback (Firebase unavailable)`);
      return await fallback();
    }

    // Test connectivity first
    const isConnected = await testFirebaseConnectivity();
    if (!isConnected) {
      console.log(`📴 ${operationName}: Using fallback (no connectivity)`);
      return await fallback();
    }

    // Attempt Firebase operation with timeout
    const timeoutPromise = new Promise<never>(
      (_, reject) =>
        setTimeout(
          () => reject(new Error("Firebase operation timeout")),
          10000,
        ), // زيادة المهلة
    );

    const result = await Promise.race([operation(), timeoutPromise]);
    console.log(`✅ ${operationName}: Firebase operation successful`);
    return result;
  } catch (error: any) {
    console.warn(
      `⚠️ ${operationName}: Firebase failed, using fallback:`,
      error.message,
    );

    // Mark Firebase as unavailable for future operations
    if (
      error.message?.includes("network") ||
      error.message?.includes("timeout") ||
      error.code === "auth/network-request-failed"
    ) {
      isFirebaseAvailable = false;
    }

    return await fallback();
  }
};

// ✅ الإصلاح: لا تعطل Firebase في التطوير
export const disableFirebaseForDevelopment = () => {
  if (process.env.NODE_ENV === "development") {
    isFirebaseAvailable = true; // ⬅️ تغيير من false إلى true
    console.log("🔧 Firebase operations enabled for development");

    // لا تقم بتسجيل الخروج التلقائي
    try {
      if (auth?.currentUser) {
        console.log("👤 Current user:", auth.currentUser.email);
      }
    } catch (error) {
      // تجاهل الأخطاء
    }
  }
};

// Check if we're in offline mode
export const isOfflineMode = (): boolean => {
  return !isFirebaseAvailable;
};

// Force offline mode (for development) - اختياري
export const forceOfflineMode = () => {
  isFirebaseAvailable = false;
  console.log("🔧 Forced offline mode enabled");
};

// Force online mode - إضافة جديدة
export const forceOnlineMode = () => {
  isFirebaseAvailable = true;
  console.log("🔧 Forced online mode enabled");
};

// Initialize wrapper
export const initializeFirebaseWrapper = () => {
  disableFirebaseForDevelopment();

  // Listen for online/offline events
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
      console.log("🌐 Network online detected");
      isFirebaseAvailable = true;
    });

    window.addEventListener("offline", () => {
      console.log("📴 Network offline detected");
      isFirebaseAvailable = false;
    });
  }
};
