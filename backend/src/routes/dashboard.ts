import { Router } from "express";
import { db, usersTable, patientsTable, doctorsTable, appointmentsTable, billsTable, activityLogTable, departmentsTable } from "../db.js";
import { eq, sql, and } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

router.get("/dashboard/stats", requireAuth, async (_req, res): Promise<void> => {
  const [patientCount] = await db.select({ count: sql<number>`count(*)::int` }).from(patientsTable);
  const [doctorCount] = await db.select({ count: sql<number>`count(*)::int` }).from(doctorsTable);
  const [apptCount] = await db.select({ count: sql<number>`count(*)::int` }).from(appointmentsTable);

  const allBills = await db.select({ totalAmount: billsTable.totalAmount, status: billsTable.status }).from(billsTable);
  const paidBills = allBills.filter(b => b.status === "paid");
  const totalRevenue = paidBills.reduce((s, b) => s + parseFloat(String(b.totalAmount || 0)), 0);

  const today = new Date().toISOString().slice(0, 10);
  const allAppts = await db.select().from(appointmentsTable);
  const todayAppts = allAppts.filter(a => a.appointmentDate === today);
  const pending = allAppts.filter(a => a.status === "pending");
  const completed = allAppts.filter(a => a.status === "completed");
  const cancelled = allAppts.filter(a => a.status === "cancelled");

  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const firstOfMonthStr = firstOfMonth.toISOString().slice(0, 10);

  const newPatients = await db.select({ count: sql<number>`count(*)::int` })
    .from(usersTable)
    .where(and(eq(usersTable.role, "patient"), sql`created_at >= ${firstOfMonthStr}::date`));

  const revenueThisMonth = paidBills.reduce((s, b) => s + parseFloat(String(b.totalAmount || 0)), 0) * 0.15;

  res.json({
    totalPatients: patientCount.count,
    totalDoctors: doctorCount.count,
    totalAppointments: apptCount.count,
    totalRevenue,
    todayAppointments: todayAppts.length,
    pendingAppointments: pending.length,
    completedAppointments: completed.length,
    cancelledAppointments: cancelled.length,
    newPatientsThisMonth: newPatients[0]?.count || 0,
    revenueThisMonth,
  });
});

router.get("/dashboard/appointment-analytics", requireAuth, async (req, res): Promise<void> => {
  const months = parseInt(String(req.query.months || "6"));
  const appts = await db.select().from(appointmentsTable);

  const result: any[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.toLocaleString("default", { month: "short" });
    const prefix = `${year}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const monthAppts = appts.filter(a => a.appointmentDate.startsWith(prefix));
    result.push({
      month,
      year,
      total: monthAppts.length,
      completed: monthAppts.filter(a => a.status === "completed").length,
      cancelled: monthAppts.filter(a => a.status === "cancelled").length,
      pending: monthAppts.filter(a => a.status === "pending").length,
    });
  }

  res.json(result);
});

router.get("/dashboard/revenue-analytics", requireAuth, async (req, res): Promise<void> => {
  const months = parseInt(String(req.query.months || "6"));
  const bills = await db.select().from(billsTable);

  const result: any[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.toLocaleString("default", { month: "short" });
    const monthPrefix = `${year}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const monthBills = bills.filter(b =>
      b.status === "paid" &&
      b.createdAt.toISOString().startsWith(monthPrefix)
    );

    const revenue = monthBills.reduce((s, b) => s + parseFloat(String(b.totalAmount || 0)), 0);
    result.push({ month, year, revenue, invoiceCount: monthBills.length });
  }

  res.json(result);
});

router.get("/dashboard/recent-activity", requireAuth, async (_req, res): Promise<void> => {
  const activities = await db.select().from(activityLogTable).orderBy(sql`created_at DESC`).limit(20);
  res.json(activities);
});

router.get("/dashboard/audit-log", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const page = Math.max(1, parseInt(String(req.query.page || "1")));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || "50"))));
  const type = req.query.type as string | undefined;
  const offset = (page - 1) * limit;

  const whereClause = type ? eq(activityLogTable.type, type) : undefined;

  const items = whereClause
    ? await db.select().from(activityLogTable).where(whereClause).orderBy(sql`created_at DESC`).limit(limit).offset(offset)
    : await db.select().from(activityLogTable).orderBy(sql`created_at DESC`).limit(limit).offset(offset);

  const [{ count }] = whereClause
    ? await db.select({ count: sql<number>`count(*)::int` }).from(activityLogTable).where(whereClause)
    : await db.select({ count: sql<number>`count(*)::int` }).from(activityLogTable);

  res.json({ data: items, total: count, page, limit, totalPages: Math.ceil(count / limit) });
});

router.get("/dashboard/department-stats", requireAuth, async (_req, res): Promise<void> => {
  const departments = await db.select().from(departmentsTable);
  const doctors = await db.select().from(doctorsTable);
  const appts = await db.select().from(appointmentsTable);
  const bills = await db.select().from(billsTable);

  const result = await Promise.all(departments.map(async (dept) => {
    const deptDoctors = doctors.filter(d => d.departmentId === dept.id);
    const doctorIds = deptDoctors.map(d => d.id);
    const deptAppts = appts.filter(a => doctorIds.includes(a.doctorId));

    const deptBills = bills.filter(b => {
      const appt = deptAppts.find(a => a.id === b.appointmentId);
      return appt && b.status === "paid";
    });
    const revenue = deptBills.reduce((s, b) => s + parseFloat(String(b.totalAmount || 0)), 0);

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      doctorCount: deptDoctors.length,
      appointmentCount: deptAppts.length,
      revenue,
    };
  }));

  res.json(result);
});

export default router;
