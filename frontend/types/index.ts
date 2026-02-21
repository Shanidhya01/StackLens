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
}

export interface ScanResult {
  report: Report;
  raw: {
    uiPatterns: UIPatterns;
  };
}