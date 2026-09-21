import { API_BASE_URL } from "./constants.js";

// ===== Session =====

const TOKEN_KEY = "wastra_token";
const ROLE_KEY = "wastra_role";

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
  if (!namaFile) {
    return "/placeholder.jpeg";
  }

  // Kalau database sudah menyimpan URL lengkap
  if (
    namaFile.startsWith("http://") ||
    namaFile.startsWith("https://")
  ) {
    return namaFile;
  }

  // API_BASE_URL:
  // http://localhost:5000/api
  //
  // Upload:
  // http://localhost:5000/uploads
  const serverUrl = API_BASE_URL.replace(/\/api$/, "");

  const fileName = namaFile.replace(/^\/+/, "");

  return `${serverUrl}/uploads/${fileName}`;
}

export function getImageUrl(namaFile) {
  return mediaUrl(namaFile);
}

export function onImgError(e) {
  e.target.onerror = null;
  e.target.src = "/placeholder.jpeg";
}

// ===== Fetch wrapper =====

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData
      ? {}
      : {
          "Content-Type": "application/json",
        }),

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),

    ...options.headers,
  };

  // API_BASE_URL sudah memiliki /api
  //
  // Contoh:
  // apiFetch("/produk")
  //
  // menjadi:
  // http://localhost:5000/api/produk

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(
      data?.message || `Request gagal (${res.status})`
    );

    err.data = data;

    throw err;
  }

  return data;
}