import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "../db.js";
import { eq } from "drizzle-orm";
import { requireAuth, signToken } from "../middlewares/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (!user || !user.isActive) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role, email: user.email });
  const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...safeUser } = user;

  res.json({ token, user: safeUser });
});

router.post("/auth/register", async (req, res): Promise<void> => {
  const { email, password, firstName, lastName, role, phone } = req.body;
  if (!email || !password || !firstName || !lastName || !role) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const existingUsers = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existingUsers.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    email: email.toLowerCase(),
    passwordHash,
    firstName,
    lastName,
    role,
    phone: phone || null,
  }).returning();

  const token = signToken({ userId: user.id, role: user.role, email: user.email });
  const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...safeUser } = user;

  res.status(201).json({ token, user: safeUser });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...safeUser } = user;
  res.json(safeUser);
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ message: "Logged out" });
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email required" });
    return;
  }

  const [user] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (!user) {
    res.json({ message: "If that email exists, a reset link has been sent" });
    return;
  }

  const resetToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

  await db.update(usersTable).set({ resetToken, resetTokenExpiry }).where(eq(usersTable.id, user.id));

  logger.info({ resetToken }, "Password reset token generated (would be emailed in production)");
  res.json({ message: "If that email exists, a reset link has been sent", resetToken });
});

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const { token, password } = req.body;
  if (!token || !password) {
    res.status(400).json({ error: "Token and password required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.resetToken, token));
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    res.status(400).json({ error: "Invalid or expired reset token" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.update(usersTable).set({ passwordHash, resetToken: null, resetTokenExpiry: null }).where(eq(usersTable.id, user.id));

  res.json({ message: "Password reset successfully" });
});

export default router;
