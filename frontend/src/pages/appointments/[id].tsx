import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, User, Stethoscope, FileText, XCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("hms_token")}` });

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  no_show: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

async function fetchAppointment(id: number) {
  const r = await fetch(`${BASE}/api/appointments/${id}`, { headers: headers() });
  if (!r.ok) throw new Error("Failed to load appointment");
  return r.json();
}

export default function AppointmentDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");

  const { data: appt, isLoading } = useQuery({
    queryKey: ["appointment", id],
    queryFn: () => fetchAppointment(id),
    enabled: !!id,
  });

  const invalidate = useCallback(() => queryClient.invalidateQueries({ queryKey: ["appointment", id] }), [queryClient, id]);

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const r = await fetch(`${BASE}/api/appointments/${id}`, { method: "PATCH", headers: headers(), body: JSON.stringify({ status }) });
      if (!r.ok) throw new Error("Failed to update");
      return r.json();
    },
    onSuccess: () => { toast({ title: "Appointment updated" }); invalidate(); },
    onError: () => toast({ title: "Update failed", variant: "destructive" }),
  });

  const cancelAppt = useMutation({
    mutationFn: async () => {
      const r = await fetch(`${BASE}/api/appointments/${id}`, { method: "DELETE", headers: headers() });
      if (!r.ok) throw new Error("Failed to cancel");
      return r.json();
    },
    onSuccess: () => { toast({ title: "Appointment cancelled" }); invalidate(); },
    onError: () => toast({ title: "Cancel failed", variant: "destructive" }),
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!appt) return <div className="p-8 text-center text-destructive">Appointment not found</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/appointments"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Appointment #{appt.id}</h1>
          <p className="text-muted-foreground text-sm">
            {format(new Date(appt.appointmentDate), "EEEE, MMMM d, yyyy")} at {appt.appointmentTime}
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${statusColors[appt.status] || ""}`}>
          {appt.status.replace("_", " ")}
        </span>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" /> Patient: <span className="text-foreground font-medium">{appt.patient?.user?.firstName} {appt.patient?.user?.lastName}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Stethoscope className="h-4 w-4" /> Doctor: <span className="text-foreground font-medium">Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName}</span>
          </div>
          {appt.reason && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <FileText className="h-4 w-4 mt-0.5" /> Reason: <span className="text-foreground">{appt.reason}</span>
            </div>
          )}
          {appt.notes && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <FileText className="h-4 w-4 mt-0.5" /> Notes: <span className="text-foreground">{appt.notes}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {["admin", "doctor", "receptionist"].includes(user?.role || "") && !["completed", "cancelled"].includes(appt.status) && (
        <Card>
          <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {appt.status === "pending" && (
              <Button size="sm" onClick={() => updateStatus.mutate("confirmed")} disabled={updateStatus.isPending}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm
              </Button>
            )}
            {appt.status === "confirmed" && (
              <Button size="sm" onClick={() => updateStatus.mutate("completed")} disabled={updateStatus.isPending}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Completed
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={() => cancelAppt.mutate()} disabled={cancelAppt.isPending}>
              <XCircle className="mr-2 h-4 w-4" /> Cancel Appointment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
