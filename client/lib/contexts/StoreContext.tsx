import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import { storeService } from "../src/services/store";
import { Store } from "../src/types";

// نوع سياق المتجر
interface StoreContextType {
  store: Store | null;
  setStore: (store: Store | null) => void;
  loading: boolean;
  refreshStore: () => Promise<void>;
  getUserStore: () => Promise<Store | null>;
  clearStore: () => void;
}

// إنشاء السياق
const StoreContext = createContext<StoreContextType | undefined>(undefined);

// المزود الرئيسي
export const StoreProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();

  // تحميل المتجر عند تغيير بيانات المستخدم
  useEffect(() => {
    if (userData?.uid) {
      loadStore();
    } else {
      setStore(null);
      setLoading(false);
    }
  }, [userData?.uid]);

  // دالة جديدة للتعامل مع تحميل AuthContext
  const { loading: authLoading } = useAuth(); // 🔥 أضف هذا الاستيراص

  useEffect(() => {
    console.log("🔄 [STORE-CONTEXT] Auth state update:", {
      authLoading,
      hasUser: !!userData?.uid,
      userId: userData?.uid,
    });

    // الانتظار حتى يكتمل تحميل AuthContext
    if (authLoading) {
      console.log("⏳ [STORE-CONTEXT] Waiting for auth to load...");
      return;
    }

    // الآن يمكننا التحقق من وجود المستخدم
    if (userData?.uid) {
      console.log("🚀 [STORE-CONTEXT] Auth loaded, loading store...");
      loadStore();
    } else {
      console.log("👤 [STORE-CONTEXT] No authenticated user");
      setStore(null);
      setLoading(false);
    }
  }, [userData?.uid, authLoading]); // 🔥 إضافة authLoading

  // الدالة الرئيسية لتحميل المتجر
  const loadStore = async () => {
    setLoading(true);

    if (!userData?.uid) {
      console.log("👤 [STORE-CONTEXT] No user data, skipping store load");
      setStore(null);
      setLoading(false);
      return;
    }

    try {
      console.log("🚀 [STORE-CONTEXT] Loading store for user:", userData.uid);

      // 1. جلب من state إذا موجود وصحيح
      if (store && store.ownerId === userData.uid) {
        console.log("✅ [STORE-CONTEXT] Store already loaded in state");
        setLoading(false);
        return;
      }

      // 2. جلب من localStorage مع التحقق
      const storedStore = localStorage.getItem("currentStore");
      if (storedStore) {
        try {
          const parsedStore = JSON.parse(storedStore) as Store;

          if (parsedStore.ownerId === userData.uid) {
            console.log(
              "📦 [STORE-CONTEXT] Store loaded from localStorage:",
              parsedStore.name,
            );
            setStore(parsedStore);
            setLoading(false);
            return;
          } else {
            console.warn(
              "⚠️ [STORE-CONTEXT] Mismatched store in localStorage, clearing...",
            );
            localStorage.removeItem("currentStore");
          }
        } catch (error) {
          console.error(
            "❌ [STORE-CONTEXT] Error parsing stored store:",
            error,
          );
          localStorage.removeItem("currentStore");
        }
      }

      // 3. جلب من السيرفر
      await fetchUserStore();
    } catch (error) {
      console.error("❌ [STORE-CONTEXT] Error loading store:", error);
      setStore(null);
    } finally {
      setLoading(false);
    }
  };

  // جلب متجر المستخدم من السيرفر
  const fetchUserStore = async () => {
    if (!userData?.uid) {
      console.log("👤 [STORE-CONTEXT] No user data for fetch");
      return;
    }

    try {
      console.log(
        "🌐 [STORE-CONTEXT] Fetching store from server for user:",
        userData.uid,
      );

      const userStores = await storeService.getByOwner(userData.uid);

      if (userStores.length > 0) {
        const userStore = userStores[0];
        console.log(
          "✅ [STORE-CONTEXT] User store loaded from server:",
          userStore.name,
        );
        updateStore(userStore);
      } else {
        console.log("📭 [STORE-CONTEXT] User has no store");
        updateStore(null);
      }
    } catch (error) {
      console.error("❌ [STORE-CONTEXT] Error fetching user store:", error);

      // محاولة استخدام localStorage كـ fallback
      const storedStore = localStorage.getItem("currentStore");
      if (storedStore) {
        try {
          const parsedStore = JSON.parse(storedStore) as Store;
          if (parsedStore.ownerId === userData.uid) {
            console.log("📦 [STORE-CONTEXT] Using localStorage as fallback");
            setStore(parsedStore);
          } else {
            updateStore(null);
          }
        } catch {
          updateStore(null);
        }
      } else {
        updateStore(null);
      }
    }
  };

  // دالة لجلب متجر المستخدم (للاستخدام في المكونات)
  const getUserStore = async (): Promise<Store | null> => {
    if (!userData?.uid) {
      console.log("👤 [STORE-CONTEXT] getUserStore: No user data");
      return null;
    }

    try {
      console.log("🔍 [STORE-CONTEXT] getUserStore: Fetching store...");

      // 1. جلب من state إذا موجود وصحيح
      if (store && store.ownerId === userData.uid) {
        console.log("✅ [STORE-CONTEXT] getUserStore: Returning from state");
        return store;
      }

      // 2. جلب من localStorage
      const storedStore = localStorage.getItem("currentStore");
      if (storedStore) {
        try {
          const parsedStore = JSON.parse(storedStore) as Store;
          if (parsedStore.ownerId === userData.uid) {
            console.log(
              "✅ [STORE-CONTEXT] getUserStore: Returning from localStorage",
            );
            updateStore(parsedStore);
            return parsedStore;
          }
        } catch (error) {
          console.error(
            "❌ [STORE-CONTEXT] Error parsing localStorage store:",
            error,
          );
        }
      }

      // 3. جلب من السيرفر
      const userStores = await storeService.getByOwner(userData.uid);

      if (userStores.length > 0) {
        const userStore = userStores[0];
        console.log("✅ [STORE-CONTEXT] getUserStore: Returning from server");
        updateStore(userStore);
        return userStore;
      }

      console.log("📭 [STORE-CONTEXT] getUserStore: No store found for user");
      return null;
    } catch (error) {
      console.error("❌ [STORE-CONTEXT] getUserStore Error:", error);
      return null;
    }
  };

  // تحديث المتجر في state و localStorage
  const updateStore = (newStore: Store | null) => {
    setStore(newStore);

    if (newStore) {
      localStorage.setItem("currentStore", JSON.stringify(newStore));
      console.log("💾 [STORE-CONTEXT] Store saved to localStorage:", {
        id: newStore.id,
        name: newStore.name,
        ownerId: newStore.ownerId,
      });
    } else {
      localStorage.removeItem("currentStore");
      console.log("🗑️ [STORE-CONTEXT] Store removed from localStorage");
    }
  };

  // دالة لمسح المتجر
  const clearStore = () => {
    setStore(null);
    localStorage.removeItem("currentStore");
    console.log("🧹 [STORE-CONTEXT] Store cleared from context and storage");
  };

  // دالة لتحديث المتجر يدوياً
  const refreshStore = async () => {
    await loadStore();
  };

  // تعيين setStore للاستخدام الخارجي مع التحقق
  const setStoreWrapper = (newStore: Store | null) => {
    if (newStore && newStore.ownerId !== userData?.uid) {
      console.error("❌ [STORE-CONTEXT] Cannot set store: User mismatch");
      return;
    }
    updateStore(newStore);
  };

  // قيمة السياق
  const value = {
    store,
    setStore: setStoreWrapper,
    loading,
    refreshStore,
    getUserStore,
    clearStore,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

// Hook لاستخدام سياق المتجر
export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
