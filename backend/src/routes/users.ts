import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "../db.js";
import { eq, ilike, or, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

const safeUser = (user: typeof usersTable.$inferSelect) => {
  const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...safe } = user;
  return safe;
};

router.get("/users", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const role = typeof req.query.role === "string" ? req.query.role : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const page = parseInt(String(req.query.page || "1"));
  const limit = parseInt(String(req.query.limit || "20"));
  const offset = (page - 1) * limit;

  let conditions: any[] = [];
  if (role) conditions.push(eq(usersTable.role, role as any));
  if (search) {
    conditions.push(or(
      ilike(usersTable.firstName, `%${search}%`),
      ilike(usersTable.lastName, `%${search}%`),
      ilike(usersTable.email, `%${search}%`),
    ));
  }

  const query = conditions.length > 0
    ? db.select().from(usersTable).where(conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`)
    : db.select().from(usersTable);

  const users = await query.limit(limit).offset(offset);
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);

  res.json({ data: users.map(safeUser), total: count, page, limit });
});

router.post("/users", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const { email, password, firstName, lastName, role, phone } = req.body;
  if (!email || !password || !firstName || !lastName || !role) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    email: email.toLowerCase(), passwordHash, firstName, lastName, role, phone: phone || null
  }).returning();

  res.status(201).json(safeUser(user));
});

router.get("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(safeUser(user));
});

router.patch("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { firstName, lastName, phone, avatarUrl, isActive } = req.body;

  const [user] = await db.update(usersTable).set({
    ...(firstName !== undefined && { firstName }),
    ...(lastName !== undefined && { lastName }),
    ...(phone !== undefined && { phone }),
    ...(avatarUrl !== undefined && { avatarUrl }),
    ...(isActive !== undefined && { isActive }),
  }).where(eq(usersTable.id, id)).returning();

  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(safeUser(user));
});

router.delete("/users/:id", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.sendStatus(204);
});

export default router;
