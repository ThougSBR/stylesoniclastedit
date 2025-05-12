// Define the possible body types that the function can return
export type BodyType =
  | "Triangle" // Pear shape, where hips are wider than shoulders
  | "Rectangle" // Balanced measurements, no defined waist
  | "Hourglass" // Defined waist, balanced bust and hips
  | "Apple" // Waist measurement close to or larger than bust/hips
  | "Inverted Triangle"; // Shoulders are wider than hips

/**
 * The `calculateBodyType` function determines a user's body type based on their bust, waist, hips, and shoulder measurements.
 *
 * @param bust - The user's bust measurement in centimeters
 * @param waist - The user's waist measurement in centimeters
 * @param hips - The user's hips measurement in centimeters
 * @param shoulders - The user's shoulders measurement in centimeters
 * @returns A string representing the user's body type (Triangle, Rectangle, Hourglass, Apple, Inverted Triangle)
 */
export const calculateBodyType = (
  bust: number, // Bust measurement
  waist: number, // Waist measurement
  hips: number, // Hips measurement
  shoulders: number // Shoulders measurement
): BodyType => {
  // Convert all input measurements to numbers
  const bustNum = Number(bust);
  const waistNum = Number(waist);
  const hipsNum = Number(hips);
  const shouldersNum = Number(shoulders);

  // Calculate ratios based on the measurements
  const bustToWaistRatio = bustNum / waistNum; // Ratio of bust to waist
  const hipsToWaistRatio = hipsNum / waistNum; // Ratio of hips to waist
  const shouldersToHipsRatio = shouldersNum / hipsNum; // Ratio of shoulders to hips

  // Determine body type based on the calculated ratios
  if (hipsToWaistRatio > 1.1 && shouldersToHipsRatio < 0.9) {
    // If hips are significantly wider than the waist and shoulders are narrower than hips, it's a "Triangle" (Pear shape)
    return "Triangle";
  } else if (bustToWaistRatio < 1.1 && hipsToWaistRatio < 1.1) {
    // If both bust-to-waist and hips-to-waist ratios are less than 1.1, it's a "Rectangle" body type (balanced measurements)
    return "Rectangle";
  } else if (bustToWaistRatio > 1.1 && hipsToWaistRatio > 1.1) {
    // If both bust-to-waist and hips-to-waist ratios are greater than 1.1, it's an "Hourglass" body type (defined waist)
    return "Hourglass";
  } else if (bustToWaistRatio > 1.1 && shouldersToHipsRatio > 1.1) {
    // If bust-to-waist ratio is high and shoulders are wider than hips, it's an "Inverted Triangle" body type
    return "Inverted Triangle";
  } else {
    // Default to "Apple" body type when none of the conditions above match (round shape with larger waist)
    return "Apple";
  }
};
