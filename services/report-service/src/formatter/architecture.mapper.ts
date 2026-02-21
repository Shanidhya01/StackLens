export const calculateArchitectureGrade = (confidence: number) => {
  if (confidence > 80) return "Strongly Identified Architecture";
  if (confidence > 60) return "Moderately Identified Architecture";
  return "Low Confidence Architecture Detection";
};