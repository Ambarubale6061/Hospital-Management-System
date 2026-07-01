import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useSocketEvent } from "@/lib/socket";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Users, ClipboardCheck, Clock, ArrowRight, CheckCircle2, XCircle, Stethoscope } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const TOKEN_KEY = "hms_token";

const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` });

type QueueItem = {
  id: number; status: string; tokenNumber: number | null;
  appointmentTime: string; appointmentDate: string; reason: string | null;
  patient: { user: { firstName: string; lastName: string; phone: string | null } } | null;
  doctor: { specialization: string; user: { firstName: string; lastName: string } } | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; next?: string; nextLabel?: string }> = {
  pending:         { label: "Pending",        color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  confirmed:       { label: "Confirmed",      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", next: "checkin", nextLabel: "Check In" },
  checked_in:      { label: "Checked In",     color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400", next: "waiting", nextLabel: "→ Waiting" },
  waiting:         { label: "Waiting",        color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", next: "in_consultation", nextLabel: "→ In Consultation" },
  in_consultation: { label: "In Consultation",color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", next: "completed", nextLabel: "✓ Complete" },
  completed:       { label: "Completed",      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  cancelled:       { label: "Cancelled",      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  no_show:         { label: "No Show",        color: "bg-gray-100 text-gray-500" },
};

async function fetchQueue(date: string): Promise<QueueItem[]> {
  const r = await fetch(`${BASE}/api/queue?date=${date}`, { headers: headers() });
  return r.json();
}
async function checkIn(id: number) {
  const r = await fetch(`${BASE}/api/appointments/${id}/checkin`, { method: "PATCH", headers: headers() });
  if (!r.ok) throw new Error("Check-in failed");
  return r.json();
}
async function setQueueStatus(id: number, status: string) {
  const r = await fetch(`${BASE}/api/appointments/${id}/queue-status`, { method: "PATCH", headers: headers(), body: JSON.stringify({ status }) });
  if (!r.ok) throw new Error("Status update failed");
  return r.json();
}

export default function Queue() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today);

  const { data: queue = [], isLoading } = useQuery({
    queryKey: ["queue", date],
    queryFn: () => fetchQueue(date),
  });

  const refresh = useCallback(() => queryClient.invalidateQueries({ queryKey: ["queue"] }), [queryClient]);
  useSocketEvent("queue:updated", refresh);
  useSocketEvent("appointment:updated", refresh);

  const checkinMutation = useMutation({
    mutationFn: checkIn,
    onSuccess: () => { toast({ title: "Patient checked in" }); refresh(); },
    onError: () => toast({ title: "Check-in failed", variant: "destructive" }),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => setQueueStatus(id, status),
    onSuccess: () => { toast({ title: "Status updated" }); refresh(); },
    onError: () => toast({ title: "Update failed", variant: "destructive" }),
  });

  const active = queue.filter(q => !["completed", "cancelled", "no_show"].includes(q.status));
  const done = queue.filter(q => ["completed", "cancelled", "no_show"].includes(q.status));
  const waiting = queue.filter(q => q.status === "waiting").length;
  const inConsult = queue.filter(q => q.status === "in_consultation").length;
  const completed = queue.filter(q => q.status === "completed").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Queue Management</h1>
          <p className="text-muted-foreground mt-1">Manage patient flow and check-ins</p>
        </div>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-auto h-9 text-sm" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{queue.length}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Waiting</p><p className="text-2xl font-bold text-amber-600">{waiting}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">In Consultation</p><p className="text-2xl font-bold text-purple-600">{inConsult}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Completed</p><p className="text-2xl font-bold text-green-600">{completed}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Queue</CardTitle>
          <CardDescription>{format(new Date(date + "T12:00:00"), "EEEE, MMMM d, yyyy")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}</div>
          ) : active.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No active patients in queue</p>
              <p className="text-sm mt-1">Check-in patients as they arrive to add them to the queue</p>
            </div>
          ) : (
            <div className="space-y-3">
              {active.map(item => {
                const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                const isPending = checkinMutation.isPending || statusMutation.isPending;
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/20 transition-colors gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {item.tokenNumber && (
                        <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0">
                          {item.tokenNumber}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{item.patient?.user?.firstName} {item.patient?.user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{item.appointmentTime} · Dr. {item.doctor?.user?.firstName} {item.doctor?.user?.lastName}</p>
                        {item.reason && <p className="text-xs text-muted-foreground truncate">{item.reason}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${cfg.color}`}>{cfg.label}</span>
                      {item.status === "confirmed" && (
                        <Button size="sm" className="h-8 text-xs gap-1.5" disabled={isPending} onClick={() => checkinMutation.mutate(item.id)}>
                          <ClipboardCheck className="h-3.5 w-3.5" /> Check In
                        </Button>
                      )}
                      {cfg.next && item.status !== "confirmed" && (
                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1" disabled={isPending}
                          onClick={() => statusMutation.mutate({ id: item.id, status: cfg.next! })}>
                          <ArrowRight className="h-3 w-3" /> {cfg.nextLabel}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" disabled={isPending}
                        onClick={() => statusMutation.mutate({ id: item.id, status: "cancelled" })}>
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {done.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base text-muted-foreground">Completed / Cancelled</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {done.map(item => {
                const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.completed;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border opacity-60 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.tokenNumber && <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">{item.tokenNumber}</div>}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.patient?.user?.firstName} {item.patient?.user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{item.appointmentTime}</p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
