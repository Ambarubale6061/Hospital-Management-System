import { Router } from "express";
import { db, hospitalSettingsTable } from "../db.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

router.get("/hospital-settings", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db.select().from(hospitalSettingsTable).limit(1);
  if (rows.length === 0) {
    res.json({
      hospitalName: "MediCore Hospital",
      address: null, city: null, state: null, zipCode: null, country: null,
      phone: null, email: null, website: null, logoUrl: null,
      workingHoursStart: "08:00", workingHoursEnd: "18:00",
      emergencyPhone: null, taxRate: "0", currency: "USD",
    });
    return;
  }
  res.json(rows[0]);
});

router.patch("/hospital-settings", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const fields = req.body;
  const rows = await db.select().from(hospitalSettingsTable).limit(1);

  if (rows.length === 0) {
    const [created] = await db.insert(hospitalSettingsTable).values(fields).returning();
    res.json(created);
  } else {
    const [updated] = await db.update(hospitalSettingsTable).set(fields).returning();
    res.json(updated);
  }
});

export default router;
