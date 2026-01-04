// // // D:\New folder (2)\store\client\contexts\AuthContext.tsx
// // import React, { createContext, useContext, useEffect, useState } from "react";
// // import { User } from "firebase/auth";
// // import { useNavigate, useLocation } from "react-router-dom";
// // import { onAuthStateChange, getUserData, UserData } from "@/lib/auth";
// // import { getCurrentFallbackUser } from "@/lib/fallback-auth";
// // import { onAuthStateChangeDev } from "@/lib/auth-dev";
// // import { storeService } from "@/lib/firestore"; // ✅ استيراد من firestore بدلاً من store-management

// // interface AuthContextType {
// //   currentUser: User | null;
// //   userData: UserData | null;
// //   loading: boolean;
// //   isOfflineMode: boolean;
// //   refreshUserData: () => Promise<void>;
// // }

// // const AuthContext = createContext<AuthContextType>({
// //   currentUser: null,
// //   userData: null,
// //   loading: true,
// //   isOfflineMode: false,
// //   refreshUserData: async () => {},
// // });

// // export const useAuth = () => {
// //   const context = useContext(AuthContext);
// //   if (!context) {
// //     throw new Error("useAuth must be used within an AuthProvider");
// //   }
// //   return context;
// // };

// // interface AuthProviderProps {
// //   children: React.ReactNode;
// // }

// // export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
// //   const [currentUser, setCurrentUser] = useState<User | null>(null);
// //   const [userData, setUserData] = useState<UserData | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [isOfflineMode, setIsOfflineMode] = useState(false);

// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   const refreshUserData = async () => {
// //     if (currentUser) {
// //       try {
// //         const data = await getUserData(currentUser.uid);
// //         setUserData(data);
// //       } catch (error) {
// //         console.warn("⚠️ Failed to refresh user data:", error);
// //         // ❌ إزالة أي fallback إلى localStorage
// //       }
// //     }
// //   };

// //   useEffect(() => {
// //     // ✅ الإصلاح: جعل Firebase يعمل دائماً
// //     const isFirebaseDisabled = false; // ⬅️ تغيير من true إلى false

// //     if (isFirebaseDisabled) {
// //       console.log("🔧 Using development auth (Firebase disabled)");

// //       // Use development auth system
// //       const unsubscribe = onAuthStateChangeDev((user) => {
// //         setCurrentUser(user);
// //         setIsOfflineMode(true);

// //         if (user) {
// //           // ❌ إزالة أي استخدام لـ localStorage
// //           setUserData({
// //             uid: user.uid,
// //             email: user.email || "",
// //             firstName: "مستخدم",
// //             lastName: "Firebase",
// //             userType: "customer",
// //             createdAt: new Date(),
// //             updatedAt: new Date(),
// //             isActive: true,
// //           });
// //         } else {
// //           setUserData(null);
// //         }
// //         setLoading(false);
// //       });

// //       return unsubscribe;
// //     }

// //     // ✅ Production Firebase auth - الكود الأساسي
// //     try {
// //       const unsubscribe = onAuthStateChange(async (user) => {
// //         setCurrentUser(user);
// //         setIsOfflineMode(false);

// //         if (user) {
// //           try {
// //             const data = await getUserData(user.uid);
// //             setUserData(data);

// //             // ✅ تحديث اسم المتجر باستخدام Firebase مباشرة
// //             // if (
// //             //   data?.userType === "merchant" &&
// //             //   data.firstName &&
// //             //   data.firstName !== "تاجر"
// //             // ) {
// //             //   setTimeout(async () => {
// //             //     try {
// //             //       const merchantStores = await storeService.getByOwner(
// //             //         user.uid,
// //             //       );
// //             //       if (merchantStores.length > 0) {
// //             //         const merchantStore = merchantStores[0];
// //             //         const expectedStoreName = `متجر ${data.firstName}`;
// //             //         if (merchantStore.name !== expectedStoreName) {
// //             //           console.log(
// //             //             "🔧 Auto-updating store name for merchant:",
// //             //             data.firstName,
// //             //           );
// //             //           await storeService.update(merchantStore.id, {
// //             //             name: expectedStoreName,
// //             //             description: `متجر ${data.firstName} للتجارة الإلكترونية`,
// //             //           });
// //             //           console.log("✅ Store name auto-updated in Firebase");
// //             //         }
// //             //       }
// //             //     } catch (error) {
// //             //       console.error("Error auto-updating store name:", error);
// //             //     }
// //             //   }, 1000);
// //             // }
// //           } catch (error) {
// //             console.warn("⚠️ Failed to get user data:", error);
// //             setUserData({
// //               uid: user.uid,
// //               email: user.email || "",
// //               firstName: "مستخدم",
// //               lastName: "",
// //               userType: "customer",
// //               createdAt: new Date(),
// //               updatedAt: new Date(),
// //               isActive: true,
// //             });
// //           }
// //         } else {
// //           setUserData(null);
// //         }
// //         setLoading(false);
// //       });

// //       return unsubscribe;
// //     } catch (error) {
// //       console.error("❌ Firebase auth initialization failed:", error);
// //       setLoading(false);
// //       setIsOfflineMode(true);
// //     }
// //   }, [navigate]);

// //   const value = {
// //     currentUser,
// //     userData,
// //     loading,
// //     isOfflineMode,
// //     refreshUserData,
// //   };

// //   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// // };

// // D:\New folder (2)\store\client\contexts\AuthContext.tsx
// import React, { createContext, useContext, useEffect, useState } from "react";
// import { User } from "firebase/auth";
// import { useNavigate, useLocation } from "react-router-dom";
// import { UserData } from "@/lib/src/types/user.types";
// import authService from "@/lib/src/services/auth/auth.service";

// // نوع سياق المصادقة
// interface AuthContextType {
//   currentUser: User | null;
//   userData: UserData | null;
//   loading: boolean;
//   refreshUserData: () => Promise<void>;
// }

// // إنشاء السياق
// const AuthContext = createContext<AuthContextType>({
//   currentUser: null,
//   userData: null,
//   loading: true,
//   refreshUserData: async () => {},
// });

// // Hook لاستخدام السياق
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// // خصائص المزود
// interface AuthProviderProps {
//   children: React.ReactNode;
// }

// // مزود سياق المصادقة
// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [loading, setLoading] = useState(true);

//   const navigate = useNavigate();
//   const location = useLocation();

//   // دالة لتحديث بيانات المستخدم
//   const refreshUserData = async () => {
//     if (currentUser) {
//       try {
//         console.log("🔄 [AUTH-CONTEXT] Refreshing user data...");
//         const data = await authService.getUserData(currentUser.uid);
//         setUserData(data);
//         console.log("✅ [AUTH-CONTEXT] User data refreshed");
//       } catch (error) {
//         console.warn("⚠️ [AUTH-CONTEXT] Failed to refresh user data:", error);
//       }
//     } else {
//       setUserData(null);
//     }
//   };

//   // تأثير لمراقبة تغيرات حالة المصادقة
//   useEffect(() => {
//     console.log("🚀 [AUTH-CONTEXT] Setting up auth state listener");

//     const unsubscribe = authService.onAuthStateChange(async (user) => {
//       console.log("👤 [AUTH-CONTEXT] Auth state changed:", user?.email);
//       setCurrentUser(user);

//       if (user) {
//         try {
//           // جلب بيانات المستخدم من Firestore
//           const data = await authService.getUserData(user.uid);
//           setUserData(data);

//           // تسجيل معلومات الدخول
//           console.log("✅ [AUTH-CONTEXT] User authenticated:", {
//             uid: user.uid,
//             email: user.email,
//             userType: data?.userType,
//           });

//           // التحقق من تسجيل دخول حديث
//           const justLoggedIn = sessionStorage.getItem("auth_just_logged_in");
//           const redirectPath = sessionStorage.getItem("auth_redirect_path");

//           if (justLoggedIn === "true" && redirectPath) {
//             console.log(
//               "🔄 [AUTH-CONTEXT] Detected recent login, redirecting...",
//             );
//             sessionStorage.removeItem("auth_just_logged_in");
//             sessionStorage.removeItem("auth_redirect_path");

//             setTimeout(() => {
//               navigate(redirectPath, { replace: true });
//             }, 100);
//           }
//         } catch (error) {
//           console.warn("⚠️ [AUTH-CONTEXT] Failed to get user data:", error);
//           setUserData(null);
//         }
//       } else {
//         // المستخدم غير مسجل دخول
//         setUserData(null);
//         console.log("👋 [AUTH-CONTEXT] User signed out");

//         // تنظيف localStorage الخاص بالمصادقة
//         localStorage.removeItem("fallback_user");
//       }

//       setLoading(false);
//     });

//     // تنظيف الاشتراك عند فك تركيب المكون
//     return () => {
//       console.log("🧹 [AUTH-CONTEXT] Cleaning up auth listener");
//       unsubscribe();
//     };
//   }, [navigate]);

//   // قيمة السياق
//   const value = {
//     currentUser,
//     userData,
//     loading,
//     refreshUserData,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };
