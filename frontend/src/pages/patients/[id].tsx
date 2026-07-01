import { useGetPatient, useGetPatientMedicalHistory } from "@/api";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Phone, Droplet, Shield, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function PatientDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);

  const { data: patient, isLoading } = useGetPatient(id, { query: { enabled: !!id } });
  const { data: history } = useGetPatientMedicalHistory(id, { query: { enabled: !!id } });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!patient) return <div className="p-8 text-center text-destructive">Patient not found</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/patients"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{patient.user?.firstName} {patient.user?.lastName}</h1>
          <p className="text-muted-foreground text-sm">{patient.user?.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Patient Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> {patient.gender || "Not specified"}</div>
          <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {patient.user?.phone || "Not provided"}</div>
          <div className="flex items-center gap-2 text-muted-foreground"><Droplet className="h-4 w-4" /> {patient.bloodGroup || "Unknown"}</div>
          <div className="flex items-center gap-2 text-muted-foreground"><Shield className="h-4 w-4" /> {patient.insuranceProvider || "No insurance"}</div>
          {patient.dateOfBirth && (
            <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> {format(new Date(patient.dateOfBirth), "MMM d, yyyy")}</div>
          )}
          {patient.address && <div className="col-span-2 text-muted-foreground">{patient.address}</div>}
          {patient.allergies && (
            <div className="col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Allergies: </span>
              <span className="text-sm">{patient.allergies}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Medical History</CardTitle>
          <CardDescription>Past diagnoses and visits</CardDescription>
        </CardHeader>
        <CardContent>
          {!history || history.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No medical records yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((rec) => (
                <div key={rec.id} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{rec.diagnosis}</p>
                    <Badge variant="outline">{format(new Date(rec.visitDate || rec.createdAt), "MMM d, yyyy")}</Badge>
                  </div>
                  {rec.symptoms && <p className="text-xs text-muted-foreground mt-1">Symptoms: {rec.symptoms}</p>}
                  {rec.treatment && <p className="text-xs text-muted-foreground mt-1">Treatment: {rec.treatment}</p>}
                  {rec.notes && <p className="text-xs text-muted-foreground mt-1">{rec.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
