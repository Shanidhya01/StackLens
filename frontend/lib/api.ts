const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const sanitizeErrorMessage = (input: unknown, fallback: string) => {
  const text = typeof input === "string" ? input : "";
  if (!text) {
    return fallback;
  }

  if (/<\s*!doctype html|<html[\s>]/i.test(text)) {
    return "Service unavailable right now (502). Please try again in a moment.";
  }

  return text.length > 300 ? `${text.slice(0, 300)}...` : text;
};

export const analyzeWebsite = async (url: string, userId?: string) => {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, userId }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const rawMessage = errorBody?.details || errorBody?.error;
    const message = sanitizeErrorMessage(rawMessage, "Failed to analyze website");
    throw new Error(message);
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

export const fetchHistoryById = async (id: string, userId: string) => {
  const searchParams = new URLSearchParams({ userId });
  const res = await fetch(`${API_BASE}/history/${id}?${searchParams.toString()}`);

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody?.error || "Failed to fetch scan details";
    throw new Error(message);
  }

  return res.json();
};