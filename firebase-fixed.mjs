// firebase-fixed.mjs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBB2N2zAuf4kDf3j5x263tI9mwVXiVf92A",
  authDomain: "house-2fbd2.firebaseapp.com",
  databaseURL: "https://house-2fbd2-default-rtdb.firebaseio.com",
  projectId: "house-2fbd2",
  storageBucket: "house-2fbd2.appspot.com",
  messagingSenderId: "482292708652",
  appId: "1:482292708652:web:f6050742a012b2720c2889",
  measurementId: "G-VRW7LE4V7B",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("✅ Firebase fixed module loaded");
