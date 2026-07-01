import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Stethoscope, Star, Phone, Mail, Calendar, Loader2 } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const h = (body?: boolean) => ({
  Authorization: `Bearer ${localStorage.getItem("hms_token")}`,
  ...(body ? { "Content-Type": "application/json" } : {}),
});

async function fetchDoctor(id: number) {
  const r = await fetch(`${BASE}/api/doctors/${id}`, { headers: h() });
  if (!r.ok) throw new Error("Failed to load doctor");
  return r.json();
}

async function fetchStats(id: number) {
  const r = await fetch(`${BASE}/api/doctors/${id}/stats`, { headers: h() });
  if (!r.ok) return null;
  return r.json();
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DoctorDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingReason, setBookingReason] = useState("");

  const { data: doctor, isLoading } = useQuery({ queryKey: ["doctor", id], queryFn: () => fetchDoctor(id), enabled: !!id });
  const { data: stats } = useQuery({ queryKey: ["doctorStats", id], queryFn: () => fetchStats(id), enabled: !!id });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const meRes = await fetch(`${BASE}/api/patients/me`, { headers: h() });
      const patient = meRes.ok ? await meRes.json() : null;
      if (!patient) throw new Error("No patient profile found for your account");
      const r = await fetch(`${BASE}/api/appointments`, {
        method: "POST",
        headers: h(true),
        body: JSON.stringify({ patientId: patient.id, doctorId: id, appointmentDate: bookingDate, appointmentTime: bookingTime, reason: bookingReason || null }),
      });
      if (!r.ok) throw new Error("Failed to book appointment");
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "Appointment booked successfully" });
      queryClient.invalidateQueries({ queryKey: ["listAppointments"] });
      setBookingDate(""); setBookingTime(""); setBookingReason("");
    },
    onError: (err: any) => toast({ title: "Booking failed", description: err.message, variant: "destructive" }),
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!doctor) return <div className="p-8 text-center text-destructive">Doctor not found</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/doctors"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {doctor.user?.firstName?.[0]}{doctor.user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dr. {doctor.user?.firstName} {doctor.user?.lastName}</h1>
            <p className="text-muted-foreground text-sm">{doctor.specialization}{doctor.department ? ` · ${doctor.department.name}` : ""}</p>
          </div>
        </div>
        <Badge variant="outline" className={doctor.isAvailable ? "text-green-600 border-green-200" : "text-red-500 border-red-200"}>
          {doctor.isAvailable ? "Available" : "Unavailable"}
        </Badge>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Patients</p><p className="text-2xl font-bold">{stats.totalPatients}</p></CardContent></Card>
          <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Appointments</p><p className="text-2xl font-bold">{stats.totalAppointments}</p></CardContent></Card>
          <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Completed</p><p className="text-2xl font-bold text-green-600">{stats.completedAppointments}</p></CardContent></Card>
          <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3" /> Rating</p><p className="text-2xl font-bold">{stats.rating}</p></CardContent></Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">About</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          {doctor.bio && <p className="text-muted-foreground">{doctor.bio}</p>}
          <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {doctor.user?.email}</div>
          {doctor.user?.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {doctor.user.phone}</div>}
          <div className="flex items-center gap-2 text-muted-foreground"><Stethoscope className="h-4 w-4" /> {doctor.yearsOfExperience || 0} years experience</div>
          {doctor.qualifications && <p className="text-muted-foreground">Qualifications: {doctor.qualifications}</p>}
          <p className="font-medium text-foreground">Consultation Fee: ${Number(doctor.consultationFee || 0).toFixed(2)}</p>
        </CardContent>
      </Card>

      {user?.role === "patient" && doctor.isAvailable && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Book an Appointment</CardTitle>
            <CardDescription>Select a date and time to schedule a visit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
              <Input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
            </div>
            <Input placeholder="Reason for visit (optional)" value={bookingReason} onChange={(e) => setBookingReason(e.target.value)} />
            <Button
              className="w-full"
              disabled={!bookingDate || !bookingTime || bookMutation.isPending}
              onClick={() => bookMutation.mutate()}
            >
              {bookMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Calendar className="mr-2 h-4 w-4" /> Book Appointment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
