import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreatePrescription, useListPatients, useListDoctors, useListAppointments } from "@/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

const prescriptionSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  appointmentId: z.string().optional(),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  medications: z.string().min(1, "Medications are required"),
  dosageInstructions: z.string().optional(),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
});

export default function NewPrescription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createMutation = useCreatePrescription();

  const { data: patients } = useListPatients({ limit: 100 });
  const { data: doctors } = useListDoctors();
  const { data: appointments } = useListAppointments({ limit: 50 });

  const form = useForm<z.infer<typeof prescriptionSchema>>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      appointmentId: "",
      diagnosis: "",
      medications: "",
      dosageInstructions: "",
      validUntil: "",
      notes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof prescriptionSchema>) => {
    createMutation.mutate(
      { 
        data: {
          patientId: parseInt(values.patientId, 10),
          doctorId: parseInt(values.doctorId, 10),
          appointmentId: values.appointmentId ? parseInt(values.appointmentId, 10) : undefined,
          diagnosis: values.diagnosis,
          medications: values.medications,
          dosageInstructions: values.dosageInstructions,
          validUntil: values.validUntil || undefined,
          notes: values.notes
        } 
      },
      {
        onSuccess: (res) => {
          toast({
            title: "Prescription created",
            description: "The prescription has been successfully saved.",
          });
          setLocation(`/prescriptions/${res.id}`);
        },
        onError: (err) => {
          toast({
            title: "Creation failed",
            description: err.message || "Could not create prescription",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/prescriptions"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Prescription</h1>
          <p className="text-muted-foreground mt-1">Issue new medications to a patient</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prescription Details</CardTitle>
          <CardDescription>Enter the diagnosis and medication details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients?.data?.map(p => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.user?.firstName} {p.user?.lastName} (PT-{p.id.toString().padStart(4, '0')})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select doctor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctors?.map(d => (
                            <SelectItem key={d.id} value={d.id.toString()}>
                              Dr. {d.user?.firstName} {d.user?.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="appointmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Appointment (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select appointment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appointments?.data?.map(a => (
                          <SelectItem key={a.id} value={a.id.toString()}>
                            {a.appointmentDate} - {a.patient?.user?.firstName} {a.patient?.user?.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter diagnosis..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medications</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List medications..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dosageInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage Instructions</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Take 1 pill twice a day" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid Until (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any other instructions..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Issue Prescription
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}