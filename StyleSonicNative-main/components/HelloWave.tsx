import { useEffect } from 'react'; // Importing React hooks
import { StyleSheet } from 'react-native'; // Importing StyleSheet for custom styles
import Animated, {
  useSharedValue, // For shared values that can be used across animations
  useAnimatedStyle, // For applying animated styles
  withTiming, // To create timed animations
  withRepeat, // To repeat animations
  withSequence, // To sequence multiple animations together
} from 'react-native-reanimated'; // Importing reanimated library for animations

import { ThemedText } from '@/components/ThemedText'; // Custom ThemedText component for displaying text

// Main component for showing a waving hand emoji with animation
export function HelloWave() {
  // Create a shared value to track the rotation of the emoji (initial value is 0)
  const rotationAnimation = useSharedValue(0);

  // Using useEffect to trigger the animation once when the component mounts
  useEffect(() => {
    rotationAnimation.value = withRepeat(
      // The animation repeats a sequence 4 times
      withSequence(
        // Rotate the emoji 25 degrees over 150 milliseconds
        withTiming(25, { duration: 150 }),
        // Rotate it back to 0 degrees over another 150 milliseconds
        withTiming(0, { duration: 150 })
      ),
      4 // Repeat the animation 4 times
    );
  }, []);

  // Create an animated style that applies the rotation to the emoji
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationAnimation.value}deg` }], // Rotate the emoji based on the shared value
  }));

  // Return the animated view containing the waving emoji
  return (
    <Animated.View style={animatedStyle}> 
      <ThemedText style={styles.text}>👋</ThemedText> {/* The waving hand emoji */}
    </Animated.View>
  );
}

// Styles for the HelloWave component
const styles = StyleSheet.create({
  text: {
    fontSize: 28, // Font size for the emoji
    lineHeight: 32, // Line height for the emoji
    marginTop: -6, // Adjust the position of the emoji slightly upwards
  },
});
