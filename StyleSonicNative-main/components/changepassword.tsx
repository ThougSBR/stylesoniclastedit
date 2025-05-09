import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { changePassword } from "../services/authService";

const ChangePassword: React.FC = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      alert("Password changed successfully!");
      router.replace("/profile");
    } catch (error) {
      alert("Failed to change password: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.replace("/profile")}>
        <Text style={styles.backButton}>Back to Profile</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Change Password</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Current Password</Text>
        <TextInput
          secureTextEntry
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          secureTextEntry
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2C22",
    padding: 20,
    justifyContent: "center",
    fontFamily: "PlayfairDisplay",
  },
  backButton: {
    color: "#FFC1A1",
    marginBottom: 20,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#FFC1A1",
    fontFamily: "PlayfairDisplay",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: "#FFF",
    marginBottom: 10,
    fontFamily: "PlayfairDisplay",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 4,
    color: "#FFF",
  },
  button: {
    backgroundColor: "#A0A897",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1C2C22",
  },
});

export default ChangePassword;
