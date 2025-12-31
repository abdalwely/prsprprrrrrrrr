// import React, {
//   createContext,
//   useContext,
//   useState,
//   ReactNode,
//   useEffect,
// } from "react";
// import { Store } from "@/lib/firestore";
// import { useAuth } from "@/contexts/AuthContext";

// interface StoreContextType {
//   store: Store | null;
//   setStore: (store: Store | null) => void;
//   loading: boolean;
//   refreshStore: () => void;
// }

// const StoreContext = createContext<StoreContextType | undefined>(undefined);

// export const StoreProvider: React.FC<{ children: ReactNode }> = ({
//   children,
// }) => {
//   const [store, setStore] = useState<Store | null>(null);
//   const [loading, setLoading] = useState(true);
//   const { userData } = useAuth();

//   // ✅ تحميل بيانات المتجر من localStorage مع التحقق من المالك
//   useEffect(() => {
//     loadStoreFromStorage();
//   }, [userData]); // ✅ إضافة userData ك dependency

//   const loadStoreFromStorage = () => {
//     const storedStore = localStorage.getItem("currentStore");

//     if (storedStore) {
//       try {
//         const storeData = JSON.parse(storedStore);

//         // ✅ التحقق الجديد: تأكد أن المستخدم الحالي هو مالك المتجر
//         if (userData && storeData.ownerId === userData.uid) {
//           setStore(storeData);
//           console.log("📦 Store loaded from localStorage:", {
//             storeId: storeData.id,
//             storeName: storeData.name,
//             ownerId: storeData.ownerId,
//             currentUser: userData.uid,
//             match: true,
//           });
//         } else {
//           // ❌ المتجر المخزن لا ينتمي للمستخدم الحالي
//           console.log("❌ Stored store does not belong to current user:", {
//             storedOwner: storeData.ownerId,
//             currentUser: userData?.uid,
//             storeId: storeData.id,
//           });
//           localStorage.removeItem("currentStore");
//           setStore(null);
//         }
//       } catch (error) {
//         console.error("❌ Error parsing stored store:", error);
//         localStorage.removeItem("currentStore");
//         setStore(null);
//       }
//     } else {
//       console.log("🔍 No store found in localStorage");
//       setStore(null);
//     }

//     setLoading(false);
//   };

//   // ✅ تحديث localStorage عند تغيير المتجر مع التحقق
//   const updateStore = (newStore: Store | null) => {
//     if (newStore && userData && newStore.ownerId !== userData.uid) {
//       console.error("❌ Cannot set store: User is not the owner!", {
//         storeOwner: newStore.ownerId,
//         currentUser: userData.uid,
//       });
//       return;
//     }

//     setStore(newStore);

//     if (newStore) {
//       localStorage.setItem("currentStore", JSON.stringify(newStore));
//       console.log("💾 Store saved to localStorage:", {
//         storeId: newStore.id,
//         storeName: newStore.name,
//         ownerId: newStore.ownerId,
//       });
//     } else {
//       localStorage.removeItem("currentStore");
//       console.log("🗑️ Store removed from localStorage");
//     }
//   };

//   // ✅ دالة لتحديث المتجر
//   const refreshStore = () => {
//     loadStoreFromStorage();
//   };

//   return (
//     <StoreContext.Provider
//       value={{
//         store,
//         setStore: updateStore,
//         loading,
//         refreshStore,
//       }}
//     >
//       {children}
//     </StoreContext.Provider>
//   );
// };

// export const useStore = () => {
//   const context = useContext(StoreContext);
//   if (context === undefined) {
//     throw new Error("useStore must be used within a StoreProvider");
//   }
//   return context;
// };

//

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { storeService } from "@/lib/firestore";
import { ExtendedStore } from "@/pages/merchant/merchant-dashboard/types";

interface StoreContextType {
  store: ExtendedStore | null;
  setStore: (store: ExtendedStore | null) => void;
  loading: boolean;
  refreshStore: () => Promise<void>;
  getUserStore: () => Promise<ExtendedStore | null>;
  clearStore: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// دالة مساعدة للتحقق من صحة بيانات المتجر
const isValidStore = (storeData: any): storeData is ExtendedStore => {
  return (
    storeData &&
    typeof storeData === "object" &&
    "id" in storeData &&
    "ownerId" in storeData &&
    "name" in storeData
  );
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [store, setStore] = useState<ExtendedStore | null>(null);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();

  // ✅ تحميل بيانات المتجر عند تحميل المكون
  useEffect(() => {
    loadStore();
  }, [userData?.uid]);

  // ✅ الدالة الرئيسية لتحميل المتجر
  const loadStore = async () => {
    setLoading(true);

    if (!userData?.uid) {
      console.log("👤 No user data, skipping store load");
      setStore(null);
      setLoading(false);
      return;
    }

    try {
      console.log("🚀 Loading store for user:", userData.uid);

      // 1. جلب من localStorage مع التحقق
      const storedStore = localStorage.getItem("currentStore");
      if (storedStore) {
        try {
          const parsedStore = JSON.parse(storedStore);

          if (
            isValidStore(parsedStore) &&
            parsedStore.ownerId === userData.uid
          ) {
            console.log("📦 Store loaded from localStorage:", parsedStore.name);
            setStore(parsedStore);
            setLoading(false);
            return;
          } else {
            console.warn(
              "⚠️ Invalid or mismatched store in localStorage, clearing...",
            );
            localStorage.removeItem("currentStore");
          }
        } catch (error) {
          console.error("❌ Error parsing stored store:", error);
          localStorage.removeItem("currentStore");
        }
      }

      // 2. جلب من السيرفر
      await fetchUserStore();
    } catch (error) {
      console.error("❌ Error loading store:", error);
      setStore(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ جلب المتجر من السيرفر
  const fetchUserStore = async () => {
    if (!userData?.uid) {
      console.log("👤 No user data for fetch");
      return;
    }

    try {
      console.log("🌐 Fetching store from server for user:", userData.uid);
      const userStores = await storeService.getByOwner(userData.uid);

      if (userStores.length > 0) {
        const userStore = userStores[0] as ExtendedStore;
        console.log("✅ User store loaded from server:", userStore.name);
        updateStore(userStore);
      } else {
        console.log("📭 User has no store");
        updateStore(null);
      }
    } catch (error) {
      console.error("❌ Error fetching user store:", error);
      updateStore(null);
    }
  };

  // ✅ دالة لجلب متجر المستخدم (للاستخدام في المكونات)
  const getUserStore = async (): Promise<ExtendedStore | null> => {
    if (!userData?.uid) {
      console.log("👤 getUserStore: No user data");
      return null;
    }

    try {
      console.log("🔍 getUserStore: Fetching store...");

      // 1. جلب من state إذا موجود وصحيح
      if (store && store.ownerId === userData.uid) {
        console.log("✅ getUserStore: Returning from state");
        return store;
      }

      // 2. جلب من localStorage
      const storedStore = localStorage.getItem("currentStore");
      if (storedStore) {
        try {
          const parsedStore = JSON.parse(storedStore);
          if (
            isValidStore(parsedStore) &&
            parsedStore.ownerId === userData.uid
          ) {
            console.log("✅ getUserStore: Returning from localStorage");
            updateStore(parsedStore);
            return parsedStore;
          }
        } catch (error) {
          console.error("❌ Error parsing localStorage store:", error);
        }
      }

      // 3. جلب من السيرفر
      const userStores = await storeService.getByOwner(userData.uid);

      if (userStores.length > 0) {
        const userStore = userStores[0] as ExtendedStore;
        console.log("✅ getUserStore: Returning from server");
        updateStore(userStore);
        return userStore;
      }

      console.log("📭 getUserStore: No store found for user");
      return null;
    } catch (error) {
      console.error("❌ getUserStore Error:", error);
      return null;
    }
  };

  // ✅ تحديث المتجر في state و localStorage
  const updateStore = (newStore: ExtendedStore | null) => {
    setStore(newStore);

    if (newStore && isValidStore(newStore)) {
      localStorage.setItem("currentStore", JSON.stringify(newStore));
      console.log("💾 Store saved to localStorage:", {
        id: newStore.id,
        name: newStore.name,
        ownerId: newStore.ownerId,
      });
    } else {
      localStorage.removeItem("currentStore");
      console.log("🗑️ Store removed from localStorage");
    }
  };

  // ✅ دالة مساعدة لمسح المتجر
  const clearStore = () => {
    setStore(null);
    localStorage.removeItem("currentStore");
    console.log("🧹 Store cleared from context and storage");
  };

  // ✅ دالة لتحديث المتجر يدوياً
  const refreshStore = async () => {
    await loadStore();
  };

  // ✅ تعيين setStore للاستخدام الخارجي
  const setStoreWrapper = (newStore: ExtendedStore | null) => {
    if (
      newStore &&
      (!isValidStore(newStore) || newStore.ownerId !== userData?.uid)
    ) {
      console.error("❌ Cannot set store: Invalid data or user mismatch");
      return;
    }
    updateStore(newStore);
  };

  return (
    <StoreContext.Provider
      value={{
        store,
        setStore: setStoreWrapper,
        loading,
        refreshStore,
        getUserStore,
        clearStore,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
