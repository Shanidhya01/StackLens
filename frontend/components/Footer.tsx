export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');

        .footer {
          border-top: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.25);
          font-family: 'IBM Plex Mono', monospace;
        }

        .footer-link {
          font-size: 11px;
          color: rgba(255,255,255,0.28);
          text-decoration: none;
          letter-spacing: 0.05em;
          transition: color 0.15s;
        }
        .footer-link:hover { color: rgba(255,255,255,0.7); }

        .footer-divider {
          color: rgba(255,255,255,0.1);
          font-size: 11px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34d399;
          animation: pulse-green 2s infinite;
          flex-shrink: 0;
        }
        @keyframes pulse-green {
          0%,100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .service-chip {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.06em;
        }
        .service-chip-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #34d399;
          opacity: 0.7;
        }
      `}</style>

      <footer className="footer">
        {/* Top row — brand + links */}
        <div
          className="max-w-6xl mx-auto px-6 py-8"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="status-dot" />
              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: "1rem",
                  color: "#fff",
                  letterSpacing: "-0.01em",
                }}
              >
                StackLens
              </span>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 7px",
                  borderRadius: "3px",
                  background: "rgba(52,211,153,0.08)",
                  border: "1px solid rgba(52,211,153,0.18)",
                  color: "#34d399",
                  letterSpacing: "0.05em",
                }}
              >
                v2.1
              </span>
            </div>

            {/* Nav links */}
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {[
                { label: "Home",      href: "/" },
                { label: "Dashboard", href: "/dashboard" },
                { label: "History",   href: "/history" },
                { label: "API Docs",  href: "/docs" },
                { label: "Pricing",   href: "/pricing" },
                { label: "Changelog", href: "/changelog" },
              ].map((l) => (
                <a key={l.label} href={l.href} className="footer-link">
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Middle row — service status */}
        <div
          className="max-w-6xl mx-auto px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em" }}>
              SERVICES
            </span>
            {[
              "API Gateway",
              "DNS Resolver",
              "Header Parser",
              "Bundle Analyzer",
              "Perf Auditor",
            ].map((s) => (
              <div key={s} className="service-chip">
                <div className="service-chip-dot" />
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row — legal + meta */}
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.03em" }}>
              © {year} StackLens. Built for developers.
            </p>

            <div className="flex items-center gap-3">
              <a href="/privacy"  className="footer-link">Privacy</a>
              <span className="footer-divider">·</span>
              <a href="/terms"    className="footer-link">Terms</a>
              <span className="footer-divider">·</span>
              <a href="/status"   className="footer-link">Status</a>
              <span className="footer-divider">·</span>
              <a
                href="https://github.com/Shanidhya01"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 12, height: 12 }}>
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                GitHub
              </a>
            </div>

          </div>
        </div>
      </footer>
    </>
  );
}