import ScoreBadge from "./ScoreBadge";
import { ScanResult } from "@/types";

interface Props {
  data: ScanResult;
}

export default function ReportCard({ data }: Props) {
  const { report, raw } = data;

  return (
    <div
      className="p-6 rounded-xl space-y-6"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <h2 className="text-xl font-semibold text-white">{report.summary}</h2>

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
    </div>
  );
}