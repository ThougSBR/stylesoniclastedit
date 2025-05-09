export type BodyType =
  | "Triangle"
  | "Rectangle"
  | "Hourglass"
  | "Apple"
  | "Inverted Triangle";

export const calculateBodyType = (
  bust: number,
  waist: number,
  hips: number,
  shoulders: number
): BodyType => {
  // Convert all measurements to numbers
  const bustNum = Number(bust);
  const waistNum = Number(waist);
  const hipsNum = Number(hips);
  const shouldersNum = Number(shoulders);

  // Calculate ratios
  const bustToWaistRatio = bustNum / waistNum;
  const hipsToWaistRatio = hipsNum / waistNum;
  const shouldersToHipsRatio = shouldersNum / hipsNum;

  // Determine body type based on ratios
  if (hipsToWaistRatio > 1.1 && shouldersToHipsRatio < 0.9) {
    return "Triangle"; // Pear shape - hips significantly wider than shoulders
  } else if (bustToWaistRatio < 1.1 && hipsToWaistRatio < 1.1) {
    return "Rectangle"; // Balanced measurements
  } else if (bustToWaistRatio > 1.1 && hipsToWaistRatio > 1.1) {
    return "Hourglass"; // Defined waist with balanced bust and hips
  } else if (bustToWaistRatio > 1.1 && shouldersToHipsRatio > 1.1) {
    return "Inverted Triangle"; // Shoulders wider than hips
  } else {
    return "Apple"; // Round shape - waist measurement close to or larger than bust/hips
  }
};
