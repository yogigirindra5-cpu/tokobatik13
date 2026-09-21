import { API_BASE_URL } from "./constants.js";

// Kumpulan helper yang dipakai di seluruh aplikasi:
// - session (token & role) di localStorage
// - format tampilan (rupiah, tanggal)
// - url gambar & fallback saat gambar gagal dimuat
// - wrapper fetch untuk endpoint yang butuh auth (dipakai di halaman admin)

const TOKEN_KEY = "wastra_token";
const ROLE_KEY = "wastra_role";

// ===== Session =====
export function saveSession(token, role) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY);
}

// ===== Format tampilan =====

export function formatRupiah(angka) {
  const num = Number(angka) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
}

export function formatTanggal(tanggal) {
  if (!tanggal) return "-";
  const d = new Date(tanggal);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ===== Gambar =====

export function mediaUrl(namaFile) {
  if (!namaFile) return "/placeholder.jpeg";
  if (namaFile.startsWith("http")) return namaFile;
  return `${API_BASE_URL}/uploads/${namaFile}`;
}

// Alias — dipakai di file-file yang menyebutnya getImageUrl, bukan mediaUrl
export function getImageUrl(namaFile) {
  return mediaUrl(namaFile);
}

export function onImgError(e) {
  e.target.onerror = null;
  e.target.src = "/placeholder.jpeg";
}

// ===== Fetch wrapper (dipakai di halaman admin: ListArtikel, ListUser, dll) =====

// Otomatis: tambah prefix /api, sisipkan token, dan lempar error dengan bentuk { message, data }
export async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(data?.message || `Request gagal (${res.status})`);
    err.data = data;
    throw err;
  }

  return data;
}