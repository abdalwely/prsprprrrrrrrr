import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBB2N2zAuf4kDf3j5x263tI9mwVXiVf92A",
  authDomain: "house-2fbd2.firebaseapp.com",
  projectId: "house-2fbd2",
};

async function testAuth() {
  console.log("🔍 جاري اختبار Firebase Auth...");

  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const email = `test${Date.now()}@example.com`;
    const password = "Test123456";

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    console.log("✅ نجح الاختبار!");
    console.log("📧 الايميل:", userCredential.user.email);
    console.log("🆔 الرقم:", userCredential.user.uid);
  } catch (error) {
    console.log("❌ فشل في الاختبار:");
    console.log("📋 كود الخطأ:", error.code);
    console.log("📖 رسالة الخطأ:", error.message);
  }
}

testAuth();
