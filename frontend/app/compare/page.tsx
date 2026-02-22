"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { analyzeWebsite } from "@/lib/api";
import ReportCard from "@/components/ReportCard";
import { ScanResult } from "@/types";

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export default function ComparePage() {
  const { user, loading } = useAuth();
  const [leftUrl, setLeftUrl] = useState("");
  const [rightUrl, setRightUrl] = useState("");
  const [leftResult, setLeftResult] = useState<ScanResult | null>(null);
  const [rightResult, setRightResult] = useState<ScanResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const handleCompare = async () => {
    const left = normalizeUrl(leftUrl);
    const right = normalizeUrl(rightUrl);
    if (!left || !right) {
      setError("Please provide both URLs.");
      return;
    }

    setError("");
    setIsAnalyzing(true);

    try {
      const [leftData, rightData] = await Promise.all([
        analyzeWebsite(left, user?.uid),
        analyzeWebsite(right, user?.uid),
      ]);

      setLeftResult(leftData);
      setRightResult(rightData);
    } catch {
      setError("Comparison failed. Please check both URLs and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const leftScore = leftResult?.report?.overallScore ?? null;
  const rightScore = rightResult?.report?.overallScore ?? null;
  const scoreDiff =
    leftScore != null && rightScore != null ? leftScore - rightScore : null;

  const leftFramework = leftResult?.raw?.detection?.framework;
  const rightFramework = rightResult?.raw?.detection?.framework;
  const leftHosting = leftResult?.raw?.detection?.hosting;
  const rightHosting = rightResult?.raw?.detection?.hosting;

  const leftPerf = leftResult?.report?.metrics?.performance ?? leftResult?.raw?.performance?.lighthouse?.performance ?? null;
  const rightPerf = rightResult?.report?.metrics?.performance ?? rightResult?.raw?.performance?.lighthouse?.performance ?? null;
  const perfDelta = leftPerf != null && rightPerf != null ? leftPerf - rightPerf : null;

  const leftUiComplexity =
    (leftResult?.raw?.uiPatterns?.formCount || 0) +
    (leftResult?.raw?.uiPatterns?.buttonCount || 0) +
    ((leftResult?.raw?.uiPatterns?.hasHeroSection ? 1 : 0) * 2);
  const rightUiComplexity =
    (rightResult?.raw?.uiPatterns?.formCount || 0) +
    (rightResult?.raw?.uiPatterns?.buttonCount || 0) +
    ((rightResult?.raw?.uiPatterns?.hasHeroSection ? 1 : 0) * 2);
  const uiComplexityDelta = leftResult && rightResult ? leftUiComplexity - rightUiComplexity : null;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-[#080c10]">
        <p className="text-sm text-white/70">Checking session...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-[#080c10]">
        <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/3 p-7 text-center">
          <p className="text-xs tracking-[0.18em] text-emerald-400 mb-2">AUTH REQUIRED</p>
          <h1 className="text-2xl font-bold text-white mb-2">Sign in to compare</h1>
          <p className="text-sm text-white/60 mb-6">You need an account to compare two websites side by side.</p>
          <Link href="/login" className="inline-flex px-5 py-2.5 rounded-md text-sm font-semibold bg-emerald-400 text-emerald-950 hover:bg-emerald-300 transition-colors">
            Go to Login →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 bg-[#080c10] text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <p className="text-xs tracking-[0.2em] text-emerald-400 mb-2">COMPARE</p>
          <h1 className="text-3xl font-bold mb-2">Side-by-Side Stack Comparison</h1>
          <p className="text-sm text-white/60">Analyze two websites at once and compare architecture and performance.</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/3 p-4 grid md:grid-cols-[1fr_1fr_auto] gap-3 items-center">
          <input
            value={leftUrl}
            onChange={(e) => setLeftUrl(e.target.value)}
            placeholder="First URL (e.g., vercel.com)"
            className="w-full rounded-lg border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-emerald-400/40"
          />
          <input
            value={rightUrl}
            onChange={(e) => setRightUrl(e.target.value)}
            placeholder="Second URL (e.g., netlify.com)"
            className="w-full rounded-lg border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-emerald-400/40"
          />
          <button
            onClick={handleCompare}
            disabled={isAnalyzing}
            className="rounded-lg px-6 py-3 text-sm font-semibold bg-emerald-400 text-emerald-950 hover:bg-emerald-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? "Comparing..." : "Compare"}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {scoreDiff != null && (
          <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/8 px-4 py-3 text-sm text-emerald-100 space-y-1">
            Score delta: {scoreDiff > 0 ? "Left" : scoreDiff < 0 ? "Right" : "Both"} {scoreDiff === 0 ? "are equal" : `is ahead by ${Math.abs(scoreDiff)} points`}.
            {perfDelta != null && (
              <div>
                Performance delta: {perfDelta > 0 ? "Left" : perfDelta < 0 ? "Right" : "Both"} {perfDelta === 0 ? "are equal" : `is ahead by ${Math.abs(perfDelta)} points`}.
              </div>
            )}
            {uiComplexityDelta != null && (
              <div>
                UI complexity difference: {uiComplexityDelta === 0 ? "equal" : `${uiComplexityDelta > 0 ? "Left" : "Right"} appears more complex by ${Math.abs(uiComplexityDelta)} points`}.
              </div>
            )}
            {(leftFramework || rightFramework || leftHosting || rightHosting) && (
              <div>
                Stack diff: {leftFramework || "Unknown"} / {leftHosting || "Unknown"} vs {rightFramework || "Unknown"} / {rightHosting || "Unknown"}.
              </div>
            )}
          </div>
        )}

        {(leftResult || rightResult) && (
          <div className="grid xl:grid-cols-2 gap-4 items-start">
            <div className="space-y-3">
              <p className="text-xs tracking-[0.14em] text-white/50">LEFT WEBSITE</p>
              {leftResult ? (
                <ReportCard data={leftResult} />
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/3 p-6 text-sm text-white/50">No result yet.</div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs tracking-[0.14em] text-white/50">RIGHT WEBSITE</p>
              {rightResult ? (
                <ReportCard data={rightResult} />
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/3 p-6 text-sm text-white/50">No result yet.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
