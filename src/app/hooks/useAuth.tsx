// src/app/hooks/useAuth.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to set cookie
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

// Helper function to delete cookie
function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pi_token');
    const userData = localStorage.getItem('pi_user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('pi_token');
        localStorage.removeItem('pi_user');
        deleteCookie('pi_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';
      
      const response = await fetch(`${API_BASE}/pi/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Login HTTP status:', response.status);

      const data = await response.json();
      console.log('Login response data:', data);

      if (data.success) {
        const authUser: AuthUser = {
          username: data.username,
          projectCode: data.projectCode,
          projects: data.projects || [data.projectCode],
          token: data.token,
        };

        setUser(authUser);
        localStorage.setItem('pi_token', data.token);
        localStorage.setItem('pi_user', JSON.stringify(authUser));
        
        // IMPORTANT: Set the cookie that middleware expects
        setCookie('pi_token', data.token);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pi_token');
    localStorage.removeItem('pi_user');
    deleteCookie('pi_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}