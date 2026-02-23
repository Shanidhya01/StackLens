import axios from "axios";
import { Scan } from "../models/scan.model";   // 🔥 ADD THIS

const cleanBaseUrl = (value: string) => value.replace(/\/+$/, "");

const getServiceBaseUrls = (envKey: string, dockerUrl: string, localUrl: string) => {
  const fromEnv = process.env[envKey];
  const candidates = [fromEnv, dockerUrl, localUrl]
    .filter(Boolean)
    .map((url) => cleanBaseUrl(url as string));

  return Array.from(new Set(candidates));
};

const postWithFallback = async (baseUrls: string[], path: string, payload: unknown) => {
  let lastError: any;

  for (const baseUrl of baseUrls) {
    try {
      return await axios.post(`${baseUrl}${path}`, payload);
    } catch (error) {
      const err = error as any;
      if (err?.response) {
        throw err;
      }
      lastError = error;
    }
  }

  throw lastError;
};

export const analyzeHandler = async (req: any, res: any) => {
  const { url, userId } = req.body;
  const crawlerUrls = getServiceBaseUrls("CRAWLER_SERVICE_URL", "http://crawler:5001", "http://localhost:5001");
  const detectionUrls = getServiceBaseUrls("DETECTION_SERVICE_URL", "http://detection:5002", "http://localhost:5002");
  const performanceUrls = getServiceBaseUrls("PERFORMANCE_SERVICE_URL", "http://performance:5003", "http://localhost:5003");
  const reportUrls = getServiceBaseUrls("REPORT_SERVICE_URL", "http://report:5004", "http://localhost:5004");

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Step 1: Crawl
    const crawlResponse = await postWithFallback(crawlerUrls, "/crawl", {
      url,
    });

    // Step 2: Detection
    const detectResponse = await postWithFallback(
      detectionUrls,
      "/detect",
      crawlResponse.data,
    );

    // Step 3: Performance
    const performanceResponse = await postWithFallback(
      performanceUrls,
      "/analyze-performance",
      crawlResponse.data,
    );

    // Step 4: Report
    const reportResponse = await postWithFallback(
      reportUrls,
      "/generate-report",
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

    // 🔥 SAVE TO MONGODB BEFORE RETURNING
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