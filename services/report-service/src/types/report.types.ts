export interface ReportInput {
  detection: {
    framework: string;
    hosting: string;
    rendering: string;
    confidence: number;
  };
  performance: {
    payloadCategory: string;
    compressionEnabled: boolean;
    thirdPartyRisk: string;
    performanceScore: number;
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