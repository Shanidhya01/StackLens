import { Signals } from "./signalExtractor";

export const detectFromSignals = (signals: Signals) => {
  const frameworkScores: Record<string, number> = {
    "Next.js": 0,
    React: 0,
    Vue: 0,
    Angular: 0,
    Svelte: 0,
    WordPress: 0,
    Shopify: 0,
  };

  const hostingScores: Record<string, number> = {
    "Vercel Edge": 0,
    "Cloudflare CDN": 0,
    Cloudflare: 0,
    Netlify: 0,
    "AWS CloudFront": 0,
    Fastly: 0,
    Akamai: 0,
    "GitHub Infrastructure": 0,
    Undetected: 1,
  };

  if (signals.frameworkSignals.hasNextData) frameworkScores["Next.js"] += 42;
  if (signals.frameworkSignals.hasReactRoot) frameworkScores.React += 20;
  if (signals.frameworkSignals.hasVueMarker) frameworkScores.Vue += 35;
  if (signals.frameworkSignals.hasNgVersion) frameworkScores.Angular += 35;
  if (signals.frameworkSignals.hasSvelte) frameworkScores.Svelte += 36;
  if (signals.frameworkSignals.hasWordPress) frameworkScores.WordPress += 45;
  if (signals.frameworkSignals.hasShopify) frameworkScores.Shopify += 45;
  if (signals.frameworkSignals.hasRedux) frameworkScores.React += 12;
  if (signals.frameworkSignals.hasTailwind) {
    frameworkScores["Next.js"] += 8;
    frameworkScores.React += 6;
    frameworkScores.Vue += 5;
  }
  if (signals.frameworkSignals.runtimeHints.includes("nextjs")) frameworkScores["Next.js"] += 18;
  if (signals.frameworkSignals.runtimeHints.includes("react")) frameworkScores.React += 12;
  if (signals.frameworkSignals.runtimeHints.includes("vue")) frameworkScores.Vue += 12;
  if (signals.frameworkSignals.runtimeHints.includes("angular")) frameworkScores.Angular += 12;

  if (signals.infraSignals.hasVercelHeader) hostingScores["Vercel Edge"] += 42;
  if (signals.infraSignals.hasVercelEdge) hostingScores["Vercel Edge"] += 28;
  if (signals.infraSignals.hasCloudflareCDN) hostingScores["Cloudflare CDN"] += 35;
  if (signals.infraSignals.hasCloudflare) hostingScores.Cloudflare += 30;
  if (signals.infraSignals.hasNetlify) hostingScores.Netlify += 40;
  if (signals.infraSignals.hasCloudFront) hostingScores["AWS CloudFront"] += 35;
  if (signals.infraSignals.hasFastly) hostingScores.Fastly += 34;
  if (signals.infraSignals.hasAkamai) hostingScores.Akamai += 34;
  if (signals.infraSignals.hasGithubServer) hostingScores["GitHub Infrastructure"] += 25;

  const frameworkCandidates = Object.entries(frameworkScores)
    .map(([name, score]) => ({ name, score }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const hostingCandidates = Object.entries(hostingScores)
    .map(([name, score]) => ({ name, score }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const topFramework = frameworkCandidates[0];
  const topHosting = hostingCandidates[0];

  const framework = topFramework?.name ?? "Static/Unclassified";
  const hosting =
    topHosting?.name && topHosting.name !== "Undetected"
      ? topHosting.name
      : (signals.infraSignals.serverFingerprint ? "Generic Web Server" : "Undetected");

  const hasHydration = signals.frameworkSignals.hasHydration;
  const rendering = hasHydration
    ? "Hydrated SSR/ISR"
    : signals.frameworkSignals.hasNextData
      ? "Hybrid SSR"
      : "Likely CSR";

  const detectionPower = (topFramework?.score || 0) + (topHosting?.score || 0);
  const confidence = Math.max(50, Math.min(99, Math.round(50 + detectionPower / 2.2)));

  const detectedTechnologies = [
    signals.frameworkSignals.hasTailwind ? "Tailwind" : "",
    signals.frameworkSignals.hasRedux ? "Redux" : "",
    signals.frameworkSignals.hasVueMarker ? "Vue" : "",
    signals.frameworkSignals.hasNgVersion ? "Angular" : "",
    signals.frameworkSignals.hasSvelte ? "Svelte" : "",
    signals.frameworkSignals.hasWordPress ? "WordPress" : "",
    signals.frameworkSignals.hasShopify ? "Shopify" : "",
    signals.infraSignals.hasCloudflareCDN ? "Cloudflare CDN" : "",
    signals.infraSignals.hasVercelEdge ? "Vercel Edge" : "",
    signals.infraSignals.hasNetlify ? "Netlify" : "",
    signals.infraSignals.hasCloudFront ? "AWS CloudFront" : "",
    signals.infraSignals.hasFastly ? "Fastly" : "",
    signals.infraSignals.hasAkamai ? "Akamai" : "",
  ].filter(Boolean);

  return {
    framework,
    hosting,
    rendering,
    confidence,
    frameworkCandidates,
    hostingCandidates,
    detectedTechnologies
  };
};
