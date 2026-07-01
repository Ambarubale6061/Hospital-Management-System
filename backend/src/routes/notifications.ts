import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getCollection } from "../lib/mongodb.js";
import { emitEvent } from "../lib/socket.js";

const router = Router();

router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  try {
    const col = await getCollection("notifications");
    if (!col) { res.json([]); return; }
    const userId = req.user!.userId;
    const notifications = await col.find({ userId }).sort({ createdAt: -1 }).limit(50).toArray();
    res.json(notifications);
  } catch {
    res.json([]);
  }
});

router.get("/notifications/unread-count", requireAuth, async (req, res): Promise<void> => {
  try {
    const col = await getCollection("notifications");
    if (!col) { res.json({ count: 0 }); return; }
    const count = await col.countDocuments({ userId: req.user!.userId, read: false });
    res.json({ count });
  } catch {
    res.json({ count: 0 });
  }
});

router.patch("/notifications/:id/read", requireAuth, async (req, res): Promise<void> => {
  try {
    const { ObjectId } = await import("mongodb");
    const col = await getCollection("notifications");
    if (!col) { res.json({ ok: true }); return; }
    await col.updateOne(
      { _id: new ObjectId(req.params.id as string), userId: req.user!.userId },
      { $set: { read: true } }
    );
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "Failed to mark as read" });
  }
});

router.patch("/notifications/read-all", requireAuth, async (req, res): Promise<void> => {
  try {
    const col = await getCollection("notifications");
    if (!col) { res.json({ ok: true }); return; }
    await col.updateMany({ userId: req.user!.userId, read: false }, { $set: { read: true } });
    emitEvent("notifications:read-all", { userId: req.user!.userId });
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "Failed to mark all as read" });
  }
});

router.delete("/notifications/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const { ObjectId } = await import("mongodb");
    const col = await getCollection("notifications");
    if (!col) { res.json({ ok: true }); return; }
    await col.deleteOne({ _id: new ObjectId(req.params.id as string), userId: req.user!.userId });
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "Failed to delete notification" });
  }
});

export default router;

export async function createNotification(opts: {
  userId: number;
  title: string;
  message: string;
  type: "appointment" | "prescription" | "bill" | "patient" | "doctor" | "system";
  link?: string;
}) {
  try {
    const col = await getCollection("notifications");
    if (!col) return null;
    const notification = { ...opts, read: false, createdAt: new Date() };
    const result = await col.insertOne(notification);
    const notifWithId = { ...notification, _id: result.insertedId };
    emitEvent(`notification:${opts.userId}`, notifWithId);
    return notifWithId;
  } catch {
    return null;
  }
}
