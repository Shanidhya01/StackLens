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

  const { detection, performance, uiPatterns } = req.body;

  const summary = generateSummary(
    detection.framework,
    detection.hosting,
    detection.rendering,
    uiPatterns
  );

  const architectureGrade = calculateArchitectureGrade(
    detection.confidence
  );

  const lighthousePerf = performance.lighthouse?.performance ?? 0;
  const performanceGrade =
    lighthousePerf >= 90 || performance.performanceScore > 85
      ? "High Performance"
      : lighthousePerf >= 70 || performance.performanceScore > 65
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
    overallScore,
    metrics: {
      performance: performance.lighthouse?.performance ?? performance.performanceScore,
      seo: performance.lighthouse?.seo ?? 0,
      accessibility: performance.lighthouse?.accessibility ?? 0,
      bestPractices: performance.lighthouse?.bestPractices ?? 0,
      renderTimingMs: {
        domContentLoaded: performance.renderTimingMs?.domContentLoaded ?? 0,
        load: performance.renderTimingMs?.load ?? 0,
        firstContentfulPaint: performance.renderTimingMs?.firstContentfulPaint ?? 0,
      },
    },
    stackInsights: {
      frameworkCandidates: detection.frameworkCandidates ?? [],
      hostingCandidates: detection.hostingCandidates ?? [],
      detectedTechnologies: detection.detectedTechnologies ?? [],
    }
  });
};