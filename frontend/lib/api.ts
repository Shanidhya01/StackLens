const API_BASE = "http://localhost:5000";

export const analyzeWebsite = async (url: string, userId?: string) => {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, userId }),
  });

  if (!res.ok) {
    throw new Error("Failed to analyze website");
  }

  return res.json();
};

export const fetchHistory = async (userId?: string) => {
  const searchParams = new URLSearchParams();
  if (userId) {
    searchParams.set("userId", userId);
  }

  const query = searchParams.toString();
  const endpoint = query ? `${API_BASE}/history?${query}` : `${API_BASE}/history`;
  const res = await fetch(endpoint);

  if (!res.ok) {
    throw new Error("Failed to fetch history");
  }

  return res.json();
};