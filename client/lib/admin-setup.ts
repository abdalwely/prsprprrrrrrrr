import { getDoc, doc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { UserData } from "./auth";

export const DEFAULT_ADMIN_EMAIL = "admin@ecommerce-platform.com";
export const DEFAULT_ADMIN_PASSWORD = "AdminPlatform2024!";

export interface AdminSetupResult {
  success: boolean;
  message: string;
  credentials?: {
    email: string;
    password: string;
  };
}

// Secure admin access checker (for frontend)
export const checkAdminExists = async (): Promise<AdminSetupResult> => {
  try {
    // فقط تحقق من وجود المستخدم Admin في Firestore
    const usersRef = doc(db, "users", DEFAULT_ADMIN_EMAIL); // إذا استخدمت UID يمكن تغييره
    const userDoc = await getDoc(usersRef);

    if (userDoc.exists()) {
      const data = userDoc.data() as UserData;
      if (data.userType === "admin") {
        return {
          success: true,
          message: "Admin user exists",
          credentials: {
            email: DEFAULT_ADMIN_EMAIL,
            password: DEFAULT_ADMIN_PASSWORD,
          },
        };
      }
    }

    return {
      success: false,
      message:
        "Admin user not found in Firestore. Please create manually via Firebase Console.",
      credentials: {
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
      },
    };
  } catch (error: any) {
    console.error("Error checking admin user:", error);
    return {
      success: false,
      message: `Error checking admin: ${error.message}`,
      credentials: {
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
      },
    };
  }
};

// Frontend safe login for admin
export const verifyAdminAccess = async (): Promise<boolean> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      DEFAULT_ADMIN_EMAIL,
      DEFAULT_ADMIN_PASSWORD,
    );

    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    return userDoc.exists() && userDoc.data()?.userType === "admin";
  } catch (error) {
    console.error("Admin verification failed:", error);
    return false;
  }
};
