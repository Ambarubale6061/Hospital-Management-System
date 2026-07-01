import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Shield, Bell, Database, Clock } from "lucide-react";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

export default function Settings() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">Current system configuration and status.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Core application details</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <InfoRow label="Application" value="MediCore HMS" />
            <InfoRow label="Version" value="1.0.0" />
            <InfoRow label="Environment" value={import.meta.env.MODE === "production" ? "Production" : "Development"} />
            <InfoRow label="API" value="/api" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Database className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle>Database</CardTitle>
              <CardDescription>Data persistence layer</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <InfoRow label="Engine" value="PostgreSQL" />
            <InfoRow label="ORM" value="Drizzle ORM" />
            <InfoRow label="Status" value="Connected" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>Security and access control</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <InfoRow label="Method" value="JWT (Bearer Token)" />
            <InfoRow label="Token Storage" value="localStorage" />
            <InfoRow label="Role-based Access" value="Enabled" />
            <InfoRow label="Roles" value="Admin · Doctor · Patient · Receptionist" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle>Real-time & Notifications</CardTitle>
              <CardDescription>Live updates and event system</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <InfoRow label="Real-time Transport" value="Socket.IO (WebSocket)" />
            <InfoRow label="Notification Store" value="MongoDB" />
            <InfoRow label="Events" value="Appointments · Bills · Patients · Doctors" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <CardTitle>Audit Logging</CardTitle>
              <CardDescription>System activity tracking</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <InfoRow label="Storage" value="PostgreSQL (activity_log table)" />
            <InfoRow label="Events Tracked" value="All create · update · delete operations" />
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                View full audit log in the Audit Log section
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
