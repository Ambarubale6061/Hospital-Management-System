import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const typeColors: Record<string, string> = {
  appointment: "bg-blue-100 text-blue-600",
  prescription: "bg-green-100 text-green-600",
  bill: "bg-amber-100 text-amber-600",
  patient: "bg-purple-100 text-purple-600",
  doctor: "bg-teal-100 text-teal-600",
  system: "bg-gray-100 text-gray-600",
};

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
            No notifications
          </div>
        ) : (
          notifications.slice(0, 10).map((n) => (
            <DropdownMenuItem
              key={n._id}
              className={cn(
                "flex flex-col items-start gap-1 px-3 py-2.5 cursor-pointer",
                !n.read && "bg-primary/5"
              )}
              onClick={() => markAsRead(n._id)}
            >
              <div className="flex items-center gap-2 w-full">
                <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize", typeColors[n.type] || typeColors.system)}>
                  {n.type}
                </span>
                {!n.read && <span className="ml-auto h-2 w-2 rounded-full bg-primary shrink-0" />}
              </div>
              <p className="text-sm font-medium leading-snug">{n.title}</p>
              <p className="text-xs text-muted-foreground leading-snug">{n.message}</p>
              <p className="text-[10px] text-muted-foreground/60">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
