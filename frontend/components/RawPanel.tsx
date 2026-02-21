"use client";

import { useState } from "react";

interface Props {
  data: any;
}

function highlight(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            // key
            return `<span style="color:#93c5fd">${match}</span>`;
          }
          // string value
          return `<span style="color:#34d399">${match}</span>`;
        }
        if (/true|false/.test(match)) {
          return `<span style="color:#fbbf24">${match}</span>`;
        }
        if (/null/.test(match)) {
          return `<span style="color:#f87171">${match}</span>`;
        }
        // number
        return `<span style="color:#c084fc">${match}</span>`;
      }
    );
}

export default function RawPanel({ data }: Props) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const raw = JSON.stringify(data, null, 2);
  const highlighted = highlight(raw);
  const lines = highlighted.split("\n");
  const byteSize = new TextEncoder().encode(raw).length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stacklens-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&display=swap');

        .raw-panel {
          background: rgba(0,0,0,0.45);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          overflow: hidden;
          font-family: 'IBM Plex Mono', monospace;
        }

        .raw-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .raw-action {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          letter-spacing: 0.06em;
          padding: 5px 12px;
          border-radius: 5px;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.5);
          font-family: 'IBM Plex Mono', monospace;
          transition: all 0.15s;
        }
        .raw-action:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.85);
          border-color: rgba(255,255,255,0.15);
        }
        .raw-action.success {
          background: rgba(52,211,153,0.08);
          border-color: rgba(52,211,153,0.25);
          color: #34d399;
        }

        .raw-scroll {
          overflow: auto;
          max-height: 520px;
        }

        .raw-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
          line-height: 1.7;
        }

        .line-num {
          user-select: none;
          text-align: right;
          padding: 0 14px 0 16px;
          color: rgba(255,255,255,0.15);
          font-size: 11px;
          min-width: 42px;
          border-right: 1px solid rgba(255,255,255,0.05);
          vertical-align: top;
        }

        .line-code {
          padding: 0 20px 0 16px;
          white-space: pre;
          color: rgba(255,255,255,0.7);
        }

        tr:hover .line-num  { color: rgba(255,255,255,0.35); }
        tr:hover .line-code { background: rgba(255,255,255,0.015); }

        .meta-chip {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 4px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.06em;
          font-family: 'IBM Plex Mono', monospace;
        }
      `}</style>

      <div className="raw-panel">
        {/* Toolbar */}
        <div className="raw-toolbar">
          <div className="flex items-center gap-3">
            {/* Traffic lights */}
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
            </div>
            <span className="meta-chip">JSON</span>
            <span className="meta-chip">{lines.length} lines</span>
            <span className="meta-chip">{byteSize < 1024 ? `${byteSize} B` : `${(byteSize / 1024).toFixed(1)} KB`}</span>
          </div>

          <div className="flex gap-2">
            <button onClick={handleCopy} className={`raw-action ${copied ? "success" : ""}`}>
              {copied ? (
                <>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}>
                    <path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 12, height: 12 }}>
                    <rect x="5" y="5" width="9" height="9" rx="1.5" />
                    <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" strokeLinecap="round" />
                  </svg>
                  Copy
                </>
              )}
            </button>

            <button onClick={handleDownload} className="raw-action">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 12, height: 12 }}>
                <path d="M8 2v8M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" strokeLinecap="round" />
              </svg>
              Download
            </button>
          </div>
        </div>

        {/* Code body */}
        <div className="raw-scroll">
          <table className="raw-table">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i}>
                  <td className="line-num">{i + 1}</td>
                  <td
                    className="line-code"
                    dangerouslySetInnerHTML={{ __html: line || " " }}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}