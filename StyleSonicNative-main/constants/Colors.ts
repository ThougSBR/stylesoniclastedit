
/**
 * Below are the colors that are used in the app. The colors are defined for both light and dark modes.
 * The colors are structured under "light" and "dark" to support theme switching in the app.
 * 
 * There are many other ways to style your app, such as using libraries like:
 * - [Nativewind](https://www.nativewind.dev/)
 * - [Tamagui](https://tamagui.dev/)
 * - [unistyles](https://reactnativeunistyles.vercel.app)
 */

// Defining the primary tint colors for light and dark mode
const tintColorLight = '#0a7ea4'; // Light mode accent color
const tintColorDark = '#fff'; // Dark mode accent color

// Exporting a Colors object that contains the color definitions for both light and dark themes
export const Colors = {
  light: {
    text: '#11181C', // Text color for light mode
    background: '#fff', // Background color for light mode
    tint: tintColorLight, // Accent color for light mode
    icon: '#687076', // Icon color for light mode
    tabIconDefault: '#687076', // Default tab icon color for light mode
    tabIconSelected: tintColorLight, // Selected tab icon color for light mode
  },
  dark: {
    text: '#ECEDEE', // Text color for dark mode
    background: '#151718', // Background color for dark mode
    tint: tintColorDark, // Accent color for dark mode
    icon: '#9BA1A6', // Icon color for dark mode
    tabIconDefault: '#9BA1A6', // Default tab icon color for dark mode
    tabIconSelected: tintColorDark, // Selected tab icon color for dark mode
  },
};
