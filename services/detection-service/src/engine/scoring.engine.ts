export const calculateConfidence = (...scores: number[]) => {
  const base = 50;
  const total = scores.reduce((a, b) => a + b, 0);
  return Math.min(base + total, 100);
};