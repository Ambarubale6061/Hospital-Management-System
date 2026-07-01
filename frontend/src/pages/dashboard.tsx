import { useCallback } from "react";
import { 
  useGetDashboardStats, 
  useGetAppointmentAnalytics, 
  useGetRevenueAnalytics, 
  useGetRecentActivity,
  useGetDepartmentStats,
  useListAppointments,
  useListBills,
  useListPrescriptions,
} from "@/api";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketEvent } from "@/lib/socket";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserRound, Calendar, DollarSign, Activity, ArrowUpRight, Clock, FileText, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Link } from "wouter";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  no_show: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  unpaid: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  partially_paid: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

function StatCard({ title, value, subtitle, icon: Icon, color }: { title: string; value: string | number; subtitle?: string; icon: any; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    teal: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  };
  return (
    <Card className="hover-elevate transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

// ── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: stats, refetch: refetchStats } = useGetDashboardStats({ query: { enabled: true }});
  const { data: appointments } = useGetAppointmentAnalytics({ months: 6 }, { query: { enabled: true }});
  const { data: revenue } = useGetRevenueAnalytics({ months: 6 }, { query: { enabled: true }});
  const { data: activity, refetch: refetchActivity } = useGetRecentActivity({ query: { enabled: true }});
  const { data: deptStats } = useGetDepartmentStats({ query: { enabled: true }});

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["getDashboardStats"] });
    queryClient.invalidateQueries({ queryKey: ["getRecentActivity"] });
    queryClient.invalidateQueries({ queryKey: ["getAppointmentAnalytics"] });
    queryClient.invalidateQueries({ queryKey: ["getDepartmentStats"] });
  }, [queryClient]);

  useSocketEvent("appointment:created", invalidateAll);
  useSocketEvent("appointment:updated", invalidateAll);
  useSocketEvent("patient:created", invalidateAll);
  useSocketEvent("doctor:created", invalidateAll);
  useSocketEvent("doctor:updated", invalidateAll);
  useSocketEvent("doctor:deleted", invalidateAll);
  useSocketEvent("bill:created", invalidateAll);
  useSocketEvent("bill:updated", invalidateAll);

  if (!stats) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.firstName}</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's an overview of the hospital today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={stats.totalPatients.toLocaleString()} subtitle={`+${stats.newPatientsThisMonth} this month`} icon={Users} color="blue" />
        <StatCard title="Total Doctors" value={stats.totalDoctors.toLocaleString()} subtitle="Across all departments" icon={UserRound} color="teal" />
        <StatCard title="Appointments Today" value={stats.todayAppointments.toLocaleString()} subtitle={`${stats.pendingAppointments} pending`} icon={Calendar} color="orange" />
        <StatCard title="Monthly Revenue" value={`$${stats.revenueThisMonth.toLocaleString()}`} subtitle={`Total: $${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {revenue && revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} />
                  <YAxis tickFormatter={(val) => `$${val/1000}k`} tickLine={false} axisLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyChart message="No revenue data yet" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activity && activity.length > 0 ? activity.slice(0, 8).map((act) => (
                <div key={act.id} className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium leading-snug">{act.description}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {format(new Date(act.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appointments Overview</CardTitle>
            <CardDescription>Monthly breakdown by status</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {appointments && appointments.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointments}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} />
                  <YAxis tickLine={false} axisLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} />
                  <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}/>
                  <Bar dataKey="completed" stackId="a" fill="hsl(var(--chart-2))" name="Completed" radius={[0,0,4,4]} />
                  <Bar dataKey="pending" stackId="a" fill="hsl(var(--chart-4))" name="Pending" />
                  <Bar dataKey="cancelled" stackId="a" fill="hsl(var(--chart-1))" name="Cancelled" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart message="No appointment data yet" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Department Activity</CardTitle>
            <CardDescription>Appointments by department</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {deptStats && deptStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptStats} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} />
                  <YAxis dataKey="departmentName" type="category" tickLine={false} axisLine={false} tick={{fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 500}} width={90} />
                  <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}/>
                  <Bar dataKey="appointmentCount" fill="hsl(var(--primary))" name="Appointments" radius={[0,4,4,0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart message="No department data yet" />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Doctor Dashboard ─────────────────────────────────────────────────────────
function DoctorDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const today = format(new Date(), "yyyy-MM-dd");
  const { data: todayAppts, refetch: refetchAppts } = useListAppointments(
    { date: today },
    { query: { enabled: true } }
  );
  const { data: allAppts } = useListAppointments({}, { query: { enabled: true } });
  const { data: prescriptions } = useListPrescriptions({}, { query: { enabled: true } });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["listAppointments"] });
    queryClient.invalidateQueries({ queryKey: ["listPrescriptions"] });
  }, [queryClient]);

  useSocketEvent("appointment:created", invalidate);
  useSocketEvent("appointment:updated", invalidate);
  useSocketEvent("prescription:created", invalidate);

  const totalAppts = allAppts?.data?.length || 0;
  const pendingAppts = allAppts?.data?.filter(a => a.status === "pending" || a.status === "confirmed").length || 0;
  const completedAppts = allAppts?.data?.filter(a => a.status === "completed").length || 0;
  const todayList = todayAppts?.data || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Good {getGreeting()}, Dr. {user?.firstName}</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your schedule for today, {format(new Date(), "EEEE, MMMM d")}.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Today's Appointments" value={todayList.length} subtitle="Scheduled for today" icon={Calendar} color="blue" />
        <StatCard title="Upcoming" value={pendingAppts} subtitle="Pending & confirmed" icon={Clock} color="orange" />
        <StatCard title="Completed" value={completedAppts} subtitle="All time" icon={CheckCircle2} color="green" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Today's Schedule</CardTitle>
            <CardDescription>{format(new Date(), "EEEE, MMMM d, yyyy")}</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/appointments">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {todayList.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayList.map(appt => (
                <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {appt.patient?.user?.firstName?.[0]}{appt.patient?.user?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{appt.patient?.user?.firstName} {appt.patient?.user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{appt.appointmentTime} · {appt.reason || "General consultation"}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-1 rounded-full capitalize ${statusColors[appt.status] || ""}`}>
                    {appt.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Prescriptions</CardTitle>
            <CardDescription>Prescriptions you've issued</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/prescriptions">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!prescriptions?.data?.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">No prescriptions issued yet</p>
          ) : (
            <div className="space-y-2">
              {prescriptions.data.slice(0, 5).map(rx => (
                <div key={rx.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div>
                    <p className="text-sm font-medium">{rx.patient?.user?.firstName} {rx.patient?.user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{rx.diagnosis}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{format(new Date(rx.createdAt), "MMM d")}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Patient Dashboard ────────────────────────────────────────────────────────
function PatientDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appts, refetch: refetchAppts } = useListAppointments({}, { query: { enabled: true } });
  const { data: bills, refetch: refetchBills } = useListBills({}, { query: { enabled: true } });
  const { data: prescriptions } = useListPrescriptions({}, { query: { enabled: true } });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["listAppointments"] });
    queryClient.invalidateQueries({ queryKey: ["listBills"] });
  }, [queryClient]);

  useSocketEvent("appointment:created", invalidate);
  useSocketEvent("appointment:updated", invalidate);
  useSocketEvent("bill:created", invalidate);
  useSocketEvent("bill:updated", invalidate);

  const upcomingAppts = appts?.data?.filter(a => a.status === "pending" || a.status === "confirmed") || [];
  const pendingBills = bills?.data?.filter(b => b.status !== "paid") || [];
  const activePrescriptions = prescriptions?.data || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {user?.firstName}</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your health records and appointments.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Upcoming Appointments" value={upcomingAppts.length} icon={Calendar} color="blue" />
        <StatCard title="Active Prescriptions" value={activePrescriptions.length} icon={FileText} color="green" />
        <StatCard title="Outstanding Bills" value={pendingBills.length} subtitle={pendingBills.length > 0 ? "Payment required" : "All paid"} icon={CreditCard} color={pendingBills.length > 0 ? "amber" : "green"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled visits</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild><Link href="/appointments">View All</Link></Button>
          </CardHeader>
          <CardContent>
            {upcomingAppts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No upcoming appointments</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="/appointments/new">Book Appointment</Link>
                </Button>
              </div>
            ) : upcomingAppts.slice(0, 5).map(appt => (
              <div key={appt.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{appt.appointmentDate} · {appt.appointmentTime}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-1 rounded-full capitalize ${statusColors[appt.status] || ""}`}>
                  {appt.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Bills & Payments</CardTitle>
              <CardDescription>Your billing history</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild><Link href="/bills">View All</Link></Button>
          </CardHeader>
          <CardContent>
            {bills?.data?.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No bills yet</p>
              </div>
            ) : bills?.data?.slice(0, 5).map(bill => (
              <div key={bill.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{bill.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">${bill.totalAmount} · {format(new Date(bill.createdAt), "MMM d, yyyy")}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-1 rounded-full capitalize ${statusColors[bill.status] || ""}`}>
                  {bill.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Receptionist Dashboard ───────────────────────────────────────────────────
function ReceptionistDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const today = format(new Date(), "yyyy-MM-dd");
  const { data: todayAppts } = useListAppointments({ date: today }, { query: { enabled: true } });
  const { data: allAppts } = useListAppointments({}, { query: { enabled: true } });
  const { data: pendingBills } = useListBills({ status: "pending" }, { query: { enabled: true } });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["listAppointments"] });
    queryClient.invalidateQueries({ queryKey: ["listBills"] });
  }, [queryClient]);

  useSocketEvent("appointment:created", invalidate);
  useSocketEvent("appointment:updated", invalidate);
  useSocketEvent("bill:created", invalidate);
  useSocketEvent("patient:created", invalidate);

  const todayList = todayAppts?.data || [];
  const pendingAppts = allAppts?.data?.filter(a => a.status === "pending").length || 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Good {getGreeting()}, {user?.firstName}</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's the front desk overview for today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Today's Appointments" value={todayList.length} icon={Calendar} color="blue" />
        <StatCard title="Pending Confirmations" value={pendingAppts} icon={AlertCircle} color="amber" />
        <StatCard title="Unpaid Bills" value={pendingBills?.data?.length || 0} icon={CreditCard} color="orange" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Today's Appointments</CardTitle>
            <CardDescription>{format(new Date(), "EEEE, MMMM d, yyyy")}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/appointments/new">+ New</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/appointments">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {todayList.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayList.map(appt => (
                <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                      {appt.patient?.user?.firstName?.[0]}{appt.patient?.user?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{appt.patient?.user?.firstName} {appt.patient?.user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{appt.appointmentTime} · Dr. {appt.doctor?.user?.lastName}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-1 rounded-full capitalize ${statusColors[appt.status] || ""}`}>
                    {appt.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-full flex items-center justify-center text-muted-foreground">
      <p className="text-sm">{message}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-64 bg-muted rounded" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 h-72 bg-muted rounded-xl" />
        <div className="h-72 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

// ── Main Entry ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return <DashboardSkeleton />;

  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "doctor":
      return <DoctorDashboard />;
    case "patient":
      return <PatientDashboard />;
    case "receptionist":
      return <ReceptionistDashboard />;
    default:
      return <AdminDashboard />;
  }
}
