import React, { useState } from "react"; // Importing React and useState hook
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"; // Importing necessary components from React Native
import { login } from "../../services/authService"; // Importing login function from authService
import { useRouter } from "expo-router"; // Importing useRouter for navigation
import CustomTextInput from "../../components/CustomTextInput"; // Importing CustomTextInput component

const LoginScreen = () => {
  const router = useRouter(); // Initialize the router for navigation
  const [email, setEmail] = useState(""); // State to store email entered by the user
  const [password, setPassword] = useState(""); // State to store password entered by the user

  // Function to handle login
  const handleLogin = async () => {
    try {
      await login(email, password); // Call the login function with the provided email and password
      router.replace("/"); // Navigate to the home screen after successful login
    } catch (error: any) {
      alert("Login Failed: " + error.message); // Show an alert if login fails
    }
  };

  return (
    <View style={styles.container}>
      {/* App Title */}
      <Text style={styles.title}>Welcome to {"\n"} Style Sonic!</Text>
      <Text style={styles.subtitle}>where style meets you</Text>

      {/* Label for sign-in */}
      <Text style={styles.label}>Sign in</Text>

      {/* Custom TextInput for Email */}
      <CustomTextInput
        placeholder="Username, Email or Phone Number" // Placeholder text
        value={email} // Bind input value to email state
        onChangeText={setEmail} // Update email state when text changes
      />

      {/* Custom TextInput for Password */}
      <CustomTextInput
        placeholder="Password" // Placeholder text
        value={password} // Bind input value to password state
        onChangeText={setPassword} // Update password state when text changes
        secureTextEntry // Ensure password is hidden
        isPassword // Custom flag for password input type
      />

      {/* Forgot Password Link */}
      <TouchableOpacity onPress={() => router.push("/auth/forgot-password")}>
        <Text style={styles.forgotPassword}>Forgot your password?</Text>
      </TouchableOpacity>

      {/* Sign-in Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      {/* Link to Sign-Up screen */}
      <TouchableOpacity
        onPress={() => router.push("/auth/signup")}
        style={styles.signupContainer}
      >
        <Text style={styles.signupText}>Don't have an account?</Text>
        <Text style={styles.signupLink}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the LoginScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2C22", // Dark background for the screen
    padding: 20,
    justifyContent: "center", // Center the content vertically
    fontFamily: "PlayfairDisplay", // Custom font for the app
  },
  title: {
    fontSize: 50,
    textAlign: "center", // Center the title
    color: "#FFC1A1", // Light orange color for the title
    fontFamily: "PlayfairDisplay", // Custom font for the title
  },
  subtitle: {
    marginTop: 20,
    textAlign: "center", // Center the subtitle
    fontSize: 20,
    marginBottom: 30,
    letterSpacing: 1.5, // Add spacing between letters
    fontFamily: "PlayfairDisplay", // Custom font for the subtitle
    color: "#FFC1A1", // Light orange color for the subtitle
  },
  label: {
    fontSize: 18,
    color: "#FFF", // White text color for label
    marginBottom: 10,
    fontFamily: "PlayfairDisplay", // Custom font for the label
  },
  forgotPassword: {
    textAlign: "right", // Align text to the right
    color: "#C2C2C2", // Light gray color for the forgot password link
    fontSize: 12,
    marginBottom: 20, // Add margin to the bottom
  },
  button: {
    backgroundColor: "#A0A897", // Light gray-green background for the sign-in button
    padding: 15,
    borderRadius: 8, // Rounded corners for the button
    alignItems: "center", // Center the button text horizontally
  },
  buttonText: {
    fontWeight: "bold", // Bold text for the button
    fontSize: 16,
    color: "#1C2C22", // Dark color for the button text
  },
  signupContainer: {
    marginTop: 20,
    display: "flex",
    flexDirection: "row", // Horizontal layout for text and link
    justifyContent: "space-between", // Space between the two texts
  },
  signupText: {
    textAlign: "center",
    color: "#C2C2C2", // Light gray color for the "Don't have an account?" text
    marginLeft: 5,
    fontSize: 16,
  },
  signupLink: {
    fontSize: 16,
    color: "#FFC1A1", // Light orange color for the "Sign up" link
    fontFamily: "PlayfairDisplay", // Custom font for the sign-up link
    marginLeft: 5,
  },
});

export default LoginScreen;

