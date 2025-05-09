import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { resetPassword } from "../../services/authService";
import { useRouter } from "expo-router";

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    try {
      const message = await resetPassword(email);
      Alert.alert("Success", message);
      router.replace("/auth/login");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter your email to reset your password.
      </Text>

      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#C2C2C2"
      />

      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/auth/login")}>
        <Text style={styles.loginLink}>Back to Login</Text>
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
  },
  title: {
    fontSize: 24,
    fontFamily: "PlayfairDisplay",
    color: "#FFF",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins",
    color: "#C2C2C2",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "transparent",
    borderBottomWidth: 1.5,
    borderBottomColor: "#C2C2C2",
    color: "#FFF",
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#A0A897",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Poppins",
    fontWeight: "bold",
    color: "#1C2C22",
  },
  loginLink: {
    textAlign: "center",
    color: "#FFC1A1",
    fontFamily: "Poppins",
    fontWeight: "bold",
    marginTop: 20,
  },
});

export default ForgotPasswordScreen;
