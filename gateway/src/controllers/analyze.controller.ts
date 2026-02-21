import axios from "axios";
import { Scan } from "../models/scan.model";   // 🔥 ADD THIS

export const analyzeHandler = async (req: any, res: any) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
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
      report: reportResponse.data,
    });

    return res.json({
      report: reportResponse.data,
      raw: {
        detection: detectResponse.data,
        performance: performanceResponse.data,
        uiPatterns: crawlResponse.data.uiPatterns,
      },
    });

  } catch (error: any) {
    return res.status(500).json({
      error: "Analysis failed",
      details: error.message,
    });
  }
};