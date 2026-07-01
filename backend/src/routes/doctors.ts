import { Router } from "express";
import { db, doctorsTable, usersTable, departmentsTable, availabilitySlotsTable, appointmentsTable, billsTable, patientsTable, activityLogTable } from "../db.js";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { emitEvent } from "../lib/socket.js";
import { createNotification } from "./notifications.js";
import bcrypt from "bcryptjs";

const router = Router();

async function getDoctorWithUser(id: number) {
  const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, id));
  if (!doctor) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, doctor.userId));
  const department = doctor.departmentId
    ? (await db.select().from(departmentsTable).where(eq(departmentsTable.id, doctor.departmentId)))[0]
    : null;
  const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...safeUser } = user;
  return { ...doctor, user: safeUser, department: department || null };
}

router.get("/doctors", requireAuth, async (req, res): Promise<void> => {
  const departmentId = req.query.departmentId ? parseInt(String(req.query.departmentId), 10) : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const available = req.query.available === "true" ? true : req.query.available === "false" ? false : undefined;
  const gender = typeof req.query.gender === "string" ? req.query.gender : undefined;

  const doctors = await db.select().from(doctorsTable);

  const enriched = await Promise.all(doctors.map(async (d) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, d.userId));
    const department = d.departmentId
      ? (await db.select().from(departmentsTable).where(eq(departmentsTable.id, d.departmentId)))[0]
      : null;
    if (!user) return null;
    const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...safeUser } = user;
    return { ...d, user: safeUser, department: department || null };
  }));

  let result = enriched.filter(Boolean) as any[];

  if (departmentId !== undefined) result = result.filter(d => d.departmentId === departmentId);
  if (available !== undefined) result = result.filter(d => d.isAvailable === available);
  if (gender) result = result.filter(d => d.gender?.toLowerCase() === gender.toLowerCase());
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(d =>
      d.user.firstName.toLowerCase().includes(s) ||
      d.user.lastName.toLowerCase().includes(s) ||
      d.specialization.toLowerCase().includes(s) ||
      (d.subSpecialization || "").toLowerCase().includes(s) ||
      (d.qualifications || "").toLowerCase().includes(s)
    );
  }

  res.json(result);
});

router.post("/doctors/register", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const {
    firstName, lastName, email, password, phone, departmentId,
    specialization, subSpecialization, qualifications, licenseNumber,
    consultationFee, videoConsultationFee, emergencyConsultationFee, followUpFee,
    yearsOfExperience, bio, services, address, city, state, pincode, gender, languages
  } = req.body;

  if (!firstName || !lastName || !email || !specialization) {
    res.status(400).json({ error: "firstName, lastName, email, and specialization are required" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existing.length > 0) {
    res.status(409).json({ error: "A user with this email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password || "password123", 10);

  const [user] = await db.insert(usersTable).values({
    email: email.toLowerCase(),
    passwordHash,
    firstName,
    lastName,
    role: "doctor",
    phone: phone || null,
    isActive: true,
  }).returning();

  const [doctor] = await db.insert(doctorsTable).values({
    userId: user.id,
    departmentId: departmentId ? parseInt(departmentId) : null,
    specialization,
    subSpecialization: subSpecialization || null,
    qualifications: qualifications || null,
    licenseNumber: licenseNumber || null,
    consultationFee: consultationFee ? String(consultationFee) : "100",
    videoConsultationFee: videoConsultationFee ? String(videoConsultationFee) : null,
    emergencyConsultationFee: emergencyConsultationFee ? String(emergencyConsultationFee) : null,
    followUpFee: followUpFee ? String(followUpFee) : null,
    yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
    bio: bio || null,
    services: services || null,
    address: address || null,
    city: city || null,
    state: state || null,
    pincode: pincode || null,
    gender: gender || null,
    languages: languages || null,
    isAvailable: true,
  }).returning();

  await db.insert(activityLogTable).values({
    type: "doctor_added",
    description: `New doctor registered: Dr. ${firstName} ${lastName} (${specialization})`,
    actorName: req.user?.email || "Admin",
  });

  const enriched = await getDoctorWithUser(doctor.id);
  emitEvent("doctor:created", enriched);
  res.status(201).json(enriched);
});

router.post("/doctors", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const { userId, departmentId, specialization, qualifications, licenseNumber, consultationFee, yearsOfExperience, bio } = req.body;
  if (!userId || !specialization) {
    res.status(400).json({ error: "userId and specialization required" });
    return;
  }

  const [doctor] = await db.insert(doctorsTable).values({
    userId,
    departmentId: departmentId || null,
    specialization,
    qualifications: qualifications || null,
    licenseNumber: licenseNumber || null,
    consultationFee: consultationFee ? String(consultationFee) : "100",
    yearsOfExperience: yearsOfExperience || null,
    bio: bio || null,
  }).returning();

  const enriched = await getDoctorWithUser(doctor.id);
  emitEvent("doctor:created", enriched);
  res.status(201).json(enriched);
});

router.get("/doctors/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const doctor = await getDoctorWithUser(id);
  if (!doctor) { res.status(404).json({ error: "Doctor not found" }); return; }
  res.json(doctor);
});

router.patch("/doctors/:id", requireAuth, requireRole("admin", "doctor"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const {
    departmentId, specialization, subSpecialization, qualifications, licenseNumber,
    consultationFee, videoConsultationFee, emergencyConsultationFee, followUpFee,
    yearsOfExperience, bio, services, address, city, state, pincode, gender, languages,
    isAvailable, firstName, lastName, phone
  } = req.body;

  const existing = await getDoctorWithUser(id);
  if (!existing) { res.status(404).json({ error: "Doctor not found" }); return; }

  if (firstName !== undefined || lastName !== undefined || phone !== undefined) {
    await db.update(usersTable).set({
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone }),
    }).where(eq(usersTable.id, existing.userId));
  }

  const [doctor] = await db.update(doctorsTable).set({
    ...(departmentId !== undefined && { departmentId: departmentId === null ? null : parseInt(String(departmentId)) }),
    ...(specialization !== undefined && { specialization }),
    ...(subSpecialization !== undefined && { subSpecialization }),
    ...(qualifications !== undefined && { qualifications }),
    ...(licenseNumber !== undefined && { licenseNumber }),
    ...(consultationFee !== undefined && { consultationFee: String(consultationFee) }),
    ...(videoConsultationFee !== undefined && { videoConsultationFee: videoConsultationFee ? String(videoConsultationFee) : null }),
    ...(emergencyConsultationFee !== undefined && { emergencyConsultationFee: emergencyConsultationFee ? String(emergencyConsultationFee) : null }),
    ...(followUpFee !== undefined && { followUpFee: followUpFee ? String(followUpFee) : null }),
    ...(yearsOfExperience !== undefined && { yearsOfExperience: yearsOfExperience ? parseInt(String(yearsOfExperience)) : null }),
    ...(bio !== undefined && { bio }),
    ...(services !== undefined && { services }),
    ...(address !== undefined && { address }),
    ...(city !== undefined && { city }),
    ...(state !== undefined && { state }),
    ...(pincode !== undefined && { pincode }),
    ...(gender !== undefined && { gender }),
    ...(languages !== undefined && { languages }),
    ...(isAvailable !== undefined && { isAvailable }),
  }).where(eq(doctorsTable.id, id)).returning();

  if (!doctor) { res.status(404).json({ error: "Doctor not found" }); return; }

  const enriched = await getDoctorWithUser(doctor.id);

  await db.insert(activityLogTable).values({
    type: "doctor_updated",
    description: `Doctor profile updated: Dr. ${enriched?.user?.firstName} ${enriched?.user?.lastName}`,
    actorName: req.user?.email || "Admin",
  });

  emitEvent("doctor:updated", enriched);
  res.json(enriched);
});

router.delete("/doctors/:id", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const existing = await getDoctorWithUser(id);
  if (!existing) { res.status(404).json({ error: "Doctor not found" }); return; }

  await db.delete(availabilitySlotsTable).where(eq(availabilitySlotsTable.doctorId, id));
  await db.delete(doctorsTable).where(eq(doctorsTable.id, id));

  await db.insert(activityLogTable).values({
    type: "doctor_deleted",
    description: `Doctor removed: Dr. ${existing.user?.firstName} ${existing.user?.lastName}`,
    actorName: req.user?.email || "Admin",
  });

  emitEvent("doctor:deleted", { id });
  res.sendStatus(204);
});

router.get("/doctors/:id/availability", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const slots = await db.select().from(availabilitySlotsTable)
    .where(eq(availabilitySlotsTable.doctorId, id))
    .orderBy(availabilitySlotsTable.dayOfWeek);
  res.json(slots);
});

router.post("/doctors/:id/availability", requireAuth, requireRole("admin", "doctor"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { slots } = req.body;

  await db.delete(availabilitySlotsTable).where(eq(availabilitySlotsTable.doctorId, id));

  if (slots && slots.length > 0) {
    await db.insert(availabilitySlotsTable).values(slots.map((s: any) => ({
      doctorId: id,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
    })));
  }

  const updated = await db.select().from(availabilitySlotsTable).where(eq(availabilitySlotsTable.doctorId, id));
  emitEvent("doctor:availability_updated", { doctorId: id, slots: updated });
  res.json(updated);
});

router.get("/doctors/:id/patients", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);

  const appts = await db.select({ patientId: appointmentsTable.patientId })
    .from(appointmentsTable)
    .where(eq(appointmentsTable.doctorId, id));

  const patientIds = [...new Set(appts.map(a => a.patientId))];

  const patients = await Promise.all(patientIds.map(async (pid) => {
    const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, pid));
    if (!patient) return null;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, patient.userId));
    if (!user) return null;
    const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...safeUser } = user;
    return { ...patient, user: safeUser };
  }));

  res.json(patients.filter(Boolean));
});

router.get("/doctors/:id/stats", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);

  const appts = await db.select().from(appointmentsTable).where(eq(appointmentsTable.doctorId, id));
  const patientIds = new Set(appts.map(a => a.patientId));
  const completed = appts.filter(a => a.status === "completed").length;
  const cancelled = appts.filter(a => a.status === "cancelled").length;

  const bills = await db.select({ total: billsTable.totalAmount })
    .from(billsTable)
    .innerJoin(appointmentsTable, eq(billsTable.appointmentId, appointmentsTable.id))
    .where(and(eq(appointmentsTable.doctorId, id), eq(billsTable.status, "paid")));

  const totalRevenue = bills.reduce((sum, b) => sum + parseFloat(String(b.total || 0)), 0);

  res.json({
    totalPatients: patientIds.size,
    totalAppointments: appts.length,
    completedAppointments: completed,
    cancelledAppointments: cancelled,
    totalRevenue,
    rating: 4.8,
  });
});

export default router;
