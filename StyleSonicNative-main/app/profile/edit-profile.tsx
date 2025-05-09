import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { updateUserProfile } from "../../services/updateUserService";
import { auth } from "../../services/firebaseConfig";
import { getUserProfile } from "../../services/authService";
import CustomTextInput from "../../components/CustomTextInput";

const EditProfileScreen = () => {
  const router = useRouter();
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

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.error("No user is currently signed in.");
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        setFullName(profile.fullName);
        setUsername(profile.username);
        setEmail(profile.email);
        setBio(profile.bio);
        setLocation(profile.location);
        setGender(profile.gender);
        if (profile.gender === "Female" && profile.measurements) {
          setMeasurements(profile.measurements);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error("No user is currently signed in.");
      return;
    }

    try {
      await updateUserProfile(
        user.uid,
        fullName,
        username,
        bio,
        location,
        gender === "Female" ? measurements : null
      );
      alert("Profile updated successfully!");
      router.push("/profile/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/profile/profile")}
      >
        <Ionicons name="arrow-back" size={24} color="#A0A897" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.uneditableInput}
          value={email}
          editable={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Full Name</Text>
        <CustomTextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full Name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <CustomTextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Bio</Text>
        <CustomTextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Bio"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Location</Text>
        <CustomTextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Location"
        />
      </View>

      {gender === "Female" && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Body Measurements (in cm)</Text>
          <View style={styles.measurementsGrid}>
            <View style={styles.measurementInputContainer}>
              <Text style={styles.measurementLabel}>Waist</Text>
              <CustomTextInput
                value={measurements.waist}
                onChangeText={(text) =>
                  setMeasurements({ ...measurements, waist: text })
                }
                placeholder="Waist"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.measurementInputContainer}>
              <Text style={styles.measurementLabel}>Hips</Text>
              <CustomTextInput
                value={measurements.hips}
                onChangeText={(text) =>
                  setMeasurements({ ...measurements, hips: text })
                }
                placeholder="Hips"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.measurementInputContainer}>
              <Text style={styles.measurementLabel}>Bust</Text>
              <CustomTextInput
                value={measurements.bust}
                onChangeText={(text) =>
                  setMeasurements({ ...measurements, bust: text })
                }
                placeholder="Bust"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.measurementInputContainer}>
              <Text style={styles.measurementLabel}>Shoulders</Text>
              <CustomTextInput
                value={measurements.shoulders}
                onChangeText={(text) =>
                  setMeasurements({ ...measurements, shoulders: text })
                }
                placeholder="Shoulders"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

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
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#FFF",
    marginBottom: 15,
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

export default EditProfileScreen;
