"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import apiClient from "@/lib/api-client";

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 登录函数
  const login = async (email: string, password: string) => {
    try {
      const data = await apiClient.post<AuthResponse>(
        "/auth/login",
        { email, password },
        { requireAuth: false }
      );
      localStorage.setItem("token", data.token);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  // 注册函数
  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      await apiClient.post<User>(
        "/auth/register",
        { username, email, password },
        { requireAuth: false }
      );
    } catch (error) {
      throw error;
    }
  };

  // 注销函数
  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
      localStorage.removeItem("token");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // 获取当前用户信息
  const getCurrentUser = async () => {
    try {
      const token = await localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const user = await apiClient.get<User>("/auth/me");
      setUser(user);
    } catch (error) {
      console.error("Get current user error:", error);
      // 如果获取用户信息失败，清除 token
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    } finally {
      setLoading(false);
    }
  };

  // 在组件挂载时获取用户信息
  useEffect(() => {
    getCurrentUser();
  }, []);

  // 添加 token 变化监听
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        if (!e.newValue) {
          setUser(null);
        } else {
          getCurrentUser();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        children
      )}
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
