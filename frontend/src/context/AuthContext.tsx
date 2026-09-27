import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppUser } from '../services/api';
import { AuthAPI } from '../services/api';

interface AuthContextValue {
  user: AppUser | null;
  login: (email: string, password: string) => Promise<AppUser>;
  register: (name: string, email: string, password: string, phone: string) => Promise<AppUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'bms_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AppUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = async (email: string, password: string) => {
    const u = await AuthAPI.login(email, password);
    setUser(u);
    return u;
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    const u = await AuthAPI.register(name, email, password, phone);
    setUser(u);
    return u;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
