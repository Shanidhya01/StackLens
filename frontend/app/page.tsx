"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    label: "STACK DETECTION",
    title: "Framework & Runtime Inference",
    desc: "Identifies React, Next.js, Vue, Nuxt, Svelte, Astro, and 40+ other frameworks from headers, bundle signatures, and DOM patterns.",
    stat: "40+ frameworks",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    label: "PERFORMANCE",
    title: "Real-Time Performance Snapshot",
    desc: "Measures payload compression, TTFB, third-party script risk scores, and render-blocking resource chains.",
    stat: "< 2s analysis",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
      </svg>
    ),
    label: "UI PATTERNS",
    title: "Layout & Interaction Mapping",
    desc: "Deconstructs layout grids, component hierarchies, animation libraries, and interaction complexity from rendered output.",
    stat: "DOM-level analysis",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3.284 14.253A8.959 8.959 0 013 12c0-1.016.164-1.994.457-2.918" />
      </svg>
    ),
    label: "INFRASTRUCTURE",
    title: "Hosting & CDN Fingerprinting",
    desc: "Detects Vercel, Cloudflare, AWS, Fastly, and other edge providers through response header analysis and IP geolocation.",
    stat: "20+ providers",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: "RENDERING",
    title: "SSR / CSR / SSG Classification",
    desc: "Distinguishes server-side rendering, static generation, client hydration, and hybrid strategies with confidence scoring.",
    stat: "6 render modes",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    label: "BENCHMARKING",
    title: "Competitive Intelligence Reports",
    desc: "Compare tech stacks across multiple URLs side-by-side. Export structured JSON or PDF reports for technical audits.",
    stat: "Multi-URL analysis",
  },
];

const STACK_TAGS = [
  "Next.js 14", "Vercel Edge", "React 18", "Tailwind CSS",
  "TypeScript", "Node.js", "CloudFront", "GraphQL",
];

function TerminalLine({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className="font-mono text-sm leading-6 transition-all duration-300"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(4px)" }}
    >
      {children}
    </div>
  );
}

function ScanningBar() {
  return (
    <div className="relative h-0.5 w-full bg-zinc-800 rounded overflow-hidden">
      <div
        className="absolute top-0 left-0 h-full bg-emerald-400"
        style={{
          animation: "scan 2s ease-in-out infinite",
          width: "40%",
        }}
      />
      <style>{`
        @keyframes scan {
          0% { left: -40%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [url, setUrl] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);

  // --- Loading state ---
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#080c10" }}>
        <div className="text-center">
          <p className="text-xs tracking-[0.18em] text-emerald-400 mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>STACKLENS</p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'IBM Plex Mono', monospace" }}>Checking session...</p>
        </div>
      </main>
    );
  }

  // --- Logged-in state ---
  if (user) {
    const firstName = user.displayName?.split(" ")[0] || "there";
    return (
      <main style={{ minHeight: "100vh", background: "#080c10", fontFamily: "'IBM Plex Mono', monospace", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');
          .au-row {
            display: flex; align-items: center; gap: 12px;
            padding: 14px 18px; border-radius: 8px;
            text-decoration: none;
            border: 1px solid rgba(255,255,255,0.07);
            background: rgba(255,255,255,0.02);
            transition: background .15s, border-color .15s;
          }
          .au-row:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.13); }
          .au-row-primary {
            display: flex; align-items: center; gap: 12px;
            padding: 14px 18px; border-radius: 8px;
            text-decoration: none;
            border: 1px solid rgba(52,211,153,0.22);
            background: rgba(52,211,153,0.05);
            transition: background .15s, border-color .15s;
          }
          .au-row-primary:hover { background: rgba(52,211,153,0.09); border-color: rgba(52,211,153,0.35); }
        `}</style>

        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Greeting */}
          <p style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>WELCOME BACK</p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "2rem", fontWeight: 800, color: "#fff", margin: "0 0 32px" }}>
            Hey, {firstName}
          </h1>

          {/* Nav links */}
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            <Link href="/dashboard" className="au-row-primary">
              <span style={{ fontSize: 13, color: "#34d399", flexShrink: 0 }}>→</span>
              <div>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>Dashboard</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 2 }}>Run a new scan or view reports</div>
              </div>
            </Link>

            {[
              { href: "/scan",    label: "New Scan",        sub: "Inspect any public URL" },
              { href: "/history", label: "Scan History",    sub: "Browse previous results" },
              { href: "/docs",    label: "API Docs",        sub: "Integrate with your pipeline" },
            ].map(a => (
              <Link key={a.href} href={a.href} className="au-row">
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>→</span>
                <div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{a.sub}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Email */}
          <p style={{ marginTop: 28, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
            Signed in as {user.email}
          </p>
        </div>
      </main>
    );
  }

  // --- Guest / marketing page ---
  return (
    <main
      className="min-h-screen text-white"
      style={{
        background: "#080c10",
        fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

        .hero-title { font-family: 'Syne', sans-serif; }

        .grid-bg {
          background-image:
            linear-gradient(rgba(52, 211, 153, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52, 211, 153, 0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .feature-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          transition: border-color 0.2s, background 0.2s;
        }
        .feature-card:hover {
          background: rgba(52, 211, 153, 0.04);
          border-color: rgba(52, 211, 153, 0.2);
        }

        .glow-input:focus {
          outline: none;
          box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.5), 0 0 20px rgba(52, 211, 153, 0.1);
        }

        .pulse-dot {
          animation: pulse-green 2s infinite;
        }
        @keyframes pulse-green {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .nav-link {
          color: rgba(255,255,255,0.45);
          font-size: 12px;
          letter-spacing: 0.08em;
          transition: color 0.2s;
        }
        .nav-link:hover { color: rgba(255,255,255,0.9); }

        .tag-chip {
          background: rgba(52, 211, 153, 0.08);
          border: 1px solid rgba(52, 211, 153, 0.15);
          color: #34d399;
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 3px;
          letter-spacing: 0.05em;
        }

        .cta-primary {
          background: #34d399;
          color: #080c10;
          font-weight: 600;
          letter-spacing: 0.08em;
          font-size: 13px;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .cta-primary:hover {
          background: #6ee7b7;
          box-shadow: 0 0 24px rgba(52, 211, 153, 0.3);
        }

        .cta-secondary {
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.6);
          font-size: 13px;
          letter-spacing: 0.06em;
          transition: border-color 0.2s, color 0.2s;
        }
        .cta-secondary:hover {
          border-color: rgba(255,255,255,0.3);
          color: rgba(255,255,255,0.9);
        }

        .section-label {
          font-size: 11px;
          letter-spacing: 0.2em;
          color: #34d399;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>


      <section className="grid-bg relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 80% at 50% 50%, rgba(52,211,153,0.05) 0%, transparent 70%)" }} />
        <div className="relative z-10 max-w-2xl mx-auto px-6 py-28 text-center">
          <div className="section-label mb-4">GET STARTED</div>
          <h2 className="hero-title text-4xl md:text-5xl font-extrabold text-white mb-4">
            Start Analyzing<br /><span style={{ color: "#34d399" }}>in 30 seconds</span>
          </h2>
          <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,0.4)" }}>
            No setup. No SDK. Paste a URL and get a full architecture report instantly.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/login" className="cta-primary px-8 py-4 rounded text-sm">Create Free Account</Link>
            <a href="#" className="cta-secondary px-8 py-4 rounded text-sm">View API Docs</a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(52,211,153,0.02)" }}>
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[["2.4M+", "URLs Analyzed"], ["99.7%", "Detection Accuracy"], ["< 3s", "Avg. Analysis Time"], ["40+", "Tech Fingerprints"]].map(([val, label]) => (
            <div key={label}>
              <div className="hero-title text-2xl font-bold text-white mb-1">{val}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-28">
        <div className="text-center mb-16">
          <div className="section-label mb-4">CAPABILITIES</div>
          <h2 className="hero-title text-3xl md:text-4xl font-bold text-white">Six Layers of Inspection</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded" style={{ background: "rgba(52,211,153,0.08)", color: "#34d399" }}>
                  {f.icon}
                </div>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>{f.label}</span>
              </div>
              <h3 className="text-white font-semibold mb-2 text-base leading-snug" style={{ fontFamily: "'Syne', sans-serif" }}>{f.title}</h3>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{f.desc}</p>
              <div className="pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="tag-chip">{f.stat}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Strip */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="section-label mb-4">ARCHITECTURE</div>
            <h2 className="hero-title text-3xl font-bold text-white mb-4">Distributed by Design</h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
              StackLens routes every analysis through an API Gateway to isolated Node.js microservices — DNS resolver, header parser, bundle analyzer, and performance auditor — each independently scalable and observable.
            </p>
            <div className="flex gap-3">
              <Link href="/dashboard" className="cta-primary px-5 py-3 rounded">Open Dashboard</Link>
              <a href="#" className="cta-secondary px-5 py-3 rounded">API Docs</a>
            </div>
          </div>

          {/* Diagram */}
          <div className="rounded-lg p-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>MICROSERVICE TOPOLOGY</div>
            <div className="space-y-3">
              {/* Client */}
              <div className="rounded px-4 py-2.5 text-center text-xs" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
                CLIENT REQUEST
              </div>
              <div className="flex justify-center"><div className="w-px h-4" style={{ background: "rgba(52,211,153,0.3)" }} /></div>
              {/* Gateway */}
              <div className="rounded px-4 py-2.5 text-center text-xs" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                API GATEWAY · Load Balancer
              </div>
              <div className="grid grid-cols-4 gap-2 pt-2">
                {[["DNS", "Resolver"], ["Header", "Parser"], ["Bundle", "Analyzer"], ["Perf", "Auditor"]].map(([a, b]) => (
                  <div key={a} className="rounded px-2 py-2 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="text-xs text-white font-medium">{a}</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{b}</div>
                  </div>
                ))}
              </div>
              <div className="rounded px-4 py-2.5 text-center text-xs" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
                RESULT AGGREGATOR → Response
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      

    </main>
  );
}