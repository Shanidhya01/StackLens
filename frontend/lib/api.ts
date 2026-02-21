const API_BASE = "http://localhost:5000";

export const analyzeWebsite = async (url: string) => {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    throw new Error("Failed to analyze website");
  }

  return res.json();
};

export const fetchHistory = async () => {
  const res = await fetch(`${API_BASE}/history`);
  return res.json();
};