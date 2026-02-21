import { Request, Response } from "express";
import {
  ReportInput,
  ReportResponse
} from "../types/report.types";

import { generateSummary } from "../formatter/summary.generator";
import { calculateArchitectureGrade } from "../formatter/architecture.mapper";
import { calculateOverallScore } from "../formatter/confidence.calculator";

export const reportHandler = (
  req: Request<{}, {}, ReportInput>,
  res: Response<ReportResponse>
) => {

  const { detection, performance } = req.body;

  const summary = generateSummary(
    detection.framework,
    detection.hosting,
    detection.rendering
  );

  const architectureGrade = calculateArchitectureGrade(
    detection.confidence
  );

  const performanceGrade =
    performance.performanceScore > 80
      ? "High Performance"
      : performance.performanceScore > 60
      ? "Moderate Performance"
      : "Performance Needs Optimization";

  const overallScore = calculateOverallScore(
    detection.confidence,
    performance.performanceScore
  );

  return res.json({
    summary,
    architectureGrade,
    performanceGrade,
    overallScore
  });
};