// // D:\New folder (2)\store\client\contexts\AuthContext.tsx
// import React, { createContext, useContext, useEffect, useState } from "react";
// import { User } from "firebase/auth";
// import { useNavigate, useLocation } from "react-router-dom";
// import { onAuthStateChange, getUserData, UserData } from "@/lib/auth";
// import { getCurrentFallbackUser } from "@/lib/fallback-auth";
// import { onAuthStateChangeDev } from "@/lib/auth-dev";
// import { storeService } from "@/lib/firestore"; // ✅ استيراد من firestore بدلاً من store-management

// interface AuthContextType {
//   currentUser: User | null;
//   userData: UserData | null;
//   loading: boolean;
//   isOfflineMode: boolean;
//   refreshUserData: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType>({
//   currentUser: null,
//   userData: null,
//   loading: true,
//   isOfflineMode: false,
//   refreshUserData: async () => {},
// });

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// interface AuthProviderProps {
//   children: React.ReactNode;
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isOfflineMode, setIsOfflineMode] = useState(false);

//   const navigate = useNavigate();
//   const location = useLocation();

//   const refreshUserData = async () => {
//     if (currentUser) {
//       try {
//         const data = await getUserData(currentUser.uid);
//         setUserData(data);
//       } catch (error) {
//         console.warn("⚠️ Failed to refresh user data:", error);
//         // ❌ إزالة أي fallback إلى localStorage
//       }
//     }
//   };

//   useEffect(() => {
//     // ✅ الإصلاح: جعل Firebase يعمل دائماً
//     const isFirebaseDisabled = false; // ⬅️ تغيير من true إلى false

//     if (isFirebaseDisabled) {
//       console.log("🔧 Using development auth (Firebase disabled)");

//       // Use development auth system
//       const unsubscribe = onAuthStateChangeDev((user) => {
//         setCurrentUser(user);
//         setIsOfflineMode(true);

//         if (user) {
//           // ❌ إزالة أي استخدام لـ localStorage
//           setUserData({
//             uid: user.uid,
//             email: user.email || "",
//             firstName: "مستخدم",
//             lastName: "Firebase",
//             userType: "customer",
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             isActive: true,
//           });
//         } else {
//           setUserData(null);
//         }
//         setLoading(false);
//       });

//       return unsubscribe;
//     }

//     // ✅ Production Firebase auth - الكود الأساسي
//     try {
//       const unsubscribe = onAuthStateChange(async (user) => {
//         setCurrentUser(user);
//         setIsOfflineMode(false);

//         if (user) {
//           try {
//             const data = await getUserData(user.uid);
//             setUserData(data);

//             // ✅ تحديث اسم المتجر باستخدام Firebase مباشرة
//             // if (
//             //   data?.userType === "merchant" &&
//             //   data.firstName &&
//             //   data.firstName !== "تاجر"
//             // ) {
//             //   setTimeout(async () => {
//             //     try {
//             //       const merchantStores = await storeService.getByOwner(
//             //         user.uid,
//             //       );
//             //       if (merchantStores.length > 0) {
//             //         const merchantStore = merchantStores[0];
//             //         const expectedStoreName = `متجر ${data.firstName}`;
//             //         if (merchantStore.name !== expectedStoreName) {
//             //           console.log(
//             //             "🔧 Auto-updating store name for merchant:",
//             //             data.firstName,
//             //           );
//             //           await storeService.update(merchantStore.id, {
//             //             name: expectedStoreName,
//             //             description: `متجر ${data.firstName} للتجارة الإلكترونية`,
//             //           });
//             //           console.log("✅ Store name auto-updated in Firebase");
//             //         }
//             //       }
//             //     } catch (error) {
//             //       console.error("Error auto-updating store name:", error);
//             //     }
//             //   }, 1000);
//             // }
//           } catch (error) {
//             console.warn("⚠️ Failed to get user data:", error);
//             setUserData({
//               uid: user.uid,
//               email: user.email || "",
//               firstName: "مستخدم",
//               lastName: "",
//               userType: "customer",
//               createdAt: new Date(),
//               updatedAt: new Date(),
//               isActive: true,
//             });
//           }
//         } else {
//           setUserData(null);
//         }
//         setLoading(false);
//       });

//       return unsubscribe;
//     } catch (error) {
//       console.error("❌ Firebase auth initialization failed:", error);
//       setLoading(false);
//       setIsOfflineMode(true);
//     }
//   }, [navigate]);

//   const value = {
//     currentUser,
//     userData,
//     loading,
//     isOfflineMode,
//     refreshUserData,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// D:\New folder (2)\store\client\contexts\AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChange, getUserData, UserData } from "@/lib/auth";
import { onAuthStateChangeDev } from "@/lib/auth-dev";

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  isOfflineMode: boolean;
  refreshUserData: () => Promise<void>;
  setPendingRedirect: (path: string) => void;
  clearPendingRedirect: () => void;
  getPendingRedirect: () => string | null;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
  isOfflineMode: false,
  refreshUserData: async () => {},
  setPendingRedirect: () => {},
  clearPendingRedirect: () => {},
  getPendingRedirect: () => null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const refreshUserData = async () => {
    if (currentUser) {
      try {
        const data = await getUserData(currentUser.uid);
        setUserData(data);
      } catch (error) {
        console.warn("⚠️ Failed to refresh user data:", error);
      }
    }
  };

  // في AuthContext.tsx، أضف هذا الـ useEffect:

  useEffect(() => {
    // ✅ التحقق من تسجيل دخول حديث
    const checkRecentLogin = () => {
      try {
        const justLoggedIn = sessionStorage.getItem("auth_just_logged_in");
        const redirectPath = sessionStorage.getItem("auth_redirect_path");

        if (justLoggedIn === "true" && redirectPath) {
          console.log("🔄 Detected recent login, clearing flags");
          sessionStorage.removeItem("auth_just_logged_in");
          sessionStorage.removeItem("auth_redirect_path");

          // تأكيد تحديث بيانات المستخدم
          refreshUserData().catch(console.error);
        }
      } catch (error) {
        console.error("Error checking recent login:", error);
      }
    };

    checkRecentLogin();
  }, [currentUser, refreshUserData]);

  const handleSetPendingRedirect = (path: string) => {
    console.log("📍 Setting pending redirect to:", path);
    setPendingRedirect(path);
  };

  const handleClearPendingRedirect = () => {
    console.log("🧹 Clearing pending redirect");
    setPendingRedirect(null);
  };

  const handleGetPendingRedirect = (): string | null => {
    return pendingRedirect;
  };

  useEffect(() => {
    const isFirebaseDisabled = false; // ⬅️ تأكد أن Firebase يعمل

    if (isFirebaseDisabled) {
      console.log("🔧 Using development auth (Firebase disabled)");

      const unsubscribe = onAuthStateChangeDev((user) => {
        setCurrentUser(user);
        setIsOfflineMode(true);

        if (user) {
          setUserData({
            uid: user.uid,
            email: user.email || "",
            firstName: "مستخدم",
            lastName: "Firebase",
            userType: "customer",
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
          });
        } else {
          setUserData(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    }

    // ✅ Production Firebase auth
    try {
      const unsubscribe = onAuthStateChange(async (user) => {
        setCurrentUser(user);
        setIsOfflineMode(false);

        if (user) {
          try {
            const data = await getUserData(user.uid);
            setUserData(data);

            // ✅ تحقق إذا كان هناك توجيه مؤقت وتم تسجيل الدخول
            if (pendingRedirect) {
              console.log(
                "🚀 User logged in, executing pending redirect:",
                pendingRedirect,
              );
              const redirectPath = pendingRedirect;
              handleClearPendingRedirect();

              // تأخير بسيط للتأكد من تحديث كل شيء
              setTimeout(() => {
                navigate(redirectPath);
              }, 500);
            }
          } catch (error) {
            console.warn("⚠️ Failed to get user data:", error);
            setUserData({
              uid: user.uid,
              email: user.email || "",
              firstName: "مستخدم",
              lastName: "",
              userType: "customer",
              createdAt: new Date(),
              updatedAt: new Date(),
              isActive: true,
            });
          }
        } else {
          setUserData(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("❌ Firebase auth initialization failed:", error);
      setLoading(false);
      setIsOfflineMode(true);
    }
  }, [navigate, pendingRedirect]);

  const value = {
    currentUser,
    userData,
    loading,
    isOfflineMode,
    refreshUserData,
    setPendingRedirect: handleSetPendingRedirect,
    clearPendingRedirect: handleClearPendingRedirect,
    getPendingRedirect: handleGetPendingRedirect,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
