import { Router } from "express";
import { db, prescriptionsTable, patientsTable, doctorsTable, usersTable, activityLogTable } from "../db.js";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { emitEvent } from "../lib/socket.js";

const router = Router();

async function enrichPrescription(p: typeof prescriptionsTable.$inferSelect) {
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, p.patientId));
  const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, p.doctorId));
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
    ...p,
    patient: patient ? { ...patient, user: patientUser } : null,
    doctor: doctor ? { ...doctor, user: doctorUser, department: null } : null,
  };
}

router.get("/prescriptions", requireAuth, async (req, res): Promise<void> => {
  const patientId = req.query.patientId ? parseInt(String(req.query.patientId), 10) : undefined;
  const doctorId = req.query.doctorId ? parseInt(String(req.query.doctorId), 10) : undefined;
  const appointmentId = req.query.appointmentId ? parseInt(String(req.query.appointmentId), 10) : undefined;

  let prescriptions = await db.select().from(prescriptionsTable).orderBy(prescriptionsTable.createdAt);

  if (patientId) prescriptions = prescriptions.filter(p => p.patientId === patientId);
  if (doctorId) prescriptions = prescriptions.filter(p => p.doctorId === doctorId);
  if (appointmentId) prescriptions = prescriptions.filter(p => p.appointmentId === appointmentId);

  const enriched = await Promise.all(prescriptions.map(enrichPrescription));
  res.json({ data: enriched, total: enriched.length });
});

router.post("/prescriptions", requireAuth, requireRole("admin", "doctor"), async (req, res): Promise<void> => {
  const { patientId, doctorId, appointmentId, medications, dosageInstructions, diagnosis, validUntil, notes } = req.body;

  if (!patientId || !doctorId || !medications) {
    res.status(400).json({ error: "patientId, doctorId, medications required" });
    return;
  }

  const [p] = await db.insert(prescriptionsTable).values({
    patientId, doctorId,
    appointmentId: appointmentId || null,
    medications,
    dosageInstructions: dosageInstructions || null,
    diagnosis: diagnosis || null,
    validUntil: validUntil || null,
    notes: notes || null,
  }).returning();

  await db.insert(activityLogTable).values({
    type: "prescription_created",
    description: `Prescription created for patient #${patientId}`,
    actorName: req.user?.email || "System",
  });

  const enriched = await enrichPrescription(p);
  emitEvent("prescription:created", enriched);
  res.status(201).json(enriched);
});

router.get("/prescriptions/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [p] = await db.select().from(prescriptionsTable).where(eq(prescriptionsTable.id, id));
  if (!p) { res.status(404).json({ error: "Prescription not found" }); return; }
  const enriched = await enrichPrescription(p);
  res.json(enriched);
});

router.patch("/prescriptions/:id", requireAuth, requireRole("admin", "doctor"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { medications, dosageInstructions, diagnosis, validUntil, notes } = req.body;

  const [p] = await db.update(prescriptionsTable).set({
    ...(medications !== undefined && { medications }),
    ...(dosageInstructions !== undefined && { dosageInstructions }),
    ...(diagnosis !== undefined && { diagnosis }),
    ...(validUntil !== undefined && { validUntil }),
    ...(notes !== undefined && { notes }),
  }).where(eq(prescriptionsTable.id, id)).returning();

  if (!p) { res.status(404).json({ error: "Prescription not found" }); return; }
  const enriched = await enrichPrescription(p);
  emitEvent("prescription:updated", enriched);
  res.json(enriched);
});

export default router;
