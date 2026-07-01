import { useCallback } from "react";
import { useListPrescriptions, getListPrescriptionsQueryKey } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketEvent } from "@/lib/socket";
import { Link } from "wouter";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";

export default function Prescriptions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: prescriptions, isLoading } = useListPrescriptions(
    {},
    { query: { enabled: true, queryKey: getListPrescriptionsQueryKey({}) } }
  );

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["listPrescriptions"] });
  }, [queryClient]);

  useSocketEvent("prescription:created", invalidate);
  useSocketEvent("prescription:updated", invalidate);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
          <p className="text-muted-foreground mt-1">Manage medical prescriptions</p>
        </div>
        {(user?.role === 'doctor' || user?.role === 'admin') && (
          <Button asChild>
            <Link href="/prescriptions/new">
              <Plus className="mr-2 h-4 w-4" /> Create Prescription
            </Link>
          </Button>
        )}
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              {user?.role !== 'patient' && <TableHead>Patient</TableHead>}
              {user?.role !== 'doctor' && <TableHead>Doctor</TableHead>}
              <TableHead>Diagnosis</TableHead>
              <TableHead>Medications</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}><div className="h-8 bg-muted rounded animate-pulse" /></TableCell>
                </TableRow>
              ))
            ) : prescriptions?.data && prescriptions.data.length > 0 ? (
              prescriptions.data.map((rx) => (
                <TableRow key={rx.id} className="group cursor-pointer hover:bg-muted/50">
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(rx.createdAt), "MMM d, yyyy")}
                    </div>
                  </TableCell>
                  {user?.role !== 'patient' && (
                    <TableCell>
                      <div className="font-medium">{rx.patient?.user?.firstName} {rx.patient?.user?.lastName}</div>
                    </TableCell>
                  )}
                  {user?.role !== 'doctor' && (
                    <TableCell>
                      Dr. {rx.doctor?.user?.firstName} {rx.doctor?.user?.lastName}
                    </TableCell>
                  )}
                  <TableCell className="max-w-[160px] truncate text-sm">
                    {rx.diagnosis || "—"}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">
                    {rx.medications}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/prescriptions/${rx.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No prescriptions found</p>
                  {user?.role === 'doctor' && (
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <Link href="/prescriptions/new">Create first prescription</Link>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
