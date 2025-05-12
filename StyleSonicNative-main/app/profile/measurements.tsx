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
import { useRouter } from "expo-router"; // Router for navigation
import CustomTextInput from "../../components/CustomTextInput"; // Custom input component
import { auth } from "../../services/firebaseConfig"; // Firebase authentication
import { doc, getFirestore, updateDoc } from "firebase/firestore"; // Firebase Firestore functions
import { calculateBodyType } from "../../utils/bodyTypeCalculator"; // Utility to calculate body type

const MeasurementsScreen = () => {
  // State hooks for storing user input for body measurements
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [bust, setBust] = useState("");
  const [shoulders, setShoulders] = useState("");

  // Router hook for navigation
  const router = useRouter();

  // Function to handle saving the measurements
  const handleSave = async () => {
    // Validation: Check if all fields are filled
    if (!waist || !hips || !bust || !shoulders) {
      alert("Please fill in all measurements!");
      return;
    }

    try {
      const user = auth.currentUser; // Get the current authenticated user
      if (!user) {
        throw new Error("No user is currently signed in.");
      }

      // Calculate the body type based on the measurements
      const bodyType = calculateBodyType(
        Number(bust),
        Number(waist),
        Number(hips),
        Number(shoulders)
      );

      const db = getFirestore(); // Get Firestore database reference
      const userRef = doc(db, "users", user.uid); // Reference to the user's document in Firestore
      await updateDoc(userRef, {
        measurements: {
          waist,
          hips,
          bust,
          shoulders,
        },
        bodyType, // Store the calculated body type
        updatedAt: new Date(), // Timestamp for when the measurements were updated
      });

      alert(`Measurements saved successfully! Your body type is: ${bodyType}`);
      router.replace("/analyser/main"); // Navigate to the analysis screen after saving
    } catch (error: any) {
      alert("Failed to save measurements: " + error.message); // Error handling if saving fails
    }
  };

  // Render the measurement input fields and save button
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust keyboard behavior for iOS and Android
      style={styles.keyboardAvoidingView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" // Allow tapping outside to dismiss the keyboard
      >
        <View style={styles.container}>
          <Text style={styles.title}>Body Measurements</Text>
          <Text style={styles.subtitle}>
            Please enter your measurements in centimeters (cm)
          </Text>

          <View style={styles.measurementsContainer}>
            {/* CustomTextInput is used for each measurement input */}
            <CustomTextInput
              placeholder="Waist measurement"
              value={waist}
              onChangeText={setWaist}
              keyboardType="numeric" // Ensure only numeric input
            />

            <CustomTextInput
              placeholder="Hips measurement"
              value={hips}
              onChangeText={setHips}
              keyboardType="numeric"
            />

            <CustomTextInput
              placeholder="Bust measurement"
              value={bust}
              onChangeText={setBust}
              keyboardType="numeric"
            />

            <CustomTextInput
              placeholder="Shoulders measurement"
              value={shoulders}
              onChangeText={setShoulders}
              keyboardType="numeric"
            />
          </View>

          {/* Save button to trigger handleSave */}
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Measurements</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Styles for the MeasurementsScreen component
const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "#1C2C22", // Dark background color
  },
  scrollContent: {
    flexGrow: 1, // Ensures the content scrolls correctly
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center", // Center the content vertically
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFF", // White text for title
    marginBottom: 10,
    fontFamily: "PlayfairDisplay",
    textAlign: "center", // Center-align the title
  },
  subtitle: {
    fontSize: 16,
    color: "#C2C2C2", // Light gray for subtitle
    marginBottom: 30,
    fontFamily: "Poppins",
    textAlign: "center", // Center-align the subtitle
  },
  measurementsContainer: {
    marginBottom: 20, // Space below the measurements inputs
  },
  button: {
    backgroundColor: "#A0A897", // Button background color
    padding: 15,
    borderRadius: 8,
    alignItems: "center", // Center text inside the button
    marginTop: 10,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1C2C22", // Dark text for button
    fontFamily: "Poppins",
  },
});

export default MeasurementsScreen;

