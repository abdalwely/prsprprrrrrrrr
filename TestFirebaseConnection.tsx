import React, { useEffect } from "react";
import { auth, db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

const TestFirebaseConnection = () => {
  useEffect(() => {
    const testConnection = async () => {
      try {
        // Firestore test
        const usersCol = collection(db, "users");
        const usersSnapshot = await getDocs(usersCol);
        console.log(
          "✅ Firestore connected. Documents count:",
          usersSnapshot.size,
        );

        // Auth test
        console.log("✅ Firebase Auth is available:", !!auth);
      } catch (error) {
        console.error("❌ Firebase connection failed:", error);
      }
    };

    testConnection();
  }, []);

  return (
    <div>🔧 Testing Firebase Connection... Check console for results.</div>
  );
};

export default TestFirebaseConnection;
