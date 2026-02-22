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

router.get("/usage", async (req, res) => {
  const { userId, tier } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const normalizedTier = tier === "premium" ? "premium" : "free";
  const limit = normalizedTier === "premium" ? 200 : 10;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const used = await Scan.countDocuments({
    userId: String(userId),
    scannedAt: { $gte: startOfDay }
  });

  return res.json({
    tier: normalizedTier,
    limit,
    used,
    remaining: Math.max(limit - used, 0)
  });
});

router.get("/:id", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const scan = await Scan.findOne({ _id: req.params.id, userId: String(userId) });
  res.json(scan);
});

export default router;