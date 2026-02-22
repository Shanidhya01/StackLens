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
    uiPatterns: UIPatterns;
    runtimeAnalysis?: {
      executedJavaScript: boolean;
      hydrationPatterns: string[];
      domMutationCount: number;
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
      lighthouse?: {
        performance: number;
        seo: number;
        accessibility: number;
        bestPractices: number;
      };
    };
  };
  usage?: {
    tier: "free" | "premium";
    limit: number;
    used: number;
    remaining: number;
  } | null;
}