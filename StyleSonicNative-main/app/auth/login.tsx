import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { login } from "../../services/authService";
import { useRouter } from "expo-router";
import CustomTextInput from "../../components/CustomTextInput";

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace("/");
    } catch (error: any) {
      alert("Login Failed: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to {"\n"} Style Sonic!</Text>
      <Text style={styles.subtitle}>where style meets you</Text>

      <Text style={styles.label}>Sign in</Text>

      <CustomTextInput
        placeholder="Username, Email or Phone Number"
        value={email}
        onChangeText={setEmail}
      />

      <CustomTextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        isPassword
      />

      <TouchableOpacity onPress={() => router.push("/auth/forgot-password")}>
        <Text style={styles.forgotPassword}>Forgot your password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2C22",
    padding: 20,
    justifyContent: "center",
    fontFamily: "PlayfairDisplay",
  },
  title: {
    fontSize: 50,
    textAlign: "center",
    color: "#FFC1A1",
    fontFamily: "PlayfairDisplay",
  },
  subtitle: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 20,
    marginBottom: 30,
    letterSpacing: 1.5,
    fontFamily: "PlayfairDisplay",
    color: "#FFC1A1",
  },
  label: {
    fontSize: 18,
    color: "#FFF",
    marginBottom: 10,
    fontFamily: "PlayfairDisplay",
  },
  forgotPassword: {
    textAlign: "right",
    color: "#C2C2C2",
    fontSize: 12,
    marginBottom: 20,
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
  signupContainer: {
    marginTop: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signupText: {
    textAlign: "center",
    color: "#C2C2C2",
    marginLeft: 5,
    fontSize: 16,
  },
  signupLink: {
    fontSize: 16,
    color: "#FFC1A1",
    fontFamily: "PlayfairDisplay",
    marginLeft: 5,
  },
});

export default LoginScreen;
