import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  apiFetch,
  saveSession,
  clearSession,
  getToken,
} from "../utils.js";

// ======================================================
// CONTEXT
// ======================================================

const AuthContext = createContext(null);

// ======================================================
// PROVIDER
// ======================================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ====================================================
  // CEK LOGIN SAAT APLIKASI DIBUKA
  // ====================================================

  useEffect(() => {
    const token = getToken();

    // Belum login
    if (!token) {
      setLoading(false);
      return;
    }

    // Cek token ke backend
    apiFetch("/auth/profile")
      .then((data) => {
        if (data?.success && data?.user) {
          setUser(data.user);
        } else {
          clearSession();
          setUser(null);
        }
      })
      .catch((error) => {
        console.error(
          "PROFILE ERROR:",
          error
        );

        clearSession();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ====================================================
  // LOGIN
  // ====================================================

  const login = async (
    credential,
    passwd
  ) => {
    const data = await apiFetch(
      "/auth/login",
      {
        method: "POST",

        body: JSON.stringify({
          credential,
          passwd,
        }),
      }
    );

    // ==================================================
    // VALIDASI RESPONSE LOGIN
    // ==================================================

    if (
      !data?.success ||
      !data?.token ||
      !data?.user
    ) {
      throw new Error(
        data?.message ||
          "Login gagal"
      );
    }

    // ==================================================
    // SIMPAN TOKEN DAN ROLE
    // ==================================================

    saveSession(
      data.token,
      data.user.role
    );

    // ==================================================
    // SIMPAN DATA USER
    // ==================================================

    setUser(data.user);

    // Kembalikan role untuk redirect
    return data.user.role;
  };

  // ====================================================
  // LOGOUT
  // ====================================================

  const logout = () => {
    clearSession();
    setUser(null);
  };

  // ====================================================
  // CONTEXT VALUE
  // ====================================================

  const value = {
    user,
    loading,

    login,
    logout,

    isLoggedIn: Boolean(user),

    isAdmin:
      user?.role === "admin",
  };

  // ====================================================
  // PROVIDER
  // ====================================================

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ======================================================
// HOOK
// ======================================================

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth harus digunakan di dalam AuthProvider"
    );
  }

  return context;
}