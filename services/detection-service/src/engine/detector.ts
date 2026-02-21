import { Signals } from "./signalExtractor";

export const detectFromSignals = (signals: Signals) => {

  let framework = "Unknown";
  let confidence = 50;

  if (
    signals.frameworkSignals.hasNextData &&
    signals.frameworkSignals.hasReactRoot
  ) {
    framework = "Next.js";
    confidence += 30;
  } else if (signals.frameworkSignals.hasReactRoot) {
    framework = "React";
    confidence += 20;
  }

  let hosting = "Unknown";

  if (signals.infraSignals.hasVercelHeader) {
    hosting = "Vercel";
  } else if (signals.infraSignals.hasCloudflare) {
    hosting = "Cloudflare";
  } else if (signals.infraSignals.hasGithubServer) {
    hosting = "GitHub Infrastructure";
  }

  const rendering =
    signals.frameworkSignals.hasNextData
      ? "Hybrid SSR"
      : "Likely CSR";

  return {
    framework,
    hosting,
    rendering,
    confidence
  };
};