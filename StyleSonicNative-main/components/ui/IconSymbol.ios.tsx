import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols'; // Importing the SymbolView component and types from expo-symbols
import { StyleProp, ViewStyle } from 'react-native'; // Importing types for styling in React Native

// The IconSymbol component renders an icon using the SymbolView component from expo-symbols
export function IconSymbol({
  name,
  size = 24, // Default size of the icon is set to 24 if not provided
  color, // Color of the icon
  style, // Optional style prop for additional styling
  weight = 'regular', // Default weight of the icon is 'regular' if not specified
}: {
  name: SymbolViewProps['name']; // The name of the icon (a required prop)
  size?: number; // Optional size of the icon (default is 24)
  color: string; // The color of the icon (required prop)
  style?: StyleProp<ViewStyle>; // Optional style prop to override or add additional styles
  weight?: SymbolWeight; // Optional weight of the icon (e.g., 'regular', 'bold')
}) {
  return (
    // Render the SymbolView component with the appropriate props
    <SymbolView
      weight={weight} // Set the weight of the icon (light, regular, bold)
      tintColor={color} // Set the color of the icon using the tintColor prop
      resizeMode="scaleAspectFit" // Maintain aspect ratio while resizing
      name={name} // Set the name of the icon (the actual icon to display)
      style={[
        {
          width: size, // Set the width of the icon
          height: size, // Set the height of the icon
        },
        style, // Apply any additional styles passed via the style prop
      ]}
    />
  );
}
