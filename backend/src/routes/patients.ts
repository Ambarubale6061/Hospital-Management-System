import { Router } from "express";
import { db, patientsTable, usersTable, medicalRecordsTable, activityLogTable } from "../db.js";
import { eq, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { emitEvent } from "../lib/socket.js";
import { createNotification } from "./notifications.js";

const router = Router();

async function getPatientWithUser(id: number) {
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, id));
  if (!patient) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, patient.userId));
  if (!user) return null;
  const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...safeUser } = user;
  return { ...patient, user: safeUser };
}

router.get("/patients/me", requireAuth, async (req, res): Promise<void> => {
  if (req.user?.role !== "patient") { res.status(403).json({ error: "Only patients can use this endpoint" }); return; }
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.userId, req.user.userId));
  if (!patient) { res.status(404).json({ error: "Patient profile not found" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, patient.userId));
  const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...safeUser } = user;
  res.json({ ...patient, user: safeUser });
});

router.get("/patients", requireAuth, async (req, res): Promise<void> => {
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const page = parseInt(String(req.query.page || "1"));
  const limit = parseInt(String(req.query.limit || "20"));
  const offset = (page - 1) * limit;

  const patients = await db.select().from(patientsTable).limit(limit).offset(offset);
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(patientsTable);

  const enriched = await Promise.all(patients.map(async (p) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, p.userId));
    if (!user) return null;
    const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...safeUser } = user;
    return { ...p, user: safeUser };
  }));

  let result = enriched.filter(Boolean) as any[];

  if (search) {
    const s = search.toLowerCase();
    result = result.filter(p =>
      p.user.firstName.toLowerCase().includes(s) ||
      p.user.lastName.toLowerCase().includes(s) ||
      p.user.email.toLowerCase().includes(s)
    );
  }

  res.json({ data: result, total: count, page, limit });
});

router.post("/patients", requireAuth, async (req, res): Promise<void> => {
  const { userId, dateOfBirth, gender, bloodGroup, allergies, address, emergencyContactName, emergencyContactPhone, insuranceProvider, insuranceNumber } = req.body;
  if (!userId) { res.status(400).json({ error: "userId required" }); return; }

  const [patient] = await db.insert(patientsTable).values({
    userId, dateOfBirth: dateOfBirth || null, gender: gender || null,
    bloodGroup: bloodGroup || null, allergies: allergies || null,
    address: address || null, emergencyContactName: emergencyContactName || null,
    emergencyContactPhone: emergencyContactPhone || null,
    insuranceProvider: insuranceProvider || null,
    insuranceNumber: insuranceNumber || null,
  }).returning();

  const enriched = await getPatientWithUser(patient.id);

  await db.insert(activityLogTable).values({
    type: "patient_registered",
    description: `New patient registered`,
    actorName: req.user?.email || "System",
  });

  emitEvent("patient:created", enriched);

  const admins = await db.select().from(usersTable).where(eq(usersTable.role, "admin"));
  const recs = await db.select().from(usersTable).where(eq(usersTable.role, "receptionist"));
  for (const u of [...admins, ...recs]) {
    await createNotification({
      userId: u.id,
      title: "New Patient Registered",
      message: `Patient ${enriched?.user?.firstName} ${enriched?.user?.lastName} has been registered`,
      type: "patient",
      link: `/patients/${patient.id}`,
    });
  }

  res.status(201).json(enriched);
});

router.get("/patients/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const patient = await getPatientWithUser(id);
  if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }
  res.json(patient);
});

router.patch("/patients/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const updates = req.body;

  const [patient] = await db.update(patientsTable).set({
    ...(updates.dateOfBirth !== undefined && { dateOfBirth: updates.dateOfBirth }),
    ...(updates.gender !== undefined && { gender: updates.gender }),
    ...(updates.bloodGroup !== undefined && { bloodGroup: updates.bloodGroup }),
    ...(updates.allergies !== undefined && { allergies: updates.allergies }),
    ...(updates.address !== undefined && { address: updates.address }),
    ...(updates.emergencyContactName !== undefined && { emergencyContactName: updates.emergencyContactName }),
    ...(updates.emergencyContactPhone !== undefined && { emergencyContactPhone: updates.emergencyContactPhone }),
    ...(updates.insuranceProvider !== undefined && { insuranceProvider: updates.insuranceProvider }),
    ...(updates.insuranceNumber !== undefined && { insuranceNumber: updates.insuranceNumber }),
  }).where(eq(patientsTable.id, id)).returning();

  if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }
  const enriched = await getPatientWithUser(patient.id);
  res.json(enriched);
});

router.delete("/patients/:id", requireAuth, requireRole("admin", "receptionist"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(patientsTable).where(eq(patientsTable.id, id));
  res.sendStatus(204);
});

router.get("/patients/:id/medical-history", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const records = await db.select().from(medicalRecordsTable)
    .where(eq(medicalRecordsTable.patientId, id))
    .orderBy(medicalRecordsTable.visitDate);
  res.json(records);
});

router.post("/patients/:id/medical-history", requireAuth, requireRole("admin", "doctor"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { doctorId, diagnosis, symptoms, treatment, notes, visitDate } = req.body;

  if (!diagnosis || !visitDate) { res.status(400).json({ error: "diagnosis and visitDate required" }); return; }

  const [record] = await db.insert(medicalRecordsTable).values({
    patientId: id,
    doctorId: doctorId || null,
    diagnosis,
    symptoms: symptoms || null,
    treatment: treatment || null,
    notes: notes || null,
    visitDate,
  }).returning();

  res.status(201).json(record);
});

export default router;
