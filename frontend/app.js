import "./styles.css";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://macacumeoaqpdifwllir.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const API_BASE_URL = window.TRIMLY_API_BASE_URL ?? "";
const API_ENDPOINT = `${API_BASE_URL}/api/urls`;
const IS_VITE_DEV = import.meta.env.DEV;
const REDIRECT_BASE_URL = window.TRIMLY_REDIRECT_BASE_URL
  ?? (IS_VITE_DEV ? "http://localhost:8080" : API_BASE_URL || window.location.origin);

// Elements
const form = document.querySelector("#shorten-form");
const input = document.querySelector("#url-input");
const urlField = document.querySelector(".url-field");
const submitButton = document.querySelector("#submit-button");
const formMessage = document.querySelector("#form-message");
const resultCard = document.querySelector("#result-card");
const shortUrlAnchor = document.querySelector("#short-url");
const copyButton = document.querySelector("#copy-button");
const openButton = document.querySelector("#open-button");
const recentSection = document.querySelector("#recent-links");
const recentList = document.querySelector("#recent-list");
const clearHistoryButton = document.querySelector("#clear-history");

// Auth Elements
const authModal = document.querySelector("#auth-modal");
const authForm = document.querySelector("#auth-form");
const authTitle = document.querySelector("#auth-title");
const authError = document.querySelector("#auth-error");
const authEmail = document.querySelector("#auth-email");
const authStep1 = document.querySelector("#auth-step-1");
const authStep2 = document.querySelector("#auth-step-2");
const authOtp = document.querySelector("#auth-otp");
const authSubmit = document.querySelector("#auth-submit");
const authVerifySubmit = document.querySelector("#auth-verify-submit");
const authBack = document.querySelector("#auth-back");
const authClose = document.querySelector("#auth-close");
const loginBtn = document.querySelector("#auth-login-btn");
const logoutBtn = document.querySelector("#auth-logout-btn");
const googleBtn = document.querySelector("#auth-google-btn");
const profilePic = document.querySelector("#profile-pic");

let currentShortUrl = "";
let currentSession = null;
let currentAuthEmail = "";
let isOtpStep = false;

// Auth State Management
supabase.auth.onAuthStateChange((event, session) => {
  currentSession = session;
  if (session?.user) {
    loginBtn.hidden = true;
    logoutBtn.hidden = false;

    const avatarUrl = session.user.user_metadata?.avatar_url;
    if (avatarUrl) {
      profilePic.src = avatarUrl;
      profilePic.hidden = false;
    } else {
      profilePic.hidden = true;
    }

    authModal.close();
    formMessage.textContent = "";
    urlField.classList.remove("invalid");
    fetchHistoryFromDB();
  } else {
    loginBtn.hidden = false;
    logoutBtn.hidden = true;
    profilePic.hidden = true;
    recentSection.hidden = true;
    recentList.innerHTML = "";
  }
});

// Auth UI Logic
function resetAuthUI() {
  authError.hidden = true;
  authStep1.hidden = false;
  authStep2.hidden = true;
  isOtpStep = false;
  currentAuthEmail = "";
  authOtp.value = "";
  authTitle.textContent = "Log in or Sign up";
}

loginBtn.addEventListener("click", () => {
  resetAuthUI();
  authModal.showModal();
});

logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
});

authClose.addEventListener("click", () => authModal.close());

authBack.addEventListener("click", () => resetAuthUI());

googleBtn.addEventListener("click", async () => {
  authError.hidden = true;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) {
    authError.textContent = error.message;
    authError.hidden = false;
  }
});

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authError.hidden = true;

  if (!isOtpStep) {
    // Step 1: Request OTP
    authSubmit.disabled = true;
    authSubmit.querySelector(".button-label").textContent = "Sending...";
    
    currentAuthEmail = authEmail.value;
    const { error } = await supabase.auth.signInWithOtp({ email: currentAuthEmail });
    
    authSubmit.disabled = false;
    authSubmit.querySelector(".button-label").textContent = "Send Login Code";

    if (error) {
      authError.textContent = error.message;
      authError.hidden = false;
    } else {
      isOtpStep = true;
      authStep1.hidden = true;
      authStep2.hidden = false;
      authTitle.textContent = "Verify Code";
    }
  } else {
    // Step 2: Verify OTP
    authVerifySubmit.disabled = true;
    authVerifySubmit.querySelector(".button-label").textContent = "Verifying...";
    
    const { error } = await supabase.auth.verifyOtp({ 
      email: currentAuthEmail, 
      token: authOtp.value, 
      type: 'email' 
    });
    
    authVerifySubmit.disabled = false;
    authVerifySubmit.querySelector(".button-label").textContent = "Verify Code";

    if (error) {
      authError.textContent = error.message;
      authError.hidden = false;
    }
    // Success is handled by onAuthStateChange listener
  }
});

// Helper Functions
function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.classList.toggle("loading", isLoading);
  submitButton.querySelector(".button-label").textContent = isLoading ? "Creating link…" : "Shorten link";
}

function showMessage(message = "") {
  formMessage.textContent = message;
  urlField.classList.toggle("invalid", Boolean(message));
}

function buildShortUrl(token) {
  return `${REDIRECT_BASE_URL.replace(/\/$/, "")}/${encodeURIComponent(token)}`;
}

async function parseError(response) {
  if (response.status === 401) return "Your session has expired. Please log in again.";
  try {
    const data = await response.json();
    return data.message || data.error || `Request failed (${response.status})`;
  } catch {
    return `Could not shorten this link (${response.status}).`;
  }
}

async function copyText(text, button, successLabel = "Copied!") {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const helper = document.createElement("textarea");
    helper.value = text;
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  }

  const label = button.querySelector("span");
  if (!label) return;
  const previous = label.textContent;
  label.textContent = successLabel;
  window.setTimeout(() => { label.textContent = previous; }, 1600);
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
}

// Database Fetching Logic
async function fetchHistoryFromDB() {
  if (!currentSession) return;
  try {
    const response = await fetch(API_ENDPOINT, {
      headers: { "Authorization": `Bearer ${currentSession.access_token}` }
    });
    if (response.ok) {
      const data = await response.json();
      renderHistory(data);
    } else if (response.status === 401) {
      supabase.auth.signOut();
    }
  } catch (e) {
    console.error("Failed to fetch history");
  }
}

function renderHistory(links) {
  recentSection.hidden = links.length === 0;
  recentList.innerHTML = links.reverse().map((link, index) => {
    const shortUrl = buildShortUrl(link.shortToken);
    return `
    <article class="recent-item">
      <div class="recent-original">
        <span>Original</span>
        <p title="${escapeHtml(link.originalUrl)}">${escapeHtml(link.originalUrl)}</p>
      </div>
      <div class="recent-short">
        <span>Short link</span>
        <a href="${escapeHtml(shortUrl)}" target="_blank" rel="noopener">${escapeHtml(shortUrl)}</a>
      </div>
      <button class="mini-copy" type="button" data-short="${escapeHtml(shortUrl)}" aria-label="Copy short link" title="Copy short link">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
    </article>
  `}).join("");
}

// Form Submission
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage();
  resultCard.hidden = true;

  const originalUrl = normalizeUrl(input.value);
  input.value = originalUrl;

  if (!isValidHttpUrl(originalUrl)) {
    showMessage("Enter a valid web address, such as https://example.com.");
    input.focus();
    return;
  }

  if (!currentSession) {
    showMessage("Please log in to shorten URLs.");
    authModal.showModal();
    return;
  }

  setLoading(true);
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${currentSession.access_token}`
      },
      body: JSON.stringify({ url: originalUrl })
    });

    if (!response.ok) throw new Error(await parseError(response));

    const data = await response.json();
    if (!data.shortToken) throw new Error("The server response did not include a short token.");

    currentShortUrl = buildShortUrl(data.shortToken);
    shortUrlAnchor.href = currentShortUrl;
    shortUrlAnchor.textContent = currentShortUrl;
    resultCard.hidden = false;

    // Refresh the list to include the new URL
    fetchHistoryFromDB();
  } catch (error) {
    showMessage(error.message || "Something went wrong. Please try again.");
    if (error.message.includes("log in")) {
      supabase.auth.signOut();
    }
  } finally {
    setLoading(false);
  }
});

input.addEventListener("input", () => showMessage());
copyButton.addEventListener("click", () => copyText(currentShortUrl, copyButton));
openButton.addEventListener("click", () => window.open(currentShortUrl, "_blank", "noopener"));

recentList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-short]");
  if (button) copyText(button.dataset.short, button);
});
