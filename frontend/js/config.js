// CONNECTIFY API CONFIGURATION
const API_BASE_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

// TOKEN MANAGEMENT

function getToken() {
    return localStorage.getItem("connectify_token");
}

function saveToken(token) {
    localStorage.setItem("connectify_token", token);
}

function removeToken() {
    localStorage.removeItem("connectify_token");
    localStorage.removeItem("connectify_user");
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("connectify_user"));
    } catch {
        return null;
    }
}

function saveCurrentUser(user) {
    localStorage.setItem("connectify_user", JSON.stringify(user));
}

// API REQUEST FUNCTION


async function apiRequest(endpoint, options = {}) {
    const headers = {
        ...(options.headers || {})
    };

    const token = getToken();

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && options.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
        removeToken();

        if (
            !window.location.pathname.endsWith("/login.html") &&
            !window.location.pathname.endsWith("/register.html")
        ) {
            window.location.href = "login.html";
        }
    }

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}

// AUTHENTICATION CHECK

function requireAuth() {
    if (!getToken()) {
        window.location.href = "login.html";
        return false;
    }

    return true;
}

// IMAGE URL

function getImageUrl(imagePath) {
    if (!imagePath) {
        return "https://placehold.co/100x100?text=User";
    }

    if (imagePath.startsWith("http")) {
        return imagePath;
    }

    return `${SERVER_URL}${imagePath}`;
}

// HELPERS

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}

function showMessage(message, type = "success") {
    let container = document.getElementById("toast-container");

    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3500);
}

function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleString();
}