const analyzeBtn = document.getElementById("analyzeBtn");
const loadingDiv = document.getElementById("loading");
const resultDiv = document.getElementById("result");
const errorDiv = document.getElementById("error");
const endpointEl = document.getElementById("endpoint");
const pageMeta = document.getElementById("pageMeta");
const pageUrlEl = document.getElementById("pageUrl");

const stripTrailingSlash = (value) => value.replace(/\/+$/, "");

const getGatewayBaseUrl = () => {
  const manifest = chrome.runtime.getManifest();
  const hostPermissions = manifest.host_permissions || [];
  const firstHttpHost = hostPermissions.find((value) => /^https?:\/\//i.test(value));
  if (!firstHttpHost) {
    return "";
  }

  return stripTrailingSlash(firstHttpHost.replace(/\/$/, "").replace(/\/\*$/, ""));
};

const API_BASE = getGatewayBaseUrl();
const FRONTEND_DEFAULT = "https://stack-lens-sk.vercel.app";

const getFrontendBaseUrl = () => {
  if (!API_BASE) {
    return FRONTEND_DEFAULT;
  }

  try {
    const parsed = new URL(API_BASE);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return "http://localhost:3000";
    }

    if (parsed.hostname === "stack-lens-gateway.vercel.app") {
      return FRONTEND_DEFAULT;
    }

    if (parsed.hostname.endsWith(".vercel.app") && parsed.hostname.includes("-gateway")) {
      return `${parsed.protocol}//${parsed.hostname.replace("-gateway", "")}`;
    }

    return `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return FRONTEND_DEFAULT;
  }
};

const FRONTEND_BASE = getFrontendBaseUrl();

const buildWebReportUrl = (url) => `${stripTrailingSlash(FRONTEND_BASE)}/scan?url=${encodeURIComponent(url || "")}`;

if (endpointEl) {
  endpointEl.textContent = API_BASE ? `Gateway: ${API_BASE}` : "Gateway is not configured in manifest host_permissions.";
}

const setLoadingState = (isLoading) => {
  analyzeBtn.disabled = isLoading;
  analyzeBtn.textContent = isLoading ? "Analyzing..." : "Analyze This Page";
  loadingDiv.classList.toggle("hidden", !isLoading);
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const toArray = (value) => (Array.isArray(value) ? value : []);

const formatPercent = (value) =>
  typeof value === "number" && Number.isFinite(value) ? `${Math.round(value)}%` : "N/A";

const formatSigned = (value, suffix = "") => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/A";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${Math.round(value)}${suffix}`;
};

const formatBytesToKb = (value) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/A";
  }
  return `${Math.round(value / 1024)} KB`;
};

const getHost = (value) => {
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return "";
  }
};

const normalizeScanResult = (data, pageUrl) => {
  const raw = data?.raw || {};
  const crawl = raw?.crawl || {};
  const detection = data?.raw?.detection || data?.detection || {};
  const performance = raw?.performance || {};
  const report = data?.report || {};
  const runtimeAnalysis = raw?.runtimeAnalysis || {};
  const uiPatterns = raw?.uiPatterns || {};
  const headers = crawl?.headers || {};
  const scripts = toArray(crawl?.scripts);
  const links = toArray(crawl?.links);
  const frameworkCandidates = toArray(detection?.frameworkCandidates);
  const hostingCandidates = toArray(detection?.hostingCandidates);
  const detectedTechnologies = toArray(detection?.detectedTechnologies);
  const pageHost = getHost(pageUrl);

  const absoluteAssets = [...scripts, ...links].filter((entry) => /^https?:\/\//i.test(entry));
  const externalDomains = Array.from(
    new Set(
      absoluteAssets
        .map((entry) => getHost(entry))
        .filter((host) => host && host !== pageHost)
    )
  ).sort();

  const thirdPartyScripts = scripts.filter((entry) => {
    if (!/^https?:\/\//i.test(entry)) return false;
    const host = getHost(entry);
    return host && host !== pageHost;
  });

  const jsFileCount = scripts.length;
  const cssFileCount = links.filter((entry) => /\.css(\?|$)/i.test(entry)).length;

  const reactDetected =
    String(detection.framework || "").toLowerCase().includes("react") ||
    frameworkCandidates.some((candidate) => String(candidate?.name || "").toLowerCase().includes("react"));
  const nextDetected =
    String(detection.framework || "").toLowerCase().includes("next") ||
    frameworkCandidates.some((candidate) => String(candidate?.name || "").toLowerCase().includes("next"));

  const hydrationPatterns = toArray(runtimeAnalysis?.hydrationPatterns).map((value) => String(value).toLowerCase());
  const hasNextHydrationMarker = hydrationPatterns.some((value) => value.includes("next-hydration"));
  const hasRuntimeHydration = hydrationPatterns.length > 0;
  const domMutationCount = Number(runtimeAnalysis?.domMutationCount || 0);

  const renderingReasonLines = [
    reactDetected
      ? "React detected via script/runtime markers"
      : "React markers not strongly detected",
    nextDetected || hasNextHydrationMarker
      ? "Next.js SSR hydration markers detected"
      : "No Next.js SSR hydration markers",
    hasNextHydrationMarker
      ? "Server-rendered data payload marker detected"
      : "No server-rendered data payload marker",
    domMutationCount > 120
      ? `Dynamic HTML mutation observed (${domMutationCount} node delta)`
      : "No dynamic HTML mutation observed"
  ];

  const csrEvidenceCount = [
    !nextDetected && !hasNextHydrationMarker,
    !hasRuntimeHydration,
    domMutationCount <= 120,
    reactDetected || jsFileCount > 0
  ].filter(Boolean).length;
  const renderingConfidence = Math.max(55, Math.min(96, 52 + csrEvidenceCount * 11));

  const serverHeader = headers["server"] || "not exposed";
  const cacheControl = headers["cache-control"] || "not exposed";
  const contentEncoding = headers["content-encoding"] || "none";
  const hasHsts = Boolean(headers["strict-transport-security"]);
  const cdnDetected =
    /cloudflare|cdn/i.test(String(serverHeader)) ||
    Boolean(headers["cf-cache-status"]) ||
    String(detection.hosting || "").toLowerCase().includes("cloudflare") ||
    String(detection.hosting || "").toLowerCase().includes("edge");

  const topHostingScore = Number(hostingCandidates[0]?.score || 0);
  const infrastructureConfidence = Math.max(45, Math.min(95, 45 + Math.round((topHostingScore / 45) * 45)));

  const performanceScore =
    typeof performance.performanceScore === "number"
      ? performance.performanceScore
      : (typeof report?.metrics?.performance === "number" ? report.metrics.performance : null);

  let jsRiskLevel = "Low";
  if (jsFileCount >= 40 || Number(crawl?.htmlSize || 0) >= 900_000) jsRiskLevel = "High";
  else if (jsFileCount >= 20 || Number(crawl?.htmlSize || 0) >= 450_000) jsRiskLevel = "Moderate";

  let dependencyExposure = "Low";
  if (thirdPartyScripts.length >= 15 || externalDomains.length >= 12) dependencyExposure = "High";
  else if (thirdPartyScripts.length >= 7 || externalDomains.length >= 6) dependencyExposure = "Moderate";

  const technologies = Array.from(
    new Set([
      ...detectedTechnologies,
      detection.framework,
      detection.hosting
    ].filter(Boolean).map((value) => String(value)))
  );

  const analyticsMarkers = [
    ...scripts,
    ...externalDomains
  ].join(" ").toLowerCase();

  const categorizedTechnologies = {
    frontend: technologies.filter((value) => /next|react|vue|angular|svelte|shopify|wordpress|tailwind|redux/i.test(value)),
    infrastructure: technologies.filter((value) => /cloudflare|vercel|edge|cdn|github/i.test(value)),
    analytics: [
      analyticsMarkers.includes("google-analytics") || analyticsMarkers.includes("googletagmanager")
        ? "Google Analytics"
        : ""
    ].filter(Boolean),
    security: [hasHsts ? "HSTS enabled" : "HSTS not detected"],
  };

  const riskIndicators = [];
  if (jsRiskLevel !== "Low") riskIndicators.push("Heavy JavaScript payload");
  if (!performance.compressionEnabled) riskIndicators.push("No compression detected");
  if (thirdPartyScripts.length >= 6) riskIndicators.push("Multiple third-party tracking scripts");
  if (!riskIndicators.length) riskIndicators.push("No major risk indicators detected");

  const renderingTag = String(detection.rendering || "").toLowerCase().includes("csr") ? "CSR" : "SSR/Hybrid";
  const badges = [
    renderingTag,
    cdnDetected ? "CDN" : "No CDN",
    jsRiskLevel !== "Low" ? "Heavy JS" : "Lean JS",
    uiPatterns?.isSPA ? "SPA" : "MPA"
  ];

  return {
    url: pageUrl,
    framework: detection.framework || detection.frameworkName || "Unknown",
    hosting: detection.hosting || detection.hostingProvider || "Unknown",
    score: report.overallScore ?? report.score ?? "N/A",
    detection,
    report,
    performance,
    crawl,
    uiPatterns,
    runtimeAnalysis,
    badges,
    renderingReasonLines,
    renderingConclusion:
      String(detection.rendering || "").toLowerCase().includes("csr")
        ? "Likely Client-Side Rendering"
        : String(detection.rendering || "Unknown rendering mode"),
    renderingConfidence,
    infraSignals: {
      serverHeader,
      cdnDetected,
      cacheControl,
      hstsEnabled: hasHsts,
      contentEncoding,
    },
    assets: {
      htmlSize: crawl?.htmlSize,
      jsFileCount,
      cssFileCount,
      thirdPartyScriptCount: thirdPartyScripts.length,
      externalDomainCount: externalDomains.length,
      jsRiskLevel,
      dependencyExposure,
    },
    confidenceBreakdown: {
      architecture: detection.confidence,
      infrastructure: infrastructureConfidence,
      rendering: renderingConfidence,
      performance: performanceScore,
    },
    riskIndicators,
    technologies: categorizedTechnologies,
    whyConclusion: {
      reactLabel: reactDetected ? "React evidence:" : "React evidence (weak):",
      reactReasons: [
        reactDetected ? "Framework candidates include React" : "React is not a dominant framework candidate",
        jsFileCount > 0 ? "JavaScript bundle references are present" : "No JavaScript bundle references found"
      ],
      nextLabel: nextDetected || hasNextHydrationMarker ? "Next.js evidence:" : "Next.js rejection evidence:",
      nextReasons: [
        nextDetected ? "Framework candidates include Next.js" : "No strong Next.js framework candidate",
        hasNextHydrationMarker
          ? "__NEXT_DATA__ / next-hydration marker found"
          : "No __NEXT_DATA__ / next-hydration marker found"
      ]
    },
    externalDomains
  };
};

const renderSection = (title, items) => `
  <div class="section-card">
    <h3>${escapeHtml(title)}</h3>
    <ul>
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  </div>
`;

const renderCategorizedSection = (title, groups) => `
  <div class="section-card">
    <h3>${escapeHtml(title)}</h3>
    ${Object.entries(groups)
      .map(([label, values]) => {
        const list = toArray(values);
        if (!list.length) return "";
        return `
          <div class="group-block">
            <p class="group-title">${escapeHtml(label.charAt(0).toUpperCase() + label.slice(1))}</p>
            <ul>
              ${list.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}
            </ul>
          </div>
        `;
      })
      .join("")}
  </div>
`;

const renderResult = (result) => {
  const scoreText = result.score === "N/A" ? "N/A" : `${result.score}`;
  const webReportUrl = buildWebReportUrl(result.url);
  const topRisks = result.riskIndicators.filter(Boolean).slice(0, 2);
  const riskList = topRisks.length ? topRisks : ["No major risk indicators detected"];

  resultDiv.innerHTML = `
    <div class="summary-card">
      <p><strong>Framework:</strong> ${escapeHtml(result.framework)}</p>
      <p><strong>Hosting:</strong> ${escapeHtml(result.hosting)}</p>
      <p><strong>Overall Score:</strong> ${escapeHtml(scoreText)}</p>
    </div>

    <div class="badge-row">
      ${result.badges.map((badge) => `<span class="tag">${escapeHtml(badge)}</span>`).join("")}
    </div>

    ${renderSection("Quick Insights", [
      `Conclusion: ${result.renderingConclusion}`,
      `Rendering Confidence: ${formatPercent(result.renderingConfidence)}`,
      `Performance Score: ${formatPercent(result.confidenceBreakdown.performance)}`,
      `JavaScript Files: ${result.assets.jsFileCount}`,
      `External Domains: ${result.assets.externalDomainCount}`
    ])}

    ${renderSection("Top Risks", riskList)}

    <div class="section-card">
      <h3>Need Full Detail?</h3>
      <p class="cta-note">Open StackLens Web for complete analysis, categorized technologies, dependency map, and full report context.</p>
      <a class="cta-link" href="${escapeHtml(webReportUrl)}" target="_blank" rel="noopener noreferrer">View Full Report on Website</a>
    </div>
  `;
};

analyzeBtn.addEventListener("click", async () => {
  errorDiv.classList.add("hidden");
  resultDiv.classList.add("hidden");
  setLoadingState(true);

  try {
    if (!API_BASE) {
      throw new Error("Gateway URL missing in manifest host permissions.");
    }

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    const url = tab?.url || "";

    if (!url || !/^https?:\/\//i.test(url)) {
      throw new Error("This tab cannot be analyzed. Open a normal website and try again.");
    }

    if (pageMeta && pageUrlEl) {
      pageUrlEl.textContent = url;
      pageMeta.classList.remove("hidden");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    const response = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      const details = errorPayload?.details || errorPayload?.error || `Request failed (${response.status})`;
      throw new Error(details);
    }

    const data = await response.json();
    const result = normalizeScanResult(data, url);

    renderResult(result);

    resultDiv.classList.remove("hidden");

  } catch (err) {
    const message = err?.message || "Failed to analyze this page.";
    errorDiv.textContent = message;
    errorDiv.classList.remove("hidden");
  } finally {
    setLoadingState(false);
  }
});