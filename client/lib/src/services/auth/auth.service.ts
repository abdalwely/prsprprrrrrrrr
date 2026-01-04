import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  User,
  UserCredential,
  ActionCodeSettings,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { UserData, AuthResult } from "../../types/user.types";

// Unified auth service
export const authService = {
  // ✅ Sign in user
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      console.log("🔐 Attempting sign in:", email);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Get user data
      const userData = await this.getUserData(userCredential.user.uid);

      console.log("✅ Sign in successful");
      return {
        success: true,
        user: userCredential,
        userData: userData || undefined,
      };
    } catch (error: any) {
      console.error("❌ Sign in failed:", error);

      let errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      if (error.code === "auth/user-not-found") {
        errorMessage = "الحساب غير موجود";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "كلمة المرور غير صحيحة";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "تم محاولة تسجيل الدخول مرات كثيرة. حاول مرة أخرى لاحقاً";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "فشل في الاتصال بالشبكة. تحقق من اتصالك بالإنترنت";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // ✅ Create account
  async createAccount(
    email: string,
    password: string,
    userData: Omit<
      UserData,
      "uid" | "createdAt" | "updatedAt" | "isActive" | "status"
    >,
  ): Promise<AuthResult> {
    try {
      console.log("📝 Creating account:", email);

      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Update profile
      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`,
      });

      // Create user document
      const completeUserData: UserData = {
        ...userData,
        uid: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        status: "active",
        role: userData.userType,
      };

      await setDoc(doc(db, "users", user.uid), completeUserData);

      console.log("✅ Account created successfully");
      return {
        success: true,
        user: userCredential,
        userData: completeUserData,
      };
    } catch (error: any) {
      console.error("❌ Account creation failed:", error);

      let errorMessage = "فشل في إنشاء الحساب";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "البريد الإلكتروني مسجل مسبقاً";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "كلمة المرور ضعيفة. يجب أن تكون 6 أحرف على الأقل";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "فشل في الاتصال بالشبكة. تحقق من اتصالك بالإنترنت";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // ✅ Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      console.log("✅ Sign out successful");
    } catch (error) {
      console.error("❌ Sign out failed:", error);
      throw error;
    }
  },

  // ✅ Get user data
  async getUserData(uid: string): Promise<UserData | null> {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          uid: userDoc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UserData;
      }
      return null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  },

  // ✅ Update user data
  async updateUserData(uid: string, data: Partial<UserData>): Promise<void> {
    try {
      await updateDoc(doc(db, "users", uid), {
        ...data,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  },

  // ✅ Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  },

  // ✅ Send email verification
  async sendEmailVerification(user: User): Promise<void> {
    try {
      const settings: ActionCodeSettings = {
        url: window.location.origin + "/email-verified",
        handleCodeInApp: true,
      };

      await sendEmailVerification(user, settings);
      console.log("✅ Verification email sent");
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw error;
    }
  },

  // ✅ Auth state observer
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // ✅ Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // ✅ Check if user is admin
  async isAdmin(uid: string): Promise<boolean> {
    const userData = await this.getUserData(uid);
    return userData?.userType === "admin";
  },

  // ✅ Check if user is merchant
  async isMerchant(uid: string): Promise<boolean> {
    const userData = await this.getUserData(uid);
    return userData?.userType === "merchant";
  },

  // ✅ Get merchant store ID
  async getMerchantStoreId(uid: string): Promise<string | null> {
    const userData = await this.getUserData(uid);
    return userData?.storeId || null;
  },
};

export default authService;
