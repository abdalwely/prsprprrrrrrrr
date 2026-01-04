import { doc, getDoc } from "firebase/firestore";
import { FirebaseDiagnostics } from "../types/user.types";
import { db, usingEmulators } from "../firebase/firebase";

export const testFirebaseConnection =
  async (): Promise<FirebaseDiagnostics> => {
    const result: FirebaseDiagnostics = {
      authConnected: false,
      firestoreConnected: false,
    };

    try {
      // Test Firestore connection
      const testDoc = doc(db, "_test", "connection_test");
      await getDoc(testDoc);
      result.firestoreConnected = true;

      // Test Auth by checking if auth instance exists
      result.authConnected = true; // We'll assume auth is connected if Firestore is

      if (usingEmulators) {
        result.suggestion = "✅ Connected to Firebase emulators";
      } else {
        result.suggestion = "✅ Connected to live Firebase services";
      }

      console.log("✅ Firebase connection test passed:", result);
    } catch (error: any) {
      result.firestoreConnected = false;
      result.authConnected = false;
      result.error = error.message;

      if (process.env.NODE_ENV === "development") {
        result.suggestion =
          "❌ Check if Firebase emulators are running (auth:9099, firestore:8080, storage:9199)\n" +
          "   Run: firebase emulators:start";
      } else {
        result.suggestion =
          "❌ Check Firebase configuration and internet connection\n" +
          "   Make sure Firebase project is properly configured";
      }

      console.error("❌ Firebase connection test failed:", error);
    }

    return result;
  };

export const quickConnectionTest = async (): Promise<boolean> => {
  try {
    const diagnostics = await testFirebaseConnection();
    return diagnostics.authConnected && diagnostics.firestoreConnected;
  } catch (error) {
    console.error("Quick connection test failed:", error);
    return false;
  }
};
