"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { analyzeWebsite, fetchUsage } from "@/lib/api";
import ScanForm from "@/components/ScanForm";
import ReportCard from "@/components/ReportCard";
import RawPanel from "@/components/RawPanel";
import { useAuth } from "@/context/AuthContext";
import { ScanResult } from "@/types";

const SCAN_STEPS = [
  "Resolving DNS & CDN fingerprint",
  "Fetching HTTP response headers",
  "Analyzing JS bundle signatures",
  "Auditing performance signals",
  "Compiling report",
];

function ScanningOverlay({ step }: { step: number }) {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: "rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "#34d399", animation: "pulse-green 1s infinite" }}
        />
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          ANALYSIS IN PROGRESS
        </span>
      </div>

      <div className="space-y-3">
        {SCAN_STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={s} className="flex items-center gap-3">
              <div className="w-4 shrink-0 flex justify-center">
                {done ? (
                  <span style={{ color: "#34d399", fontSize: "13px" }}>✓</span>
                ) : active ? (
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2.5"
                    style={{ animation: "spin 0.9s linear infinite" }}
                  >
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
                  </svg>
                ) : (
                  <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "13px" }}>○</span>
                )}
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: done
                    ? "rgba(52,211,153,0.7)"
                    : active
                    ? "rgba(255,255,255,0.8)"
                    : "rgba(255,255,255,0.2)",
                  transition: "color 0.3s",
                }}
              >
                {done ? `✓ ${s}` : active ? `→ ${s}...` : s}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div
        className="mt-5 rounded overflow-hidden"
        style={{ height: "2px", background: "rgba(255,255,255,0.05)" }}
      >
        <div
          className="h-full rounded"
          style={{
            width: `${((step + 1) / SCAN_STEPS.length) * 100}%`,
            background: "linear-gradient(90deg, #34d399, #6ee7b7)",
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}

export default function ScanPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const autoTriggeredRef = useRef(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scannedUrl, setScannedUrl] = useState("");
  const [error, setError] = useState("");
  const [tier, setTier] = useState<"free" | "premium">("free");
  const [usage, setUsage] = useState<{ limit: number; used: number; remaining: number; tier: "free" | "premium" } | null>(null);
  const [activeTab, setActiveTab] = useState<"report" | "raw">("report");

  const handleScan = useCallback(async (url: string) => {
    if (!url) return;
    setError("");
    setResult(null);
    setScannedUrl(url);
    setLoading(true);
    setScanStep(0);

    // Animate through steps
    const stepInterval = setInterval(() => {
      setScanStep((prev) => {
        if (prev >= SCAN_STEPS.length - 2) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    try {
      const data = await analyzeWebsite(url, user?.uid, tier);
      clearInterval(stepInterval);
      setScanStep(SCAN_STEPS.length - 1);
      await new Promise((r) => setTimeout(r, 400));
      setResult(data);
      setUsage(data?.usage ?? null);
      setActiveTab("report");
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err?.message || "Analysis failed. Check the URL and try again.");
    } finally {
      setLoading(false);
    }
  }, [tier, user?.uid]);

  useEffect(() => {
    const loadUsage = async () => {
      if (!user?.uid) {
        setUsage(null);
        return;
      }

      try {
        const current = await fetchUsage(user.uid, tier);
        setUsage(current);
      } catch {
        setUsage(null);
      }
    };

    void loadUsage();
  }, [tier, user?.uid]);

  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (!urlParam || autoTriggeredRef.current) {
      return;
    }

    autoTriggeredRef.current = true;
    void handleScan(urlParam);
  }, [searchParams, handleScan]);

  return (
    <main
      className="min-h-screen"
      style={{
        background: "#080c10",
        fontFamily: "'IBM Plex Mono', monospace",
        color: "rgba(255,255,255,0.85)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

        .syne { font-family: 'Syne', sans-serif; }

        .grid-bg {
          background-image:
            linear-gradient(rgba(52,211,153,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        @keyframes pulse-green {
          0%,100% { opacity:1; }
          50% { opacity:0.3; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up 0.4s ease forwards; }

        .tab-btn {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          padding: 7px 18px;
          border-radius: 5px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s;
        }
        .tab-btn.active {
          background: rgba(52,211,153,0.08);
          border-color: rgba(52,211,153,0.2);
          color: #34d399;
        }
        .tab-btn.inactive {
          color: rgba(255,255,255,0.3);
          background: transparent;
        }
        .tab-btn.inactive:hover {
          color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.03);
        }

        .error-box {
          background: rgba(248,113,113,0.06);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 8px;
          padding: 14px 18px;
          font-size: 12px;
          color: #fca5a5;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .url-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(52,211,153,0.06);
          border: 1px solid rgba(52,211,153,0.15);
          border-radius: 5px;
          padding: 3px 10px;
          font-size: 11px;
          color: #34d399;
        }

        .section-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.25);
        }
      `}</style>

      {/* Top grid texture strip */}
      <div className="grid-bg fixed inset-0 pointer-events-none opacity-60" />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(52,211,153,0.04) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* Page header */}
        <div className="mb-8">
          <p className="section-label mb-2">ANALYZER</p>
          <h1 className="syne text-3xl font-bold text-white mb-1">
            Inspect a Website
          </h1>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
            Enter any public URL to reveal its full technology fingerprint.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
            <label className="flex items-center gap-2">
              <span>Tier</span>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as "free" | "premium")}
                className="rounded border border-white/10 bg-black/30 px-2 py-1 text-xs"
              >
                <option value="free">Free (10/day)</option>
                <option value="premium">Premium (200/day)</option>
              </select>
            </label>
            {!!usage && (
              <span>
                Usage: {usage.used}/{usage.limit} scans today ({usage.remaining} left)
              </span>
            )}
          </div>
        </div>

        {/* Scan form */}
        <div className="mb-6">
          <ScanForm onScan={handleScan} loading={loading} />
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="error-box mb-6 fade-up">
            <span>⚠</span>
            {error}
          </div>
        )}

        {/* Scanning animation */}
        {loading && (
          <div className="mb-6 fade-up">
            <ScanningOverlay step={scanStep} />
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="fade-up space-y-4">

            {/* Result header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#34d399", animation: "pulse-green 2s infinite" }}
                />
                <span className="section-label">ANALYSIS COMPLETE</span>
                <div className="url-pill">
                  <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 8a6 6 0 1012 0A6 6 0 002 8z" />
                    <path d="M8 2c0 0-2 2-2 6s2 6 2 6M8 2c0 0 2 2 2 6s-2 6-2 6M2 8h12" strokeLinecap="round" />
                  </svg>
                  {scannedUrl}
                </div>
              </div>

              {/* Tabs */}
              <div
                className="flex gap-1 p-1 rounded-lg"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <button
                  className={`tab-btn ${activeTab === "report" ? "active" : "inactive"}`}
                  onClick={() => setActiveTab("report")}
                >
                  Report
                </button>
                <button
                  className={`tab-btn ${activeTab === "raw" ? "active" : "inactive"}`}
                  onClick={() => setActiveTab("raw")}
                >
                  Raw JSON
                </button>
              </div>
            </div>

            {/* Tab content */}
            {activeTab === "report" ? (
              <ReportCard data={result} />
            ) : (
              <RawPanel data={result} />
            )}
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div
            className="text-center py-20 rounded-xl"
            style={{ border: "1px dashed rgba(255,255,255,0.06)" }}
          >
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.12)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
              </svg>
            </div>
            <p
              className="syne text-lg font-bold text-white mb-1"
            >
              Ready to analyze
            </p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
              Enter a URL above to inspect its tech stack, hosting, and performance.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}