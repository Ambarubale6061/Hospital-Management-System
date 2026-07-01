import { useCallback } from "react";
import { useListBills, getListBillsQueryKey } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketEvent } from "@/lib/socket";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, CreditCard } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  partially_paid: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export default function Bills() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bills, isLoading } = useListBills(
    {},
    { query: { enabled: true, queryKey: getListBillsQueryKey({}) } }
  );

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["listBills"] });
  }, [queryClient]);

  useSocketEvent("bill:created", invalidate);
  useSocketEvent("bill:updated", invalidate);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bills & Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage billing and payments</p>
        </div>
        {(user?.role === "admin" || user?.role === "receptionist") && (
          <Button asChild>
            <Link href="/bills/new">
              <Plus className="mr-2 h-4 w-4" /> Create Bill
            </Link>
          </Button>
        )}
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              {user?.role !== "patient" && <TableHead>Patient</TableHead>}
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
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
            ) : bills?.data && bills.data.length > 0 ? (
              bills.data.map((bill) => (
                <TableRow key={bill.id} className="group cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{bill.invoiceNumber}</TableCell>
                  {user?.role !== "patient" && (
                    <TableCell>{bill.patient?.user?.firstName} {bill.patient?.user?.lastName}</TableCell>
                  )}
                  <TableCell>${Number(bill.totalAmount).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-full capitalize ${statusColors[bill.status] || ""}`}>
                      {bill.status.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(bill.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/bills/${bill.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <CreditCard className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No bills found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
