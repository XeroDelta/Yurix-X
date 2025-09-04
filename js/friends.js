import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, getDocs, query, where, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

// Elements
const friendsContainer = document.getElementById('friendsContainer');
const friendSearch = document.getElementById('friendSearch');
const addFriendBtn = document.querySelector('.btn-hacker');

let currentUserUID;
let currentUserDocRef;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    currentUserUID = user.uid;
    currentUserDocRef = doc(db, "users", currentUserUID);

    // Load friends & requests
    loadFriends();
});

// Send friend request
addFriendBtn.addEventListener('click', async () => {
    const usernameToAdd = friendSearch.value.trim();
    if (!usernameToAdd) return alert("Enter a username!");

    const usersCol = collection(db, "users");
    const q = query(usersCol, where("username", "==", usernameToAdd));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return alert("Username not found!");
    const targetUserDoc = snapshot.docs[0];
    const targetUID = targetUserDoc.id;

    if (targetUID === currentUserUID) return alert("You can't add yourself!");

    // Add request
    await updateDoc(doc(db, "users", currentUserUID), {
        outgoingRequests: arrayUnion(targetUID)
    });
    await updateDoc(doc(db, "users", targetUID), {
        incomingRequests: arrayUnion(currentUserUID)
    });

    alert(`Friend request sent to ${usernameToAdd}!`);
    friendSearch.value = '';
});

// Load friends & requests
function loadFriends() {
    const usersCol = collection(db, "users");
    onSnapshot(usersCol, snapshot => {
        friendsContainer.innerHTML = '';

        snapshot.forEach(docItem => {
            const user = docItem.data();
            if (!user.friends) user.friends = [];
            if (!user.incomingRequests) user.incomingRequests = [];
            if (!user.outgoingRequests) user.outgoingRequests = [];

            const isFriend = user.friends.includes(currentUserUID);
            const requestPending = user.incomingRequests.includes(currentUserUID);

            // Display confirmed friends
            if (isFriend) {
                friendsContainer.innerHTML += `
                  <div class="friend-item p-4 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="relative">
                        <div class="w-2 h-2 rounded-full ${user.status === 'online' ? 'status-online' : 'status-offline'} absolute -right-1 -top-1"></div>
                        <img src="${user.profilePic || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded-full border border-green-400">
                      </div>
                      <div>
                        <h3 class="font-bold">${user.username}</h3>
                        <p class="text-xs ${user.status || 'offline'}">${user.status || 'offline'}</p>
                      </div>
                    </div>
                    <div class="flex space-x-2">
                      <button class="p-2 rounded hover:bg-green-900 hover:bg-opacity-20 start-chat" data-uid="${docItem.id}" data-username="${user.username}">
                        <i data-feather="message-square"></i>
                      </button>
                    </div>
                  </div>
                `;
            }

            // Display incoming requests
            if (user.incomingRequests.includes(currentUserUID)) {
                friendsContainer.innerHTML += `
                  <div class="friend-item p-4 flex items-center justify-between bg-yellow-900 bg-opacity-20">
                    <div>
                      <h3 class="font-bold">${user.username}</h3>
                      <p class="text-xs">Sent you a friend request</p>
                    </div>
                    <div class="flex space-x-2">
                      <button class="accept-request p-2 rounded bg-green-500" data-uid="${docItem.id}" data-username="${user.username}">Accept</button>
                      <button class="deny-request p-2 rounded bg-red-500" data-uid="${docItem.id}">Deny</button>
                    </div>
                  </div>
                `;
            }
        });

        feather.replace();

        // Add event listeners for accept/deny/start-chat
        document.querySelectorAll('.accept-request').forEach(btn => {
            btn.addEventListener('click', async () => {
                const friendUID = btn.dataset.uid;
                const friendName = btn.dataset.username;

                // Add each other as friends
                await updateDoc(currentUserDocRef, {
                    friends: arrayUnion(friendUID),
                    incomingRequests: arrayRemove(friendUID)
                });
                await updateDoc(doc(db, "users", friendUID), {
                    friends: arrayUnion(currentUserUID),
                    outgoingRequests: arrayRemove(currentUserUID)
                });

                alert(`You are now friends with ${friendName}`);
            });
        });

        document.querySelectorAll('.deny-request').forEach(btn => {
            btn.addEventListener('click', async () => {
                const friendUID = btn.dataset.uid;

                await updateDoc(currentUserDocRef, {
                    incomingRequests: arrayRemove(friendUID)
                });
                await updateDoc(doc(db, "users", friendUID), {
                    outgoingRequests: arrayRemove(currentUserUID)
                });

                alert(`Friend request denied`);
            });
        });

        document.querySelectorAll('.start-chat').forEach(btn => {
            btn.addEventListener('click', () => {
                const friendUID = btn.dataset.uid;
                const friendName = btn.dataset.username;

                // Only allow if friend
                const currentUserDoc = snapshot.docs.find(d => d.id === currentUserUID).data();
                if (!currentUserDoc.friends.includes(friendUID)) {
                    alert("You can only message friends!");
                    return;
                }

                localStorage.setItem('chatFriendUID', friendUID);
                localStorage.setItem('chatFriendName', friendName);
                window.location.href = 'chat.html';
            });
        });
    });
}
