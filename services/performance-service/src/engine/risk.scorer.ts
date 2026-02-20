export const calculatePerformanceScore = (
  ...scores: number[]
) => {
  const base = 100;
  const penalty = scores.reduce((a, b) => a + b, 0);

  return Math.max(base - penalty, 0);
};