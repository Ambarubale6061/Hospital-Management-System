import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  UserRound,
  Building2,
  Calendar,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  Stethoscope,
  ChevronRight,
  ClipboardList,
  BarChart3,
  ListOrdered,
  HeartPulse,
  UserCheck2,
  BookOpen,
  Hospital,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotificationBell } from "@/components/notification-bell";

interface LayoutProps {
  children: ReactNode;
}

const roleBadgeColor: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  doctor: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  patient: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  receptionist: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  group?: string;
};

const navItems: NavItem[] = [
  // --- Common ---
  { name: "Dashboard",        href: "/dashboard",         icon: LayoutDashboard, roles: ["admin", "doctor", "patient", "receptionist"], group: "Main" },

  // --- Patient ---
  { name: "Find Doctors",     href: "/doctors",           icon: UserRound,       roles: ["patient"], group: "Main" },
  { name: "My Appointments",  href: "/appointments",      icon: Calendar,        roles: ["patient"], group: "Main" },
  { name: "Medical Records",  href: "/medical-records",   icon: HeartPulse,      roles: ["patient"], group: "Main" },
  { name: "Prescriptions",    href: "/prescriptions",     icon: FileText,        roles: ["patient"], group: "Main" },
  { name: "My Bills",         href: "/bills",             icon: CreditCard,      roles: ["patient"], group: "Main" },

  // --- Doctor ---
  { name: "Appointments",     href: "/appointments",      icon: Calendar,        roles: ["doctor"], group: "Main" },
  { name: "My Schedule",      href: "/schedule",          icon: BookOpen,        roles: ["doctor"], group: "Main" },
  { name: "My Patients",      href: "/patients",          icon: Users,           roles: ["doctor"], group: "Main" },
  { name: "Prescriptions",    href: "/prescriptions",     icon: FileText,        roles: ["doctor"], group: "Main" },

  // --- Receptionist ---
  { name: "Appointments",     href: "/appointments",      icon: Calendar,        roles: ["receptionist"], group: "Main" },
  { name: "Patients",         href: "/patients",          icon: Users,           roles: ["receptionist"], group: "Main" },
  { name: "Queue",            href: "/queue",             icon: ListOrdered,     roles: ["receptionist"], group: "Main" },
  { name: "Bills",            href: "/bills",             icon: CreditCard,      roles: ["receptionist"], group: "Main" },

  // --- Admin: Management ---
  { name: "Patients",         href: "/patients",          icon: Users,           roles: ["admin"], group: "Management" },
  { name: "Doctors",          href: "/doctors",           icon: UserRound,       roles: ["admin"], group: "Management" },
  { name: "Receptionists",    href: "/receptionists",     icon: UserCheck2,      roles: ["admin"], group: "Management" },
  { name: "Departments",      href: "/departments",       icon: Building2,       roles: ["admin"], group: "Management" },
  { name: "Appointments",     href: "/appointments",      icon: Calendar,        roles: ["admin"], group: "Management" },
  { name: "Billing",          href: "/bills",             icon: CreditCard,      roles: ["admin"], group: "Management" },
  { name: "Prescriptions",    href: "/prescriptions",     icon: FileText,        roles: ["admin"], group: "Management" },
  { name: "Queue",            href: "/queue",             icon: ListOrdered,     roles: ["admin"], group: "Management" },

  // --- Admin: System ---
  { name: "Reports",          href: "/reports",           icon: BarChart3,       roles: ["admin"], group: "System" },
  { name: "Hospital Settings",href: "/hospital-settings", icon: Hospital,        roles: ["admin"], group: "System" },
  { name: "Audit Log",        href: "/audit-log",         icon: ClipboardList,   roles: ["admin"], group: "System" },
  { name: "Settings",         href: "/settings",          icon: Settings,        roles: ["admin"], group: "System" },
];

export function AppLayout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const filtered = navItems.filter(item => item.roles.includes(user.role));

  const groups: Record<string, NavItem[]> = {};
  for (const item of filtered) {
    const g = item.group || "Main";
    if (!groups[g]) groups[g] = [];
    groups[g].push(item);
  }

  const NavContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border w-64 shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <Stethoscope className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-sidebar-foreground leading-none">MediCore HMS</span>
          <p className="text-xs text-sidebar-foreground/50 mt-0.5">Hospital Management</p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest mb-1.5 px-3">{group}</p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
                return (
                  <Link
                    key={item.name + item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"}`} />
                      {item.name}
                    </div>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-sidebar-accent/50 mb-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={user.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/15 text-primary font-semibold text-sm">
              {user.firstName[0]}{user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">{user.firstName} {user.lastName}</p>
            <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${roleBadgeColor[user.role] || ""}`}>
              {user.role}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-9 text-sm"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <NavContent />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">MediCore HMS</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <NavContent />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Desktop Top Bar */}
        <div className="hidden md:flex h-14 bg-card border-b border-border items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="capitalize font-medium text-foreground">
              {location.split("/")[1]?.replace(/-/g, " ") || "Dashboard"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link href="/profile">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/15 text-primary font-semibold text-xs">
                  {user.firstName[0]}{user.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
