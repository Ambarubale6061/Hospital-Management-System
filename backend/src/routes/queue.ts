import { Router } from "express";
import { db, appointmentsTable, patientsTable, doctorsTable, usersTable, activityLogTable } from "../db.js";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { emitEvent } from "../lib/socket.js";
import { createNotification } from "./notifications.js";

const router = Router();

async function enrichQueueItem(appt: typeof appointmentsTable.$inferSelect) {
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, appt.patientId));
  const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, appt.doctorId));
  let patientUser = null, doctorUser = null;
  if (patient) {
    const [u] = await db.select().from(usersTable).where(eq(usersTable.id, patient.userId));
    if (u) { const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...s } = u; patientUser = s; }
  }
  if (doctor) {
    const [u] = await db.select().from(usersTable).where(eq(usersTable.id, doctor.userId));
    if (u) { const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...s } = u; doctorUser = s; }
  }
  return { ...appt, patient: patient ? { ...patient, user: patientUser } : null, doctor: doctor ? { ...doctor, user: doctorUser } : null };
}

router.get("/queue", requireAuth, async (req, res): Promise<void> => {
  const today = new Date().toISOString().slice(0, 10);
  const date = typeof req.query.date === "string" ? req.query.date : today;
  const doctorId = req.query.doctorId ? parseInt(String(req.query.doctorId)) : undefined;

  let appts = await db.select().from(appointmentsTable)
    .where(eq(appointmentsTable.appointmentDate, date))
    .orderBy(appointmentsTable.tokenNumber, appointmentsTable.appointmentTime);

  if (doctorId) appts = appts.filter(a => a.doctorId === doctorId);

  const enriched = await Promise.all(appts.map(enrichQueueItem));
  res.json(enriched);
});

router.patch("/appointments/:id/checkin", requireAuth, requireRole("admin", "receptionist"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);

  const today = new Date().toISOString().slice(0, 10);
  const todayAppts = await db.select().from(appointmentsTable)
    .where(and(eq(appointmentsTable.appointmentDate, today), sql`token_number IS NOT NULL`));
  const nextToken = (todayAppts.length) + 1;

  const [appt] = await db.update(appointmentsTable)
    .set({ status: "checked_in", tokenNumber: nextToken })
    .where(eq(appointmentsTable.id, id))
    .returning();

  if (!appt) { res.status(404).json({ error: "Appointment not found" }); return; }

  await db.insert(activityLogTable).values({
    type: "appointment_updated",
    description: `Patient checked in for appointment #${id}, token #${nextToken}`,
    actorName: req.user?.email || "System",
  });

  const enriched = await enrichQueueItem(appt);
  emitEvent("queue:updated", enriched);
  emitEvent("appointment:updated", enriched);

  if (enriched.patient?.userId) {
    await createNotification({
      userId: enriched.patient.userId,
      title: "Checked In",
      message: `You have been checked in. Your token number is ${nextToken}.`,
      type: "appointment",
      link: `/appointments/${id}`,
    });
  }

  res.json(enriched);
});

router.patch("/appointments/:id/queue-status", requireAuth, requireRole("admin", "receptionist", "doctor"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { status } = req.body;

  const validStatuses = ["waiting", "in_consultation", "completed", "cancelled"] as const;
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status" }); return;
  }

  const [appt] = await db.update(appointmentsTable)
    .set({ status })
    .where(eq(appointmentsTable.id, id))
    .returning();

  if (!appt) { res.status(404).json({ error: "Not found" }); return; }

  const enriched = await enrichQueueItem(appt);
  emitEvent("queue:updated", enriched);
  emitEvent("appointment:updated", enriched);
  res.json(enriched);
});

router.patch("/appointments/:id/consult", requireAuth, requireRole("admin", "doctor"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { chiefComplaint, consultationNotes, diagnosis, followUpDate } = req.body;

  const [appt] = await db.update(appointmentsTable).set({
    chiefComplaint: chiefComplaint || null,
    consultationNotes: consultationNotes || null,
    diagnosis: diagnosis || null,
    followUpDate: followUpDate || null,
    status: "completed",
  }).where(eq(appointmentsTable.id, id)).returning();

  if (!appt) { res.status(404).json({ error: "Not found" }); return; }

  await db.insert(activityLogTable).values({
    type: "appointment_updated",
    description: `Consultation completed for appointment #${id}`,
    actorName: req.user?.email || "Doctor",
  });

  const enriched = await enrichQueueItem(appt);

  if (enriched.patient?.userId) {
    await createNotification({
      userId: enriched.patient.userId,
      title: "Consultation Complete",
      message: `Your consultation with Dr. ${enriched.doctor?.user?.firstName} ${enriched.doctor?.user?.lastName} is complete.`,
      type: "appointment",
      link: `/appointments/${id}`,
    });
  }

  emitEvent("appointment:updated", enriched);
  res.json(enriched);
});

export default router;
