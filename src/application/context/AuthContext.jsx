import { createContext, useContext, useMemo, useState } from 'react';
import { authRepository } from '../../infrastructure/repositories/authRepository';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  });

  const isAuthenticated = !!localStorage.getItem('access_token');

  const login = async (payload) => {
    const data = await authRepository.login(payload);

    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('auth_user', JSON.stringify(data.usuario));

    setUser(data.usuario);
    return data;
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) await authRepository.logout(refresh);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({ user, isAuthenticated, login, logout, setUser }),
    [user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}