import { useRouter } from "next/navigation";

interface HistoryItem {
  _id: string;
  url: string;
  scannedAt: string;
  framework?: string;
  hosting?: string;
  renderMode?: string;
  score?: number;
}

interface Props {
  history: HistoryItem[];
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 90 ? "#34d399" : score >= 70 ? "#fbbf24" : "#f87171";
  const circumference = 94.2;
  return (
    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90 absolute">
        <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
        <circle
          cx="18" cy="18" r="15"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <span style={{ fontSize: "9px", fontWeight: 700, color, fontFamily: "'IBM Plex Mono', monospace", position: "relative" }}>
        {score}
      </span>
    </div>
  );
}

function RenderBadge({ mode }: { mode: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    "Hybrid SSR":  { bg: "rgba(99,102,241,0.12)",  color: "#818cf8" },
    "SSG + ISR":   { bg: "rgba(52,211,153,0.10)",  color: "#34d399" },
    "CSR + SWR":   { bg: "rgba(251,191,36,0.10)",  color: "#fbbf24" },
    "CSR":         { bg: "rgba(251,191,36,0.10)",  color: "#fbbf24" },
    "SSR":         { bg: "rgba(139,92,246,0.12)",  color: "#a78bfa" },
    "SSG":         { bg: "rgba(52,211,153,0.10)",  color: "#34d399" },
  };
  const s = styles[mode] || { bg: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" };
  return (
    <span style={{
      fontSize: "10px",
      padding: "2px 8px",
      borderRadius: "4px",
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.color}22`,
      fontFamily: "'IBM Plex Mono', monospace",
      whiteSpace: "nowrap",
    }}>
      {mode}
    </span>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function EmptyState() {
  return (
    <div className="text-center py-20 rounded-xl" style={{ border: "1px dashed rgba(255,255,255,0.06)" }}>
      <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
        style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.1)" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#fff", marginBottom: 4 }}>
        No scans yet
      </p>
      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
        Your analysis history will appear here once you run your first scan.
      </p>
    </div>
  );
}

export default function HistoryList({ history }: Props) {
  const router = useRouter();

  if (!history.length) return <EmptyState />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Syne:wght@700&display=swap');

        .history-row {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 16px;
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
          cursor: pointer;
        }
        .history-row:last-child { border-bottom: none; }
        .history-row:hover { background: rgba(255,255,255,0.02); }

        @media (min-width: 640px) {
          .history-row {
            grid-template-columns: 2fr 1fr 1fr auto auto;
          }
        }

        .col-hide { display: none; }
        @media (min-width: 640px) { .col-hide { display: flex; } }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up {
          animation: fade-up 0.35s ease forwards;
        }
      `}</style>

      <div
        className="rounded-xl overflow-hidden fade-up"
        style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}
      >
        {/* Table header */}
        <div
          className="hidden sm:grid px-[18px] py-3 text-xs"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr auto auto",
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.12em",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          <span>URL</span>
          <span>FRAMEWORK</span>
          <span>RENDER</span>
          <span className="text-center">SCORE</span>
          <span className="text-right">SCANNED</span>
        </div>

        {/* Rows */}
        {history.map((item, i) => (
          <div
            key={item._id}
            className="history-row"
            style={{ animationDelay: `${i * 40}ms`, opacity: 0, animation: `fade-up 0.35s ease ${i * 40}ms forwards` }}
            onClick={() => router.push(`/histroy?id=${encodeURIComponent(item._id)}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(`/histroy?id=${encodeURIComponent(item._id)}`);
              }
            }}
          >
            {/* URL + hosting */}
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" style={{ width: 12, height: 12 }}>
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 2c0 0-2 2-2 6s2 6 2 6M8 2c0 0 2 2 2 6s-2 6-2 6M2 8h12" strokeLinecap="round" />
                </svg>
              </div>
              <div className="min-w-0">
                <p
                  className="text-white text-sm truncate"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", maxWidth: "220px" }}
                >
                  {item.url}
                </p>
                {item.hosting && (
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", fontFamily: "'IBM Plex Mono', monospace" }}>
                    {item.hosting}
                  </p>
                )}
              </div>
            </div>

            {/* Framework */}
            <div className="col-hide items-center">
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontFamily: "'IBM Plex Mono', monospace" }}>
                {item.framework ?? "—"}
              </span>
            </div>

            {/* Render mode */}
            <div className="col-hide items-center">
              {item.renderMode ? <RenderBadge mode={item.renderMode} /> : (
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", fontFamily: "'IBM Plex Mono', monospace" }}>—</span>
              )}
            </div>

            {/* Score */}
            <div className="flex items-center justify-center">
              {item.score != null ? (
                <ScoreRing score={item.score} />
              ) : (
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", fontFamily: "'IBM Plex Mono', monospace" }}>—</span>
              )}
            </div>

            {/* Time */}
            <div className="text-right">
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap" }}>
                {formatDate(item.scannedAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}