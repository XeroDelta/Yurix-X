import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email) return alert("Please enter your email!");
    if (!password) return alert("Please enter your password!");

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Optional: Save UID to localStorage/session for later use
        localStorage.setItem("currentUserUID", user.uid);

        alert("Login successful!");
        window.location.href = "friends.html"; // redirect to friends page

    } catch (error) {
        console.error(error);
        alert("Login failed: " + error.message);
    }
});
