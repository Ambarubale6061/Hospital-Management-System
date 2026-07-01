import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useSocketEvent } from "@/lib/socket";
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const TOKEN_KEY = "hms_token";
const h = () => ({ Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` });

type Appointment = {
  id: number; appointmentDate: string; appointmentTime: string; status: string;
  reason: string | null; tokenNumber: number | null;
  patient: { user: { firstName: string; lastName: string } } | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  checked_in: "bg-cyan-100 text-cyan-700 border-cyan-200",
  waiting: "bg-orange-100 text-orange-700 border-orange-200",
  in_consultation: "bg-purple-100 text-purple-700 border-purple-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-500 border-red-200 opacity-50",
  no_show: "bg-gray-100 text-gray-500 border-gray-200 opacity-50",
};

async function fetchAppointments(): Promise<{ data: Appointment[] }> {
  const r = await fetch(`${BASE}/api/appointments?limit=200`, { headers: h() });
  return r.json();
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Schedule() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [view, setView] = useState<"week" | "day">("week");
  const [selectedDay, setSelectedDay] = useState(new Date());

  const { data, isLoading } = useQuery({ queryKey: ["schedule-appointments"], queryFn: fetchAppointments });
  const allAppts = data?.data || [];

  const refresh = useCallback(() => queryClient.invalidateQueries({ queryKey: ["schedule-appointments"] }), [queryClient]);
  useSocketEvent("appointment:created", refresh);
  useSocketEvent("appointment:updated", refresh);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppts = (day: Date) =>
    allAppts.filter(a => {
      try { return isSameDay(parseISO(a.appointmentDate), day); } catch { return false; }
    }).sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));

  const todayAppts = getAppts(selectedDay);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
          <p className="text-muted-foreground mt-1">Your appointment calendar</p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")}>Week</Button>
          <Button variant={view === "day" ? "default" : "outline"} size="sm" onClick={() => setView("day")}>Day</Button>
        </div>
      </div>

      {/* Week Navigator */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setWeekStart(w => subWeeks(w, 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-base">
              {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setWeekStart(w => addWeeks(w, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, i) => {
              const dayAppts = getAppts(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDay);
              const hasCancelled = dayAppts.every(a => a.status === "cancelled" || a.status === "no_show");
              const active = dayAppts.filter(a => a.status !== "cancelled" && a.status !== "no_show");
              return (
                <button
                  key={i}
                  onClick={() => { setSelectedDay(day); setView("day"); }}
                  className={`p-2 rounded-xl text-center transition-all hover:bg-primary/10 ${isSelected ? "bg-primary text-primary-foreground" : ""} ${isToday && !isSelected ? "ring-2 ring-primary" : ""}`}
                >
                  <p className={`text-[10px] font-semibold uppercase tracking-wide ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{DAYS[i]}</p>
                  <p className={`text-lg font-bold mt-0.5 ${isSelected ? "text-primary-foreground" : ""}`}>{format(day, "d")}</p>
                  {dayAppts.length > 0 && (
                    <div className={`mt-1.5 mx-auto h-1.5 w-1.5 rounded-full ${isSelected ? "bg-primary-foreground" : active.length > 0 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                  )}
                  {active.length > 0 && (
                    <p className={`text-[10px] mt-0.5 ${isSelected ? "text-primary-foreground/80" : "text-primary"}`}>{active.length} appt{active.length !== 1 ? "s" : ""}</p>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Day View */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{format(selectedDay, "EEEE, MMMM d, yyyy")}</CardTitle>
          <CardDescription>
            {isLoading ? "Loading…" : todayAppts.length === 0 ? "No appointments" : `${todayAppts.filter(a => a.status !== "cancelled" && a.status !== "no_show").length} active appointment(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}</div>
          ) : todayAppts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No appointments on this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppts.map(appt => (
                <Link key={appt.id} href={`/appointments/${appt.id}`}>
                  <div className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer hover:shadow-sm transition-all ${STATUS_COLORS[appt.status] || ""}`}>
                    <div className="flex flex-col items-center justify-center min-w-[60px]">
                      <Clock className="h-3.5 w-3.5 mb-0.5 opacity-60" />
                      <span className="text-sm font-bold">{appt.appointmentTime}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{appt.patient?.user?.firstName} {appt.patient?.user?.lastName}</p>
                      {appt.reason && <p className="text-xs opacity-75 truncate">{appt.reason}</p>}
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {appt.tokenNumber && <span className="text-[11px] font-bold">#{appt.tokenNumber}</span>}
                      <span className="text-[11px] font-semibold capitalize">{appt.status.replace(/_/g, " ")}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
