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

    console.log('Login HTTP status:', response.status); // Debug: Check status code (e.g., 200, 401, 404, 500)

    const data = await response.json();
    console.log('Login response data:', data); // Debug: See what the backend returns (e.g., {success: false, error: '...'})

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
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login error:', error); // This should log network errors (e.g., "Failed to fetch")
    return false;
  }
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pi_token');
    localStorage.removeItem('pi_user');
    
    // FIX: Also remove the cookie on logout
    document.cookie = 'pi_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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