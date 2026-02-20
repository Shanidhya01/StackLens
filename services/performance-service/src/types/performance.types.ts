export interface PerformanceInput {
  headers: Record<string, string>;
  scripts: string[];
  htmlSize: number;
}

export interface PerformanceResponse {
  payloadCategory: string;
  compressionEnabled: boolean;
  thirdPartyRisk: string;
  performanceScore: number;
}