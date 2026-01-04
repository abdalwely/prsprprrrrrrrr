// // import React, {
// //   createContext,
// //   useContext,
// //   useState,
// //   ReactNode,
// //   useEffect,
// // } from "react";
// // import { Store } from "@/lib/firestore";
// // import { useAuth } from "@/contexts/AuthContext";

// // interface StoreContextType {
// //   store: Store | null;
//   // setStore: (store: Store | null) => void;
// //   loading: boolean;
// //   refreshStore: () => void;
// // }

// // const StoreContext = createContext<StoreContextType | undefined>(undefined);

// // export const StoreProvider: React.FC<{ children: ReactNode }> = ({
// //   children,
// // }) => {
// //   const [store, setStore] = useState<Store | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const { userData } = useAuth();

// //   // ✅ تحميل بيانات المتجر من localStorage مع التحقق من المالك
// //   useEffect(() => {
// //     loadStoreFromStorage();
// //   }, [userData]); // ✅ إضافة userData ك dependency

// //   const loadStoreFromStorage = () => {
// //     const storedStore = localStorage.getItem("currentStore");

// //     if (storedStore) {
// //       try {
// //         const storeData = JSON.parse(storedStore);

// //         // ✅ التحقق الجديد: تأكد أن المستخدم الحالي هو مالك المتجر
// //         if (userData && storeData.ownerId === userData.uid) {
// //           setStore(storeData);
// //           console.log("📦 Store loaded from localStorage:", {
// //             storeId: storeData.id,
// //             storeName: storeData.name,
// //             ownerId: storeData.ownerId,
// //             currentUser: userData.uid,
// //             match: true,
// //           });
// //         } else {
// //           // ❌ المتجر المخزن لا ينتمي للمستخدم الحالي
// //           console.log("❌ Stored store does not belong to current user:", {
// //             storedOwner: storeData.ownerId,
// //             currentUser: userData?.uid,
// //             storeId: storeData.id,
// //           });
// //           localStorage.removeItem("currentStore");
// //           setStore(null);
// //         }
// //       } catch (error) {
// //         console.error("❌ Error parsing stored store:", error);
// //         localStorage.removeItem("currentStore");
// //         setStore(null);
// //       }
// //     } else {
// //       console.log("🔍 No store found in localStorage");
// //       setStore(null);
// //     }

// //     setLoading(false);
// //   };

// //   // ✅ تحديث localStorage عند تغيير المتجر مع التحقق
// //   const updateStore = (newStore: Store | null) => {
// //     if (newStore && userData && newStore.ownerId !== userData.uid) {
// //       console.error("❌ Cannot set store: User is not the owner!", {
// //         storeOwner: newStore.ownerId,
// //         currentUser: userData.uid,
// //       });
// //       return;
// //     }

// //     setStore(newStore);

// //     if (newStore) {
// //       localStorage.setItem("currentStore", JSON.stringify(newStore));
// //       console.log("💾 Store saved to localStorage:", {
// //         storeId: newStore.id,
// //         storeName: newStore.name,
// //         ownerId: newStore.ownerId,
// //       });
// //     } else {
// //       localStorage.removeItem("currentStore");
// //       console.log("🗑️ Store removed from localStorage");
// //     }
// //   };

// //   // ✅ دالة لتحديث المتجر
// //   const refreshStore = () => {
// //     loadStoreFromStorage();
// //   };

// //   return (
// //     <StoreContext.Provider
// //       value={{
// //         store,
// //         setStore: updateStore,
// //         loading,
// //         refreshStore,
// //       }}
// //     >
// //       {children}
// //     </StoreContext.Provider>
// //   );
// // };

// // export const useStore = () => {
// //   const context = useContext(StoreContext);
// //   if (context === undefined) {
// //     throw new Error("useStore must be used within a StoreProvider");
// //   }
// //   return context;
// // };

// //

// import React, {
//   createContext,
//   useContext,
//   useState,
//   ReactNode,
//   useEffect,
// } from "react";
// import { useAuth } from "@/contexts/AuthContext";
// import { storeService } from "@/lib/src";
// import adminService from "@/lib/src/services/admin/admin.service";

// // نوع سياق المتجر
// interface StoreContextType {
//   store: any | null;
//   setStore: (store: any | null) => void;
//   loading: boolean;
//   refreshStore: () => Promise<void>;
//   getUserStore: () => Promise<any | null>;
//   clearStore: () => void;
// }

// // إنشاء السياق
// const StoreContext = createContext<StoreContextType | undefined>(undefined);

// // المزود الرئيسي
// export const StoreProvider: React.FC<{ children: ReactNode }> = ({
//   children,
// }) => {
//   const [store, setStore] = useState<any | null>(null);
//   const [loading, setLoading] = useState(true);
//   const { userData } = useAuth();

//   // تحميل المتجر عند تغيير بيانات المستخدم
//   useEffect(() => {
//     loadStore();
//   }, [userData?.uid]);

//   // الدالة الرئيسية لتحميل المتجر
//   const loadStore = async () => {
//     setLoading(true);

//     if (!userData?.uid) {
//       console.log("👤 [STORE-CONTEXT] No user data, skipping store load");
//       setStore(null);
//       setLoading(false);
//       return;
//     }

//     try {
//       console.log("🚀 [STORE-CONTEXT] Loading store for user:", userData.uid);

//       // 1. جلب من state إذا موجود وصحيح
//       if (store && store.ownerId === userData.uid) {
//         console.log("✅ [STORE-CONTEXT] Store already loaded in state");
//         setLoading(false);
//         return;
//       }

//       // 2. جلب من localStorage مع التحقق
//       const storedStore = localStorage.getItem("currentStore");
//       if (storedStore) {
//         try {
//           const parsedStore = JSON.parse(storedStore);

//           if (parsedStore.ownerId === userData.uid) {
//             console.log(
//               "📦 [STORE-CONTEXT] Store loaded from localStorage:",
//               parsedStore.name,
//             );
//             setStore(parsedStore);
//             setLoading(false);
//             return;
//           } else {
//             console.warn(
//               "⚠️ [STORE-CONTEXT] Mismatched store in localStorage, clearing...",
//             );
//             localStorage.removeItem("currentStore");
//           }
//         } catch (error) {
//           console.error(
//             "❌ [STORE-CONTEXT] Error parsing stored store:",
//             error,
//           );
//           localStorage.removeItem("currentStore");
//         }
//       }

//       // 3. جلب من السيرفر
//       await fetchUserStore();
//     } catch (error) {
//       console.error("❌ [STORE-CONTEXT] Error loading store:", error);
//       setStore(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // جلب متجر المستخدم من السيرفر
//   const fetchUserStore = async () => {
//     if (!userData?.uid) {
//       console.log("👤 [STORE-CONTEXT] No user data for fetch");
//       return;
//     }

//     try {
//       console.log(
//         "🌐 [STORE-CONTEXT] Fetching store from server for user:",
//         userData.uid,
//       );

//       const userStores = await storeService.getByOwner(userData.uid);

//       // في وضع التطوير: إنشاء متجر تطوير إذا لزم الأمر
//       if (
//         userStores.length === 0 &&
//         process.env.NODE_ENV === "development" &&
//         userData.userType === "merchant"
//       ) {
//         console.log(
//           "🔧 [STORE-CONTEXT] Development mode: Creating dev store...",
//         );

//         try {
//           const storeId = await adminService.initializeDevStore(
//             userData.uid,
//             "متجر التطوير",
//           );
//           const newStore = await storeService.getById(storeId);

//           if (newStore) {
//             updateStore(newStore);
//             return;
//           }
//         } catch (devError) {
//           console.warn(
//             "⚠️ [STORE-CONTEXT] Could not create dev store:",
//             devError,
//           );
//         }
//       }

//       if (userStores.length > 0) {
//         const userStore = userStores[0];
//         console.log(
//           "✅ [STORE-CONTEXT] User store loaded from server:",
//           userStore.name,
//         );
//         updateStore(userStore);
//       } else {
//         console.log("📭 [STORE-CONTEXT] User has no store");
//         updateStore(null);
//       }
//     } catch (error) {
//       console.error("❌ [STORE-CONTEXT] Error fetching user store:", error);
//       updateStore(null);
//     }
//   };

//   // دالة لجلب متجر المستخدم (للاستخدام في المكونات)
//   const getUserStore = async (): Promise<any | null> => {
//     if (!userData?.uid) {
//       console.log("👤 [STORE-CONTEXT] getUserStore: No user data");
//       return null;
//     }

//     try {
//       console.log("🔍 [STORE-CONTEXT] getUserStore: Fetching store...");

//       // 1. جلب من state إذا موجود وصحيح
//       if (store && store.ownerId === userData.uid) {
//         console.log("✅ [STORE-CONTEXT] getUserStore: Returning from state");
//         return store;
//       }

//       // 2. جلب من localStorage
//       const storedStore = localStorage.getItem("currentStore");
//       if (storedStore) {
//         try {
//           const parsedStore = JSON.parse(storedStore);
//           if (parsedStore.ownerId === userData.uid) {
//             console.log(
//               "✅ [STORE-CONTEXT] getUserStore: Returning from localStorage",
//             );
//             updateStore(parsedStore);
//             return parsedStore;
//           }
//         } catch (error) {
//           console.error(
//             "❌ [STORE-CONTEXT] Error parsing localStorage store:",
//             error,
//           );
//         }
//       }

//       // 3. جلب من السيرفر
//       const userStores = await storeService.getByOwner(userData.uid);

//       if (userStores.length > 0) {
//         const userStore = userStores[0];
//         console.log("✅ [STORE-CONTEXT] getUserStore: Returning from server");
//         updateStore(userStore);
//         return userStore;
//       }

//       console.log("📭 [STORE-CONTEXT] getUserStore: No store found for user");
//       return null;
//     } catch (error) {
//       console.error("❌ [STORE-CONTEXT] getUserStore Error:", error);
//       return null;
//     }
//   };

//   // تحديث المتجر في state و localStorage
//   const updateStore = (newStore: any | null) => {
//     setStore(newStore);

//     if (newStore) {
//       localStorage.setItem("currentStore", JSON.stringify(newStore));
//       console.log("💾 [STORE-CONTEXT] Store saved to localStorage:", {
//         id: newStore.id,
//         name: newStore.name,
//         ownerId: newStore.ownerId,
//       });
//     } else {
//       localStorage.removeItem("currentStore");
//       console.log("🗑️ [STORE-CONTEXT] Store removed from localStorage");
//     }
//   };

//   // دالة لمسح المتجر
//   const clearStore = () => {
//     setStore(null);
//     localStorage.removeItem("currentStore");
//     console.log("🧹 [STORE-CONTEXT] Store cleared from context and storage");
//   };

//   // دالة لتحديث المتجر يدوياً
//   const refreshStore = async () => {
//     await loadStore();
//   };

//   // تعيين setStore للاستخدام الخارجي مع التحقق
//   const setStoreWrapper = (newStore: any | null) => {
//     if (newStore && newStore.ownerId !== userData?.uid) {
//       console.error("❌ [STORE-CONTEXT] Cannot set store: User mismatch");
//       return;
//     }
//     updateStore(newStore);
//   };

//   // قيمة السياق
//   const value = {
//     store,
//     setStore: setStoreWrapper,
//     loading,
//     refreshStore,
//     getUserStore,
//     clearStore,
//   };

//   return (
//     <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
//   );
// };

// // Hook لاستخدام سياق المتجر
// export const useStore = () => {
//   const context = useContext(StoreContext);
//   if (context === undefined) {
//     throw new Error("useStore must be used within a StoreProvider");
//   }
//   return context;
// };
