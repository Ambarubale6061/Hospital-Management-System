import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building2, Phone, Mail, Globe, Clock, CreditCard, Save } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const TOKEN_KEY = "hms_token";
const h = (hasBody?: boolean) => ({
  Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
  ...(hasBody ? { "Content-Type": "application/json" } : {}),
});

type Settings = {
  hospitalName: string; address: string | null; city: string | null;
  state: string | null; zipCode: string | null; country: string | null;
  phone: string | null; email: string | null; website: string | null;
  logoUrl: string | null; workingHoursStart: string | null;
  workingHoursEnd: string | null; emergencyPhone: string | null;
  taxRate: string | null; currency: string | null;
};

async function fetchSettings(): Promise<Settings> {
  const r = await fetch(`${BASE}/api/hospital-settings`, { headers: h() });
  return r.json();
}
async function saveSettings(data: Partial<Settings>): Promise<Settings> {
  const r = await fetch(`${BASE}/api/hospital-settings`, { method: "PATCH", headers: h(true), body: JSON.stringify(data) });
  if (!r.ok) throw new Error("Failed to save");
  return r.json();
}

function Field({ label, value, onChange, type = "text", placeholder }: any) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <Input type={type} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-9" />
    </div>
  );
}

export default function HospitalSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["hospitalSettings"], queryFn: fetchSettings });
  const [form, setForm] = useState<Partial<Settings>>({});

  useEffect(() => { if (data) setForm(data); }, [data]);

  const set = (key: keyof Settings) => (val: string) => setForm(f => ({ ...f, [key]: val || null }));

  const mutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: (updated) => {
      queryClient.setQueryData(["hospitalSettings"], updated);
      toast({ title: "Settings saved successfully" });
    },
    onError: () => toast({ title: "Failed to save settings", variant: "destructive" }),
  });

  if (user?.role !== "admin") return <div className="flex h-64 items-center justify-center text-muted-foreground">Access restricted.</div>;
  if (isLoading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hospital Settings</h1>
          <p className="text-muted-foreground mt-1">Configure hospital information and operational settings</p>
        </div>
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="gap-2">
          <Save className="h-4 w-4" /> {mutation.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 className="h-4 w-4 text-primary" /></div>
            <div><CardTitle>Basic Information</CardTitle><CardDescription>Hospital name and address details</CardDescription></div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Hospital Name *" value={form.hospitalName} onChange={set("hospitalName")} placeholder="e.g. MediCore General Hospital" />
            </div>
            <div className="sm:col-span-2">
              <Field label="Address" value={form.address} onChange={set("address")} placeholder="Street address" />
            </div>
            <Field label="City" value={form.city} onChange={set("city")} placeholder="City" />
            <Field label="State / Province" value={form.state} onChange={set("state")} placeholder="State" />
            <Field label="ZIP / Postal Code" value={form.zipCode} onChange={set("zipCode")} placeholder="ZIP code" />
            <Field label="Country" value={form.country} onChange={set("country")} placeholder="Country" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
            <div><CardTitle>Contact Information</CardTitle><CardDescription>Phone, email, and web presence</CardDescription></div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Main Phone" value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" />
            <Field label="Emergency Phone" value={form.emergencyPhone} onChange={set("emergencyPhone")} placeholder="+1 (555) 911-0000" />
            <Field label="Email" value={form.email} onChange={set("email")} type="email" placeholder="info@hospital.com" />
            <Field label="Website" value={form.website} onChange={set("website")} placeholder="https://hospital.com" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" /></div>
            <div><CardTitle>Working Hours</CardTitle><CardDescription>Default operating hours</CardDescription></div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field label="Opening Time" value={form.workingHoursStart} onChange={set("workingHoursStart")} type="time" />
            <Field label="Closing Time" value={form.workingHoursEnd} onChange={set("workingHoursEnd")} type="time" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" /></div>
            <div><CardTitle>Billing Configuration</CardTitle><CardDescription>Tax and currency settings</CardDescription></div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tax Rate (%)" value={form.taxRate} onChange={set("taxRate")} type="number" placeholder="0" />
            <Field label="Currency Code" value={form.currency} onChange={set("currency")} placeholder="USD" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
