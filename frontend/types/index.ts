export interface UIPatterns {
  hasNavbar: boolean;
  hasFooter: boolean;
  hasHeroSection: boolean;
  formCount: number;
  buttonCount: number;
  isSPA: boolean;
}

export interface Report {
  summary: string;
  architectureGrade: string;
  performanceGrade: string;
  overallScore: number;
  metrics?: {
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
  stackInsights?: {
    frameworkCandidates: Array<{ name: string; score: number }>;
    hostingCandidates: Array<{ name: string; score: number }>;
    detectedTechnologies: string[];
  };
}

export interface ScanResult {
  report: Report;
  raw: {
    crawl?: {
      statusCode?: number;
      headers?: Record<string, string>;
      scripts?: string[];
      meta?: string[];
      links?: string[];
      htmlSize?: number;
      crawlDurationMs?: number;
    };
    uiPatterns: UIPatterns;
    runtimeAnalysis?: {
      executedJavaScript: boolean;
      dynamicFrameworkHints?: string[];
      hydrationPatterns: string[];
      domMutationCount: number;
      staticDomNodes?: number;
      runtimeDomNodes?: number;
      renderTimingMs: {
        domContentLoaded: number;
        load: number;
        firstContentfulPaint: number;
      };
    };
    lighthouse?: {
      performance: number;
      seo: number;
      accessibility: number;
      bestPractices: number;
    };
    detection?: {
      framework: string;
      hosting: string;
      rendering: string;
      confidence: number;
      frameworkCandidates?: Array<{ name: string; score: number }>;
      hostingCandidates?: Array<{ name: string; score: number }>;
      detectedTechnologies?: string[];
    };
    performance?: {
      performanceScore: number;
      payloadCategory?: string;
      compressionEnabled?: boolean;
      thirdPartyRisk?: string;
      lighthouse?: {
        performance: number;
        seo: number;
        accessibility: number;
        bestPractices: number;
      };
    };
  };
}