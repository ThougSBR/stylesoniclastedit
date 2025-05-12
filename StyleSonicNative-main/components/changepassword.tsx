import { useRouter } from "expo-router"; // Hook to navigate between screens
import React, { useState } from "react"; // React imports
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native"; // React Native components for UI
import { changePassword } from "../services/authService"; // Import the changePassword function from auth service

const ChangePassword: React.FC = () => {
  const router = useRouter(); // Initialize the router for screen navigation
  // State hooks to manage the form inputs
  const [currentPassword, setCurrentPassword] = useState(""); 
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Function to handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent form from reloading the page
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!"); // Alert if passwords do not match
      return;
    }
    try {
      // Call changePassword from authService to update the password
      await changePassword(currentPassword, newPassword);
      alert("Password changed successfully!"); // Notify user of success
      router.replace("/profile"); // Navigate back to profile page after success
    } catch (error) {
      alert("Failed to change password: " + error.message); // Show error message if change fails
    }
  };

  return (
    <View style={styles.container}>
      {/* Back button to navigate to profile page */}
      <TouchableOpacity onPress={() => router.replace("/profile")}>
        <Text style={styles.backButton}>Back to Profile</Text>
      </TouchableOpacity>
      
      {/* Title for the Change Password screen */}
      <Text style={styles.title}>Change Password</Text>
      
      {/* Input for current password */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Current Password</Text>
        <TextInput
          secureTextEntry
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
      </View>
      
      {/* Input for new password */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          secureTextEntry
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
        />
      </View>
      
      {/* Input for confirming new password */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>
      
      {/* Submit button to handle password change */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the ChangePassword screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2C22", // Dark background color
    padding: 20,
    justifyContent: "center", // Vertically center the content
    fontFamily: "PlayfairDisplay", // Custom font for the screen
  },
  backButton: {
    color: "#FFC1A1", // Light color for back button
    marginBottom: 20,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center", // Center align the title
    color: "#FFC1A1", // Light color for title
    fontFamily: "PlayfairDisplay", // Custom font for the title
  },
  inputContainer: {
    marginBottom: 20, // Space below each input field
  },
  label: {
    fontSize: 18,
    color: "#FFF", // White color for label text
    marginBottom: 10, // Space below the label
    fontFamily: "PlayfairDisplay", // Custom font for label
  },
  input: {
    borderWidth: 1, // Border around the input field
    borderColor: "#ccc", // Light border color
    padding: 10, // Padding inside the input field
    borderRadius: 4, // Rounded corners for the input field
    color: "#FFF", // White color for input text
  },
  button: {
    backgroundColor: "#A0A897", // Button background color
    padding: 15, // Padding inside the button
    borderRadius: 8, // Rounded corners for the button
    alignItems: "center", // Center-align text inside the button
  },
  buttonText: {
    fontWeight: "bold", // Bold text for the button
    fontSize: 16,
    color: "#1C2C22", // Dark color for the button text
  },
});


