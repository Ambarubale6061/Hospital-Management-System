import { Router } from "express";
import { db, departmentsTable } from "../db.js";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

router.get("/departments", requireAuth, async (_req, res): Promise<void> => {
  const departments = await db.select().from(departmentsTable).orderBy(departmentsTable.name);
  res.json(departments);
});

router.post("/departments", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const { name, description, headDoctorId } = req.body;
  if (!name) { res.status(400).json({ error: "Name required" }); return; }

  const [dept] = await db.insert(departmentsTable).values({
    name,
    description: description || null,
    headDoctorId: headDoctorId || null,
  }).returning();

  res.status(201).json(dept);
});

router.get("/departments/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, id));
  if (!dept) { res.status(404).json({ error: "Department not found" }); return; }
  res.json(dept);
});

router.patch("/departments/:id", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { name, description, headDoctorId } = req.body;

  const [dept] = await db.update(departmentsTable).set({
    ...(name !== undefined && { name }),
    ...(description !== undefined && { description }),
    ...(headDoctorId !== undefined && { headDoctorId }),
  }).where(eq(departmentsTable.id, id)).returning();

  if (!dept) { res.status(404).json({ error: "Department not found" }); return; }
  res.json(dept);
});

router.delete("/departments/:id", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(departmentsTable).where(eq(departmentsTable.id, id));
  res.sendStatus(204);
});

export default router;
