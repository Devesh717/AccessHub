const storageKey = "accesshub-session";
const configuredApiBase = document.body?.dataset?.apiBase?.trim() || "";

const signupForm = document.getElementById("signupForm");
const signinForm = document.getElementById("signinForm");
const signupMessage = document.getElementById("signupMessage");
const signinMessage = document.getElementById("signinMessage");
const sessionTitle = document.getElementById("sessionTitle");
const sessionSummary = document.getElementById("sessionSummary");
const logoutButton = document.getElementById("logoutButton");
const profileDetails = document.getElementById("profileDetails");

function resolveApiBase() {
    if (configuredApiBase) {
        return configuredApiBase.replace(/\/$/, "");
    }

    const { protocol, hostname, port } = window.location;
    const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
    const isSpringDefaultPort = port === "8080" || port === "";
    const isDirectFileOpen = protocol === "file:";

    if (isDirectFileOpen || (isLocalHost && !isSpringDefaultPort)) {
        return "http://localhost:8080";
    }

    return "";
}

const apiBase = resolveApiBase();

function toApiUrl(path) {
    return `${apiBase}${path}`;
}

function readSession() {
    try {
        return JSON.parse(localStorage.getItem(storageKey)) || null;
    } catch (error) {
        localStorage.removeItem(storageKey);
        return null;
    }
}

function writeSession(session) {
    localStorage.setItem(storageKey, JSON.stringify(session));
}

function clearSession() {
    localStorage.removeItem(storageKey);
}

function setMessage(element, text, type) {
    element.textContent = text || "";
    element.className = "message";
    if (type) {
        element.classList.add(type);
    }
}

function updateProfile(session) {
    const details = session
        ? [session.id ?? "-", session.username ?? "-", session.email ?? "-", (session.roles || []).join(", ") || "-"]
        : ["-", "-", "-", "-"];

    profileDetails.querySelectorAll("dd").forEach((valueNode, index) => {
        valueNode.textContent = details[index];
    });
}

function updateSessionUI() {
    const session = readSession();

    if (session?.token) {
        sessionTitle.textContent = `Signed in as ${session.username}`;
        sessionSummary.textContent = `Roles: ${(session.roles || []).join(", ") || "none"}`;
        logoutButton.hidden = false;
    } else {
        sessionTitle.textContent = "Not signed in";
        sessionSummary.textContent = "Create an account or sign in to store your token locally and unlock protected checks.";
        logoutButton.hidden = true;
    }

    updateProfile(session);
}

async function requestJson(url, options = {}) {
    const session = readSession();
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (session?.token) {
        headers.Authorization = `Bearer ${session.token}`;
    }

    const response = await fetch(url, { ...options, headers });
    const text = await response.text();

    let data;
    try {
        data = text ? JSON.parse(text) : null;
    } catch (error) {
        data = text;
    }

    if (!response.ok) {
        const message =
            typeof data === "string"
                ? data
                : data?.message || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return data;
}

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(signupMessage, "Creating account...", null);

    const formData = new FormData(signupForm);
    const roles = formData.getAll("role");
    const payload = {
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: roles.length ? roles : ["user"]
    };

    try {
        const response = await requestJson(toApiUrl("/api/auth/signup"), {
            method: "POST",
            body: JSON.stringify(payload)
        });
        setMessage(signupMessage, response.message || "User registered successfully.", "success");
        signupForm.reset();
        signupForm.querySelector('input[value="user"]').checked = true;
    } catch (error) {
        setMessage(signupMessage, error.message, "error");
    }
});

signinForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(signinMessage, "Signing in...", null);

    const formData = new FormData(signinForm);
    const payload = {
        username: formData.get("username"),
        password: formData.get("password")
    };

    try {
        const response = await requestJson(toApiUrl("/api/auth/signin"), {
            method: "POST",
            body: JSON.stringify(payload)
        });
        writeSession(response);
        updateSessionUI();
        setMessage(signinMessage, "Signed in successfully.", "success");
        signinForm.reset();
    } catch (error) {
        clearSession();
        updateSessionUI();
        setMessage(signinMessage, error.message, "error");
    }
});

logoutButton.addEventListener("click", () => {
    clearSession();
    updateSessionUI();
    setMessage(signinMessage, "Logged out.", "success");
});

updateSessionUI();
