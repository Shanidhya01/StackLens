import { Request, Response } from "express";
import {
  CrawlInput,
  DetectionResponse
} from "../types/detection.types";

import { detectFramework } from "../engine/framework.detector";
import { detectHosting } from "../engine/infra.detector";
import { detectRendering } from "../engine/rendering.detector";
import { calculateConfidence } from "../engine/scoring.engine";

export const detectHandler = (
  req: Request<{}, {}, CrawlInput>,
  res: Response<DetectionResponse>
) => {
  const { headers, scripts } = req.body;

  const frameworkResult = detectFramework(scripts);
  const hostingResult = detectHosting(headers);
  const rendering = detectRendering(scripts);

  const confidence = calculateConfidence(
    frameworkResult.score,
    hostingResult.score
  );

  return res.json({
    framework: frameworkResult.name,
    hosting: hostingResult.name,
    rendering,
    confidence
  });
};