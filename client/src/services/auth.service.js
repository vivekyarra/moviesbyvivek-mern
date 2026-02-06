import { apiRequest } from "./api";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveSession({ token, user }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function registerUser(payload) {
  const data = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  saveSession(data);
  return data;
}

export async function loginUser(payload) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  saveSession(data);
  return data;
}

export async function loginWithGoogle(credential) {
  const data = await apiRequest("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
  saveSession(data);
  return data;
}

export async function requestOtp(payload) {
  return apiRequest("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyOtp(payload) {
  const data = await apiRequest("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  saveSession(data);
  return data;
}

export async function requestPasswordReset(email) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(payload) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchMe() {
  const data = await apiRequest("/auth/me");
  return data.user;
}

export async function updateProfile(payload) {
  const data = await apiRequest("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (data?.user) {
    saveSession({ user: data.user });
  }
  return data;
}
