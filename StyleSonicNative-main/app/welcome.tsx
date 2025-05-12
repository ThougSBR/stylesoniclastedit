import { useRouter } from "expo-router"; // Hook for navigation between screens
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native"; // Importing components from React Native
import { Ionicons } from "@expo/vector-icons"; // Icon library for displaying icons

// Main component for the Welcome screen
export default function WelcomeScreen() {
  const router = useRouter(); // Using the router hook to navigate between screens

  // Function to handle the "Get Started" button click
  const handleGetStarted = () => {
    router.replace("/(tabs)"); // Navigate to the tabs screen when the user clicks "Get Started"
  };

  return (
    // The main container for the Welcome screen, centered content
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Welcome screen title */}
        <Text style={styles.title}>Welcome to StyleSonic</Text>
        
        {/* Subtitle below the title */}
        <Text style={styles.subtitle}>Your Personal Fashion Advisor</Text>

        {/* Section for features of the app */}
        <View style={styles.features}>
          {/* Feature 1: Personalized Style Analysis */}
          <View style={styles.feature}>
            <Ionicons name="color-palette" size={32} color="#FFC1A1" /> {/* Icon for style analysis */}
            <Text style={styles.featureText}>Personalized Style Analysis</Text>
          </View>

          {/* Feature 2: Smart Outfit Suggestions */}
          <View style={styles.feature}>
            <Ionicons name="shirt" size={32} color="#FFC1A1" /> {/* Icon for outfit suggestions */}
            <Text style={styles.featureText}>Smart Outfit Suggestions</Text>
          </View>

          {/* Feature 3: AI Fashion Advisor */}
          <View style={styles.feature}>
            <Ionicons name="chatbubble" size={32} color="#FFC1A1" /> {/* Icon for AI fashion advisor */}
            <Text style={styles.featureText}>AI Fashion Advisor</Text>
          </View>
        </View>

        {/* Button to get started */}
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styling for the WelcomeScreen component
const styles = StyleSheet.create({
  // Container for the whole screen, centered content
  container: {
    flex: 1, // Full height of the screen
    backgroundColor: "#1C2C22", // Dark background color
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
  },
  // Content container for title, subtitle, and features
  content: {
    width: "90%", // Content width set to 90% of screen width
    alignItems: "center", // Center-align all elements inside this container
  },
  // Title text style
  title: {
    fontSize: 32, // Large font size for title
    color: "#FFC1A1", // Light color for text
    fontFamily: "PlayfairDisplay", // Custom font family
    marginBottom: 10, // Space below the title
    textAlign: "center", // Center-align the title
  },
  // Subtitle text style
  subtitle: {
    fontSize: 18, // Smaller font size for subtitle
    color: "#FFC1A1", // Light color for subtitle
    marginBottom: 40, // Space below the subtitle
    textAlign: "center", // Center-align the subtitle
  },
  // Container for the features section
  features: {
    width: "100%", // Take up full width
    marginBottom: 40, // Space below the features section
  },
  // Individual feature styling (each feature is a row with icon and text)
  feature: {
    flexDirection: "row", // Display items in a row (icon + text)
    alignItems: "center", // Center the icon and text vertically
    backgroundColor: "#2C3E2D", // Dark background for the feature container
    padding: 15, // Padding inside the feature container
    borderRadius: 8, // Rounded corners
    marginBottom: 15, // Space below each feature
  },
  // Text style for feature names
  featureText: {
    color: "#FFC1A1", // Light color for feature text
    fontSize: 16, // Font size for feature text
    marginLeft: 15, // Space between icon and text
    fontFamily: "Poppins", // Custom font family
  },
  // Button style for the "Get Started" button
  button: {
    backgroundColor: "#FFC1A1", // Button background color
    paddingVertical: 15, // Vertical padding inside the button
    paddingHorizontal: 40, // Horizontal padding inside the button
    borderRadius: 8, // Rounded corners for the button
  },
  // Text style for the "Get Started" button text
  buttonText: {
    color: "#1C2C22", // Dark text color for the button
    fontSize: 18, // Font size for button text
    fontWeight: "bold", // Bold text for button text
  },
});
