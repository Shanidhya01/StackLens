export const detectFramework = (scripts: string[] = []) => {
  const scriptString = scripts.join(" ").toLowerCase();

  if (scriptString.includes("_next")) {
    return { name: "Next.js", score: 25 };
  }

  if (scriptString.includes("react")) {
    return { name: "React", score: 15 };
  }

  if (scriptString.includes("vue")) {
    return { name: "Vue", score: 20 };
  }

  if (scriptString.includes("angular")) {
    return { name: "Angular", score: 20 };
  }

  return { name: "Unknown", score: 0 };
};