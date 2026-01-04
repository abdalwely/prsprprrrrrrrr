import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../src/services/auth/auth.service";
import { UserData } from "../src/types/user.types";

// نوع سياق المصادقة
interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
  logout: () => Promise<void>;
}

// إنشاء السياق
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
  refreshUserData: async () => {},
  logout: async () => {},
});

// Hook لاستخدام السياق
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// خصائص المزود
interface AuthProviderProps {
  children: React.ReactNode;
}

// مزود سياق المصادقة
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // دالة لتحديث بيانات المستخدم
  const refreshUserData = async () => {
    if (currentUser) {
      try {
        console.log("🔄 [AUTH-CONTEXT] Refreshing user data...");
        const data = await authService.getUserData(currentUser.uid);
        if (data) {
          setUserData(data);
          console.log("✅ [AUTH-CONTEXT] User data refreshed");
        } else {
          console.warn("⚠️ [AUTH-CONTEXT] User data not found");
          setUserData(null);
        }
      } catch (error) {
        console.warn("⚠️ [AUTH-CONTEXT] Failed to refresh user data:", error);
        setUserData(null);
      }
    } else {
      setUserData(null);
    }
  };

  // دالة لتسجيل الخروج
  const logout = async () => {
    try {
      await authService.signOut();
      setCurrentUser(null);
      setUserData(null);
      localStorage.removeItem("currentStore");
      localStorage.removeItem("pendingStoreInfo");
      sessionStorage.removeItem("auth_just_logged_in");
      sessionStorage.removeItem("auth_redirect_path");
      console.log("👋 [AUTH-CONTEXT] User logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("❌ [AUTH-CONTEXT] Logout failed:", error);
    }
  };

  // تأثير لمراقبة تغيرات حالة المصادقة
  useEffect(() => {
    console.log("🚀 [AUTH-CONTEXT] Setting up auth state listener");

    const unsubscribe = authService.onAuthStateChange(async (user) => {
      console.log("👤 [AUTH-CONTEXT] Auth state changed:", user?.email);
      setCurrentUser(user);

      if (user) {
        try {
          // جلب بيانات المستخدم من Firestore
          const data = await authService.getUserData(user.uid);
          setUserData(data);

          // تسجيل معلومات الدخول
          console.log("✅ [AUTH-CONTEXT] User authenticated:", {
            uid: user.uid,
            email: user.email,
            userType: data?.userType,
          });

          // التحقق من تسجيل دخول حديث
          const justLoggedIn = sessionStorage.getItem("auth_just_logged_in");
          const redirectPath = sessionStorage.getItem("auth_redirect_path");

          if (justLoggedIn === "true" && redirectPath) {
            console.log(
              "🔄 [AUTH-CONTEXT] Detected recent login, redirecting...",
            );
            sessionStorage.removeItem("auth_just_logged_in");
            sessionStorage.removeItem("auth_redirect_path");

            setTimeout(() => {
              navigate(redirectPath, { replace: true });
            }, 100);
          }
        } catch (error) {
          console.warn("⚠️ [AUTH-CONTEXT] Failed to get user data:", error);
          setUserData(null);
        }
      } else {
        // المستخدم غير مسجل دخول
        setUserData(null);
        console.log("👋 [AUTH-CONTEXT] User signed out");

        // تنظيف localStorage الخاص بالمصادقة
        localStorage.removeItem("fallback_user");
      }

      setLoading(false);
    });

    // تنظيف الاشتراك عند فك تركيب المكون
    return () => {
      console.log("🧹 [AUTH-CONTEXT] Cleaning up auth listener");
      unsubscribe();
    };
  }, [navigate]);

  // قيمة السياق
  const value = {
    currentUser,
    userData,
    loading,
    refreshUserData,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
