export const detectRendering = (scripts: string[] = []) => {
  const scriptString = scripts.join(" ");

  if (scriptString.includes("_next")) {
    return "Hybrid (SSR + CSR)";
  }

  return "Likely CSR";
};