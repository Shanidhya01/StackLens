import axios from "axios";
import { Scan } from "../models/scan.model";   

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const getServiceUrl = (...envKeys: string[]) => {
  for (const key of envKeys) {
    const value = process.env[key];
    if (value && value.trim()) {
      return stripTrailingSlash(value.trim());
    }
  }
  return "";
};

const isHtmlPayload = (value: string) => /<\s*!doctype html|<html[\s>]/i.test(value);

const normalizeTargetUrl = (input: string) => {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
};

const toClientErrorMessage = (statusCode: number, value: unknown, serviceName?: string) => {
  const text =
    typeof value === "string"
      ? value
      : (value as any)?.message || (value as any)?.error || "Unknown upstream error";

  if (typeof text === "string" && isHtmlPayload(text)) {
    if (statusCode === 502 || statusCode === 503 || statusCode === 504) {
      return `${serviceName || "Upstream service"} is unavailable right now (${statusCode}).`;
    }
    return `${serviceName || "Upstream service"} returned an invalid HTML error response.`;
  }

  return typeof text === "string" ? text.slice(0, 300) : "Unknown upstream error";
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientFailure = (error: any) => {
  const status = error?.response?.status;
  const code = error?.code;

  if (status === 502 || status === 503 || status === 504) {
    return true;
  }

  return code === "ECONNABORTED" || code === "ETIMEDOUT" || code === "ECONNRESET";
};

const callService = async (
  serviceName: string,
  baseUrl: string,
  path: string,
  payload: unknown,
  timeoutMs = 60000,
) => {
  const maxAttempts = 3;
  const retryDelays = [1200, 2500];
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await axios.post(`${baseUrl}${path}`, payload, { timeout: timeoutMs });
    } catch (error: any) {
      lastError = error;
      const shouldRetry = attempt < maxAttempts && isTransientFailure(error);
      if (shouldRetry) {
        await sleep(retryDelays[attempt - 1] || 2500);
        continue;
      }
      break;
    }
  }

  const statusCode = lastError?.response?.status || 500;
  const downstreamDetails = lastError?.response?.data || lastError?.message;
  const normalizedDetails = toClientErrorMessage(statusCode, downstreamDetails, serviceName);
  const wrappedError: any = new Error(normalizedDetails);
  wrappedError.statusCode = statusCode;
  throw wrappedError;
};

export const analyzeHandler = async (req: any, res: any) => {
  const { url, userId } = req.body;
  const normalizedUrl = normalizeTargetUrl(url || "");
  const crawlerUrl = getServiceUrl("CRAWLER_URL", "CRAWLER_SERVICE_URL");
  const detectionUrl = getServiceUrl("DETECTION_URL", "DETECTION_SERVICE_URL");
  const performanceUrl = getServiceUrl("PERFORMANCE_URL", "PERFORMANCE_SERVICE_URL");
  const reportUrl = getServiceUrl("REPORT_URL", "REPORT_SERVICE_URL");

  if (!crawlerUrl || !detectionUrl || !performanceUrl || !reportUrl) {
    return res.status(500).json({
      error: "Analysis failed",
      details: "Gateway service URLs are not configured correctly.",
    });
  }

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (!normalizedUrl) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    // Step 1: Crawl
    const crawlResponse = await callService("Crawler service", crawlerUrl, "/crawl", {
      url: normalizedUrl,
    });

    // Step 2: Detection
    const detectResponse = await callService(
      "Detection service",
      detectionUrl,
      "/detect",
      crawlResponse.data,
    );

    // Step 3: Performance
    const performanceResponse = await callService(
      "Performance service",
      performanceUrl,
      "/analyze-performance",
      crawlResponse.data,
    );

    // Step 4: Report
    const reportResponse = await callService(
      "Report service",
      reportUrl,
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

    try {
      await Scan.create({
        url: normalizedUrl,
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
    const statusCode = error?.statusCode || 500;
    const normalizedDetails = error?.message || "Analysis failed due to an upstream service error.";

    return res.status(statusCode).json({
      error: "Analysis failed",
      details: normalizedDetails,
    });
  }
};