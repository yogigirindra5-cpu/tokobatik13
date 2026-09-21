import {
  API_BASE_URL,
} from "./constants.js";

// ======================================================
// STORAGE KEY
// ======================================================

const TOKEN_KEY =
  "wastra_token";

const ROLE_KEY =
  "wastra_role";

// ======================================================
// SESSION
// ======================================================

export function saveSession(
  token,
  role
) {
  localStorage.setItem(
    TOKEN_KEY,
    token
  );

  localStorage.setItem(
    ROLE_KEY,
    role
  );
}

export function clearSession() {
  localStorage.removeItem(
    TOKEN_KEY
  );

  localStorage.removeItem(
    ROLE_KEY
  );
}

export function getToken() {
  return localStorage.getItem(
    TOKEN_KEY
  );
}

export function getRole() {
  return localStorage.getItem(
    ROLE_KEY
  );
}

// ======================================================
// RUPIAH
// ======================================================

export function formatRupiah(
  angka
) {
  const num =
    Number(angka) || 0;

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }
  ).format(num);
}

// ======================================================
// TANGGAL
// ======================================================

export function formatTanggal(
  tanggal
) {
  if (!tanggal) {
    return "-";
  }

  const d =
    new Date(tanggal);

  return d.toLocaleDateString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

// ======================================================
// MEDIA URL
// ======================================================

export function mediaUrl(
  namaFile
) {
  if (!namaFile) {
    return "/placeholder.jpeg";
  }

  if (
    namaFile.startsWith(
      "http://"
    ) ||
    namaFile.startsWith(
      "https://"
    )
  ) {
    return namaFile;
  }

  const serverUrl =
    API_BASE_URL.replace(
      /\/api$/,
      ""
    );

  const fileName =
    namaFile
      .replace(/^\/+/, "")
      .replace(
        /^uploads\//,
        ""
      );

  return `${serverUrl}/uploads/${fileName}`;
}

// ======================================================
// IMAGE
// ======================================================

export function getImageUrl(
  namaFile
) {
  return mediaUrl(
    namaFile
  );
}

export function onImgError(
  e
) {
  e.currentTarget.onerror =
    null;

  e.currentTarget.src =
    "/placeholder.jpeg";
}

// ======================================================
// API FETCH
// ======================================================

export async function apiFetch(
  endpoint,
  options = {}
) {
  const token =
    getToken();

  const isFormData =
    options.body instanceof
    FormData;

  const headers = {
    ...(isFormData
      ? {}
      : {
          "Content-Type":
            "application/json",
        }),

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),

    ...(options.headers ||
      {}),
  };

  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );

  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    const error =
      new Error(
        data?.message ||
          `Request gagal (${response.status})`
      );

    error.status =
      response.status;

    error.data = data;

    throw error;
  }

  return data;
}