import fetch from "node-fetch";

const API_KEY = "AIzaSyBB2N2zAuf4kDf3j5x263tI9mwVXiVf92A";

const testSignUp = async () => {
  try {
    console.log("🔍 Testing Firebase Auth connection...");

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "testuser@example.com",
          password: "Test1234",
          returnSecureToken: true,
        }),
      },
    );

    console.log(`📊 Response status: ${response.status}`);
    console.log(`📋 Response OK: ${response.ok}`);

    const data = await response.json();
    console.log("📄 Full response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("❌ Firebase Error:", data.error.message);
      console.log("🔧 Error code:", data.error.code);
      console.log("📖 Error details:", data.error.details);
    } else {
      console.log("✅ Firebase Auth is working!");
      console.log("📧 User:", data.email);
      console.log("🆔 User ID:", data.localId);
    }
  } catch (error) {
    console.error("💥 Network error:", error.message);
    console.error("🔧 Stack:", error.stack);
  }
};

testSignUp();
