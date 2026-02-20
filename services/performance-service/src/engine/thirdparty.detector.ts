export const detectThirdPartyRisk = (
  scripts: string[]
) => {
  const riskyDomains = [
    "googletagmanager",
    "analytics",
    "doubleclick",
    "facebook"
  ];

  let count = 0;

  scripts.forEach(script => {
    if (riskyDomains.some(domain => script.includes(domain))) {
      count++;
    }
  });

  if (count === 0)
    return { level: "Low", score: 5 };

  if (count < 3)
    return { level: "Moderate", score: 15 };

  return { level: "High", score: 25 };
};