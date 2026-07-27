import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; role?: string }) => Promise<void>;
  googleLogin: (email: string, name: string, picture?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('connecthub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('connecthub_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('connecthub_user', JSON.stringify(res.data));
        } catch (err) {
          logout();
        }
      } else {
        setToken(null);
        setUser(null);
        localStorage.removeItem('connecthub_token');
        localStorage.removeItem('connecthub_user');
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, accessToken } = res.data;
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('connecthub_token', accessToken);
    localStorage.setItem('connecthub_user', JSON.stringify(userData));
  };

  const register = async (data: { email: string; password: string; fullName: string; role?: string }) => {
    const res = await api.post('/auth/register', data);
    const { user: userData, accessToken } = res.data;
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('connecthub_token', accessToken);
    localStorage.setItem('connecthub_user', JSON.stringify(userData));
  };

  const googleLogin = async (email: string, name: string, picture?: string) => {
    const res = await api.post('/auth/google', { email, name, picture });
    const { user: userData, accessToken } = res.data;
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('connecthub_token', accessToken);
    localStorage.setItem('connecthub_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('connecthub_token');
    localStorage.removeItem('connecthub_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
