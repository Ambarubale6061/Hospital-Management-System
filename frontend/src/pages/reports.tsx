import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from "recharts";
import { DollarSign, Users, Calendar, UserRound, TrendingUp, Download } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const TOKEN_KEY = "hms_token";
const h = () => ({ Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` });

async function fetchRevenue() { return (await fetch(`${BASE}/api/reports/revenue?months=12`, { headers: h() })).json(); }
async function fetchAppointments() { return (await fetch(`${BASE}/api/reports/appointments?months=12`, { headers: h() })).json(); }
async function fetchPatients() { return (await fetch(`${BASE}/api/reports/patients?months=12`, { headers: h() })).json(); }
async function fetchDoctors() { return (await fetch(`${BASE}/api/reports/doctors`, { headers: h() })).json(); }

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

function EmptyChart() {
  return <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available yet</div>;
}

function StatCard({ title, value, sub, icon: Icon, color }: any) {
  const colorMap: Record<string, string> = {
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    teal: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}><Icon className="h-4 w-4" /></div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const { user } = useAuth();
  if (user?.role !== "admin") return <div className="flex h-64 items-center justify-center text-muted-foreground">Access restricted to administrators.</div>;

  const { data: rev } = useQuery({ queryKey: ["reports-revenue"], queryFn: fetchRevenue });
  const { data: appt } = useQuery({ queryKey: ["reports-appointments"], queryFn: fetchAppointments });
  const { data: pat } = useQuery({ queryKey: ["reports-patients"], queryFn: fetchPatients });
  const { data: docs } = useQuery({ queryKey: ["reports-doctors"], queryFn: fetchDoctors });

  const genderData = pat?.summary?.genderDistribution
    ? Object.entries(pat.summary.genderDistribution).map(([name, value]) => ({ name, value }))
    : [];

  const statusData = appt?.summary?.byStatus
    ? Object.entries(appt.summary.byStatus).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }))
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Analytics and insights across the hospital</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`$${(rev?.summary?.totalRevenue || 0).toLocaleString()}`} sub="All paid bills" icon={DollarSign} color="green" />
        <StatCard title="Pending Revenue" value={`$${(rev?.summary?.pendingRevenue || 0).toLocaleString()}`} sub="Unpaid bills" icon={TrendingUp} color="purple" />
        <StatCard title="Total Patients" value={(pat?.summary?.total || 0).toLocaleString()} sub="Registered" icon={Users} color="blue" />
        <StatCard title="Total Appointments" value={(appt?.summary?.total || 0).toLocaleString()} sub={`${appt?.summary?.completionRate || 0}% completion rate`} icon={Calendar} color="teal" />
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Revenue</CardTitle>
                <CardDescription>Paid vs pending revenue over 12 months</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {rev?.monthly?.some((m: any) => m.totalRevenue > 0 || m.pendingRevenue > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rev.monthly}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <YAxis tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(0)+"k" : v}`} tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [`$${v.toLocaleString()}`]} />
                      <Bar dataKey="totalRevenue" fill="hsl(var(--chart-2))" name="Paid" radius={[4,4,0,0]} />
                      <Bar dataKey="pendingRevenue" fill="hsl(var(--chart-4))" name="Pending" radius={[4,4,0,0]} />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue Summary</CardTitle>
                <CardDescription>Bills breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {[
                  { label: "Total Revenue (Paid)", value: `$${(rev?.summary?.totalRevenue || 0).toLocaleString()}`, color: "text-green-600" },
                  { label: "Pending Revenue", value: `$${(rev?.summary?.pendingRevenue || 0).toLocaleString()}`, color: "text-amber-600" },
                  { label: "Total Bills", value: rev?.summary?.totalBills || 0, color: "" },
                  { label: "Paid Bills", value: rev?.summary?.paidBills || 0, color: "text-green-600" },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="text-sm text-muted-foreground">{r.label}</span>
                    <span className={`font-semibold ${r.color}`}>{r.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Appointments</CardTitle>
                <CardDescription>By status over 12 months</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {appt?.monthly?.some((m: any) => m.total > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appt.monthly}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                      <Bar dataKey="completed" stackId="a" fill="hsl(var(--chart-2))" name="Completed" />
                      <Bar dataKey="pending" stackId="a" fill="hsl(var(--chart-4))" name="Pending/Confirmed" />
                      <Bar dataKey="cancelled" stackId="a" fill="hsl(var(--chart-1))" name="Cancelled" radius={[4,4,0,0]} />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Status</CardTitle>
                <CardDescription>All-time distribution</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                        {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Patient Growth</CardTitle>
                <CardDescription>New registrations per month</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {pat?.monthly?.some((m: any) => m.newPatients > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pat.monthly}>
                      <defs>
                        <linearGradient id="patGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                      <Area type="monotone" dataKey="newPatients" stroke="hsl(var(--primary))" fill="url(#patGrad)" strokeWidth={2} name="New Patients" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Gender Distribution</CardTitle></CardHeader>
                <CardContent>
                  {genderData.length > 0 ? genderData.map((g, i) => (
                    <div key={g.name} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="text-sm capitalize">{g.name || "Unknown"}</span>
                      <span className="font-semibold">{g.value as number}</span>
                    </div>
                  )) : <p className="text-sm text-muted-foreground text-center py-4">No gender data yet</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Blood Group Distribution</CardTitle></CardHeader>
                <CardContent>
                  {pat?.summary?.bloodGroupDistribution && Object.keys(pat.summary.bloodGroupDistribution).length > 0 ? (
                    Object.entries(pat.summary.bloodGroupDistribution).map(([bg, count]) => (
                      <div key={bg} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span className="text-sm font-medium">{bg}</span>
                        <span className="font-semibold">{count as number}</span>
                      </div>
                    ))
                  ) : <p className="text-sm text-muted-foreground text-center py-4">No blood group data yet</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="doctors" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Doctor Performance</CardTitle>
              <CardDescription>Appointments handled per doctor</CardDescription>
            </CardHeader>
            <CardContent>
              {!docs?.length ? (
                <p className="text-sm text-muted-foreground text-center py-8">No doctor data yet</p>
              ) : (
                <div className="space-y-0">
                  <div className="grid grid-cols-5 text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-2 border-b px-1">
                    <span className="col-span-2">Doctor</span>
                    <span className="text-center">Total</span>
                    <span className="text-center">Completed</span>
                    <span className="text-center">Cancelled</span>
                  </div>
                  {docs.map((doc: any) => (
                    <div key={doc.doctorId} className="grid grid-cols-5 items-center py-3 border-b last:border-0 px-1 hover:bg-muted/20 rounded transition-colors">
                      <div className="col-span-2">
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.specialization}</p>
                      </div>
                      <span className="text-center font-semibold">{doc.totalAppointments}</span>
                      <span className="text-center text-green-600 font-semibold">{doc.completed}</span>
                      <span className="text-center text-red-500 font-semibold">{doc.cancelled}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
