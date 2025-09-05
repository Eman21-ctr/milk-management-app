// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// FIX: Reverted to hardcoded config to fix runtime error.
// The current execution environment does not support Vite's `import.meta.env`.
const firebaseConfig = {
  apiKey: "AIzaSyDu4EkAAiud3VDvK2QEu23YBc7ruoKZB6U",
  authDomain: "milk-app-472b9.firebaseapp.com",
  projectId: "milk-app-472b9",
  storageBucket: "milk-app-472b9.appspot.com",
  messagingSenderId: "67275298885",
  appId: "1:67275298885:web:d94e42d4f14440501d6b2c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);