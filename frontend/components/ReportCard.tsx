import ScoreBadge from "./ScoreBadge";
import { ScanResult } from "@/types";
import jsPDF from "jspdf";

interface Props {
  data: ScanResult;
}

export default function ReportCard({ data }: Props) {
  const { report, raw } = data;

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

    if (report.metrics) {
      y += 3;
      write(`Lighthouse Performance: ${report.metrics.performance}`);
      write(`SEO: ${report.metrics.seo}`);
      write(`Accessibility: ${report.metrics.accessibility}`);
      write(`Best Practices: ${report.metrics.bestPractices}`);
    }

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

      {!!report.metrics && (
        <div>
          <h3 className="font-semibold mb-3 text-white">Lighthouse</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="rounded-md p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ color: "rgba(255,255,255,0.5)" }}>Performance</p>
              <p className="text-white font-semibold">{report.metrics.performance}</p>
            </div>
            <div className="rounded-md p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ color: "rgba(255,255,255,0.5)" }}>SEO</p>
              <p className="text-white font-semibold">{report.metrics.seo}</p>
            </div>
            <div className="rounded-md p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ color: "rgba(255,255,255,0.5)" }}>Accessibility</p>
              <p className="text-white font-semibold">{report.metrics.accessibility}</p>
            </div>
            <div className="rounded-md p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ color: "rgba(255,255,255,0.5)" }}>Best Practices</p>
              <p className="text-white font-semibold">{report.metrics.bestPractices}</p>
            </div>
          </div>
        </div>
      )}

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

      {!!(report.stackInsights?.detectedTechnologies?.length || raw.detection?.detectedTechnologies?.length) && (
        <div>
          <h3 className="font-semibold mb-3 text-white">Detected Technologies</h3>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
            {(report.stackInsights?.detectedTechnologies || raw.detection?.detectedTechnologies || []).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}