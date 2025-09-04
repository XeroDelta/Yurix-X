import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase config
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

const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!username) return alert("Enter a username!");
  if (!email) return alert("Enter an email!");
  if (!password) return alert("Enter a password!");
  if (password !== confirmPassword) return alert("Passwords do not match!");

  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create Firestore document for the user
    await setDoc(doc(db, "users", user.uid), {
      username: username,
      email: email,
      status: "online",
      profilePic: "https://i.pravatar.cc/150?u=" + user.uid,
      friends: [] // initialize friends array
    });

    alert("Signup successful!");
    window.location.href = "friends.html"; // redirect after signup

  } catch (error) {
    alert("Signup failed: " + error.message);
    console.error(error);
  }
});
