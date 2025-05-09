import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { signUp } from "../../services/authService";
import { useRouter } from "expo-router";
import CustomTextInput from "../../components/CustomTextInput";

const SignupScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!location || !bio || !gender) {
      alert("Please fill in all fields!");
      return;
    }
    try {
      await signUp(email, password, fullName, username, location, bio, gender);
      alert("Account Created Successfully!");
      if (gender === "Female") {
        router.replace("/profile/measurements");
      } else {
        router.replace("/");
      }
    } catch (error: any) {
      alert("Signup Failed: " + error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Register</Text>

          <CustomTextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />

          <CustomTextInput
            placeholder="Full name"
            value={fullName}
            onChangeText={setFullName}
          />

          <CustomTextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />

          <CustomTextInput
            placeholder="Location"
            value={location}
            onChangeText={setLocation}
          />

          <CustomTextInput
            placeholder="Bio"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
          />

          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "Male" && styles.selectedGender,
              ]}
              onPress={() => setGender("Male")}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === "Male" && styles.selectedGenderText,
                ]}
              >
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "Female" && styles.selectedGender,
              ]}
              onPress={() => setGender("Female")}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === "Female" && styles.selectedGenderText,
                ]}
              >
                Female
              </Text>
            </TouchableOpacity>
          </View>

          <CustomTextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            isPassword
          />
          <Text style={styles.passwordHint}>
            Must contain a number and at least 6 characters
          </Text>

          <CustomTextInput
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            isPassword
          />

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Create account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/auth/login")}
            style={styles.signInContainer}
          >
            <Text style={styles.signInText}>Already have an account?</Text>
            <Text style={styles.signInLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "#1C2C22",
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 20,
    fontFamily: "PlayfairDisplay",
  },
  passwordHint: {
    fontSize: 12,
    color: "#C2C2C2",
    marginBottom: 12,
    fontFamily: "Poppins",
  },
  button: {
    backgroundColor: "#A0A897",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1C2C22",
    fontFamily: "Poppins",
  },
  signInContainer: {
    marginTop: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signInText: {
    textAlign: "center",
    color: "#C2C2C2",
    marginLeft: 5,
    fontSize: 16,
  },
  signInLink: {
    fontSize: 16,
    color: "#FFC1A1",
    marginRight: 5,
    fontFamily: "PlayfairDisplay",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  genderButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#2C3E2D",
    marginHorizontal: 5,
    alignItems: "center",
  },
  selectedGender: {
    backgroundColor: "#A0A897",
  },
  genderText: {
    color: "#C2C2C2",
    fontSize: 16,
    fontFamily: "Poppins",
  },
  selectedGenderText: {
    color: "#1C2C22",
    fontWeight: "bold",
  },
});

export default SignupScreen;
