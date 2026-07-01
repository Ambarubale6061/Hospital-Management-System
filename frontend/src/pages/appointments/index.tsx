import { useCallback } from "react";
import { useListAppointments, getListAppointmentsQueryKey } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketEvent } from "@/lib/socket";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, Calendar } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  no_show: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export default function Appointments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useListAppointments(
    {},
    { query: { enabled: true, queryKey: getListAppointmentsQueryKey({}) } }
  );

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["listAppointments"] });
  }, [queryClient]);

  useSocketEvent("appointment:created", invalidate);
  useSocketEvent("appointment:updated", invalidate);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage patient appointments</p>
        </div>
        <Button asChild>
          <Link href="/appointments/new">
            <Plus className="mr-2 h-4 w-4" /> Book Appointment
          </Link>
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date / Time</TableHead>
              {user?.role !== "patient" && <TableHead>Patient</TableHead>}
              {user?.role !== "doctor" && <TableHead>Doctor</TableHead>}
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}><div className="h-8 bg-muted rounded animate-pulse" /></TableCell>
                </TableRow>
              ))
            ) : appointments?.data && appointments.data.length > 0 ? (
              appointments.data.map((appt) => (
                <TableRow key={appt.id} className="group cursor-pointer hover:bg-muted/50">
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(appt.appointmentDate), "MMM d, yyyy")} · {appt.appointmentTime}
                    </div>
                  </TableCell>
                  {user?.role !== "patient" && (
                    <TableCell className="font-medium">{appt.patient?.user?.firstName} {appt.patient?.user?.lastName}</TableCell>
                  )}
                  {user?.role !== "doctor" && (
                    <TableCell>Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName}</TableCell>
                  )}
                  <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">{appt.reason || "—"}</TableCell>
                  <TableCell>
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-full capitalize ${statusColors[appt.status] || ""}`}>
                      {appt.status.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/appointments/${appt.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No appointments found</p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href="/appointments/new">Book first appointment</Link>
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
