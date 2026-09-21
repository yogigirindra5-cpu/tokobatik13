// src/services/authService.js
import { API_BASE_URL } from "../constants.js";
import { saveSession, clearSession, getToken } from "../utils.js";

export async function register(data) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Gagal mendaftar");
  return result;
}

export async function login(credential, passwd) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential, passwd }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login gagal");

  const payload = JSON.parse(atob(data.token.split(".")[1]));
  saveSession(data.token, payload.role);

  return { ...data, role: payload.role };
}

export async function getProfile() {
  const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Gagal mengambil profil");
  return res.json();
}

export function logout() {
  clearSession();
}