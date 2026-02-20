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
    return res.status(500).json({
      error: "Failed to fetch website",
      message: error.message
    });
  }
};