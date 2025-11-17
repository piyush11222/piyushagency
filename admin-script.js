// admin-script.js
// Upload images to Cloudinary (unsigned) and save post to Firestore

import { auth, db } from './firebase.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc,
  deleteDoc,
  getDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ---------- CLOUDINARY CONFIG ----------
const CLOUD_NAME = "dzbdoraot";    // your cloud name
const UPLOAD_PRESET = "Chamet";    // your upload preset
const ADMIN_UID = "suYrLBl6hsZ8dmVIhpj1ze8WeRO2";

// ---------- DOM refs ----------
const emailIn = document.getElementById("email");
const pwdIn = document.getElementById("password");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const authMsg = document.getElementById("authMsg");

const titleIn = document.getElementById("title");
const descIn = document.getElementById("desc");
const catIn = document.getElementById("category");
const linkIn = document.getElementById("link");
const imgInput = document.getElementById("imageInput");
const btnUpload = document.getElementById("btnUpload");
const status = document.getElementById("status");

const postsGrid = document.getElementById("postsGrid");
const totalPosts = document.getElementById("totalPosts");
const latest = document.getElementById("latest");

let editId = null;

// LOGIN
btnLogin.onclick = async () => {
  const email = emailIn.value.trim();
  const pwd = pwdIn.value;

  if (!email || !pwd) {
    authMsg.textContent = "Enter email & password";
    return;
  }

  authMsg.textContent = "Signing in...";

  try {
    await signInWithEmailAndPassword(auth, email, pwd);
    authMsg.textContent = "Login successful!";
  } catch (err) {
    authMsg.textContent = "Login failed: " + err.message;
  }
};

btnLogout.onclick = () => {
  signOut(auth);
};

// CLOUDINARY UPLOAD
async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(url, {
    method: "POST",
    body: formData
  });

  const json = await res.json();

  if (!json.secure_url) {
    throw new Error("Cloudinary upload failed");
  }

  return json.secure_url;
}

// CREATE POST
btnUpload.onclick = async () => {
  const title = titleIn.value.trim();
  const desc = descIn.value.trim();
  const category = catIn.value;
  const link = linkIn.value.trim();
  const file = imgInput.files[0];

  if (!title || !file) {
    status.textContent = "Title and image required";
    return;
  }

  status.textContent = "Uploading image...";

  try {
    // 1. Upload Image
    const imageUrl = await uploadToCloudinary(file);

    // 2. Save Post
    await addDoc(collection(db, "posts"), {
      title,
      desc,
      category,
      link: link || null,
      imageUrl,
      createdAt: serverTimestamp()
    });

    // Reset
    titleIn.value = "";
    descIn.value = "";
    linkIn.value = "";
    imgInput.value = "";

    status.textContent = "Post uploaded successfully!";
  } catch (err) {
    console.error(err);
    status.textContent = "Error: " + err.message;
  }
};

// AUTH STATE CHANGE
onAuthStateChanged(auth, (user) => {
  if (user && user.uid === ADMIN_UID) {
    document.getElementById("authCard").style.display = "none";
    document.getElementById("dashCard").style.display = "block";
    document.getElementById("postsCard").style.display = "block";
    document.getElementById("statsCard").style.display = "block";
    loadPosts();
  } else {
    document.getElementById("authCard").style.display = "block";
    document.getElementById("dashCard").style.display = "none";
    document.getElementById("postsCard").style.display = "none";
    document.getElementById("statsCard").style.display = "none";
  }
});

// LOAD POSTS
function loadPosts() {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

  onSnapshot(
    q,
    (snap) => {
      postsGrid.innerHTML = "";
      let count = 0;
      let last = "-";

      snap.forEach((docSnap) => {
        count++;
        const d = docSnap.data();

        if (d.createdAt?.toDate) {
          last = d.createdAt.toDate().toLocaleString();
        }

        const el = document.createElement("div");
        el.className = "post-card";
        el.innerHTML = `
          <img src="${d.imageUrl}">
          <div style="font-weight:700">${d.title}</div>
          <div class="muted">${d.category}</div>
        `;

        postsGrid.appendChild(el);
      });

      totalPosts.textContent = count;
      latest.textContent = last;
    },
    (err) => console.error(err)
  );
}
