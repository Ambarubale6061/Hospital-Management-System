import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, UserCheck, UserX, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const TOKEN_KEY = "hms_token";
const h = (body?: boolean) => ({ Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`, ...(body ? { "Content-Type": "application/json" } : {}) });

type Receptionist = { id: number; email: string; firstName: string; lastName: string; phone: string | null; isActive: boolean; createdAt: string };

async function fetchReceptionists(search = ""): Promise<Receptionist[]> {
  const r = await fetch(`${BASE}/api/users?role=receptionist&limit=200`, { headers: h() });
  const body = await r.json();
  const list: Receptionist[] = body.data || body || [];
  if (!search) return list;
  const s = search.toLowerCase();
  return list.filter((u: Receptionist) => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(s));
}
async function createReceptionist(data: any): Promise<Receptionist> {
  const r = await fetch(`${BASE}/api/users`, { method: "POST", headers: h(true), body: JSON.stringify({ ...data, role: "receptionist" }) });
  if (!r.ok) { const e = await r.json(); throw new Error(e.error || "Failed to create"); }
  return r.json();
}
async function toggleActive(id: number, isActive: boolean): Promise<Receptionist> {
  const r = await fetch(`${BASE}/api/users/${id}`, { method: "PATCH", headers: h(true), body: JSON.stringify({ isActive }) });
  if (!r.ok) throw new Error("Failed to update");
  return r.json();
}
async function deleteUser(id: number) {
  const r = await fetch(`${BASE}/api/users/${id}`, { method: "DELETE", headers: h() });
  if (!r.ok) throw new Error("Failed to delete");
}

function AddDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (v: boolean) => void; onDone: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: createReceptionist,
    onSuccess: () => { toast({ title: "Receptionist added" }); onDone(); onOpenChange(false); setForm({ firstName: "", lastName: "", email: "", phone: "", password: "" }); },
    onError: (e: any) => toast({ title: e.message || "Failed to add", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add Receptionist</DialogTitle></DialogHeader>
        <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>First Name *</Label><Input value={form.firstName} onChange={set("firstName")} required /></div>
            <div className="space-y-1.5"><Label>Last Name *</Label><Input value={form.lastName} onChange={set("lastName")} required /></div>
          </div>
          <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={form.email} onChange={set("email")} required /></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={set("phone")} /></div>
          <div className="space-y-1.5"><Label>Password *</Label><Input type="password" value={form.password} onChange={set("password")} required minLength={6} /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Adding…" : "Add Receptionist"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Receptionists() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Receptionist | null>(null);

  const { data: receptionists = [], isLoading } = useQuery({ queryKey: ["receptionists", search], queryFn: () => fetchReceptionists(search) });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["receptionists"] });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => toggleActive(id, isActive),
    onSuccess: () => { toast({ title: "Status updated" }); refresh(); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => { toast({ title: "Receptionist removed" }); refresh(); setDeleteTarget(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  if (user?.role !== "admin") return <div className="flex h-64 items-center justify-center text-muted-foreground">Access restricted.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receptionists</h1>
          <p className="text-muted-foreground mt-1">Manage front-desk staff accounts</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Receptionist</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 max-w-sm" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : receptionists.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground border rounded-xl bg-card">
          <UserCheck className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-medium">{search ? "No receptionists match your search" : "No receptionists yet"}</p>
          {!search && <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add First Receptionist</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {receptionists.map(r => (
            <Card key={r.id} className="hover-elevate transition-all">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-amber-100 text-amber-700 font-semibold">{r.firstName[0]}{r.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{r.firstName} {r.lastName}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={r.isActive ? "text-green-600 border-green-200" : "text-red-500 border-red-200"}>
                    {r.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {r.phone && <p className="text-sm text-muted-foreground mb-3">{r.phone}</p>}
                <p className="text-xs text-muted-foreground mb-4">Joined {format(new Date(r.createdAt), "MMM d, yyyy")}</p>
                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1" onClick={() => toggleMutation.mutate({ id: r.id, isActive: !r.isActive })} disabled={toggleMutation.isPending}>
                    {r.isActive ? <><UserX className="h-3.5 w-3.5" /> Deactivate</> : <><UserCheck className="h-3.5 w-3.5" /> Activate</>}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(r)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddDialog open={addOpen} onOpenChange={setAddOpen} onDone={refresh} />

      <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleteTarget?.firstName} {deleteTarget?.lastName}?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this account. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
