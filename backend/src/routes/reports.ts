import { Router } from "express";
import { db, patientsTable, doctorsTable, appointmentsTable, billsTable, usersTable } from "../db.js";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

router.get("/reports/revenue", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const months = Math.min(24, parseInt(String(req.query.months || "12")));
  const bills = await db.select().from(billsTable);
  const now = new Date();
  const result = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthBills = bills.filter(b => b.createdAt.toISOString().startsWith(prefix));
    const paid = monthBills.filter(b => b.status === "paid");
    const pending = monthBills.filter(b => b.status === "pending" || b.status === "partially_paid");
    result.push({
      month: d.toLocaleString("default", { month: "short" }),
      year: d.getFullYear(),
      period: prefix,
      totalRevenue: paid.reduce((s, b) => s + parseFloat(String(b.totalAmount || 0)), 0),
      pendingRevenue: pending.reduce((s, b) => s + parseFloat(String(b.totalAmount || 0)), 0),
      totalBills: monthBills.length,
      paidBills: paid.length,
    });
  }

  const allPaid = bills.filter(b => b.status === "paid");
  const allPending = bills.filter(b => b.status === "pending" || b.status === "partially_paid");

  res.json({
    summary: {
      totalRevenue: allPaid.reduce((s, b) => s + parseFloat(String(b.totalAmount || 0)), 0),
      pendingRevenue: allPending.reduce((s, b) => s + parseFloat(String(b.totalAmount || 0)), 0),
      totalBills: bills.length,
      paidBills: allPaid.length,
    },
    monthly: result,
  });
});

router.get("/reports/appointments", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const months = Math.min(24, parseInt(String(req.query.months || "12")));
  const appts = await db.select().from(appointmentsTable);
  const now = new Date();
  const monthly = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const month = appts.filter(a => a.appointmentDate.startsWith(prefix));
    monthly.push({
      month: d.toLocaleString("default", { month: "short" }),
      year: d.getFullYear(),
      period: prefix,
      total: month.length,
      completed: month.filter(a => a.status === "completed").length,
      cancelled: month.filter(a => a.status === "cancelled").length,
      pending: month.filter(a => a.status === "pending" || a.status === "confirmed").length,
      noShow: month.filter(a => a.status === "no_show").length,
    });
  }

  const statusCounts: Record<string, number> = {};
  for (const a of appts) { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; }

  res.json({
    summary: {
      total: appts.length,
      byStatus: statusCounts,
      completionRate: appts.length > 0 ? Math.round(((statusCounts["completed"] || 0) / appts.length) * 100) : 0,
    },
    monthly,
  });
});

router.get("/reports/patients", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const months = Math.min(24, parseInt(String(req.query.months || "12")));
  const patients = await db.select({
    id: patientsTable.id,
    createdAt: usersTable.createdAt,
    gender: patientsTable.gender,
    bloodGroup: patientsTable.bloodGroup,
  }).from(patientsTable).innerJoin(usersTable, eq(usersTable.id, patientsTable.userId));

  const now = new Date();
  const monthly = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const month = patients.filter(p => p.createdAt.toISOString().startsWith(prefix));
    monthly.push({
      month: d.toLocaleString("default", { month: "short" }),
      year: d.getFullYear(),
      period: prefix,
      newPatients: month.length,
    });
  }

  const genderDist: Record<string, number> = {};
  const bloodDist: Record<string, number> = {};
  for (const p of patients) {
    if (p.gender) genderDist[p.gender] = (genderDist[p.gender] || 0) + 1;
    if (p.bloodGroup) bloodDist[p.bloodGroup] = (bloodDist[p.bloodGroup] || 0) + 1;
  }

  res.json({
    summary: { total: patients.length, genderDistribution: genderDist, bloodGroupDistribution: bloodDist },
    monthly,
  });
});

router.get("/reports/doctors", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const doctors = await db.select().from(doctorsTable);
  const appts = await db.select().from(appointmentsTable);

  const result = await Promise.all(doctors.map(async (doc) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, doc.userId));
    const docAppts = appts.filter(a => a.doctorId === doc.id);
    return {
      doctorId: doc.id,
      name: user ? `Dr. ${user.firstName} ${user.lastName}` : `Doctor #${doc.id}`,
      specialization: doc.specialization,
      totalAppointments: docAppts.length,
      completed: docAppts.filter(a => a.status === "completed").length,
      cancelled: docAppts.filter(a => a.status === "cancelled").length,
      pending: docAppts.filter(a => a.status === "pending" || a.status === "confirmed").length,
    };
  }));

  res.json(result.sort((a, b) => b.totalAppointments - a.totalAppointments));
});

export default router;
