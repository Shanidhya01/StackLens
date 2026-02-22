export interface CrawlInput {
  headers: Record<string, string>;
  scripts: string[];
  meta?: string[];
  links?: string[];
  htmlSize?: number;
  runtimeAnalysis?: {
    executedJavaScript?: boolean;
    dynamicFrameworkHints?: string[];
    hydrationPatterns?: string[];
    domMutationCount?: number;
    staticDomNodes?: number;
    runtimeDomNodes?: number;
    renderTimingMs?: {
      domContentLoaded?: number;
      load?: number;
      firstContentfulPaint?: number;
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

export interface ScoredCandidate {
  name: string;
  score: number;
}

export interface DetectionResponse {
  framework: string;
  hosting: string;
  rendering: string;
  confidence: number;
  frameworkCandidates: ScoredCandidate[];
  hostingCandidates: ScoredCandidate[];
  detectedTechnologies: string[];
}