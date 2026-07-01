import { useState, useEffect, useCallback } from "react";

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: React.ReactNode;
}

type ToastInput = Omit<ToastProps, "id">;

let toastCount = 0;
let listeners: Array<(toasts: ToastProps[]) => void> = [];
let toastList: ToastProps[] = [];

function emitChange() {
  listeners.forEach((l) => l(toastList));
}

function addToast(toast: ToastInput) {
  const id = String(toastCount++);
  toastList = [...toastList, { ...toast, id }];
  emitChange();
  setTimeout(() => {
    toastList = toastList.filter((t) => t.id !== id);
    emitChange();
  }, 5000);
  return id;
}

function dismissToast(id: string) {
  toastList = toastList.filter((t) => t.id !== id);
  emitChange();
}

export function toast(input: ToastInput) {
  return addToast(input);
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>(toastList);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  const dismiss = useCallback((id: string) => dismissToast(id), []);

  return { toasts, toast, dismiss };
}
