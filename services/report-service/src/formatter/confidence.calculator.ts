export const calculateOverallScore = (
  detectionConfidence: number,
  performanceScore: number
) => {
  return Math.round((detectionConfidence + performanceScore) / 2);
};