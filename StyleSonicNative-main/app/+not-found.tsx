import { Link, Stack } from 'expo-router'; // Importing routing components from expo-router
import { StyleSheet } from 'react-native'; // Importing StyleSheet for custom styles

import { ThemedText } from '@/components/ThemedText'; // Custom themed text component
import { ThemedView } from '@/components/ThemedView'; // Custom themed view component

// Default function for the NotFoundScreen component
export default function NotFoundScreen() {
  return (
    <>
      {/* Stack screen header title */}
      <Stack.Screen options={{ title: 'Oops!' }} />

      {/* ThemedView: Custom view that applies a theme to the layout */}
      <ThemedView style={styles.container}>
        
        {/* ThemedText: Displays the message that the screen does not exist */}
        <ThemedText type="title">This screen doesn't exist.</ThemedText>

        {/* Link: Navigates to the home screen when clicked */}
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

// Custom styles using StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the container takes up full height
    alignItems: 'center', // Center content horizontally
    justifyContent: 'center', // Center content vertically
    padding: 20, // Add padding to the container
  },
  link: {
    marginTop: 15, // Add space above the link
    paddingVertical: 15, // Add vertical padding around the link
  },
});

