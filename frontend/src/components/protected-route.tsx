import { type ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/lib/auth";

export function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Access restricted.
      </div>
    );
  }

  return <>{children}</>;
}
