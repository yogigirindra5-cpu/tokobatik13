// Wrapper fetch dasar untuk semua request ke backend
// Otomatis nambahin base URL, header Content-Type, dan token (kalau ada)

import { getToken } from "../utils.js";

const BASE_URL = "http://localhost:5000"; // ganti sesuai port backend kamu

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `Request gagal (${res.status})`);
  }

  return data;
}