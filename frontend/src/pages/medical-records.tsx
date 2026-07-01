import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useSocketEvent } from "@/lib/socket";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Stethoscope, Pill, FlaskConical } from "lucide-react";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const TOKEN_KEY = "hms_token";
const h = () => ({ Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` });

type MedicalRecord = {
  id: number; diagnosis: string; symptoms: string | null; treatment: string | null;
  notes: string | null; visitDate: string; createdAt: string;
  doctor?: { user?: { firstName: string; lastName: string }; specialization?: string } | null;
};

type Appointment = {
  id: number; appointmentDate: string; appointmentTime: string; status: string;
  chiefComplaint: string | null; consultationNotes: string | null; diagnosis: string | null; followUpDate: string | null;
  doctor?: { user?: { firstName: string; lastName: string }; specialization?: string } | null;
};

async function fetchMedicalHistory(patientId?: number): Promise<MedicalRecord[]> {
  if (!patientId) return [];
  const r = await fetch(`${BASE}/api/patients/${patientId}/medical-history`, { headers: h() });
  if (!r.ok) return [];
  return r.json();
}

async function fetchMyAppointments(): Promise<{ data: Appointment[] }> {
  const r = await fetch(`${BASE}/api/appointments?status=completed&limit=100`, { headers: h() });
  if (!r.ok) return { data: [] };
  return r.json();
}

async function fetchMyProfile(): Promise<any> {
  const r = await fetch(`${BASE}/api/auth/me`, { headers: h() });
  return r.json();
}

export default function MedicalRecords() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({ queryKey: ["myProfile"], queryFn: fetchMyProfile });
  const patientId = profile?.patient?.id;

  const { data: records = [], isLoading: loadingRecords } = useQuery({
    queryKey: ["medicalHistory", patientId],
    queryFn: () => fetchMedicalHistory(patientId),
    enabled: !!patientId,
  });

  const { data: appointments } = useQuery({
    queryKey: ["completedAppointments"],
    queryFn: fetchMyAppointments,
  });

  const completedAppts = (appointments?.data || []).filter(
    (a: Appointment) => a.status === "completed" && (a.chiefComplaint || a.consultationNotes || a.diagnosis)
  );

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["medicalHistory"] });
    queryClient.invalidateQueries({ queryKey: ["completedAppointments"] });
  }, [queryClient]);

  useSocketEvent("appointment:updated", refresh);

  const isLoading = loadingRecords;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
        <p className="text-muted-foreground mt-1">Your complete health history and consultation records</p>
      </div>

      {/* Consultation Records from Completed Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" /> Consultation History
          </CardTitle>
          <CardDescription>Records from completed appointments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />)}</div>
          ) : completedAppts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Stethoscope className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No consultation records yet</p>
              <p className="text-sm mt-1">Consultation notes from your doctors will appear here after appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedAppts.map((appt: Appointment) => (
                <div key={appt.id} className="border rounded-xl p-4 bg-card hover:bg-muted/10 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold">Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName}</p>
                      <p className="text-sm text-muted-foreground">{appt.doctor?.specialization}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">{format(new Date(appt.appointmentDate + "T12:00:00"), "MMM d, yyyy")}</p>
                      <Badge variant="outline" className="text-xs">Completed</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {appt.chiefComplaint && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Chief Complaint</p>
                        <p>{appt.chiefComplaint}</p>
                      </div>
                    )}
                    {appt.diagnosis && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Diagnosis</p>
                        <p>{appt.diagnosis}</p>
                      </div>
                    )}
                    {appt.consultationNotes && (
                      <div className="p-3 bg-muted/30 rounded-lg sm:col-span-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Doctor's Notes</p>
                        <p>{appt.consultationNotes}</p>
                      </div>
                    )}
                    {appt.followUpDate && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">Follow-up Date</p>
                        <p>{format(new Date(appt.followUpDate + "T12:00:00"), "MMM d, yyyy")}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <Link href={`/appointments/${appt.id}`} className="text-xs text-primary hover:underline">View appointment details →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medical Records from medical_records table */}
      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Additional Medical Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {records.map((rec: MedicalRecord) => (
                <div key={rec.id} className="border rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <p className="font-semibold">{rec.diagnosis}</p>
                    <p className="text-sm text-muted-foreground shrink-0">{format(new Date(rec.visitDate + "T12:00:00"), "MMM d, yyyy")}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {rec.symptoms && <div className="p-2 bg-muted/30 rounded"><p className="text-xs text-muted-foreground mb-0.5">Symptoms</p><p>{rec.symptoms}</p></div>}
                    {rec.treatment && <div className="p-2 bg-muted/30 rounded"><p className="text-xs text-muted-foreground mb-0.5">Treatment</p><p>{rec.treatment}</p></div>}
                    {rec.notes && <div className="p-2 bg-muted/30 rounded sm:col-span-2"><p className="text-xs text-muted-foreground mb-0.5">Notes</p><p>{rec.notes}</p></div>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
