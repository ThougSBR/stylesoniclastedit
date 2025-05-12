import React, { useState, useEffect } from "react"; // Importing React and hooks (useState, useEffect)
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native"; // Importing React Native components
import { useRouter } from "expo-router"; // Router hook for navigation
import { Ionicons } from "@expo/vector-icons"; // Ionicons library for icons
import { updateUserProfile } from "../../services/updateUserService"; // Service to update user profile
import { auth } from "../../services/firebaseConfig"; // Firebase authentication service
import { getUserProfile } from "../../services/authService"; // Service to get user profile from Firestore
import CustomTextInput from "../../components/CustomTextInput"; // Custom text input component

// EditProfileScreen component where the user can edit their profile information
const EditProfileScreen = () => {
  const router = useRouter(); // Use the router for navigation
  // State variables to store profile data
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState("");
  const [measurements, setMeasurements] = useState({
    waist: "",
    hips: "",
    bust: "",
    shoulders: "",
  });

  // Fetch user profile data when the component is mounted
  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser; // Get the current logged-in user
      if (!user) {
        console.error("No user is currently signed in.");
        return;
      }

      try {
        // Get user profile from Firestore
        const profile = await getUserProfile(user.uid);
        // Set state variables with the fetched profile data
        setFullName(profile.fullName);
        setUsername(profile.username);
        setEmail(profile.email);
        setBio(profile.bio);
        setLocation(profile.location);
        setGender(profile.gender);
        if (profile.gender === "Female" && profile.measurements) {
          setMeasurements(profile.measurements); // Set body measurements if available
        }
      } catch (error) {
        console.error("Error fetching user profile:", error); // Handle errors while fetching profile
      }
    };

    fetchUserProfile(); // Call the fetch user profile function
  }, []);

  // Handle saving the profile updates
  const handleSave = async () => {
    const user = auth.currentUser; // Get the current logged-in user
    if (!user) {
      console.error("No user is currently signed in.");
      return;
    }

    try {
      // Call the service to update the user's profile in Firestore
      await updateUserProfile(
        user.uid,
        fullName,
        username,
        bio,
        location,
        gender === "Female" ? measurements : null // Send measurements only if the user is female
      );
      alert("Profile updated successfully!"); // Success message
      router.push("/profile/profile"); // Navigate back to the profile page
    } catch (error) {
      console.error("Error updating profile:", error); // Handle errors while updating the profile
      alert("Failed to update profile. Please try again."); // Error message
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back button to go to the profile screen */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/profile/profile")}
      >
        <Ionicons name="arrow-back" size={24} color="#A0A897" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Input field for email (not editable) */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.uneditableInput}
          value={email}
          editable={false} // Email is not editable
        />
      </View>

      {/* Input field for full name */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Full Name</Text>
        <CustomTextInput
          value={fullName}
          onChangeText={setFullName} // Update full name state when user types
          placeholder="Full Name"
        />
      </View>

      {/* Input field for username */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <CustomTextInput
          value={username}
          onChangeText={setUsername} // Update username state when user types
          placeholder="Username"
        />
      </View>

      {/* Input field for bio */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Bio</Text>
        <CustomTextInput
          value={bio}
          onChangeText={setBio} // Update bio state when user types
          placeholder="Bio"
          multiline
          numberOfLines={3} // Allow multiple lines for the bio
        />
      </View>

      {/* Input field for location */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Location</Text>
        <CustomTextInput
          value={location}
          onChangeText={setLocation} // Update location state when user types
          placeholder="Location"
        />
      </View>

      {/* Show body measurements section if gender is Female */}
      {gender === "Female" && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Body Measurements (in cm)</Text>
          {/* Grid layout for measurement inputs */}
          <View style={styles.measurementsGrid}>
            {/* Waist measurement input */}
            <View style={styles.measurementInputContainer}>
              <Text style={styles.measurementLabel}>Waist</Text>
              <CustomTextInput
                value={measurements.waist}
                onChangeText={(text) =>
                  setMeasurements({ ...measurements, waist: text })
                }
                placeholder="Waist"
                keyboardType="numeric" // Numeric input for waist size
              />
            </View>
            {/* Hips measurement input */}
            <View style={styles.measurementInputContainer}>
              <Text style={styles.measurementLabel}>Hips</Text>
              <CustomTextInput
                value={measurements.hips}
                onChangeText={(text) =>
                  setMeasurements({ ...measurements, hips: text })
                }
                placeholder="Hips"
                keyboardType="numeric" // Numeric input for hips size
              />
            </View>
            {/* Bust measurement input */}
            <View style={styles.measurementInputContainer}>
              <Text style={styles.measurementLabel}>Bust</Text>
              <CustomTextInput
                value={measurements.bust}
                onChangeText={(text) =>
                  setMeasurements({ ...measurements, bust: text })
                }
                placeholder="Bust"
                keyboardType="numeric" // Numeric input for bust size
              />
            </View>
            {/* Shoulders measurement input */}
            <View style={styles.measurementInputContainer}>
              <Text style={styles.measurementLabel}>Shoulders</Text>
              <CustomTextInput
                value={measurements.shoulders}
                onChangeText={(text) =>
                  setMeasurements({ ...measurements, shoulders: text })
                }
                placeholder="Shoulders"
                keyboardType="numeric" // Numeric input for shoulders size
              />
            </View>
          </View>
        </View>
      )}

      {/* Save button to update the profile */}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Styles for the components
const styles = StyleSheet.create({
  uneditableInput: {
    borderWidth: 0,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 4,
    color: "#fff",
  },
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1C2C22",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    color: "#FFC1A1",
  },
  backButtonText: {
    color: "#FFC1A1",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: "#FFF",
    marginBottom: 10,
    fontFamily: "PlayfairDisplay",
  },
  button: {
    backgroundColor: "#A0A897",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    color: "#1C2C22",
    fontSize: 16,
    fontWeight: "bold",
  },
  measurementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  measurementInputContainer: {
    width: "48%",
    marginBottom: 15,
  },
  measurementLabel: {
    color: "#C2C2C2",
    fontSize: 14,
    marginBottom: 5,
    fontFamily: "Poppins",
  },
});

export default EditProfileScreen; // Export the EditProfileScreen component

