import { auth, db } from "./firebase-fixed.mjs";
import { signInWithEmailAndPassword } from "firebase/auth";

async function testFixedFirebase() {
  try {
    console.log("🧪 Testing fixed Firebase...");

    const result = await signInWithEmailAndPassword(
      auth,
      "testuser@example.com",
      "Test1234",
    );

    console.log("✅ Fixed Firebase works!", result.user.email);
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

testFixedFirebase();
