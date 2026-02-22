import mongoose from "mongoose";

const scanSchema = new mongoose.Schema({
  url: { type: String, required: true },
  userId: { type: String },
  tier: { type: String, enum: ["free", "premium"], default: "free" },
  scannedAt: { type: Date, default: Date.now },
  report: { type: Object, required: true }
});

export const Scan = mongoose.model("Scan", scanSchema);