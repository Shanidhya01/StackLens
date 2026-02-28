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
    hasNetlify: boolean;
    hasCloudFront: boolean;
    hasFastly: boolean;
    hasAkamai: boolean;
    hasGithubServer: boolean;
    serverFingerprint: string;
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
  const servedBy = (headers["x-served-by"] || "").toLowerCase();
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
      hasNetlify:
        !!headers["x-nf-request-id"] ||
        serverHeader.includes("netlify"),
      hasCloudFront:
        !!headers["x-amz-cf-id"] ||
        !!headers["x-amz-cf-pop"] ||
        viaHeader.includes("cloudfront"),
      hasFastly:
        servedBy.includes("fastly") ||
        !!headers["x-fastly-request-id"] ||
        !!headers["x-cache-hits"],
      hasAkamai:
        !!headers["x-akamai-transformed"] ||
        !!headers["akamai-origin-hop"] ||
        serverHeader.includes("akamai"),
      hasGithubServer: serverHeader.includes("github"),
      serverFingerprint: serverHeader || "",
    },

    performanceSignals: {
      usesGzip:
        encoding.includes("gzip") ||
        encoding.includes("br"),
    }
  };
};
