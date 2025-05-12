import { Text, type TextProps, StyleSheet } from 'react-native'; // Importing core components from React Native
import { useThemeColor } from '@/hooks/useThemeColor'; // Custom hook to get theme-specific colors

// Type definition for ThemedText props
export type ThemedTextProps = TextProps & {
  lightColor?: string; // Optional light mode color
  darkColor?: string; // Optional dark mode color
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link'; // Type of text style (e.g., title, subtitle)
};

// ThemedText component to render text with theme-specific color and styles
export function ThemedText({
  style, // Additional styles passed as prop
  lightColor, // Color for light mode
  darkColor, // Color for dark mode
  type = 'default', // Default text style type
  ...rest // Spread remaining props (such as children, onPress, etc.)
}: ThemedTextProps) {
  // Fetch the theme-specific color using the custom hook
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    // Render the Text component with the applied styles
    <Text
      style={[
        { color }, // Apply the theme color
        type === 'default' ? styles.default : undefined, // Apply default style if type is 'default'
        type === 'title' ? styles.title : undefined, // Apply title style if type is 'title'
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined, // Apply semi-bold style if type is 'defaultSemiBold'
        type === 'subtitle' ? styles.subtitle : undefined, // Apply subtitle style if type is 'subtitle'
        type === 'link' ? styles.link : undefined, // Apply link style if type is 'link'
        style, // Allow for custom styles passed via the `style` prop
      ]}
      {...rest} // Spread additional props (such as children, event handlers, etc.)
    />
  );
}

// Define the different styles for each text type
const styles = StyleSheet.create({
  default: {
    fontSize: 16, // Default font size
    lineHeight: 24, // Default line height
  },
  defaultSemiBold: {
    fontSize: 16, // Same font size as default
    lineHeight: 24, // Same line height as default
    fontWeight: '600', // Semi-bold font weight
  },
  title: {
    fontSize: 32, // Larger font size for title
    fontWeight: 'bold', // Bold font weight
    lineHeight: 32, // Same line height as font size
  },
  subtitle: {
    fontSize: 20, // Medium font size for subtitle
    fontWeight: 'bold', // Bold font weight for subtitle
  },
  link: {
    lineHeight: 30, // Adjusted line height for links
    fontSize: 16, // Font size for links
    color: '#0a7ea4', // Blue color for link text
  },
});

