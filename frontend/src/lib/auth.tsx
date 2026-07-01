import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe, getGetMeQueryKey, type User } from "@/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("hms_token"));
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: meData, isLoading, isError } = useGetMe({
    query: { enabled: !!token, retry: false, queryKey: getGetMeQueryKey() },
  });

  useEffect(() => {
    if (meData) setUser(meData);
  }, [meData]);

  useEffect(() => {
    if (isError) {
      setToken(null);
      setUser(null);
      localStorage.removeItem("hms_token");
    }
  }, [isError]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("hms_token", newToken);
    setToken(newToken);
    setUser(newUser);
    queryClient.invalidateQueries();
  };

  const logout = () => {
    localStorage.removeItem("hms_token");
    setToken(null);
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading: !!token && isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
