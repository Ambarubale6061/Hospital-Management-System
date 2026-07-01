import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const h = (body?: boolean) => ({
  Authorization: `Bearer ${localStorage.getItem("hms_token")}`,
  ...(body ? { "Content-Type": "application/json" } : {}),
});

async function fetchDepartments() {
  const r = await fetch(`${BASE}/api/departments`, { headers: h() });
  if (!r.ok) return [];
  return r.json();
}

async function registerDoctor(data: any) {
  const r = await fetch(`${BASE}/api/doctors/register`, { method: "POST", headers: h(true), body: JSON.stringify(data) });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e.error || "Failed to register doctor");
  }
  return r.json();
}

export default function NewDoctor() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: departments } = useQuery({ queryKey: ["departments"], queryFn: fetchDepartments });

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", phone: "",
    departmentId: "", specialization: "", qualifications: "", licenseNumber: "",
    consultationFee: "100", yearsOfExperience: "", bio: "", gender: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: registerDoctor,
    onSuccess: (doctor) => {
      toast({ title: "Doctor registered" });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      setLocation(`/doctors/${doctor.id}`);
    },
    onError: (err: any) => toast({ title: "Failed to register", description: err.message, variant: "destructive" }),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/doctors"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Doctor</h1>
          <p className="text-muted-foreground text-sm">Register a new doctor and create their account</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Doctor Details</CardTitle>
          <CardDescription>This will create a new user account with the doctor role</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>First Name *</Label><Input value={form.firstName} onChange={set("firstName")} required /></div>
              <div className="space-y-1.5"><Label>Last Name *</Label><Input value={form.lastName} onChange={set("lastName")} required /></div>
            </div>
            <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={form.email} onChange={set("email")} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Password</Label><Input type="password" value={form.password} onChange={set("password")} placeholder="Default: password123" /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={set("phone")} /></div>
            </div>

            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={form.departmentId} onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments?.map((d: any) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5"><Label>Specialization *</Label><Input value={form.specialization} onChange={set("specialization")} required placeholder="Cardiologist" /></div>
            <div className="space-y-1.5"><Label>Qualifications</Label><Input value={form.qualifications} onChange={set("qualifications")} placeholder="MBBS, MD" /></div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>License Number</Label><Input value={form.licenseNumber} onChange={set("licenseNumber")} /></div>
              <div className="space-y-1.5"><Label>Years of Experience</Label><Input type="number" value={form.yearsOfExperience} onChange={set("yearsOfExperience")} /></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Consultation Fee</Label><Input type="number" step="0.01" value={form.consultationFee} onChange={set("consultationFee")} /></div>
              <div className="space-y-1.5"><Label>Gender</Label><Input value={form.gender} onChange={set("gender")} /></div>
            </div>

            <div className="space-y-1.5"><Label>Bio</Label><Textarea value={form.bio} onChange={set("bio")} rows={3} /></div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register Doctor
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
