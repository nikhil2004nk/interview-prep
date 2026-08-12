import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, logoutApi, getMeApi } from '../api/auth';
import type { User } from '../api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, passwordPlain: string) => Promise<void>;
  register: (email: string, passwordPlain: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUser = async () => {
    try {
      const currentUser = await getMeApi();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email: string, passwordPlain: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await loginApi(email, passwordPlain);
      setUser(loggedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, passwordPlain: string, name?: string) => {
    setIsLoading(true);
    try {
      const registeredUser = await registerApi(email, passwordPlain, name);
      setUser(registeredUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutApi();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
