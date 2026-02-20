export const detectCompression = (
  headers: Record<string, string>
) => {
  const encoding = headers["content-encoding"] || "";

  if (encoding.includes("gzip") || encoding.includes("br")) {
    return { enabled: true, score: -10 };
  }

  return { enabled: false, score: 15 };
};