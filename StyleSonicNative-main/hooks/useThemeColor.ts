/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors'; // Importing the Colors object, which contains light and dark mode colors
import { useColorScheme } from '@/hooks/useColorScheme'; // Custom hook to get the current color scheme (light or dark)

/**
 * A custom hook that returns the correct color based on the current theme (light or dark).
 * It first checks if a color has been provided in the `props`. If no color is provided,
 * it falls back to the `Colors` object to get the default theme color.
 *
 * @param props - Object that may contain custom colors for light and dark themes.
 * @param colorName - The color key (name) that corresponds to a color in the Colors object.
 * @returns The appropriate color based on the current theme.
 */
export function useThemeColor(
  props: { light?: string; dark?: string }, // The colors passed in as props for light and dark themes
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark // The key to retrieve the color from the Colors object
) {
  const theme = useColorScheme() ?? 'light'; // Get the current theme (light or dark), defaulting to 'light'
  const colorFromProps = props[theme]; // Check if the user provided a color for the current theme

  if (colorFromProps) {
    // If a color is provided in the props, use that color
    return colorFromProps;
  } else {
    // If no color is provided in the props, fall back to the color from the Colors object
    return Colors[theme][colorName];
  }
}
