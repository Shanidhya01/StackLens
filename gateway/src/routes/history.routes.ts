import { Router } from "express";
import { Scan } from "../models/scan.model";

const router = Router();

router.get("/", async (_, res) => {
  const scans = await Scan.find().sort({ scannedAt: -1 });
  res.json(scans);
});

router.get("/:id", async (req, res) => {
  const scan = await Scan.findById(req.params.id);
  res.json(scan);
});

export default router;