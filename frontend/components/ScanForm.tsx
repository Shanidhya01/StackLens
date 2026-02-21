"use client";

import { useState } from "react";

interface Props {
  onScan: (url: string) => void;
  loading: boolean;
}

export default function ScanForm({ onScan, loading }: Props) {
  const [url, setUrl] = useState("");

  return (
    <div className="flex gap-3 mb-6">
      <input
        className="flex-1 p-3 border rounded"
        placeholder="Enter website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        onClick={() => onScan(url)}
        className="bg-black text-white px-6 py-3 rounded"
      >
        {loading ? "Scanning..." : "Scan"}
      </button>
    </div>
  );
}