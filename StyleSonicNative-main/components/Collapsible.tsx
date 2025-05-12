import React, { useState } from "react";
import { TextInput, View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Ionicons for password visibility toggle icon

// Interface for the props the component accepts
interface CustomTextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean; // Whether the text input is for password
  isPassword?: boolean; // Whether it's a password field that can toggle visibility
  multiline?: boolean; // Whether the input allows multiple lines
  numberOfLines?: number; // Number of lines for the multiline input
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "number-pad"; // Type of keyboard to show
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  isPassword = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = "default",
}) => {
  // State to manage if the input is focused and if the password is visible
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    // Container for the text input, adjusts styles based on focus state
    <View style={[styles.container, isFocused && styles.focusedContainer]}>
      <TextInput
        placeholder={placeholder} // Placeholder text for the input field
        value={value} // Current value of the input field
        onChangeText={onChangeText} // Function to update value when the user types
        secureTextEntry={secureTextEntry && !showPassword} // If it's a password field, toggle visibility based on state
        style={[
          styles.input,
          isFocused && styles.focusedInput, // Adjusts input field style when focused
          multiline && styles.multilineInput, // Adjusts input for multiline
        ]}
        placeholderTextColor="#C2C2C2" // Color for the placeholder text
        onFocus={() => setIsFocused(true)} // Set focused state to true when the input is focused
        onBlur={() => setIsFocused(false)} // Set focused state to false when the input loses focus
        multiline={multiline} // Allows multi-line input
        numberOfLines={numberOfLines} // Defines number of lines for the multiline input
        keyboardType={keyboardType} // Determines the type of keyboard shown
      />
      
      {/* If it's a password input, show the eye icon for visibility toggle */}
      {isPassword && (
        <TouchableOpacity
          style={styles.eyeIcon} // Style for the eye icon
          onPress={() => setShowPassword(!showPassword)} // Toggle the password visibility when clicked
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"} // Change icon based on visibility state
            size={22}
            color="#C2C2C2" // Color of the icon
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Styles for the CustomTextInput component
const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1.5, // Border at the bottom of the input field
    borderBottomColor: "#C2C2C2", // Border color for the input field
    marginBottom: 12, // Space below the input field
    position: "relative", // To position the eye icon correctly inside the input
  },
  focusedContainer: {
    backgroundColor: "#2D3D33", // Background color when the input is focused
    borderRadius: 8, // Rounded corners
    borderWidth: 1.5, // Border width when focused
    borderColor: "#A0A897", // Border color when focused
  },
  input: {
    color: "#FFF", // White text color
    paddingVertical: 10, // Vertical padding inside the input field
    paddingHorizontal: 10, // Horizontal padding inside the input field
    fontSize: 16, // Font size of the input text
    width: "100%", // Ensure the input takes up full width
  },
  multilineInput: {
    textAlignVertical: "top", // Aligns text to the top in multiline input
    minHeight: 100, // Minimum height for multiline input
  },
  focusedInput: {
    paddingVertical: 15, // Increased vertical padding when the input is focused
  },
  eyeIcon: {
    position: "absolute", // Position the icon inside the input
    right: 10, // Place the icon to the right of the input
    top: 15, // Vertically center the icon
  },
});

export default CustomTextInput;

