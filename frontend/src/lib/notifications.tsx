import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useSocket } from "./socket";
import { useAuth } from "./auth";
import { customFetch } from "@/api/custom-fetch";

export interface Notification {
  _id: string;
  userId: number;
  title: string;
  message: string;
  type: "appointment" | "prescription" | "bill" | "patient" | "doctor" | "system";
  read: boolean;
  link?: string;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socket = useSocket();
  const { user, isAuthenticated } = useAuth();

  const refresh = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await customFetch<Notification[]>("/api/notifications");
      setNotifications(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refresh();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket || !user) return;
    const handler = (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
    };
    socket.on(`notification:${user.id}`, handler);
    return () => {
      socket.off(`notification:${user.id}`, handler);
    };
  }, [socket, user]);

  const markAsRead = async (id: string) => {
    try {
      await customFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      await customFetch("/api/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, refresh }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications must be used within NotificationsProvider");
  return context;
}
