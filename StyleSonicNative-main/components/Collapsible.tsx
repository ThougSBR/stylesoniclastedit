import { PropsWithChildren, useState } from 'react'; // Importing React and useState for managing state
import { StyleSheet, TouchableOpacity } from 'react-native'; // Importing React Native components

import { ThemedText } from '@/components/ThemedText'; // Importing custom themed text component
import { ThemedView } from '@/components/ThemedView'; // Importing custom themed view component
import { IconSymbol } from '@/components/ui/IconSymbol'; // Importing IconSymbol component for displaying icons
import { Colors } from '@/constants/Colors'; // Importing colors from the constants
import { useColorScheme } from '@/hooks/useColorScheme'; // Hook to get the current color scheme (light or dark)

// Collapsible component that shows or hides content when clicked
export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  // useState to control whether the content is open or closed
  const [isOpen, setIsOpen] = useState(false);

  // Get the current theme (light or dark)
  const theme = useColorScheme() ?? 'light';

  return (
    // Themed container for the collapsible component
    <ThemedView>
      {/* Touchable element for the collapsible heading */}
      <TouchableOpacity
        style={styles.heading} // Applying styles to the heading
        onPress={() => setIsOpen((value) => !value)} // Toggle the state on press to open/close
        activeOpacity={0.8} // Reduce opacity when the button is pressed
      >
        {/* Icon for collapsing/expanding, rotates based on whether the content is open or closed */}
        <IconSymbol
          name="chevron.right" // Icon name (chevron right)
          size={18} // Icon size
          weight="medium" // Icon weight (medium)
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon} // Icon color based on theme
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }} // Rotate icon if the content is open
        />

        {/* Title of the collapsible section */}
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>

      {/* Content that will only be shown when the section is open */}
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

// Styling for the collapsible component
const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row', // Layout the icon and title horizontally
    alignItems: 'center', // Vertically align the icon and title in the center
    gap: 6, // Space between the icon and title
  },
  content: {
    marginTop: 6, // Add space above the content when it's opened
    marginLeft: 24, // Indent the content to the right
  },
});

