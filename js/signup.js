import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

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

  if (!username) {
    alert("Please enter a username.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save the username and status to Firestore
    await setDoc(doc(db, "users", user.uid), {
      username,
      email,
      status: "online",
      profilePic: "https://i.pravatar.cc/150?u=" + user.uid // optional placeholder
    });

    alert("Signup successful!");
    window.location.href = "friends.html";
  } catch (error) {
    alert(error.message);
  }
});
