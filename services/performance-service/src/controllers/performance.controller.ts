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

  const { headers, scripts, htmlSize } = req.body;

  const payload = analyzePayload(htmlSize, scripts);
  const compression = detectCompression(headers);
  const thirdParty = detectThirdPartyRisk(scripts);

  const performanceScore = calculatePerformanceScore(
    payload.score,
    thirdParty.score,
    compression.score
  );

  return res.json({
    payloadCategory: payload.category,
    compressionEnabled: compression.enabled,
    thirdPartyRisk: thirdParty.level,
    performanceScore
  });
};