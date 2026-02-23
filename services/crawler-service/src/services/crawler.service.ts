import axios from "axios";
import puppeteer from "puppeteer";
import https from "https";
import { parseHTML } from "../parsers/html.parser";
import { extractUIPatterns } from "../parsers/uiPattern.parser";

interface RuntimeAnalysis {
  executedJavaScript: boolean;
  dynamicFrameworkHints: string[];
  hydrationPatterns: string[];
  domMutationCount: number;
  staticDomNodes: number;
  runtimeDomNodes: number;
  renderTimingMs: {
    domContentLoaded: number;
    load: number;
    firstContentfulPaint: number;
  };
}

interface LighthouseScores {
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
}

const importEsmModule = new Function("moduleName", "return import(moduleName)") as (
  moduleName: string
) => Promise<any>;

const toScore = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.round(value * 100);
};

const isTlsCertificateError = (error: any) => {
  const code = error?.code;
  const message = String(error?.message || "").toLowerCase();

  return (
    code === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY" ||
    code === "SELF_SIGNED_CERT_IN_CHAIN" ||
    code === "DEPTH_ZERO_SELF_SIGNED_CERT" ||
    code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
    message.includes("certificate")
  );
};

const fetchHtmlWithTlsFallback = async (url: string) => {
  try {
    return await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
  } catch (error: any) {
    if (!isTlsCertificateError(error)) {
      throw error;
    }

    return axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });
  }
};

const runRuntimeAnalysis = async (url: string, staticHtml: string): Promise<RuntimeAnalysis> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--ignore-certificate-errors"]
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

    const metrics = await page.evaluate((initialHtmlLength: number) => {
      const runtimeDomNodes = document.querySelectorAll("*").length;
      const staticDomNodes = Math.max(Math.floor(initialHtmlLength / 42), 1);
      const paints = performance.getEntriesByType("paint") as Array<{ name: string; startTime: number }>;
      const fcp = paints.find((entry) => entry.name === "first-contentful-paint");
      const nav = performance.getEntriesByType("navigation")[0] as
        | { domContentLoadedEventEnd?: number; loadEventEnd?: number }
        | undefined;

      const scriptAndMarkup = `${document.documentElement.outerHTML} ${Array.from(document.scripts)
        .map((script) => script.src || script.textContent || "")
        .join(" ")}`.toLowerCase();

      const dynamicFrameworkHints = Array.from(
        new Set(
          [
            scriptAndMarkup.includes("_next") || scriptAndMarkup.includes("next/") ? "nextjs" : "",
            scriptAndMarkup.includes("react") ? "react" : "",
            scriptAndMarkup.includes("redux") ? "redux" : "",
            scriptAndMarkup.includes("vue") ? "vue" : "",
            scriptAndMarkup.includes("ng-version") || scriptAndMarkup.includes("angular") ? "angular" : "",
            scriptAndMarkup.includes("svelte") ? "svelte" : "",
            scriptAndMarkup.includes("tailwind") ? "tailwind" : "",
            scriptAndMarkup.includes("wp-content") || scriptAndMarkup.includes("wordpress") ? "wordpress" : "",
            scriptAndMarkup.includes("shopify") ? "shopify" : ""
          ].filter(Boolean)
        )
      );

      const hydrationPatterns = Array.from(
        new Set(
          [
            document.getElementById("__NEXT_DATA__") ? "next-hydration" : "",
            document.querySelector("[data-reactroot], [data-reactroot='']") ? "react-root-hydration" : "",
            scriptAndMarkup.includes("hydrate") || scriptAndMarkup.includes("hydration") ? "hydrate-call-detected" : "",
            nav &&
            (nav.domContentLoadedEventEnd || 0) > 0 &&
            (nav.loadEventEnd || 0) > 0 &&
            (nav.loadEventEnd || 0) > (nav.domContentLoadedEventEnd || 0)
              ? "post-dcl-runtime-work"
              : ""
          ].filter(Boolean)
        )
      );

      return {
        dynamicFrameworkHints,
        hydrationPatterns,
        domMutationCount: Math.max(runtimeDomNodes - staticDomNodes, 0),
        staticDomNodes,
        runtimeDomNodes,
        renderTimingMs: {
          domContentLoaded: Math.round(nav?.domContentLoadedEventEnd || 0),
          load: Math.round(nav?.loadEventEnd || 0),
          firstContentfulPaint: Math.round(fcp?.startTime || 0)
        }
      };
    }, staticHtml.length);

    return {
      executedJavaScript: true,
      ...metrics
    };
  } finally {
    await browser.close();
  }
};

const runLighthouseAudit = async (url: string): Promise<LighthouseScores> => {
  const lighthouseModule = await importEsmModule("lighthouse");
  const lighthouse = lighthouseModule.default || lighthouseModule;
  const chromeLauncherModule = await importEsmModule("chrome-launcher");
  const launch = chromeLauncherModule.launch;
  const resolvedChromePath = process.env.CHROME_PATH || puppeteer.executablePath();

  const chrome = await launch({
    chromePath: resolvedChromePath,
    chromeFlags: ["--headless", "--no-sandbox", "--disable-dev-shm-usage", "--ignore-certificate-errors"]
  });

  try {
    const report = await lighthouse(url, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance", "seo", "accessibility", "best-practices"]
    });

    const categories = report?.lhr?.categories;

    return {
      performance: toScore(categories?.performance?.score),
      seo: toScore(categories?.seo?.score),
      accessibility: toScore(categories?.accessibility?.score),
      bestPractices: toScore(categories?.["best-practices"]?.score)
    };
  } finally {
    await chrome.kill();
  }
};

export const crawlWebsite = async (url: string) => {
  const startedAt = Date.now();

  const response = await fetchHtmlWithTlsFallback(url);

  const html = response.data;

  const normalizedHeaders: Record<string, string> = {};
  Object.keys(response.headers).forEach((key) => {
    normalizedHeaders[key.toLowerCase()] = String(response.headers[key]);
  });

  const parsedData = parseHTML(html);
  const uiPatterns = extractUIPatterns(html);

  let runtimeAnalysis: RuntimeAnalysis = {
    executedJavaScript: false,
    dynamicFrameworkHints: [],
    hydrationPatterns: [],
    domMutationCount: 0,
    staticDomNodes: 0,
    runtimeDomNodes: 0,
    renderTimingMs: {
      domContentLoaded: 0,
      load: 0,
      firstContentfulPaint: 0,
    },
  };

  let lighthouse: LighthouseScores = {
    performance: 0,
    seo: 0,
    accessibility: 0,
    bestPractices: 0,
  };

  try {
    runtimeAnalysis = await runRuntimeAnalysis(url, html);
  } catch (runtimeError: any) {
    console.warn("Runtime analysis skipped:", runtimeError?.message || runtimeError);
  }

  try {
    lighthouse = await runLighthouseAudit(url);
  } catch (lighthouseError: any) {
    console.warn("Lighthouse audit skipped:", lighthouseError?.message || lighthouseError);
  }

  return {
    statusCode: response.status,
    headers: normalizedHeaders,
    htmlSize: html.length,
    crawlDurationMs: Date.now() - startedAt,
    ...parsedData,
    uiPatterns,
    runtimeAnalysis,
    lighthouse
  };
};
