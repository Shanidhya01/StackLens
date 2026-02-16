import axios from "axios";
import * as cheerio from "cheerio";

export const crawHandler = async (req: any, res: any) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36",
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const scripts = $("script")
      .map((_, el) => $(el).attr("src"))
      .get()
      .filter(Boolean);

    const meta = $("meta")
      .map((_, el) => $(el).attr("name") || $(el).attr("property"))
      .get()
      .filter(Boolean);

    const links = $("link")
      .map((_, el) => $(el).attr("href"))
      .get()
      .filter(Boolean);

    res.json({
      statusCode: response.status,
      headers: response.headers,
      htmlSize: html.length,
      scripts,
      meta,
      links,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to crawl the website",
      message: error.message,
    });
  }
};
