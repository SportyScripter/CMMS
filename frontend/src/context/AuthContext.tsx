import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api/axiosConfig';
import { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role_id: number | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
  role_name: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMe = async () => {
    try {
      const response = await api.get<User>('/users/me');
      setUser(response.data);
    } catch (error) {
      console.error("Błąd pobierania użytkownika", error);
      logout(); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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