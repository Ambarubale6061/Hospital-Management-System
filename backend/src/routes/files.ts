import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getCollection } from "../lib/mongodb.js";

const router = Router();

router.get("/files", requireAuth, async (req, res): Promise<void> => {
  try {
    const col = await getCollection("files");
    if (!col) { res.json([]); return; }
    const patientId = req.query.patientId ? parseInt(String(req.query.patientId)) : undefined;
    const query = patientId ? { patientId } : {};
    const files = await col.find(query).sort({ uploadedAt: -1 }).limit(100).toArray();
    res.json(files);
  } catch {
    res.json([]);
  }
});

router.post("/files/upload-meta", requireAuth, async (req, res): Promise<void> => {
  try {
    const col = await getCollection("files");
    if (!col) { res.status(503).json({ error: "Document storage unavailable" }); return; }
    const { fileName, fileType, fileSize, patientId, category, description } = req.body;
    if (!fileName || !fileType || !patientId) {
      res.status(400).json({ error: "fileName, fileType, patientId required" });
      return;
    }
    const record = {
      fileName, fileType, fileSize, patientId,
      category: category || "general",
      description: description || null,
      uploadedBy: req.user!.userId,
      uploadedAt: new Date(),
      url: null,
    };
    const result = await col.insertOne(record);
    res.status(201).json({ ...record, _id: result.insertedId });
  } catch {
    res.status(500).json({ error: "Failed to store file metadata" });
  }
});

router.delete("/files/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const { ObjectId } = await import("mongodb");
    const col = await getCollection("files");
    if (!col) { res.json({ ok: true }); return; }
    await col.deleteOne({ _id: new ObjectId(req.params.id as string) });
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "Failed to delete file" });
  }
});

export default router;
