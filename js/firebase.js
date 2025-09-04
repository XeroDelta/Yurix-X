// js/firebase.js
// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDYEdKmNFmS3vRhKtkYEQoCQhO2Hzr9vmA",
  authDomain: "yurix-x-d2dc5.firebaseapp.com",
  projectId: "yurix-x-d2dc5",
  storageBucket: "yurix-x-d2dc5.firebasestorage.app",
  messagingSenderId: "213856481440",
  appId: "1:213856481440:web:b9846ca3ee70b85c4719c5",
  measurementId: "G-HDF5W64NHE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export what you need
export { app, auth, db };
