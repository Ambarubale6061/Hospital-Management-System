import { Router } from "express";
import { db, billsTable, patientsTable, usersTable, activityLogTable } from "../db.js";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { emitEvent } from "../lib/socket.js";

const router = Router();

async function enrichBill(bill: typeof billsTable.$inferSelect) {
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, bill.patientId));
  let patientUser = null;
  if (patient) {
    const [u] = await db.select().from(usersTable).where(eq(usersTable.id, patient.userId));
    if (u) { const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...s } = u; patientUser = s; }
  }
  return { ...bill, patient: patient ? { ...patient, user: patientUser } : null };
}

function generateInvoiceNumber(): string {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
}

router.get("/bills", requireAuth, async (req, res): Promise<void> => {
  const patientId = req.query.patientId ? parseInt(String(req.query.patientId), 10) : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const page = parseInt(String(req.query.page || "1"));
  const limit = parseInt(String(req.query.limit || "20"));
  const offset = (page - 1) * limit;

  let bills = await db.select().from(billsTable).orderBy(billsTable.createdAt);

  if (patientId) bills = bills.filter(b => b.patientId === patientId);
  if (status) bills = bills.filter(b => b.status === status);

  const total = bills.length;
  const paged = bills.slice(offset, offset + limit);
  const enriched = await Promise.all(paged.map(enrichBill));
  res.json({ data: enriched, total, page, limit });
});

router.post("/bills", requireAuth, requireRole("admin", "receptionist"), async (req, res): Promise<void> => {
  const { patientId, appointmentId, amount, taxAmount = 0, discountAmount = 0, description } = req.body;

  if (!patientId || amount == null) { res.status(400).json({ error: "patientId and amount required" }); return; }

  const total = parseFloat(amount) + parseFloat(taxAmount) - parseFloat(discountAmount);

  const [bill] = await db.insert(billsTable).values({
    patientId,
    appointmentId: appointmentId || null,
    amount: String(amount),
    taxAmount: String(taxAmount),
    discountAmount: String(discountAmount),
    totalAmount: String(total),
    invoiceNumber: generateInvoiceNumber(),
    description: description || null,
  }).returning();

  await db.insert(activityLogTable).values({
    type: "bill_created",
    description: `Invoice ${bill.invoiceNumber} created for $${total.toFixed(2)}`,
    actorName: req.user?.email || "System",
  });

  const enriched = await enrichBill(bill);
  emitEvent("bill:created", enriched);
  res.status(201).json(enriched);
});

router.get("/bills/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [bill] = await db.select().from(billsTable).where(eq(billsTable.id, id));
  if (!bill) { res.status(404).json({ error: "Bill not found" }); return; }
  const enriched = await enrichBill(bill);
  res.json(enriched);
});

router.patch("/bills/:id", requireAuth, requireRole("admin", "receptionist"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { status, paymentMethod, paidAt } = req.body;

  const [bill] = await db.update(billsTable).set({
    ...(status !== undefined && { status }),
    ...(paymentMethod !== undefined && { paymentMethod }),
    ...(paidAt !== undefined && { paidAt: paidAt ? new Date(paidAt) : null }),
    ...(status === "paid" && !paidAt && { paidAt: new Date() }),
  }).where(eq(billsTable.id, id)).returning();

  if (!bill) { res.status(404).json({ error: "Bill not found" }); return; }
  const enriched = await enrichBill(bill);
  emitEvent("bill:updated", enriched);
  res.json(enriched);
});

export default router;
