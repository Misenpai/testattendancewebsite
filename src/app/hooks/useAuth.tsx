// src/app/hooks/useAuth.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { AuthUser } from "../types";

interface AuthContextType {
  user: AuthUser | null;
  // login: (username: string, password: string) => Promise<boolean>; // REMOVE
  logout: () => void;
  isLoading: boolean;
  setSSOUser: (ssoUser: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to set cookie
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
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
    // Only check for SSO user
    const ssoUser = localStorage.getItem("sso_user");
    if (ssoUser) {
      try {
        setUser(JSON.parse(ssoUser));
      } catch {
        localStorage.removeItem("sso_user");
      }
    }
    setIsLoading(false);
  }, []);

  // Remove the login function entirely
  // const login = async (...) => { ... }  // DELETE THIS

  const setSSOUser = (ssoUser: AuthUser) => {
    setUser(ssoUser);
    localStorage.setItem("sso_user", JSON.stringify(ssoUser));
    setCookie("sso_token", ssoUser.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sso_user");
    deleteCookie("sso_token");
    // Optionally redirect to PI Website
    window.location.href = process.env.NEXT_PUBLIC_PI_WEBSITE_URL || "/";
  };

  return (
    <AuthContext.Provider value={{ user, logout, isLoading, setSSOUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
