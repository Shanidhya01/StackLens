import { Request, Response } from "express";
import {
  PerformanceInput,
  PerformanceResponse
} from "../types/performance.types";

import { analyzePayload } from "../engine/payload.analyzer";
import { detectCompression } from "../engine/compression.checker";
import { detectThirdPartyRisk } from "../engine/thirdparty.detector";
import { calculatePerformanceScore } from "../engine/risk.scorer";

export const performanceHandler = (
  req: Request<{}, {}, PerformanceInput>,
  res: Response<PerformanceResponse>
) => {

  const { headers, scripts, htmlSize, lighthouse, runtimeAnalysis } = req.body;

  const payload = analyzePayload(htmlSize, scripts);
  const compression = detectCompression(headers);
  const thirdParty = detectThirdPartyRisk(scripts);

  const heuristicPerformanceScore = calculatePerformanceScore(
    payload.score,
    thirdParty.score,
    compression.score
  );

  const lighthouseScore = lighthouse?.performance ?? 0;
  const performanceScore =
    lighthouseScore > 0
      ? Math.round((heuristicPerformanceScore * 0.45) + (lighthouseScore * 0.55))
      : heuristicPerformanceScore;

  return res.json({
    payloadCategory: payload.category,
    compressionEnabled: compression.enabled,
    thirdPartyRisk: thirdParty.level,
    performanceScore,
    lighthouse: {
      performance: lighthouse?.performance ?? 0,
      seo: lighthouse?.seo ?? 0,
      accessibility: lighthouse?.accessibility ?? 0,
      bestPractices: lighthouse?.bestPractices ?? 0,
    },
    renderTimingMs: {
      domContentLoaded: runtimeAnalysis?.renderTimingMs?.domContentLoaded ?? 0,
      load: runtimeAnalysis?.renderTimingMs?.load ?? 0,
      firstContentfulPaint: runtimeAnalysis?.renderTimingMs?.firstContentfulPaint ?? 0,
    }
  });
};