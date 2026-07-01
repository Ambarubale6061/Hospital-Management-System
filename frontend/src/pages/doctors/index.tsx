import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Stethoscope, Star } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const h = () => ({ Authorization: `Bearer ${localStorage.getItem("hms_token")}` });

type Doctor = {
  id: number;
  specialization: string;
  subSpecialization?: string | null;
  yearsOfExperience: number | null;
  consultationFee?: number;
  isAvailable?: boolean;
  user?: { firstName: string; lastName: string; email: string };
  department?: { name: string } | null;
};

async function fetchDoctors(params: { search?: string; departmentId?: string; available?: string }) {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.departmentId) qs.set("departmentId", params.departmentId);
  if (params.available) qs.set("available", params.available);
  const r = await fetch(`${BASE}/api/doctors?${qs}`, { headers: h() });
  if (!r.ok) throw new Error("Failed to load doctors");
  return r.json() as Promise<Doctor[]>;
}

async function fetchDepartments() {
  const r = await fetch(`${BASE}/api/departments`, { headers: h() });
  if (!r.ok) return [];
  return r.json();
}

export default function Doctors() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors", search, departmentId],
    queryFn: () => fetchDoctors({ search, departmentId }),
  });

  const { data: departments } = useQuery({ queryKey: ["departments"], queryFn: fetchDepartments });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
          <p className="text-muted-foreground mt-1">Browse and manage the medical staff</p>
        </div>
        {user?.role === "admin" && (
          <Button asChild>
            <Link href="/doctors/new">
              <Plus className="mr-2 h-4 w-4" /> Add Doctor
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search by name or specialization…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
        </div>
        <Select value={departmentId || "all"} onValueChange={(v) => setDepartmentId(v === "all" ? "" : v)}>
          <SelectTrigger className="h-9 w-full sm:w-52 text-sm"><SelectValue placeholder="All Departments" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments?.map((d: any) => (
              <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-44 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : doctors && doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc) => (
            <Link key={doc.id} href={`/doctors/${doc.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {doc.user?.firstName?.[0]}{doc.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">Dr. {doc.user?.firstName} {doc.user?.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{doc.specialization}</p>
                    </div>
                  </div>
                  {doc.department && <p className="text-xs text-muted-foreground mb-2">{doc.department.name}</p>}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-xs text-muted-foreground">{doc.yearsOfExperience || 0} yrs exp</span>
                    <Badge variant="outline" className={doc.isAvailable ? "text-green-600 border-green-200" : "text-red-500 border-red-200"}>
                      {doc.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground border rounded-xl bg-card">
          <Stethoscope className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No doctors found</p>
        </div>
      )}
    </div>
  );
}
