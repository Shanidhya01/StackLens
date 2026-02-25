import { Request, Response } from "express";
import { validateURL } from "../utils/urlValidator";
import { crawlWebsite } from "../services/crawler.service";

export const crawlHandler = async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url || !validateURL(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const result = await crawlWebsite(url);
    return res.json(result);
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 403) {
      return res.status(403).json({
        error: "Website blocked the request",
        message:
          "The target website returned 403 Forbidden. It may have bot protection that prevents scanning.",
      });
    }
    if (status === 429) {
      return res.status(429).json({
        error: "Rate limited by target website",
        message:
          "The target website is rate-limiting requests. Please try again later.",
      });
    }
    return res.status(500).json({
      error: "Failed to fetch website",
      message: error.message
    });
  }
};