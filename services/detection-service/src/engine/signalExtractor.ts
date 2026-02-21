export interface Signals {
  frameworkSignals: {
    hasNextData: boolean;
    hasReactRoot: boolean;
    hasNgVersion: boolean;
    hasVueMarker: boolean;
  };
  infraSignals: {
    hasVercelHeader: boolean;
    hasCloudflare: boolean;
    hasGithubServer: boolean;
  };
  performanceSignals: {
    usesGzip: boolean;
  };
}

export const extractSignals = (
  headers: Record<string, string>,
  scripts: string[]
): Signals => {

  const scriptString = scripts.join(" ").toLowerCase();
  const serverHeader = (headers["server"] || "").toLowerCase();
  const encoding = (headers["content-encoding"] || "").toLowerCase();

  return {
    frameworkSignals: {
      hasNextData: scriptString.includes("_next"),
      hasReactRoot: scriptString.includes("react"),
      hasNgVersion: scriptString.includes("angular"),
      hasVueMarker: scriptString.includes("vue"),
    },

    infraSignals: {
      hasVercelHeader: !!headers["x-vercel-id"],
      hasCloudflare: serverHeader.includes("cloudflare"),
      hasGithubServer: serverHeader.includes("github"),
    },

    performanceSignals: {
      usesGzip:
        encoding.includes("gzip") ||
        encoding.includes("br"),
    }
  };
};