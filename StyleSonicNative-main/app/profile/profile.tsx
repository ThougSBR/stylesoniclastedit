import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons"; // Added Ionicons import
import { auth } from "../../services/firebaseConfig";
import { getUserProfile, logout } from "../../services/authService";
import { useRouter } from "expo-router";
import { doc, getFirestore, updateDoc } from "firebase/firestore";

const ProfileScreen = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const profileData = await getUserProfile(userId);
          setUserData(profileData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleImageUpload = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission to access camera roll is required!");
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (pickerResult.canceled === true) {
        return;
      }

      const formData = new FormData();
      formData.append("image", {
        uri: pickerResult.assets[0].uri,
        name: "profile.jpg",
        type: "image/jpeg",
      });

      formData.append("previousImageId", userData?.profileImageId || "");

      const response = await fetch("http://192.168.0.16:5000/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = await response.json();
      console.log("Image upload result:", result);
      if (result.success) {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const db = getFirestore();
          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, {
            profileImageId: result.imageId,
          });
          setUserData((prevData: any) => ({
            ...prevData,
            profileImageId: result.imageId,
          }));
        }
      } else {
        console.error("Failed to upload image:", result.error);
        Alert.alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error uploading image");
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#A0A897" />;

  // Construct profile image URL using Node.js backend
  const profilePicUrl = userData?.profileImageId
    ? `http://192.168.0.16:5000/uploads/${userData.profileImageId}`
    : "https://via.placeholder.com/100";

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: "#1C2C22" }, // Apply Dominant Color
      ]}
    >
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/")}
      >
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={handleImageUpload}>
          <Image source={{ uri: profilePicUrl }} style={styles.profileImage} />
        </TouchableOpacity>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{userData?.fullName || "John Doe"}</Text>
          {userData?.gender && (
            <Ionicons
              name={userData.gender === "Female" ? "female" : "male"}
              size={24}
              color={userData.gender === "Female" ? "#FF69B4" : "#1E90FF"}
              style={styles.genderIcon}
            />
          )}
        </View>
        <Text style={styles.username}>@{userData?.username || "johndoe"}</Text>
        <Text style={styles.email}>
          {userData?.email || "johndoe@example.com"}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Bio</Text>
        <Text style={styles.infoText}>
          {userData?.bio || "This is a sample bio."}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Location</Text>
        <Text style={styles.infoText}>
          {userData?.location || "New York, USA"}
        </Text>
      </View>

      {userData?.gender === "Female" && userData?.measurements && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Body Measurements</Text>
          <View style={styles.measurementsGrid}>
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>Waist</Text>
              <Text style={styles.measurementValue}>
                {userData.measurements.waist} cm
              </Text>
            </View>
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>Hips</Text>
              <Text style={styles.measurementValue}>
                {userData.measurements.hips} cm
              </Text>
            </View>
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>Bust</Text>
              <Text style={styles.measurementValue}>
                {userData.measurements.bust} cm
              </Text>
            </View>
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>Shoulders</Text>
              <Text style={styles.measurementValue}>
                {userData.measurements.shoulders} cm
              </Text>
            </View>
          </View>
          {userData?.bodyType && (
            <View style={styles.bodyTypeContainer}>
              <Text style={styles.infoTitle}>Body Type</Text>
              <Text style={styles.bodyTypeText}>{userData.bodyType}</Text>
            </View>
          )}
        </View>
      )}

      {/* Show Detected Season and Dominant Color */}
      <View style={styles.colorInfo}>
        {userData?.detectedSeason && (
          <Text style={styles.detectedSeasonTitle}>
            Detected Season: {userData.detectedSeason}
          </Text>
        )}
        <Text style={styles.infoTitle}>Dominant Color</Text>
        <View
          style={[
            styles.colorSwatch,
            { backgroundColor: userData?.dominantColor || "#FFFFFF" },
          ]}
        >
          {/* <Text style={styles.colorHex}>
            {userData?.dominantColor || "#FFFFFF"}
          </Text> */}
        </View>
        {userData?.colorPalette && (
          <>
            <Text style={styles.detectedColorsTitle}>
              Other Detected Colors
            </Text>
            <View style={styles.colorPalette}>
              {userData.colorPalette
                .slice(0, 4)
                .map((color: string, index: number) => (
                  <View
                    key={index}
                    style={[styles.colorSwatch, { backgroundColor: color }]}
                  />
                ))}
            </View>
          </>
        )}
        {userData?.outfitSuggestions && (
          <>
            <Text style={styles.outfitSuggestionsTitle}>
              Outfit Colors Suggestions
            </Text>
            <View style={styles.outfitSuggestions}>
              {userData.outfitSuggestions.map(
                (outfit: string, index: number) => (
                  <Text key={index} style={styles.outfitText}>
                    {outfit}
                  </Text>
                )
              )}
            </View>
          </>
        )}
        <TouchableOpacity
          style={styles.analyseButton}
          onPress={() => router.replace("/analyser/main")}
        >
          <Text style={styles.analyseButtonText}>
            {userData?.dominantColor ? "Analyse again" : "Analyse"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/profile/change-password-screen")}
        >
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/profile/edit-profile")}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start", // Adjusted to start from the top
    alignItems: "center",
    padding: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20, // Adjusted to maintain layout
    marginTop: 20, // Adjusted to maintain layout
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#FFF",
    marginBottom: 15,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 22,
    fontFamily: "PlayfairDisplay",
    color: "#FFC1A1",
  },
  username: { fontSize: 16, color: "#A0A897" },
  email: { fontSize: 14, color: "#C2C2C2", marginBottom: 20 },

  colorInfo: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20, // Added margin to separate sections
  },
  colorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  colorPalette: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: 50,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  colorHex: {
    color: "#FFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  analyseButton: {
    backgroundColor: "#1C2C22",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
    borderColor: "#A0A897",
    borderWidth: 1,
  },
  analyseButtonText: {
    color: "#A0A897",
    fontSize: 16,
    fontWeight: "bold",
  },
  detectedColorsTitle: {
    fontSize: 16,
    color: "#FFF",
    marginTop: 10,
    fontFamily: "PlayfairDisplay",
  },
  outfitSuggestionsTitle: {
    fontSize: 16,
    color: "#FFF",
    marginTop: 10,
    fontFamily: "PlayfairDisplay",
  },
  outfitSuggestions: {
    alignItems: "center",
    marginTop: 10,
  },
  outfitText: {
    color: "#FFF",
    fontSize: 14,
    marginBottom: 5,
  },
  infoContainer: { width: "100%", marginBottom: 20 },
  infoTitle: {
    fontSize: 18,
    color: "#FFF",
    fontFamily: "PlayfairDisplay",
  },
  infoText: { fontSize: 16, color: "#C2C2C2" },

  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20, // Added margin to separate from the last info section
  },
  button: {
    backgroundColor: "#A0A897",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: "90%",
    alignItems: "center",
  },
  buttonText: { color: "#1C2C22", fontSize: 16, fontWeight: "bold" },
  detectedSeasonTitle: {
    fontSize: 18,
    color: "#FFC1A1",
    marginBottom: 10,
    fontFamily: "PlayfairDisplay",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  genderIcon: {
    marginLeft: 10,
  },
  measurementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  measurementItem: {
    width: "48%",
    backgroundColor: "#2C3E2D",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  measurementLabel: {
    color: "#C2C2C2",
    fontSize: 14,
    fontFamily: "Poppins",
  },
  measurementValue: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  bodyTypeContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  bodyTypeText: {
    fontSize: 18,
    color: "#FFC1A1",
    fontFamily: "PlayfairDisplay",
    marginTop: 5,
  },
});

export default ProfileScreen;
