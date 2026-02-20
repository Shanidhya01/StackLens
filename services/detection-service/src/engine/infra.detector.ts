export const detectHosting = (headers: any = {}) => {
  const serverHeader = (headers.server || "").toLowerCase();

  if (headers["x-vercel-id"]) {
    return { name: "Vercel", score: 15 };
  }

  if (serverHeader.includes("cloudflare")) {
    return { name: "Cloudflare", score: 15 };
  }

  if (serverHeader.includes("github")) {
    return { name: "GitHub Infrastructure", score: 10 };
  }

  return { name: "Unknown", score: 0 };
};