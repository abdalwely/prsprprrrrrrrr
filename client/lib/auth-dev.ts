// Development-only authentication that completely bypasses Firebase

import {
  getCurrentFallbackUser,
  fallbackSignIn,
  fallbackSignOut,
} from "./fallback-auth";

// ✅ الإصلاح: جعل Firebase مفعل دائماً في التطوير
const isFirebaseDisabled = () => {
  return false; // ⬅️ تغيير من true إلى false
};

// Development-only auth state management
let authListeners: ((user: any) => void)[] = [];
let currentDevUser: any = null;

// Initialize dev user from storage
const initializeDevUser = () => {
  if (isFirebaseDisabled()) {
    const fallbackUser = getCurrentFallbackUser();
    if (fallbackUser) {
      currentDevUser = fallbackUser;
      console.log("🔧 Dev auth initialized with user:", fallbackUser.email);
    }
  }
};

// Development auth state observer
export const onAuthStateChangeDev = (callback: (user: any) => void) => {
  if (!isFirebaseDisabled()) {
    // ✅ Use regular Firebase in production - مع الإصلاح
    import("./auth").then(({ onAuthStateChange }) => {
      return onAuthStateChange(callback);
    });
    // إرجاع دالة إلغاء اشتراك مؤقتة
    return () => {
      console.log("🔧 Temporary unsubscribe function");
    };
  }

  // Development mode
  authListeners.push(callback);

  // Immediately call with current user
  setTimeout(() => {
    callback(currentDevUser);
  }, 100);

  // Return unsubscribe function
  return () => {
    authListeners = authListeners.filter((listener) => listener !== callback);
  };
};

// Development sign in
// export const signInUserDev = async (email: string, password: string) => {
//   if (!isFirebaseDisabled()) {
//     // ✅ Use regular Firebase in production - مع الإصلاح
//     const { signInUser } = await import("./auth");
//     console.log("🔧 Development: Using REAL Firebase authentication");
//     return await signInUser(email, password);
//   }

//   // Development mode - Fallback (لن يتم استخدامه الآن)
//   console.log("🔧 Dev sign in attempt:", email);

//   try {
//     const result = await fallbackSignIn(email, password);
//     currentDevUser = result.user;

//     // Notify all listeners
//     authListeners.forEach((listener) => {
//       try {
//         listener(currentDevUser);
//       } catch (error) {
//         console.error("Error in auth listener:", error);
//       }
//     });

//     console.log("✅ Dev sign in successful");
//     return result;
//   } catch (error) {
//     console.error("❌ Dev sign in failed:", error);
//     throw error;
//   }
// };

// في auth-dev.ts، عدل signInUserDev:
export const signInUserDev = async (email: string, password: string) => {
  if (!isFirebaseDisabled()) {
    // ✅ Use regular Firebase in production
    const { signInUser } = await import("./auth");
    console.log("🔧 Development: Using REAL Firebase authentication");

    try {
      const userCredential = await signInUser(email, password);
      console.log("✅ REAL Firebase sign in successful", userCredential);

      // ✅ إرجاع نفس تنسيق AuthResult مع user و user.user
      return {
        success: true,
        user: {
          user: userCredential.user, // هذا مهم!
          ...userCredential,
        },
      };
    } catch (error: any) {
      console.error("❌ REAL Firebase sign in failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Development mode - Fallback
  console.log("🔧 Dev sign in attempt:", email);

  try {
    const result = await fallbackSignIn(email, password);
    currentDevUser = result.user;

    // Notify all listeners
    authListeners.forEach((listener) => {
      try {
        listener(currentDevUser);
      } catch (error) {
        console.error("Error in auth listener:", error);
      }
    });

    console.log("✅ Dev sign in successful");

    // ✅ إرجاع نفس تنسيق AuthResult
    return {
      success: true,
      user: result,
    };
  } catch (error: any) {
    console.error("❌ Dev sign in failed:", error);

    // ✅ إرجاع نفس تنسيق AuthResult للخطأ
    return {
      success: false,
      error: error.message || "Invalid credentials (development mode)",
    };
  }
};

// Development sign out
export const signOutUserDev = async () => {
  if (!isFirebaseDisabled()) {
    // ✅ Use regular Firebase in production - مع الإصلاح
    const { signOutUser } = await import("./auth");
    console.log("🔧 Development: Using REAL Firebase sign out");
    return await signOutUser();
  }

  // Development mode
  console.log("🔧 Dev sign out");

  await fallbackSignOut();
  currentDevUser = null;

  // Notify all listeners
  authListeners.forEach((listener) => {
    try {
      listener(null);
    } catch (error) {
      console.error("Error in auth listener:", error);
    }
  });

  console.log("✅ Dev sign out successful");
};

// Get current user (development)
export const getCurrentUserDev = () => {
  if (!isFirebaseDisabled()) {
    return null; // Use regular Firebase auth in production
  }

  return currentDevUser;
};

// Initialize development auth
if (isFirebaseDisabled()) {
  initializeDevUser();
}

// Development-only exports
export const devAuth = {
  currentUser: getCurrentUserDev(),
  onAuthStateChanged: onAuthStateChangeDev,
  signInWithEmailAndPassword: signInUserDev,
  signOut: signOutUserDev,
};
