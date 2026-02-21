import ScoreBadge from "./ScoreBadge";
import { ScanResult } from "@/types";

interface Props {
  data: ScanResult;
}

export default function ReportCard({ data }: Props) {
  const { report, raw } = data;

  return (
    <div className="bg-white p-6 rounded shadow-md space-y-6">
      <h2 className="text-xl font-semibold">{report.summary}</h2>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <p className="font-medium">Architecture</p>
          <p>{report.architectureGrade}</p>
        </div>

        <div>
          <p className="font-medium">Performance</p>
          <p>{report.performanceGrade}</p>
        </div>

        <div>
          <p className="font-medium">Overall Score</p>
          <ScoreBadge score={report.overallScore} />
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">UI Patterns</h3>
        <ul className="list-disc ml-5 space-y-1">
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