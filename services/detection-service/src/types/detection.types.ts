// -----------------------------
// Input from Crawler Service
// -----------------------------

export interface CrawlInput {
  headers: Record<string, string>;
  scripts: string[];
  meta?: string[];
  htmlSize?: number;
}

// -----------------------------
// Framework Detection Result
// -----------------------------

export interface FrameworkResult {
  name: string;
  score: number;
}

// -----------------------------
// Hosting Detection Result
// -----------------------------

export interface HostingResult {
  name: string;
  score: number;
}

// -----------------------------
// Final Detection Output
// -----------------------------

export interface DetectionResponse {
  framework: string;
  hosting: string;
  rendering: string;
  confidence: number;
}