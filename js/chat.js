import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

let currentUser = null;
let chatFriendUID = localStorage.getItem('chatFriendUID');
let chatFriendName = localStorage.getItem('chatFriendName');

// Redirect if no chat friend
if (!chatFriendUID) {
  alert("No friend selected for chat!");
  window.location.href = "friends.html";
}

// Redirect if not logged in
onAuthStateChanged(auth, async user => {
  if (!user) window.location.href = 'index.html';
  currentUser = user;

  // Check if friend relationship exists
  const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));
  const friendDoc = await getDoc(doc(db, "users", chatFriendUID));

  if (!currentUserDoc.exists() || !friendDoc.exists()) {
    alert("User data missing!");
    window.location.href = "friends.html";
    return;
  }

  const currentUserData = currentUserDoc.data();
  const friendData = friendDoc.data();

  if (!currentUserData.friends.includes(chatFriendUID) || !friendData.friends.includes(currentUser.uid)) {
    alert("You are not friends with this user!");
    window.location.href = "friends.html";
    return;
  }

  // Load messages
  loadMessages();
});

// Send message
sendBtn.addEventListener('click', async () => {
  const text = chatInput.value.trim();
  if (!text || !currentUser) return;

  // Extra safety check before sending
  const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));
  if (!currentUserDoc.data().friends.includes(chatFriendUID)) {
    alert("You are not friends with this user!");
    return;
  }

  await addDoc(collection(db, "users", currentUser.uid, "chats", chatFriendUID, "messages"), {
    text,
    timestamp: Date.now(),
    uid: currentUser.uid,
    email: currentUser.email
  });

  // Optional: also add to friend's chat collection for easier sync
  await addDoc(collection(db, "users", chatFriendUID, "chats", currentUser.uid, "messages"), {
    text,
    timestamp: Date.now(),
    uid: currentUser.uid,
    email: currentUser.email
  });

  chatInput.value = '';
});

// Press Enter to send
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendBtn.click();
});

// Display messages in real-time
function loadMessages() {
  const messagesQuery = query(
    collection(db, "users", currentUser.uid, "chats", chatFriendUID, "messages"),
    orderBy("timestamp")
  );

  onSnapshot(messagesQuery, snapshot => {
    chatMessages.innerHTML = '';
    snapshot.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement('div');
      div.classList.add('chat-message');
      div.classList.add(msg.uid === currentUser.uid ? 'sent' : 'received');
      div.innerHTML = `<p>${msg.email}: ${msg.text}</p>`;
      chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}
