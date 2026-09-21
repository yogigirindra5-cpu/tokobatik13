import { createContext, useContext, useEffect, useState } from 'react';
import { getToken, saveSession, clearSession, apiFetch } from '../utils.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch('/auth/profile')
      .then((data) => setUser(data))
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credential, passwd) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ credential, passwd }),
    });

    saveSession(data.token, data.user.role);
    setUser(data.user);
    return data.user.role;
  };

  const register = async (payload) => {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  };

  const updateUser = (nextUser) => setUser(nextUser);

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}