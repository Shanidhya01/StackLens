import { Request, Response } from "express";
import {
  CrawlInput,
  DetectionResponse
} from "../types/detection.types";

import { extractSignals } from "../engine/signalExtractor";
import { detectFromSignals } from "../engine/detector";

export const detectHandler = (
  req: Request<{}, {}, CrawlInput>,
  res: Response<DetectionResponse>
) => {
  const { headers, scripts, meta, links, runtimeAnalysis } = req.body;

  // Step 1: Extract signals
  const signals = extractSignals(headers, scripts, meta, links, runtimeAnalysis);

  // Step 2: Detect from signals
  const result = detectFromSignals(signals);

  return res.json({
    framework: result.framework,
    hosting: result.hosting,
    rendering: result.rendering,
    confidence: result.confidence,
    frameworkCandidates: result.frameworkCandidates,
    hostingCandidates: result.hostingCandidates,
    detectedTechnologies: result.detectedTechnologies,
  });
};