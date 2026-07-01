import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateBill, useListPatients, useListAppointments } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";

const schema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  appointmentId: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  taxAmount: z.string().optional(),
  discountAmount: z.string().optional(),
  description: z.string().optional(),
});

export default function NewBill() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createBill = useCreateBill();
  const { data: patientsResp } = useListPatients({ limit: 200 });
  const { data: appointmentsResp } = useListAppointments({ limit: 200 });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { patientId: "", appointmentId: "", amount: "", taxAmount: "0", discountAmount: "0", description: "" },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    createBill.mutate(
      {
        data: {
          patientId: parseInt(values.patientId, 10),
          appointmentId: values.appointmentId ? parseInt(values.appointmentId, 10) : null,
          amount: parseFloat(values.amount),
          taxAmount: values.taxAmount ? parseFloat(values.taxAmount) : 0,
          discountAmount: values.discountAmount ? parseFloat(values.discountAmount) : 0,
          description: values.description || null,
        },
      },
      {
        onSuccess: (bill) => {
          toast({ title: "Bill created" });
          setLocation(`/bills/${bill.id}`);
        },
        onError: (err) => {
          toast({ title: "Failed to create bill", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/bills"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Bill</h1>
          <p className="text-muted-foreground text-sm">Generate a new invoice for a patient</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Details</CardTitle>
          <CardDescription>Enter the billing information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <FormField
                control={form.control}
                name="appointmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Appointment (optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue placeholder="None" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appointmentsResp?.data?.map((a) => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            #{a.id} — {a.appointmentDate} {a.appointmentTime}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="taxAmount" render={({ field }) => (
                  <FormItem><FormLabel>Tax</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="discountAmount" render={({ field }) => (
                  <FormItem><FormLabel>Discount</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="Consultation fee, lab tests, etc." {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <Button type="submit" className="w-full" disabled={createBill.isPending}>
                {createBill.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Bill
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
