import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, ClipboardList, Search } from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const TOKEN_KEY = "hms_token";

const EVENT_TYPES = [
  { value: "", label: "All Events" },
  { value: "patient_registered", label: "Patient Registered" },
  { value: "patient_updated", label: "Patient Updated" },
  { value: "appointment_booked", label: "Appointment Booked" },
  { value: "appointment_updated", label: "Appointment Updated" },
  { value: "appointment_cancelled", label: "Appointment Cancelled" },
  { value: "prescription_created", label: "Prescription Created" },
  { value: "bill_generated", label: "Bill Generated" },
  { value: "bill_updated", label: "Bill Updated" },
  { value: "doctor_registered", label: "Doctor Registered" },
  { value: "doctor_updated", label: "Doctor Updated" },
  { value: "doctor_deleted", label: "Doctor Deleted" },
];

const TYPE_BADGE: Record<string, string> = {
  patient_registered: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  patient_updated: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300",
  appointment_booked: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  appointment_updated: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300",
  appointment_cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  prescription_created: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  bill_generated: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  bill_updated: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300",
  doctor_registered: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  doctor_updated: "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-300",
  doctor_deleted: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function formatType(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

async function fetchAuditLog(page: number, limit: number, type: string) {
  const token = localStorage.getItem(TOKEN_KEY);
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (type) params.set("type", type);
  const res = await fetch(`${BASE_URL}/api/dashboard/audit-log?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch audit log");
  return res.json() as Promise<{
    data: { id: number; type: string; description: string; actorName: string | null; createdAt: string }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

export default function AuditLog() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const limit = 50;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["auditLog", page, limit, typeFilter],
    queryFn: () => fetchAuditLog(page, limit, typeFilter),
    enabled: user?.role === "admin",
    placeholderData: (prev) => prev,
  });

  if (user?.role !== "admin") {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <p>Access restricted to administrators.</p>
      </div>
    );
  }

  const rows = data?.data?.filter(row =>
    !search || row.description.toLowerCase().includes(search.toLowerCase()) ||
    (row.actorName || "").toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleTypeChange = (val: string) => {
    setTypeFilter(val === "all" ? "" : val);
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground mt-1">Complete history of all system activity.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="text-base">Activity Events</CardTitle>
              <CardDescription>
                {data ? `${data.total.toLocaleString()} total events` : "Loading…"}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search description or actor…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 h-9 w-full sm:w-60 text-sm"
                />
              </div>
              <Select value={typeFilter || "all"} onValueChange={handleTypeChange}>
                <SelectTrigger className="h-9 w-full sm:w-52 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(t => (
                    <SelectItem key={t.value || "all"} value={t.value || "all"}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-14 border-b bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No activity logged yet</p>
              <p className="text-sm mt-1">Events will appear here as users interact with the system.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[180px]">Time</TableHead>
                    <TableHead className="w-[200px]">Event Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[160px]">Actor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(row => (
                    <TableRow key={row.id} className="text-sm">
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {format(new Date(row.createdAt), "MMM d, yyyy")}
                        <br />
                        <span className="text-[11px]">{format(new Date(row.createdAt), "h:mm:ss a")}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${TYPE_BADGE[row.type] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                          {formatType(row.type)}
                        </span>
                      </TableCell>
                      <TableCell className="text-foreground/80 leading-snug">
                        {row.description}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {row.actorName || <span className="italic opacity-50">System</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-muted-foreground">
                Page {data.page} of {data.totalPages} · {data.total.toLocaleString()} events
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page >= (data.totalPages) || isFetching}
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
