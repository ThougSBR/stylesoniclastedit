import React, { useState } from "react"; // Importing React and useState hook
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"; // Importing necessary components from React Native
import { signUp } from "../../services/authService"; // Importing signUp function from authService
import { useRouter } from "expo-router"; // Importing useRouter for navigation
import CustomTextInput from "../../components/CustomTextInput"; // Importing CustomTextInput component

const SignupScreen = () => {
  const router = useRouter(); // Initialize the router for navigation
  const [email, setEmail] = useState(""); // State to store the user's email
  const [fullName, setFullName] = useState(""); // State to store the user's full name
  const [username, setUsername] = useState(""); // State to store the user's username
  const [password, setPassword] = useState(""); // State to store the user's password
  const [confirmPassword, setConfirmPassword] = useState(""); // State to store the user's confirm password
  const [location, setLocation] = useState(""); // State to store the user's location
  const [bio, setBio] = useState(""); // State to store the user's bio
  const [gender, setGender] = useState(""); // State to store the user's gender

  // Function to handle sign up process
  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!"); // Show an alert if passwords don't match
      return;
    }
    if (!location || !bio || !gender) {
      alert("Please fill in all fields!"); // Ensure all fields are filled before submitting
      return;
    }
    try {
      // Call the signUp function from authService
      await signUp(email, password, fullName, username, location, bio, gender);
      alert("Account Created Successfully!"); // Show success message
      if (gender === "Female") {
        router.replace("/profile/measurements"); // Redirect to measurements page for female users
      } else {
        router.replace("/"); // Redirect to the home page for male users
      }
    } catch (error: any) {
      alert("Signup Failed: " + error.message); // Show error message if signup fails
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
          {/* Title of the screen */}
          <Text style={styles.title}>Register</Text>

          {/* Custom TextInput for Email */}
          <CustomTextInput
            placeholder="Email" // Placeholder text
            value={email} // Bind the input value to email state
            onChangeText={setEmail} // Update email state when text changes
          />

          {/* Custom TextInput for Full Name */}
          <CustomTextInput
            placeholder="Full name" // Placeholder text
            value={fullName} // Bind the input value to fullName state
            onChangeText={setFullName} // Update fullName state when text changes
          />

          {/* Custom TextInput for Username */}
          <CustomTextInput
            placeholder="Username" // Placeholder text
            value={username} // Bind the input value to username state
            onChangeText={setUsername} // Update username state when text changes
          />

          {/* Custom TextInput for Location */}
          <CustomTextInput
            placeholder="Location" // Placeholder text
            value={location} // Bind the input value to location state
            onChangeText={setLocation} // Update location state when text changes
          />

          {/* Custom TextInput for Bio */}
          <CustomTextInput
            placeholder="Bio" // Placeholder text
            value={bio} // Bind the input value to bio state
            onChangeText={setBio} // Update bio state when text changes
            multiline // Allow multiple lines of text
            numberOfLines={3} // Set the number of lines for the text area
          />

          {/* Gender Selection */}
          <View style={styles.genderContainer}>
            {/* Gender selection button for Male */}
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "Male" && styles.selectedGender, // Style change when Male is selected
              ]}
              onPress={() => setGender("Male")} // Update gender state to Male
            >
              <Text
                style={[
                  styles.genderText,
                  gender === "Male" && styles.selectedGenderText, // Text style change when Male is selected
                ]}
              >
                Male
              </Text>
            </TouchableOpacity>

            {/* Gender selection button for Female */}
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "Female" && styles.selectedGender, // Style change when Female is selected
              ]}
              onPress={() => setGender("Female")} // Update gender state to Female
            >
              <Text
                style={[
                  styles.genderText,
                  gender === "Female" && styles.selectedGenderText, // Text style change when Female is selected
                ]}
              >
                Female
              </Text>
            </TouchableOpacity>
          </View>

          {/* Custom TextInput for Password */}
          <CustomTextInput
            placeholder="Password" // Placeholder text
            value={password} // Bind the input value to password state
            onChangeText={setPassword} // Update password state when text changes
            secureTextEntry // Ensure password is hidden
            isPassword // Custom flag for password input type
          />

          {/* Password hint */}
          <Text style={styles.passwordHint}>
            Must contain a number and at least 6 characters
          </Text>

          {/* Custom TextInput for Confirm Password */}
          <CustomTextInput
            placeholder="Confirm password" // Placeholder text
            value={confirmPassword} // Bind the input value to confirmPassword state
            onChangeText={setConfirmPassword} // Update confirmPassword state when text changes
            secureTextEntry // Ensure password is hidden
            isPassword // Custom flag for password input type
          />

          {/* Sign-Up Button */}
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Create account</Text>
          </TouchableOpacity>

          {/* Sign-In Link */}
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

// Styles for the SignupScreen
const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "#1C2C22", // Set background color for the screen
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center", // Center the content vertically
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFF", // White color for the title text
    marginBottom: 20,
    fontFamily: "PlayfairDisplay", // Use custom font for the title
  },
  passwordHint: {
    fontSize: 12,
    color: "#C2C2C2", // Light gray color for the password hint text
    marginBottom: 12,
    fontFamily: "Poppins", // Use custom font for the hint text
  },
  button: {
    backgroundColor: "#A0A897", // Background color for the sign-up button
    padding: 15,
    borderRadius: 8, // Rounded corners for the button
    alignItems: "center", // Center the button text horizontally
    marginTop: 10,
  },
  buttonText: {
    fontWeight: "bold", // Bold text for the button
    fontSize: 16,
    color: "#1C2C22", // Dark color for the button text
    fontFamily: "Poppins", // Use custom font for the button text
  },
  signInContainer: {
    marginTop: 20,
    display: "flex",
    flexDirection: "row", // Horizontal layout for text and link
    justifyContent: "space-between", // Space between the two texts
  },
  signInText: {
    textAlign: "center",
    color: "#C2C2C2", // Light gray color for the "Already have an account?" text
    marginLeft: 5,
    fontSize: 16,
  },
  signInLink: {
    fontSize: 16,
    color: "#FFC1A1", // Light orange color for the "Sign in" link
    marginRight: 5,
    fontFamily: "PlayfairDisplay", // Use custom font for the sign-in link
  },
  genderContainer: {
    flexDirection: "row", // Horizontal layout for gender selection
    justifyContent: "space-between", // Space between the two gender buttons
    marginBottom: 20,
  },
  genderButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8, // Rounded corners for gender selection buttons
    backgroundColor: "#2C3E2D", // Background color for gender selection buttons
    marginHorizontal: 5,
    alignItems: "center", // Center the gender text horizontally
  },
  selectedGender: {
    backgroundColor: "#A0A897", // Background color when the gender button is selected
  },
  genderText: {
    color: "#C2C2C2", // Light gray color for the gender text
    fontSize: 16,
    fontFamily: "Poppins", // Use custom font for the gender text
  },
  selectedGenderText: {
    color: "#1C2C22", // Dark color for the selected gender text
    fontWeight: "bold", // Bold text for the selected gender
  },
});

export default SignupScreen;

