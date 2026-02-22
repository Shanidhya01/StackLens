export interface PerformanceInput {
  headers: Record<string, string>;
  scripts: string[];
  htmlSize: number;
  lighthouse?: {
    performance: number;
    seo: number;
    accessibility: number;
    bestPractices: number;
  };
  runtimeAnalysis?: {
    renderTimingMs?: {
      domContentLoaded: number;
      load: number;
      firstContentfulPaint: number;
    };
  };
}

export interface PerformanceResponse {
  payloadCategory: string;
  compressionEnabled: boolean;
  thirdPartyRisk: string;
  performanceScore: number;
  lighthouse: {
    performance: number;
    seo: number;
    accessibility: number;
    bestPractices: number;
  };
  renderTimingMs: {
    domContentLoaded: number;
    load: number;
    firstContentfulPaint: number;
  };
}