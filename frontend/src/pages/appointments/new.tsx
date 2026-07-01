import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useBookAppointment, useListPatients, useListDoctors } from "@/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";

const schema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  doctorId: z.string().min(1, "Please select a doctor"),
  appointmentDate: z.string().min(1, "Date is required"),
  appointmentTime: z.string().min(1, "Time is required"),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export default function NewAppointment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const bookAppointment = useBookAppointment();
  const [patientProfileId, setPatientProfileId] = useState<number | null>(null);

  const { data: patientsResp } = useListPatients({ limit: 200 }, { query: { enabled: user?.role !== "patient" } });
  const { data: doctors } = useListDoctors({ available: true });

  useEffect(() => {
    if (user?.role === "patient") {
      fetch("/api/patients/me", { headers: { Authorization: `Bearer ${localStorage.getItem("hms_token")}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((p) => p && setPatientProfileId(p.id));
    }
  }, [user]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { patientId: "", doctorId: "", appointmentDate: "", appointmentTime: "", reason: "", notes: "" },
  });

  useEffect(() => {
    if (patientProfileId) form.setValue("patientId", String(patientProfileId));
  }, [patientProfileId]);

  const onSubmit = (values: z.infer<typeof schema>) => {
    bookAppointment.mutate(
      {
        data: {
          patientId: parseInt(values.patientId, 10),
          doctorId: parseInt(values.doctorId, 10),
          appointmentDate: values.appointmentDate,
          appointmentTime: values.appointmentTime,
          reason: values.reason || null,
          notes: values.notes || null,
        },
      },
      {
        onSuccess: (appt) => {
          toast({ title: "Appointment booked" });
          setLocation(`/appointments/${appt.id}`);
        },
        onError: (err) => {
          toast({ title: "Failed to book appointment", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/appointments"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Book Appointment</h1>
          <p className="text-muted-foreground text-sm">Schedule a new patient appointment</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appointment Details</CardTitle>
          <CardDescription>Select a patient, doctor, and time slot</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {user?.role !== "patient" && (
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Select patient" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patientsResp?.data?.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.user?.firstName} {p.user?.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select doctor" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors?.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            Dr. {d.user?.firstName} {d.user?.lastName} — {d.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="appointmentDate" render={({ field }) => (
                  <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="appointmentTime" render={({ field }) => (
                  <FormItem><FormLabel>Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="reason" render={({ field }) => (
                <FormItem><FormLabel>Reason for Visit</FormLabel><FormControl><Input placeholder="e.g. Routine checkup" {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>Additional Notes</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <Button type="submit" className="w-full" disabled={bookAppointment.isPending}>
                {bookAppointment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Book Appointment
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
