import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isManagerOrAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('cloudblitz_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cloudblitz_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const currentUser = await authService.getMe();
          setUser(currentUser);
          localStorage.setItem('cloudblitz_user', JSON.stringify(currentUser));
        } catch (error) {
          console.error('Failed to verify token:', error);
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('cloudblitz_token', data.token);
    localStorage.setItem('cloudblitz_user', JSON.stringify(data.user));
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    const data = await authService.register({ name, email, password, role });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('cloudblitz_token', data.token);
    localStorage.setItem('cloudblitz_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cloudblitz_token');
    localStorage.removeItem('cloudblitz_user');
  };

  const isAdmin = user?.role === ('ADMIN' as UserRole);
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        isAdmin,
        isManagerOrAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
