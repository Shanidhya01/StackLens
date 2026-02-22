import { Router } from "express";
import { Scan } from "../models/scan.model";

const router = Router();

router.get("/", async (req, res) => {
  const { userId } = req.query;
  const filter = userId ? { userId: String(userId) } : {};
  const scans = await Scan.find(filter).sort({ scannedAt: -1 });
  res.json(scans);
});

router.get("/:id", async (req, res) => {
  const scan = await Scan.findById(req.params.id);
  res.json(scan);
});

export default router;