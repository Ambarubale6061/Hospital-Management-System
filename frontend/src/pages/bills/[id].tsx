import { useGetBill, useUpdateBill } from "@/api";
import { useParams, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  partially_paid: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export default function BillDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: bill, isLoading } = useGetBill(id, { query: { enabled: !!id } });
  const updateBill = useUpdateBill();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!bill) return <div className="p-8 text-center text-destructive">Bill not found</div>;

  const markPaid = () => {
    updateBill.mutate(
      { id, data: { status: "paid", paymentMethod: "cash" } },
      {
        onSuccess: () => toast({ title: "Bill marked as paid" }),
        onError: (err) => toast({ title: "Failed to update", description: err.message, variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/bills"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{bill.invoiceNumber}</h1>
          <p className="text-muted-foreground text-sm">{format(new Date(bill.createdAt), "MMMM d, yyyy")}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${statusColors[bill.status] || ""}`}>
          {bill.status.replace("_", " ")}
        </span>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Invoice Summary</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span className="font-medium">{bill.patient?.user?.firstName} {bill.patient?.user?.lastName}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${Number(bill.amount).toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${Number(bill.taxAmount || 0).toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-${Number(bill.discountAmount || 0).toFixed(2)}</span></div>
          <div className="flex justify-between border-t pt-3 font-semibold"><span>Total</span><span>${Number(bill.totalAmount).toFixed(2)}</span></div>
          {bill.description && (
            <div className="pt-2 text-muted-foreground">{bill.description}</div>
          )}
          {bill.paidAt && (
            <div className="flex justify-between text-muted-foreground"><span>Paid on</span><span>{format(new Date(bill.paidAt), "MMM d, yyyy")}</span></div>
          )}
        </CardContent>
      </Card>

      {(user?.role === "admin" || user?.role === "receptionist") && bill.status !== "paid" && bill.status !== "cancelled" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
          <CardContent>
            <Button onClick={markPaid} disabled={updateBill.isPending}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Paid
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
