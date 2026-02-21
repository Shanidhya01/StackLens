"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const RECENT_SCANS = [
  {
    url: "stripe.com",
    framework: "Next.js 14",
    hosting: "Vercel Edge",
    render: "Hybrid SSR",
    score: 94,
    time: "2m ago",
    status: "done",
  },
  {
    url: "linear.app",
    framework: "React 18",
    hosting: "Cloudflare",
    render: "CSR + SWR",
    score: 88,
    time: "1h ago",
    status: "done",
  },
  {
    url: "vercel.com",
    framework: "Next.js 14",
    hosting: "Vercel Edge",
    render: "SSG + ISR",
    score: 97,
    time: "3h ago",
    status: "done",
  },
  {
    url: "notion.so",
    framework: "React 18",
    hosting: "Cloudflare",
    render: "CSR",
    score: 71,
    time: "Yesterday",
    status: "done",
  },
];

const QUICK_STATS = [
  { label: "Total Scans", value: "24", delta: "+3 this week" },
  { label: "Avg. Score", value: "87", delta: "+4 vs last week" },
  { label: "Unique Hosts", value: "11", delta: "across all scans" },
  { label: "Frameworks", value: "6", delta: "detected so far" },
];

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 90 ? "#34d399" : score >= 70 ? "#fbbf24" : "#f87171";
  return (
    <div className="flex items-center justify-center relative w-10 h-10">
      <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
        <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx="18" cy="18" r="15"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${(score / 100) * 94.2} 94.2`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color, fontFamily: "'IBM Plex Mono', monospace" }}>{score}</span>
    </div>
  );
}

function RenderBadge({ mode }: { mode: string }) {
  const map: Record<string, string> = {
    "Hybrid SSR": "rgba(99,102,241,0.15)",
    "SSG + ISR": "rgba(52,211,153,0.12)",
    "CSR + SWR": "rgba(251,191,36,0.12)",
    CSR: "rgba(251,191,36,0.12)",
  };
  const colorMap: Record<string, string> = {
    "Hybrid SSR": "#818cf8",
    "SSG + ISR": "#34d399",
    "CSR + SWR": "#fbbf24",
    CSR: "#fbbf24",
  };
  return (
    <span
      className="text-xs px-2 py-0.5 rounded"
      style={{
        background: map[mode] || "rgba(255,255,255,0.06)",
        color: colorMap[mode] || "rgba(255,255,255,0.5)",
        border: `1px solid ${colorMap[mode] || "rgba(255,255,255,0.08)"}22`,
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      {mode}
    </span>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const firstName = user?.displayName?.split(" ")[0] || "there";

  const handleAnalyze = () => {
    if (!url.trim()) return;
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 2500);
  };

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
        .mono { font-family: 'IBM Plex Mono', monospace; }

        .grid-bg {
          background-image:
            linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
        }

        .scan-row {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        .scan-row:last-child { border-bottom: none; }
        .scan-row:hover { background: rgba(255,255,255,0.02); }

        .analyze-btn {
          background: #34d399;
          color: #080c10;
          font-weight: 600;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.08em;
          border: none;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }
        .analyze-btn:hover:not(:disabled) {
          background: #6ee7b7;
          box-shadow: 0 0 20px rgba(52,211,153,0.25);
        }
        .analyze-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .url-input {
          background: transparent;
          color: rgba(255,255,255,0.85);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
          border: none;
          outline: none;
          width: 100%;
        }
        .url-input::placeholder { color: rgba(255,255,255,0.2); }

        .stat-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px;
          transition: border-color 0.2s;
        }
        .stat-card:hover { border-color: rgba(52,211,153,0.2); }

        .pulse-dot { animation: pulse-green 2s infinite; }
        @keyframes pulse-green {
          0%,100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, rgba(52,211,153,0.0) 25%, rgba(52,211,153,0.12) 50%, rgba(52,211,153,0.0) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .section-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.25);
        }

        .view-all {
          font-size: 11px;
          color: #34d399;
          letter-spacing: 0.05em;
          text-decoration: none;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        .view-all:hover { opacity: 1; }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Greeting */}
        <div className="mb-10">
          <p className="section-label mb-2">WELCOME BACK</p>
          <h1 className="syne text-3xl font-bold text-white">
            Hey, {firstName} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            Paste a URL below to run a new analysis, or pick up where you left off.
          </p>
        </div>

        {/* Analyze Input */}
        <div
          className="grid-bg rounded-xl p-6 mb-8 relative overflow-hidden"
          style={{ border: "1px solid rgba(52,211,153,0.12)", background: "rgba(52,211,153,0.02)" }}
        >
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(52,211,153,0.06) 0%, transparent 70%)"
          }} />

          <div className="relative z-10">
            <p className="section-label mb-4">NEW ANALYSIS</p>
            <div
              className="flex items-center gap-3 rounded-lg px-4 py-3.5 mb-4"
              style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="text-sm shrink-0" style={{ color: "rgba(52,211,153,0.6)" }}>https://</span>
              <input
                type="text"
                className="url-input"
                placeholder="enter any public URL to analyze..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAnalyze()}
              />
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !url.trim()}
                className="analyze-btn px-5 py-2 rounded-md"
              >
                {analyzing ? "Scanning..." : "Analyze →"}
              </button>
            </div>

            {/* Scanning progress */}
            {analyzing && (
              <div className="space-y-2">
                <div className="shimmer h-0.5 rounded" />
                <div className="flex gap-6 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <span className="text-emerald-400">✓ DNS resolved</span>
                  <span className="text-emerald-400">✓ Headers fetched</span>
                  <span style={{ color: "rgba(255,255,255,0.25)" }}>○ Bundle analysis...</span>
                  <span style={{ color: "rgba(255,255,255,0.25)" }}>○ Performance audit</span>
                </div>
              </div>
            )}

            {/* Quick examples */}
            {!analyzing && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Try:</span>
                {["github.com", "shopify.com", "figma.com", "tailwindcss.com"].map(s => (
                  <button
                    key={s}
                    onClick={() => setUrl(s)}
                    className="text-xs px-2.5 py-1 rounded transition-all"
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      background: "transparent",
                      fontFamily: "'IBM Plex Mono', monospace",
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.65)"; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.3)"; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {QUICK_STATS.map((s) => (
            <div key={s.label} className="stat-card px-4 py-4">
              <div className="syne text-2xl font-bold text-white mb-0.5">{s.value}</div>
              <div className="text-xs text-white mb-1" style={{ opacity: 0.6 }}>{s.label}</div>
              <div className="text-xs" style={{ color: "rgba(52,211,153,0.6)" }}>{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Recent Scans */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
              <span className="section-label">RECENT SCANS</span>
            </div>
            <Link href="/history" className="view-all">View all →</Link>
          </div>

          {/* Table header */}
          <div
            className="grid px-5 py-2.5 text-xs"
            style={{
              gridTemplateColumns: "2fr 1fr 1fr 1fr auto auto",
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.1em",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <span>URL</span>
            <span>FRAMEWORK</span>
            <span>HOSTING</span>
            <span>RENDER</span>
            <span className="text-center">SCORE</span>
            <span className="text-right">TIME</span>
          </div>

          {RECENT_SCANS.map((scan, i) => (
            <div
              key={i}
              className="scan-row grid items-center px-5 py-3.5 cursor-pointer"
              style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr auto auto" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
                    <path d="M2 8a6 6 0 1012 0A6 6 0 002 8z" />
                    <path d="M8 2c0 0-2 2-2 6s2 6 2 6M8 2c0 0 2 2 2 6s-2 6-2 6M2 8h12" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-sm text-white">{scan.url}</span>
              </div>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{scan.framework}</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{scan.hosting}</span>
              <RenderBadge mode={scan.render} />
              <div className="flex justify-center">
                <ScoreRing score={scan.score} />
              </div>
              <span className="text-xs text-right" style={{ color: "rgba(255,255,255,0.25)" }}>{scan.time}</span>
            </div>
          ))}
        </div>

        {/* Bottom cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">

          {/* Top frameworks */}
          <div className="card p-5">
            <p className="section-label mb-4">TOP FRAMEWORKS DETECTED</p>
            <div className="space-y-3">
              {[
                { name: "Next.js", count: 12, pct: 50 },
                { name: "React (CRA/Vite)", count: 7, pct: 29 },
                { name: "Nuxt", count: 3, pct: 12 },
                { name: "Astro", count: 2, pct: 9 },
              ].map((f) => (
                <div key={f.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "rgba(255,255,255,0.6)" }}>{f.name}</span>
                    <span style={{ color: "rgba(255,255,255,0.25)" }}>{f.count} scans</span>
                  </div>
                  <div className="h-1 rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div
                      className="h-full rounded"
                      style={{ width: `${f.pct}%`, background: "rgba(52,211,153,0.5)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="card p-5" style={{ background: "rgba(52,211,153,0.02)", borderColor: "rgba(52,211,153,0.08)" }}>
            <p className="section-label mb-4">QUICK ACTIONS</p>
            <div className="space-y-2">
              {[
                { label: "Compare two URLs side-by-side", href: "/compare", icon: "⇄" },
                { label: "Export last scan as JSON", href: "/history", icon: "↓" },
                { label: "Browse full scan history", href: "/history", icon: "◷" },
                { label: "Read the API docs", href: "/docs", icon: "⌥" },
              ].map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded group"
                  style={{ border: "1px solid transparent", transition: "all 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,211,153,0.15)"; (e.currentTarget as HTMLElement).style.background = "rgba(52,211,153,0.04)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "transparent"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <span className="text-sm w-5 text-center" style={{ color: "#34d399" }}>{a.icon}</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{a.label}</span>
                  <span className="ml-auto text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#34d399" }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}