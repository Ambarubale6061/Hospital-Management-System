import { Router } from "express";
import { db, appointmentsTable, patientsTable, doctorsTable, usersTable, activityLogTable } from "../db.js";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";
import { emitEvent } from "../lib/socket.js";
import { createNotification } from "./notifications.js";

const router = Router();

async function enrichAppointment(appt: typeof appointmentsTable.$inferSelect) {
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

  return {
    ...appt,
    patient: patient ? { ...patient, user: patientUser } : null,
    doctor: doctor ? { ...doctor, user: doctorUser, department: null } : null,
  };
}

router.get("/appointments", requireAuth, async (req, res): Promise<void> => {
  const patientId = req.query.patientId ? parseInt(String(req.query.patientId), 10) : undefined;
  const doctorId = req.query.doctorId ? parseInt(String(req.query.doctorId), 10) : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const date = typeof req.query.date === "string" ? req.query.date : undefined;
  const page = parseInt(String(req.query.page || "1"));
  const limit = parseInt(String(req.query.limit || "20"));
  const offset = (page - 1) * limit;

  let appts = await db.select().from(appointmentsTable).orderBy(appointmentsTable.appointmentDate);

  if (patientId) appts = appts.filter(a => a.patientId === patientId);
  if (doctorId) appts = appts.filter(a => a.doctorId === doctorId);
  if (status) appts = appts.filter(a => a.status === status);
  if (date) appts = appts.filter(a => a.appointmentDate === date);

  const total = appts.length;
  const paged = appts.slice(offset, offset + limit);
  const enriched = await Promise.all(paged.map(enrichAppointment));
  res.json({ data: enriched, total, page, limit });
});

router.post("/appointments", requireAuth, async (req, res): Promise<void> => {
  const { patientId, doctorId, appointmentDate, appointmentTime, reason, notes } = req.body;
  if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
    res.status(400).json({ error: "patientId, doctorId, appointmentDate, appointmentTime required" });
    return;
  }

  const [appt] = await db.insert(appointmentsTable).values({
    patientId, doctorId, appointmentDate, appointmentTime,
    reason: reason || null, notes: notes || null,
  }).returning();

  await db.insert(activityLogTable).values({
    type: "appointment_booked",
    description: `Appointment booked for ${appointmentDate} at ${appointmentTime}`,
    actorName: req.user?.email || "System",
  });

  const enriched = await enrichAppointment(appt);
  emitEvent("appointment:created", enriched);

  if (enriched?.doctor?.userId) {
    await createNotification({
      userId: enriched.doctor.userId,
      title: "New Appointment Booked",
      message: `${enriched.patient?.user?.firstName} ${enriched.patient?.user?.lastName} booked an appointment on ${appointmentDate} at ${appointmentTime}`,
      type: "appointment",
      link: `/appointments/${appt.id}`,
    });
  }

  res.status(201).json(enriched);
});

router.get("/appointments/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [appt] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, id));
  if (!appt) { res.status(404).json({ error: "Appointment not found" }); return; }
  const enriched = await enrichAppointment(appt);
  res.json(enriched);
});

router.patch("/appointments/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { status, notes, reason } = req.body;

  const [appt] = await db.update(appointmentsTable).set({
    ...(status !== undefined && { status }),
    ...(notes !== undefined && { notes }),
    ...(reason !== undefined && { reason }),
  }).where(eq(appointmentsTable.id, id)).returning();

  if (!appt) { res.status(404).json({ error: "Appointment not found" }); return; }

  if (status) {
    await db.insert(activityLogTable).values({
      type: "appointment_updated",
      description: `Appointment #${id} status changed to ${status}`,
      actorName: req.user?.email || "System",
    });
  }

  const enriched = await enrichAppointment(appt);
  emitEvent("appointment:updated", enriched);
  res.json(enriched);
});

router.delete("/appointments/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [appt] = await db.update(appointmentsTable).set({ status: "cancelled" }).where(eq(appointmentsTable.id, id)).returning();
  if (!appt) { res.status(404).json({ error: "Appointment not found" }); return; }

  await db.insert(activityLogTable).values({
    type: "appointment_cancelled",
    description: `Appointment #${id} cancelled`,
    actorName: req.user?.email || "System",
  });

  const enriched = await enrichAppointment(appt);
  emitEvent("appointment:updated", enriched);
  res.json(enriched);
});

router.patch("/appointments/:id/reschedule", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { appointmentDate, appointmentTime } = req.body;
  if (!appointmentDate || !appointmentTime) {
    res.status(400).json({ error: "appointmentDate and appointmentTime required" }); return;
  }
  const [appt] = await db.update(appointmentsTable).set({ appointmentDate, appointmentTime, status: "confirmed" }).where(eq(appointmentsTable.id, id)).returning();
  if (!appt) { res.status(404).json({ error: "Appointment not found" }); return; }
  const enriched = await enrichAppointment(appt);
  emitEvent("appointment:updated", enriched);
  res.json(enriched);
});

export default router;
