import { Signals } from "./signalExtractor";

export const detectFromSignals = (signals: Signals) => {

  let framework = "Unclassified";
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

  let hosting = "Undetected";

  if (signals.infraSignals.hasVercelHeader) {
    hosting = "Vercel";
  } else if (signals.infraSignals.hasCloudflare) {
    hosting = "Cloudflare";
  } else if (signals.infraSignals.hasGithubServer) {
    hosting = "GitHub Infrastructure";
  }

  return {
    framework,
    hosting,
    confidence
  };
};
