import React, { useState } from "react";
import { TextInput, View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For password visibility toggle

interface CustomTextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  isPassword?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "number-pad";
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
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, isFocused && styles.focusedContainer]}>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showPassword}
        style={[
          styles.input,
          isFocused && styles.focusedInput,
          multiline && styles.multilineInput,
        ]}
        placeholderTextColor="#C2C2C2"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
      />
      {isPassword && (
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={22}
            color="#C2C2C2"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#C2C2C2",
    marginBottom: 12,
    position: "relative",
  },
  focusedContainer: {
    backgroundColor: "#2D3D33",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#A0A897",
  },
  input: {
    color: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    width: "100%", // Ensures full width
  },
  multilineInput: {
    textAlignVertical: "top",
    minHeight: 100,
  },
  focusedInput: {
    paddingVertical: 15,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 15, // Aligns vertically
  },
});

export default CustomTextInput;
