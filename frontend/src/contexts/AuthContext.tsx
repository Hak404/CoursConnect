import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, AuthResponse } from '../types';
import { getApiBase } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('cc_token');
    const savedUser = localStorage.getItem('cc_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  function login(data: AuthResponse) {
    const u: User = {
      id: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: '',
      role: data.role as User['role'],
      enabled: true,
      createdAt: '',
    };
    setToken(data.token);
    setUser(u);
    localStorage.setItem('cc_token', data.token);
    localStorage.setItem('cc_user', JSON.stringify(u));
  }

  function logout() {
    const currentToken = token;
    setToken(null);
    setUser(null);
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    if (currentToken) {
      fetch(`${getApiBase()}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentToken}` },
      }).catch(() => {});
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
