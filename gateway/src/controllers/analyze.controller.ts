import axios from "axios";
import { Scan } from "../models/scan.model";   

export const analyzeHandler = async (req: any, res: any) => {
  const { url, userId } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Step 1: Crawl
    const crawlResponse = await axios.post(`${process.env.CRAWLER_URL}/crawl`, {
      url,
    });

    // Step 2: Detection
    const detectResponse = await axios.post(
      `${process.env.DETECTION_URL}/detect`,
      crawlResponse.data,
    );

    // Step 3: Performance
    const performanceResponse = await axios.post(
      `${process.env.PERFORMANCE_URL}/analyze-performance`,
      crawlResponse.data,
    );

    // Step 4: Report
    const reportResponse = await axios.post(
      `${process.env.REPORT_URL}/generate-report`,
      {
        detection: detectResponse.data,
        performance: performanceResponse.data,
        uiPatterns: crawlResponse.data.uiPatterns,
      },
    );

    const rawPayload = {
      detection: detectResponse.data,
      performance: performanceResponse.data,
      uiPatterns: crawlResponse.data.uiPatterns,
      runtimeAnalysis: crawlResponse.data.runtimeAnalysis,
      lighthouse: crawlResponse.data.lighthouse,
    };

    try {
      await Scan.create({
        url,
        userId,
        report: reportResponse.data,
        raw: rawPayload,
      });
    } catch (saveError) {
      console.warn("Scan persistence failed:", (saveError as Error).message);
    }

    return res.json({
      report: reportResponse.data,
      raw: rawPayload,
    });

  } catch (error: any) {
    const downstreamDetails = error?.response?.data;
    const normalizedDetails =
      typeof downstreamDetails === "string"
        ? downstreamDetails
        : downstreamDetails?.message || downstreamDetails?.error || error.message;
    const statusCode = error?.response?.status || 500;

    return res.status(statusCode).json({
      error: "Analysis failed",
      details: normalizedDetails,
    });
  }
};