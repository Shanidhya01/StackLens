import * as cheerio from "cheerio";

export interface UIPatterns {
  hasNavbar: boolean;
  hasFooter: boolean;
  hasHeroSection: boolean;
  formCount: number;
  buttonCount: number;
  isSPA: boolean;
}

export const extractUIPatterns = (html: string): UIPatterns => {
  const $ = cheerio.load(html);

  const hasNavbar =
    $("nav").length > 0 ||
    $("[class*='nav']").length > 0;

  const hasFooter =
    $("footer").length > 0;

  const hasHeroSection =
    $("[class*='hero']").length > 0 ||
    $("section").first().text().length > 200;

  const formCount = $("form").length;
  const buttonCount = $("button").length;

  const isSPA =
    html.includes("id=\"root\"") ||
    html.includes("id=\"__next\"") ||
    html.includes("data-reactroot");

  return {
    hasNavbar,
    hasFooter,
    hasHeroSection,
    formCount,
    buttonCount,
    isSPA
  };
};