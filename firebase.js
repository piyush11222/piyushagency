// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAUoKa_d6aeheuKRTyRm_7cla1aJEbUUoQ",
  authDomain: "piyush-agency.firebaseapp.com",
  projectId: "piyush-agency",
  storageBucket: "piyush-agency.firebasestorage.app",
  messagingSenderId: "931552293046",
  appId: "1:931552293046:web:94c6d622e3a9edad587617",
  measurementId: "G-V2L4CVKDPZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
