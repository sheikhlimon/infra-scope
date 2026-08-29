"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

interface User {
  id: number;
  email: string;
  role: "ADMIN" | "USER";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get<{ user: User }>("/auth/me")
        .then((data) => {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        })
        .catch((err) => {
          if (err instanceof Error && err.message.toLowerCase().includes("unauthorized")) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
