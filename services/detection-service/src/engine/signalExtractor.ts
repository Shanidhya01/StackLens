export interface Signals {
  frameworkSignals: {
    hasNextData: boolean;
    hasReactRoot: boolean;
    hasNgVersion: boolean;
    hasVueMarker: boolean;
    hasTailwind: boolean;
    hasRedux: boolean;
    hasSvelte: boolean;
    hasWordPress: boolean;
    hasShopify: boolean;
    runtimeHints: string[];
    hydrationPatterns: string[];
    hasHydration: boolean;
  };
  infraSignals: {
    hasVercelHeader: boolean;
    hasVercelEdge: boolean;
    hasCloudflare: boolean;
    hasCloudflareCDN: boolean;
    hasGithubServer: boolean;
  };
  performanceSignals: {
    usesGzip: boolean;
  };
}

export const extractSignals = (
  headers: Record<string, string>,
  scripts: string[],
  meta: string[] = [],
  links: string[] = [],
  runtimeAnalysis?: {
    dynamicFrameworkHints?: string[];
    hydrationPatterns?: string[];
  }
): Signals => {

  const scriptString = scripts.join(" ").toLowerCase();
  const metaString = meta.join(" ").toLowerCase();
  const linkString = links.join(" ").toLowerCase();
  const serverHeader = (headers["server"] || "").toLowerCase();
  const poweredBy = (headers["x-powered-by"] || "").toLowerCase();
  const cacheHeader = (headers["cf-cache-status"] || "").toLowerCase();
  const viaHeader = (headers["via"] || "").toLowerCase();
  const vercelCache = (headers["x-vercel-cache"] || "").toLowerCase();
  const encoding = (headers["content-encoding"] || "").toLowerCase();
  const runtimeHints = runtimeAnalysis?.dynamicFrameworkHints || [];
  const hydrationPatterns = runtimeAnalysis?.hydrationPatterns || [];

  const combinedSignals = `${scriptString} ${metaString} ${linkString} ${poweredBy} ${runtimeHints.join(" ")}`;

  return {
    frameworkSignals: {
      hasNextData: combinedSignals.includes("_next") || runtimeHints.includes("nextjs"),
      hasReactRoot: combinedSignals.includes("react") || runtimeHints.includes("react"),
      hasNgVersion:
        combinedSignals.includes("ng-version") ||
        combinedSignals.includes("angular") ||
        runtimeHints.includes("angular"),
      hasVueMarker: combinedSignals.includes("vue") || runtimeHints.includes("vue"),
      hasTailwind: combinedSignals.includes("tailwind") || runtimeHints.includes("tailwind"),
      hasRedux: combinedSignals.includes("redux") || runtimeHints.includes("redux"),
      hasSvelte: combinedSignals.includes("svelte") || runtimeHints.includes("svelte"),
      hasWordPress:
        combinedSignals.includes("wp-content") ||
        combinedSignals.includes("wordpress") ||
        runtimeHints.includes("wordpress"),
      hasShopify: combinedSignals.includes("shopify") || runtimeHints.includes("shopify"),
      runtimeHints,
      hydrationPatterns,
      hasHydration: hydrationPatterns.length > 0,
    },

    infraSignals: {
      hasVercelHeader: !!headers["x-vercel-id"],
      hasVercelEdge:
        !!headers["x-vercel-id"] ||
        vercelCache.includes("hit") ||
        viaHeader.includes("vercel"),
      hasCloudflare:
        serverHeader.includes("cloudflare") ||
        !!headers["cf-ray"],
      hasCloudflareCDN:
        !!headers["cf-cache-status"] ||
        cacheHeader.includes("hit") ||
        serverHeader.includes("cloudflare"),
      hasGithubServer: serverHeader.includes("github"),
    },

    performanceSignals: {
      usesGzip:
        encoding.includes("gzip") ||
        encoding.includes("br"),
    }
  };
};