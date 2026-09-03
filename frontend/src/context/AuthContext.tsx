import React, { createContext, useState, useEffect, useContext } from 'react';
import { getProfile, loginRequest, registerRequest } from '../services/vehiclesApi';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await getProfile();
          if (!cancelled) setUser(profile);
        } catch {
          // Token inválido/expirado — o interceptor 401 já limpa o localStorage
          if (!cancelled) localStorage.removeItem('token');
        }
      }
      if (!cancelled) setLoading(false);
    };

    loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user: userData } = await loginRequest(email, password);
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string) => {
    const { token, user: userData } = await registerRequest(name, email, password);
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
