"use client";

import { useState } from "react";

interface Props {
  onScan: (url: string) => void;
  loading: boolean;
}

export default function ScanForm({ onScan, loading }: Props) {
  const [url, setUrl] = useState("");

  return (
    <div
      className="rounded-xl p-4 mb-6"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="flex flex-col sm:flex-row gap-3 items-stretch"
      >
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg flex-1"
          style={{
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span className="text-xs" style={{ color: "rgba(52,211,153,0.65)" }}>https://</span>
          <input
            className="flex-1 bg-transparent outline-none border-none text-sm"
            style={{ color: "rgba(255,255,255,0.9)" }}
            placeholder="enter any public URL to analyze..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onScan(url)}
          />
        </div>
        <button
          onClick={() => onScan(url)}
          disabled={loading || !url.trim()}
          className="px-6 py-3 rounded-md text-sm font-semibold tracking-wide"
          style={{
            background: loading || !url.trim() ? "rgba(52,211,153,0.35)" : "#34d399",
            color: "#04110d",
            boxShadow: loading || !url.trim() ? "none" : "0 0 24px rgba(52,211,153,0.2)",
            cursor: loading || !url.trim() ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {loading ? "Scanning..." : "Scan →"}
        </button>
      </div>
    </div>
  );
}