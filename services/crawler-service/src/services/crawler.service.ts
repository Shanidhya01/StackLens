import axios from "axios";
import { parseHTML } from "../parsers/html.parser";
import { extractUIPatterns } from "../parsers/uiPattern.parser";

export const crawlWebsite = async (url: string) => {
  const response = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  const html = response.data;

  const normalizedHeaders: Record<string, string> = {};
  Object.keys(response.headers).forEach((key) => {
    normalizedHeaders[key.toLowerCase()] = String(response.headers[key]);
  });

  const parsedData = parseHTML(html);
  const uiPatterns = extractUIPatterns(html);

  return {
    statusCode: response.status,
    headers: normalizedHeaders,
    htmlSize: html.length,
    ...parsedData,
    uiPatterns,
  };
};
