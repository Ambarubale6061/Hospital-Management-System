import { useGetPrescription } from "@/api";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, User, Stethoscope, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function PrescriptionDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);
  
  const { data: rx, isLoading } = useGetPrescription(id, { query: { enabled: !!id } });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!rx) return <div className="p-8 text-center text-destructive">Prescription not found</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/prescriptions"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Prescription</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              RX-{rx.id.toString().padStart(6, '0')}
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              Issued on {format(new Date(rx.createdAt), "MMMM d, yyyy")}
            </div>
          </div>
          {rx.validUntil && (
            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-950/30">
              Valid until: {format(new Date(rx.validUntil), "MMM d, yyyy")}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-3">
                <User className="mr-2 h-4 w-4" /> Patient
              </h3>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="font-semibold text-lg">{rx.patient?.user?.firstName} {rx.patient?.user?.lastName}</div>
                <div className="text-sm mt-1">{rx.patient?.user?.email}</div>
                <div className="text-sm text-muted-foreground mt-2">ID: PT-{rx.patientId.toString().padStart(4, '0')}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-3">
                <Stethoscope className="mr-2 h-4 w-4" /> Prescribing Doctor
              </h3>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="font-semibold text-lg">Dr. {rx.doctor?.user?.firstName} {rx.doctor?.user?.lastName}</div>
                <div className="text-sm mt-1 text-primary">{rx.doctor?.specialization}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 border-b pb-2">Diagnosis</h3>
            <p className="text-lg font-medium">{rx.diagnosis || "No diagnosis specified"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 border-b pb-2">Medications</h3>
            <div className="bg-card border rounded-lg p-5">
              <p className="whitespace-pre-wrap font-medium">{rx.medications}</p>
            </div>
          </div>

          {rx.dosageInstructions && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 border-b pb-2">Instructions</h3>
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 rounded-lg border border-blue-100 dark:border-blue-900/50">
                <Clock className="h-5 w-5 shrink-0 mt-0.5" />
                <p>{rx.dosageInstructions}</p>
              </div>
            </div>
          )}

          {rx.notes && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 border-b pb-2">Additional Notes</h3>
              <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">{rx.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}