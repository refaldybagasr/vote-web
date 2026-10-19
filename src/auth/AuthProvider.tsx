import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { apiClient, refreshSession, setAuthFailureHandler } from '../api/client';
import { setAccessToken } from '../api/token';
import type { AuthResult, User } from '../api/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const restoreRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!restoreRef.current) {
      restoreRef.current = (async () => {
        const restoredUser = await refreshSession();
        if (!restoredUser) {
          return;
        }
        try {
          const response = await apiClient.get<User>('/auth/me');
          setUser(response.data);
        } catch {
          setAccessToken(null);
        }
      })().finally(() => {
        setLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    setAuthFailureHandler(() => {
      setUser(null);
    });
    return () => setAuthFailureHandler(null);
  }, []);

  async function login(username: string, password: string): Promise<User> {
    const response = await apiClient.post<AuthResult>('/auth/login', { username, password });
    setAccessToken(response.data.accessToken);
    setUser(response.data.user);
    return response.data.user;
  }

  async function logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
