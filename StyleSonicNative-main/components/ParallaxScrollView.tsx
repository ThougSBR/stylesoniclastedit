import type { PropsWithChildren, ReactElement } from 'react'; // Importing types for props
import { StyleSheet } from 'react-native'; // Importing StyleSheet for custom styles
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated'; // Importing Reanimated functions for animation effects

import { ThemedView } from '@/components/ThemedView'; // Custom themed view component
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground'; // Hook to manage overflow of the tab bar
import { useColorScheme } from '@/hooks/useColorScheme'; // Hook to get the current color scheme (light/dark)

const HEADER_HEIGHT = 250; // Constant for header height

// Props type definition for the ParallaxScrollView component
type Props = PropsWithChildren<{
  headerImage: ReactElement; // The image element for the header
  headerBackgroundColor: { dark: string; light: string }; // Background color for the header based on color scheme
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light'; // Get the current color scheme, default to light
  const scrollRef = useAnimatedRef<Animated.ScrollView>(); // Create a reference for the scroll view
  const scrollOffset = useScrollViewOffset(scrollRef); // Get the current scroll offset
  const bottom = useBottomTabOverflow(); // Get the bottom tab overflow value

  // Animated header style that changes based on scroll position
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        // Parallax effect for translating the header vertically based on scroll
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        // Scale effect for the header as the user scrolls
        {
          scale: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [2, 1, 1]
          ),
        },
      ],
    };
  });

  return (
    // ThemedView container for the whole component, applying light/dark theme
    <ThemedView style={styles.container}>
      {/* ScrollView with animated scroll offset */}
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16} // Throttle scroll events for smoother performance
        scrollIndicatorInsets={{ bottom }} // Set the bottom inset for the scroll indicator
        contentContainerStyle={{ paddingBottom: bottom }}> {/* Content padding for bottom */}
        
        {/* Animated header that moves and scales based on scroll */}
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] }, // Set header background color based on the color scheme
            headerAnimatedStyle, // Apply animated style to the header
          ]}>
          {headerImage} {/* Render the header image */}
        </Animated.View>
        
        {/* Content section, the rest of the page content */}
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

// Styles for the ParallaxScrollView component
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures the container takes full height
  },
  header: {
    height: HEADER_HEIGHT, // Set the fixed height for the header
    overflow: 'hidden', // Hide any content that overflows outside the header container
  },
  content: {
    flex: 1, // Ensure the content section fills the remaining space
    padding: 32, // Add padding around the content
    gap: 16, // Space between elements in the content
    overflow: 'hidden', // Prevent content from overflowing outside the container
  },
});
