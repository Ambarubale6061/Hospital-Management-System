import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-lg border bg-card text-card-foreground shadow-lg p-4 pr-8 relative animate-in slide-in-from-top-2 fade-in duration-200",
            t.variant === "destructive" && "border-destructive bg-destructive text-destructive-foreground"
          )}
        >
          {t.title && <p className="text-sm font-semibold">{t.title}</p>}
          {t.description && <p className="text-xs opacity-90 mt-0.5">{t.description}</p>}
          <button
            onClick={() => dismiss(t.id)}
            className="absolute top-3 right-3 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
