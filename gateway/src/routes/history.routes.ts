import { Router } from "express";
import { Scan } from "../models/scan.model";

const router = Router();

router.get("/", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.json([]);
  }

  const filter = { userId: String(userId) };
  const scans = await Scan.find(filter).sort({ scannedAt: -1 });
  res.json(scans);
});

router.get("/:id", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const scan = await Scan.findOne({ _id: req.params.id, userId: String(userId) });
  if (!scan) {
    return res.status(404).json({ error: "Scan not found" });
  }

  res.json(scan);
});

export default router;