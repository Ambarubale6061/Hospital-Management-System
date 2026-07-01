import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreatePatient, useListUsers } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";

const schema = z.object({
  userId: z.string().min(1, "Please select a user account"),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
});

export default function NewPatient() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createPatient = useCreatePatient();
  const { data: usersResp } = useListUsers({ role: "patient", limit: 200 });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: "", dateOfBirth: "", gender: "", bloodGroup: "", allergies: "",
      address: "", emergencyContactName: "", emergencyContactPhone: "",
      insuranceProvider: "", insuranceNumber: "",
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    createPatient.mutate(
      {
        data: {
          userId: parseInt(values.userId, 10),
          dateOfBirth: values.dateOfBirth || null,
          gender: values.gender || null,
          bloodGroup: values.bloodGroup || null,
          allergies: values.allergies || null,
          address: values.address || null,
          emergencyContactName: values.emergencyContactName || null,
          emergencyContactPhone: values.emergencyContactPhone || null,
          insuranceProvider: values.insuranceProvider || null,
          insuranceNumber: values.insuranceNumber || null,
        },
      },
      {
        onSuccess: (patient) => {
          toast({ title: "Patient registered" });
          setLocation(`/patients/${patient.id}`);
        },
        onError: (err) => {
          toast({ title: "Failed to register patient", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/patients"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Register Patient</h1>
          <p className="text-muted-foreground text-sm">Create a new patient profile</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Patient Details</CardTitle>
          <CardDescription>Link this profile to an existing user account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Account</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select a user" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {usersResp?.data?.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.firstName} {u.lastName} ({u.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                  <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem><FormLabel>Gender</FormLabel><FormControl><Input placeholder="Male / Female / Other" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                  <FormItem><FormLabel>Blood Group</FormLabel><FormControl><Input placeholder="O+" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="allergies" render={({ field }) => (
                  <FormItem><FormLabel>Allergies</FormLabel><FormControl><Input placeholder="None" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="emergencyContactName" render={({ field }) => (
                  <FormItem><FormLabel>Emergency Contact Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (
                  <FormItem><FormLabel>Emergency Contact Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="insuranceProvider" render={({ field }) => (
                  <FormItem><FormLabel>Insurance Provider</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="insuranceNumber" render={({ field }) => (
                  <FormItem><FormLabel>Insurance Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <Button type="submit" className="w-full" disabled={createPatient.isPending}>
                {createPatient.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Patient
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
