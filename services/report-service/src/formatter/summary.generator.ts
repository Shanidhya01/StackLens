export const generateSummary = (
  framework: string,
  hosting: string,
  rendering: string,
  uiPatterns?: any
) => {

  let uiInfo = "";

  if (uiPatterns?.hasHeroSection)
    uiInfo += " A hero section is present.";

  if (uiPatterns?.formCount > 0)
    uiInfo += ` Contains ${uiPatterns.formCount} forms.`;

  if (uiPatterns?.isSPA)
    uiInfo += " SPA behavior detected.";

  return `The website appears to use ${framework}, hosted on ${hosting}, following ${rendering}.${uiInfo}`;
};