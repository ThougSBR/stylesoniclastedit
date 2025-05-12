import { View, type ViewProps } from 'react-native'; // Importing View component and ViewProps for type safety from React Native
import { useThemeColor } from '@/hooks/useThemeColor'; // Custom hook to get theme-based colors

// Define the props that ThemedView component will accept, extending from ViewProps
export type ThemedViewProps = ViewProps & {
  lightColor?: string; // Optional prop to define light mode background color
  darkColor?: string; // Optional prop to define dark mode background color
};

// ThemedView component that adjusts its background color based on the theme
export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  // Use the custom hook to get the appropriate background color based on the current theme (light or dark)
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  // Return the View component with dynamic background color and passed style and other props
  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
