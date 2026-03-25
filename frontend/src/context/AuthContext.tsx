import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthResponse, AuthContextValue } from '../types/auth.types';
import { STORAGE_KEYS } from '../constants/storage';
import api from '../api/axios';
import { API_ROUTES } from '../constants/api';

const AuthContext = createContext<AuthContextValue | null>(null);

interface Props {
  readonly children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!stored) {
      setLoading(false);
      return;
    }

    api
      .get<User>(API_ROUTES.AUTH.ME)
      .then((res) => {
        setToken(stored);
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      })
      .finally(() => setLoading(false));
  }, []);

  function login(data: AuthResponse) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    setToken(null);
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, login, logout, isAuthenticated: !!token }),
    [user, token],
  );

  if (loading) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
