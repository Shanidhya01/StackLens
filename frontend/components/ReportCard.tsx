"use client";

import { useEffect, useMemo, useState } from "react";
import ScoreBadge from "./ScoreBadge";
import { ScanResult } from "@/types";
import jsPDF from "jspdf";

interface Props {
  data: ScanResult;
}

interface DerivedSnapshot {
  hosting: string;
  jsFileCount: number;
  htmlSizeKb: number;
  performanceScore: number | null;
}

export default function ReportCard({ data }: Props) {
  const { report, raw } = data;
  const [previousScan, setPreviousScan] = useState<DerivedSnapshot | null>(null);

  const derived = useMemo(() => {
    const detection = raw.detection || {
      framework: "Unknown",
      hosting: "Unknown",
      rendering: "Unknown",
      confidence: 0,
      frameworkCandidates: [],
      hostingCandidates: [],
      detectedTechnologies: [],
    };
    const performance = raw.performance || { performanceScore: 0 };
    const crawl = raw.crawl || {};
    const runtime = raw.runtimeAnalysis || { hydrationPatterns: [], domMutationCount: 0 };

    const scripts = Array.isArray(crawl.scripts) ? crawl.scripts : [];
    const links = Array.isArray(crawl.links) ? crawl.links : [];
    const frameworkCandidates = detection.frameworkCandidates || [];
    const hostingCandidates = detection.hostingCandidates || [];

    const absoluteUrls = [...scripts, ...links].filter((entry) => /^https?:\/\//i.test(entry));
    const externalDomains = Array.from(
      new Set(
        absoluteUrls
          .map((entry) => {
            try {
              return new URL(entry).host.toLowerCase();
            } catch {
              return "";
            }
          })
          .filter(Boolean)
      )
    ).sort();

    const thirdPartyScriptCount = scripts.filter((entry) => /^https?:\/\//i.test(entry)).length;
    const cssFileCount = links.filter((entry) => /\.css(\?|$)/i.test(entry)).length;

    const rendering = String(detection.rendering || "Unknown");
    const hydrationPatterns = runtime.hydrationPatterns || [];
    const domMutationCount = runtime.domMutationCount || 0;
    const nextMarkerDetected = hydrationPatterns.some((pattern) =>
      String(pattern).toLowerCase().includes("next-hydration")
    );
    const reactDetected =
      /react/i.test(detection.framework || "") ||
      frameworkCandidates.some((candidate) => /react/i.test(candidate.name));
    const nextDetected =
      /next/i.test(detection.framework || "") ||
      frameworkCandidates.some((candidate) => /next/i.test(candidate.name));

    const renderingLines = [
      reactDetected ? "React detected via script/runtime markers" : "React markers not strongly detected",
      nextDetected || nextMarkerDetected
        ? "Next.js SSR hydration markers detected"
        : "No Next.js SSR hydration markers",
      nextMarkerDetected ? "Server-rendered data payload marker detected" : "No server-rendered data payload marker",
      domMutationCount > 120
        ? `Dynamic HTML mutation observed (${domMutationCount} node delta)`
        : "No dynamic HTML mutation observed",
    ];

    const renderingEvidenceScore = [
      !nextDetected && !nextMarkerDetected,
      hydrationPatterns.length === 0,
      domMutationCount <= 120,
      reactDetected || scripts.length > 0,
    ].filter(Boolean).length;
    const renderingConfidence = Math.max(55, Math.min(96, 52 + renderingEvidenceScore * 11));

    const headers = crawl.headers || {};
    const serverHeader = headers["server"] || "not exposed";
    const cacheControl = headers["cache-control"] || "not exposed";
    const contentEncoding = headers["content-encoding"] || "none";
    const hstsEnabled = Boolean(headers["strict-transport-security"]);
    const cdnDetected =
      /cloudflare|cdn/i.test(String(serverHeader)) ||
      Boolean(headers["cf-cache-status"]) ||
      /cloudflare|edge|cdn/i.test(String(detection.hosting || ""));

    const infrastructureConfidence = Math.max(
      45,
      Math.min(95, 45 + Math.round(((hostingCandidates[0]?.score || 0) / 45) * 45))
    );

    const performanceScore =
      typeof performance.performanceScore === "number"
        ? performance.performanceScore
        : typeof report.metrics?.performance === "number"
          ? report.metrics.performance
          : null;

    const htmlSize = typeof crawl.htmlSize === "number" ? crawl.htmlSize : 0;
    const htmlSizeKb = Math.round(htmlSize / 1024);

    const jsRiskLevel = scripts.length >= 40 || htmlSize >= 900_000
      ? "High"
      : scripts.length >= 20 || htmlSize >= 450_000
        ? "Moderate"
        : "Low";

    const dependencyExposure = thirdPartyScriptCount >= 15 || externalDomains.length >= 12
      ? "High"
      : thirdPartyScriptCount >= 7 || externalDomains.length >= 6
        ? "Moderate"
        : "Low";

    const confidenceBreakdown = {
      architecture: detection.confidence || 0,
      infrastructure: infrastructureConfidence,
      rendering: renderingConfidence,
      performance: performanceScore,
    };

    const riskIndicators: string[] = [];
    if (jsRiskLevel !== "Low") riskIndicators.push("Heavy JavaScript payload");
    if (!performance.compressionEnabled) riskIndicators.push("No compression detected");
    if (thirdPartyScriptCount >= 6) riskIndicators.push("Multiple third-party tracking scripts");
    if (!riskIndicators.length) riskIndicators.push("No major risk indicators detected");

    const detectedTech = Array.from(
      new Set([
        ...(report.stackInsights?.detectedTechnologies || raw.detection?.detectedTechnologies || []),
        detection.framework,
        detection.hosting,
      ].filter(Boolean))
    );

    const analyticsSource = [...scripts, ...externalDomains].join(" ").toLowerCase();
    const technologies = {
      frontend: detectedTech.filter((value) => /next|react|vue|angular|svelte|shopify|wordpress|tailwind|redux/i.test(value)),
      infrastructure: detectedTech.filter((value) => /cloudflare|vercel|edge|cdn|github/i.test(value)),
      analytics: [
        analyticsSource.includes("google-analytics") || analyticsSource.includes("googletagmanager")
          ? "Google Analytics"
          : "",
      ].filter(Boolean),
      security: [hstsEnabled ? "HSTS enabled" : "HSTS not detected"],
    };

    return {
      framework: detection.framework || "Unknown",
      hosting: detection.hosting || "Unknown",
      score: report.overallScore,
      rendering,
      renderingLines,
      renderingConfidence,
      serverHeader,
      cacheControl,
      contentEncoding,
      hstsEnabled,
      cdnDetected,
      htmlSizeKb,
      jsFileCount: scripts.length,
      cssFileCount,
      thirdPartyScriptCount,
      externalDomains,
      jsRiskLevel,
      dependencyExposure,
      confidenceBreakdown,
      riskIndicators,
      technologies,
      badges: [
        /csr/i.test(rendering) ? "CSR" : "SSR/Hybrid",
        cdnDetected ? "CDN" : "No CDN",
        jsRiskLevel !== "Low" ? "Heavy JS" : "Lean JS",
        raw.uiPatterns?.isSPA ? "SPA" : "MPA",
      ],
      whyConclusion: {
        reactLabel: reactDetected ? "React evidence:" : "React evidence (weak):",
        react: [
          reactDetected ? "Framework candidates include React" : "React is not a dominant framework candidate",
          scripts.length > 0 ? "JavaScript bundle references are present" : "No JavaScript bundle references found",
        ],
        nextLabel: nextDetected || nextMarkerDetected ? "Next.js evidence:" : "Next.js rejection evidence:",
        next: [
          nextDetected ? "Framework candidates include Next.js" : "No strong Next.js framework candidate",
          nextMarkerDetected
            ? "__NEXT_DATA__ / next-hydration marker found"
            : "No __NEXT_DATA__ / next-hydration marker found",
        ],
      },
      snapshot: {
        hosting: detection.hosting || "Unknown",
        jsFileCount: scripts.length,
        htmlSizeKb,
        performanceScore,
      } as DerivedSnapshot,
    };
  }, [report, raw]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem("stacklens:lastScanSnapshot");
      if (stored) {
        setPreviousScan(JSON.parse(stored) as DerivedSnapshot);
      }
    } catch {
      setPreviousScan(null);
    }

    try {
      window.localStorage.setItem("stacklens:lastScanSnapshot", JSON.stringify(derived.snapshot));
    } catch {
      // ignore write failures
    }
  }, [derived.snapshot]);

  const toPercent = (value: number | null | undefined) =>
    typeof value === "number" ? `${Math.round(value)}%` : "N/A";

  const formatSigned = (value: number | null | undefined, suffix = "") => {
    if (typeof value !== "number") return "N/A";
    const sign = value > 0 ? "+" : "";
    return `${sign}${Math.round(value)}${suffix}`;
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    let y = 14;

    const write = (text: string, step = 7) => {
      doc.text(text, 14, y);
      y += step;
    };

    doc.setFontSize(16);
    write("StackLens Analysis Report", 10);

    doc.setFontSize(11);
    write(`Summary: ${report.summary}`);
    write(`Architecture: ${report.architectureGrade}`);
    write(`Performance: ${report.performanceGrade}`);
    write(`Overall Score: ${report.overallScore}`);
    write(`Rendering Conclusion: ${derived.rendering}`);
    write(`Rendering Confidence: ${toPercent(derived.renderingConfidence)}`);
    write(`Infrastructure Header: ${derived.serverHeader}`);
    write(`JS Assets: ${derived.jsFileCount}`);
    write(`External Domains: ${derived.externalDomains.length}`);

    const techs = report.stackInsights?.detectedTechnologies || raw.detection?.detectedTechnologies || [];
    if (techs.length) {
      y += 3;
      write(`Detected Technologies: ${techs.join(", ")}`);
    }

    doc.save("stacklens-report.pdf");
  };

  return (
    <div
      className="p-6 rounded-xl space-y-6"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <h2 className="text-xl font-semibold text-white">{report.summary}</h2>

      <div className="flex justify-end">
        <button
          onClick={exportPdf}
          className="rounded-md px-3 py-1.5 text-xs font-semibold bg-white/5 border border-white/15 text-white/80 hover:bg-white/10"
        >
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="rounded-lg p-4"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="font-medium text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.45)" }}>Architecture</p>
          <p className="text-lg mt-1 text-white">{report.architectureGrade}</p>
        </div>

        <div
          className="rounded-lg p-4"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="font-medium text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.45)" }}>Performance</p>
          <p className="text-lg mt-1 text-white">{report.performanceGrade}</p>
        </div>

        <div
          className="rounded-lg p-4"
          style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.2)" }}
        >
          <p className="font-medium text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.55)" }}>Overall Score</p>
          <ScoreBadge score={report.overallScore} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {derived.badges.map((badge) => (
          <span
            key={badge}
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}
          >
            [{badge}]
          </span>
        ))}
      </div>

      <div>
        <h3 className="font-semibold mb-3 text-white">UI Patterns</h3>
        <ul className="list-disc ml-5 space-y-1.5 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
          {raw.uiPatterns?.hasNavbar && <li>Navbar detected</li>}
          {raw.uiPatterns?.hasFooter && <li>Footer detected</li>}
          {raw.uiPatterns?.hasHeroSection && <li>Hero section detected</li>}
          {raw.uiPatterns?.formCount > 0 && (
            <li>{raw.uiPatterns.formCount} Forms detected</li>
          )}
          {raw.uiPatterns?.isSPA && <li>SPA behavior detected</li>}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-3 text-white">Rendering Analysis</h3>
        <ul className="list-disc ml-5 space-y-1.5 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
          {derived.renderingLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
          <li>Conclusion: {derived.rendering}</li>
          <li>Confidence: {toPercent(derived.renderingConfidence)}</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-3 text-white">Infrastructure Signals</h3>
        <ul className="list-disc ml-5 space-y-1.5 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
          <li>Server Header: {derived.serverHeader}</li>
          <li>CDN: {derived.cdnDetected ? "Detected" : "Not detected"}</li>
          <li>Cache-Control: {derived.cacheControl}</li>
          <li>Strict-Transport-Security: {derived.hstsEnabled ? "enabled" : "not detected"}</li>
          <li>Content-Encoding: {derived.contentEncoding}</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-3 text-white">Asset Breakdown</h3>
        <ul className="list-disc ml-5 space-y-1.5 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
          <li>HTML Size: {derived.htmlSizeKb} KB</li>
          <li>JavaScript Files: {derived.jsFileCount}</li>
          <li>CSS Files: {derived.cssFileCount}</li>
          <li>Third-party Scripts: {derived.thirdPartyScriptCount}</li>
          <li>External Domains: {derived.externalDomains.length}</li>
          <li>JS Risk Level: {derived.jsRiskLevel}</li>
          <li>Third-party Dependency Exposure: {derived.dependencyExposure}</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-3 text-white">Score Breakdown</h3>
        <ul className="list-disc ml-5 space-y-1.5 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
          <li>Architecture Confidence: {toPercent(derived.confidenceBreakdown.architecture)}</li>
          <li>Infrastructure Confidence: {toPercent(derived.confidenceBreakdown.infrastructure)}</li>
          <li>Rendering Confidence: {toPercent(derived.confidenceBreakdown.rendering)}</li>
          <li>Performance Score: {toPercent(derived.confidenceBreakdown.performance)}</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-3 text-white">Risk Indicators</h3>
        <ul className="list-disc ml-5 space-y-1.5 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
          {derived.riskIndicators.map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-3 text-white">Detected Technologies</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
          <div className="rounded-md p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="font-semibold text-white mb-1">Frontend</p>
            <p>{derived.technologies.frontend.join(", ") || "None detected"}</p>
          </div>
          <div className="rounded-md p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="font-semibold text-white mb-1">Infrastructure</p>
            <p>{derived.technologies.infrastructure.join(", ") || "None detected"}</p>
          </div>
          <div className="rounded-md p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="font-semibold text-white mb-1">Analytics</p>
            <p>{derived.technologies.analytics.join(", ") || "None detected"}</p>
          </div>
          <div className="rounded-md p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="font-semibold text-white mb-1">Security</p>
            <p>{derived.technologies.security.join(", ") || "None detected"}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3 text-white">Last Scan Comparison</h3>
        <ul className="list-disc ml-5 space-y-1.5 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
          {!previousScan ? (
            <li>No previous local scan available</li>
          ) : (
            <>
              <li>JS size changed by {formatSigned(derived.htmlSizeKb - previousScan.htmlSizeKb, " KB")}</li>
              <li>{derived.hosting === previousScan.hosting ? "Hosting unchanged" : `Hosting changed to ${derived.hosting}`}</li>
              <li>
                Performance score changed by {formatSigned(
                  (derived.confidenceBreakdown.performance ?? 0) - (previousScan.performanceScore ?? 0)
                )}
              </li>
            </>
          )}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-3 text-white">External Dependencies</h3>
        <ul className="list-disc ml-5 space-y-1.5 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
          {derived.externalDomains.length ? (
            derived.externalDomains.map((domain) => <li key={domain}>{domain}</li>)
          ) : (
            <li>No external domains detected</li>
          )}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-3 text-white">Conclusion Evidence</h3>
        <ul className="list-disc ml-5 space-y-1.5 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
          <li>{derived.whyConclusion.reactLabel}</li>
          {derived.whyConclusion.react.map((line) => (
            <li key={line}>{line}</li>
          ))}
          <li>{derived.whyConclusion.nextLabel}</li>
          {derived.whyConclusion.next.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

    </div>
  );
}