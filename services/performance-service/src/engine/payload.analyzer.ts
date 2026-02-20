export const analyzePayload = (
  htmlSize: number,
  scripts: string[]
) => {
  const estimatedScriptWeight = scripts.length * 50000;
  const total = htmlSize + estimatedScriptWeight;

  if (total < 300000)
    return { category: "Light", score: 10 };

  if (total < 800000)
    return { category: "Moderate", score: 20 };

  return { category: "Heavy", score: 35 };
};