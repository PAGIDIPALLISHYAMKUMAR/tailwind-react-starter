


// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQNwpqVUGiPY2FKgAzw7BPyVZRCDzkhns",
  authDomain: "devops-5a609.firebaseapp.com",
  projectId: "devops-5a609",
  storageBucket: "devops-5a609.firebasestorage.app",
  messagingSenderId: "555889621160",
  appId: "1:555889621160:web:398b8f5977d0131483aa9d",
  measurementId: "G-8V49H6RV03"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });
const analytics = getAnalytics(app);