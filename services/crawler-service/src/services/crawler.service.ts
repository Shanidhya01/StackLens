import axios from "axios";
import lighthouse from "lighthouse";
import puppeteer from "puppeteer";
import { launch } from "chrome-launcher";
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

const toScore = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.round(value * 100);
};

const runRuntimeAnalysis = async (url: string, staticHtml: string): Promise<RuntimeAnalysis> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

    const metrics = await page.evaluate((initialHtmlLength) => {
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
            nav && nav.domContentLoadedEventEnd > 0 && nav.loadEventEnd > 0 && nav.loadEventEnd > nav.domContentLoadedEventEnd
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
  const chrome = await launch({
    chromeFlags: ["--headless", "--no-sandbox", "--disable-dev-shm-usage"]
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

  const response = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  const html = response.data;

  const normalizedHeaders: Record<string, string> = {};
  Object.keys(response.headers).forEach((key) => {
    normalizedHeaders[key.toLowerCase()] = String(response.headers[key]);
  });

  const parsedData = parseHTML(html);
  const uiPatterns = extractUIPatterns(html);

  const [runtimeAnalysis, lighthouse] = await Promise.all([
    runRuntimeAnalysis(url, html),
    runLighthouseAudit(url)
  ]);

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
