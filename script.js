// script.js — Public Website Logic

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAUoKa_d6aeheuKRTyRm_7cla1aJEbUUoQ",
    authDomain: "piyush-agency.firebaseapp.com",
    projectId: "piyush-agency",
    storageBucket: "piyush-agency.firebasestorage.app",
    messagingSenderId: "931552293046",
    appId: "1:931552293046:web:94c6d622e3a9edad587617",
    measurementId: "G-V2L4CVKDPZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// UI references
const grid = document.getElementById("grid");
const loading = document.getElementById("loading");
const searchInput = document.getElementById("searchInput");
const categoryTabs = document.getElementById("categoryTabs");
const modalRoot = document.getElementById("modalRoot");
const themeToggle = document.getElementById("themeToggle");

// State
let posts = [];
let filter = { q: "", cat: "all" };

// THEME SYSTEM
const body = document.body;
const savedTheme = localStorage.getItem("theme") || "light";
body.dataset.theme = savedTheme;
themeToggle.textContent = savedTheme === "light" ? "Dark" : "Light";

themeToggle.onclick = () => {
    const newTheme = body.dataset.theme === "light" ? "dark" : "light";
    body.dataset.theme = newTheme;
    localStorage.setItem("theme", newTheme);
    themeToggle.textContent = newTheme === "light" ? "Dark" : "Light";
};

// Escape HTML (security)
function safe(s) {
    return (s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Build card
function buildCard(p) {
    const div = document.createElement("div");
    div.className = "card fade-in";

    div.innerHTML = `
        <img src="${p.imageUrl}" alt="${safe(p.title)}">
        <div class="title">${safe(p.title)}</div>
    `;

    // CLICK → open post.html
    div.onclick = () => {
        window.location.href = `post.html?id=${p.id}`;
    };

    return div;
}

// Render posts grid
function render() {
    grid.innerHTML = "";

    const search = filter.q.toLowerCase();

    const filtered = posts.filter(p => {
        const matchCat = filter.cat === "all" || p.category === filter.cat;
        const matchSearch = !search || p.title.toLowerCase().includes(search);
        return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
        loading.textContent = "No posts found.";
        loading.style.display = "block";
        return;
    }

    loading.style.display = "none";

    filtered.forEach(p => grid.appendChild(buildCard(p)));
}

// Events
searchInput.oninput = e => {
    filter.q = e.target.value;
    render();
};

categoryTabs.onclick = e => {
    const tab = e.target.closest(".tab");
    if (!tab) return;

    categoryTabs.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    filter.cat = tab.dataset.cat;
    render();
};

// Load posts realtime
const qRef = query(collection(db, "posts"), orderBy("createdAt", "desc"));

onSnapshot(qRef, snap => {
    posts = [];
    snap.forEach(doc => {
        posts.push({
            id: doc.id,
            ...doc.data()
        });
    });

    render();
});
