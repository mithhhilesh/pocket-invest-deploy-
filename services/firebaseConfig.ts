// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3GBSsb_dNRgOxKKilZxu6N0pa-GEQyFY",
  authDomain: "pocket-invest-feea1.firebaseapp.com",
  databaseURL: "https://pocket-invest-feea1-default-rtdb.firebaseio.com",
  projectId: "pocket-invest-feea1",
  storageBucket: "pocket-invest-feea1.firebasestorage.app",
  messagingSenderId: "668380257702",
  appId: "1:668380257702:web:93e8473d5fedfa3c378367",
  measurementId: "G-9Y21W000S6",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const rtdb = getDatabase(app);

// Analytics (only runs in browser)
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;
