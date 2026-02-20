import * as cheerio from "cheerio";

export const parseHTML = (html: string) => {
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

  return { scripts, meta, links };
};