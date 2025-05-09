import React, { useState } from "react"; // Importing React and useState hook
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native"; // Importing necessary components from React Native
import { resetPassword } from "../../services/authService"; // Importing resetPassword function from auth service
import { useRouter } from "expo-router"; // Importing useRouter for navigation

const ForgotPasswordScreen = () => {
  const router = useRouter(); // Initialize router for navigation
  const [email, setEmail] = useState(""); // State to hold the user's email

  // Function to handle password reset process
  const handleResetPassword = async () => {
    try {
      // Call the resetPassword function from authService and pass the email
      const message = await resetPassword(email);
      Alert.alert("Success", message); // Show success message if reset is successful
      router.replace("/auth/login"); // Navigate to the login page after password reset
    } catch (error: any) {
      Alert.alert("Error", error.message); // Show error message if there's an issue
    }
  };

  return (
    <View style={styles.container}>
      {/* Screen title */}
      <Text style={styles.title}>Forgot Password?</Text>
      {/* Subtitle explaining the action */}
      <Text style={styles.subtitle}>
        Enter your email to reset your password.
      </Text>

      {/* Email input field */}
      <TextInput
        placeholder="Enter your email" // Placeholder for the input
        value={email} // Value of the input field bound to the state
        onChangeText={setEmail} // Update email state when text changes
        style={styles.input} // Apply input field styles
        placeholderTextColor="#C2C2C2" // Placeholder text color
      />

      {/* Button to trigger the password reset process */}
      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>

      {/* Link to navigate back to the login screen */}
      <TouchableOpacity onPress={() => router.replace("/auth/login")}>
        <Text style={styles.loginLink}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the ForgotPasswordScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2C22", // Dark background for the screen
    padding: 20,
    justifyContent: "center", // Center the content vertically
  },
  title: {
    fontSize: 24,
    fontFamily: "PlayfairDisplay", // Use custom font for title
    color: "#FFF", // White text color
    marginBottom: 10,
    textAlign: "center", // Center the title horizontally
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins", // Use custom font for subtitle
    color: "#C2C2C2", // Light gray color for subtitle text
    marginBottom: 20,
    textAlign: "center", // Center the subtitle horizontally
  },
  input: {
    backgroundColor: "transparent", // Transparent background for input field
    borderBottomWidth: 1.5,
    borderBottomColor: "#C2C2C2", // Light gray border for input field
    color: "#FFF", // White text color inside input
    padding: 15,
    fontSize: 16,
    marginBottom: 20, // Margin at the bottom for spacing
  },
  button: {
    backgroundColor: "#A0A897", // Light gray-green background for the button
    padding: 15,
    borderRadius: 8, // Rounded corners for the button
    alignItems: "center", // Center the button text
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Poppins", // Use custom font for button text
    fontWeight: "bold", // Bold button text
    color: "#1C2C22", // Dark color for button text
  },
  loginLink: {
    textAlign: "center", // Center the login link text
    color: "#FFC1A1", // Light orange color for the link
    fontFamily: "Poppins", // Use custom font for link
    fontWeight: "bold", // Bold text for the link
    marginTop: 20, // Add top margin for spacing
  },
});

export default ForgotPasswordScreen;
