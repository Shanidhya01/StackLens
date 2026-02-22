import axios from "axios";
import { Scan } from "../models/scan.model";   // 🔥 ADD THIS

export const analyzeHandler = async (req: any, res: any) => {
  const { url, userId, tier } = req.body;
  const normalizedTier = tier === "premium" ? "premium" : "free";
  const dailyLimit = normalizedTier === "premium" ? 200 : 10;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    if (userId) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const scansToday = await Scan.countDocuments({
        userId,
        scannedAt: { $gte: startOfDay }
      });

      if (scansToday >= dailyLimit) {
        return res.status(429).json({
          error: "Daily scan limit reached",
          usage: {
            tier: normalizedTier,
            limit: dailyLimit,
            used: scansToday,
            remaining: 0
          }
        });
      }
    }

    // Step 1: Crawl
    const crawlResponse = await axios.post("http://crawler:5001/crawl", {
      url,
    });

    // Step 2: Detection
    const detectResponse = await axios.post(
      "http://detection:5002/detect",
      crawlResponse.data,
    );

    // Step 3: Performance
    const performanceResponse = await axios.post(
      "http://performance:5003/analyze-performance",
      crawlResponse.data,
    );

    // Step 4: Report
    const reportResponse = await axios.post(
      "http://report:5004/generate-report",
      {
        detection: detectResponse.data,
        performance: performanceResponse.data,
        uiPatterns: crawlResponse.data.uiPatterns,
      },
    );

    // 🔥 SAVE TO MONGODB BEFORE RETURNING
    await Scan.create({
      url,
      userId,
      tier: normalizedTier,
      report: reportResponse.data,
    });

    let usage = null;
    if (userId) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const used = await Scan.countDocuments({
        userId,
        scannedAt: { $gte: startOfDay }
      });

      usage = {
        tier: normalizedTier,
        limit: dailyLimit,
        used,
        remaining: Math.max(dailyLimit - used, 0)
      };
    }

    return res.json({
      report: reportResponse.data,
      raw: {
        detection: detectResponse.data,
        performance: performanceResponse.data,
        uiPatterns: crawlResponse.data.uiPatterns,
        runtimeAnalysis: crawlResponse.data.runtimeAnalysis,
        lighthouse: crawlResponse.data.lighthouse,
      },
      usage,
    });

  } catch (error: any) {
    return res.status(500).json({
      error: "Analysis failed",
      details: error.message,
    });
  }
};