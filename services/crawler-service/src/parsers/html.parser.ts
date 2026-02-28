import * as cheerio from "cheerio";

export const parseHTML = (html: string) => {
  const $ = cheerio.load(html);

  const scripts = $("script")
    .map((_, el) => {
      const src = $(el).attr("src");
      if (src) {
        return src;
      }

      const id = $(el).attr("id") || "";
      const type = $(el).attr("type") || "";
      const inlineBody = ($(el).html() || "")
        .replace(/\s+/g, " ")
        .slice(0, 350);

      return `${id} ${type} ${inlineBody}`.trim();
    })
    .get()
    .filter(Boolean);

  const meta = $("meta")
    .map((_, el) => {
      const key = $(el).attr("name") || $(el).attr("property") || "";
      const content = $(el).attr("content") || "";
      return `${key} ${content}`.trim();
    })
    .get()
    .filter(Boolean);

  const links = $("link")
    .map((_, el) => $(el).attr("href"))
    .get()
    .filter(Boolean);

  return { scripts, meta, links };
};
