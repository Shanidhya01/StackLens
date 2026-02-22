export interface ReportInput {
  detection: {
    framework: string;
    hosting: string;
    rendering: string;
    confidence: number;
    frameworkCandidates?: Array<{ name: string; score: number }>;
    hostingCandidates?: Array<{ name: string; score: number }>;
    detectedTechnologies?: string[];
  };
  performance: {
    payloadCategory: string;
    compressionEnabled: boolean;
    thirdPartyRisk: string;
    performanceScore: number;
    lighthouse?: {
      performance: number;
      seo: number;
      accessibility: number;
      bestPractices: number;
    };
    renderTimingMs?: {
      domContentLoaded: number;
      load: number;
      firstContentfulPaint: number;
    };
  };
  uiPatterns?: {
    hasNavbar: boolean;
    hasFooter: boolean;
    hasHeroSection: boolean;
    formCount: number;
    buttonCount: number;
    isSPA: boolean;
  };
}

export interface ReportResponse {
  summary: string;
  architectureGrade: string;
  performanceGrade: string;
  overallScore: number;
  metrics: {
    performance: number;
    seo: number;
    accessibility: number;
    bestPractices: number;
    renderTimingMs: {
      domContentLoaded: number;
      load: number;
      firstContentfulPaint: number;
    };
  };
  stackInsights: {
    frameworkCandidates: Array<{ name: string; score: number }>;
    hostingCandidates: Array<{ name: string; score: number }>;
    detectedTechnologies: string[];
  };
}