import React, { useState, useEffect } from "react"; // React imports
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native"; // React Native components
import * as ImagePicker from "expo-image-picker"; // For handling image picking from the user's gallery
import { Ionicons } from "@expo/vector-icons"; // Ionicons for icons like back button
import { auth } from "../../services/firebaseConfig"; // Firebase auth service
import { getUserProfile, logout } from "../../services/authService"; // Services to fetch user data and log out
import { useRouter } from "expo-router"; // Router hook for navigation
import { doc, getFirestore, updateDoc } from "firebase/firestore"; // Firestore methods

// ProfileScreen component displays the user's profile information
const ProfileScreen = () => {
  const [userData, setUserData] = useState<any>(null); // State to store user profile data
  const [loading, setLoading] = useState(true); // State to manage loading state

  const router = useRouter(); // Use the router for navigation

  // useEffect hook to fetch user data from Firestore when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = auth.currentUser?.uid; // Get current user ID
        if (userId) {
          const profileData = await getUserProfile(userId); // Fetch profile data from Firestore
          setUserData(profileData); // Set the fetched data to state
        }
      } catch (error) {
        console.error("Error fetching profile:", error); // Handle errors while fetching
      } finally {
        setLoading(false); // Stop the loading indicator
      }
    };

    fetchUserData(); // Call the fetch user data function
  }, []); // Empty dependency array ensures this runs once when component mounts

  // handleLogout function to log out the user
  const handleLogout = async () => {
    try {
      await logout(); // Call the logout service
    } catch (error) {
      console.error("Error logging out:", error); // Handle logout error
    }
  };

  // handleImageUpload function to allow users to upload a profile image
  const handleImageUpload = async () => {
    try {
      // Request permission to access media library
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission to access camera roll is required!"); // Alert if permission is not granted
        return;
      }

      // Open image picker to allow the user to select an image
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Make the selected image square
      });
      if (pickerResult.canceled === true) {
        return; // Do nothing if the user cancels the image picker
      }

      // Prepare the selected image for upload
      const formData = new FormData();
      formData.append("image", {
        uri: pickerResult.assets[0].uri,
        name: "profile.jpg",
        type: "image/jpeg",
      });

      // Add the previous image ID to the form data to remove it after the upload
      formData.append("previousImageId", userData?.profileImageId || "");

      // Send the image to the backend (server) for upload
      const response = await fetch("http://192.168.0.16:5000/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data", // Indicating file upload
        },
      });

      const result = await response.json(); // Parse the response from the server
      console.log("Image upload result:", result);
      if (result.success) {
        // If the upload is successful, update the user profile with the new image ID
        const userId = auth.currentUser?.uid;
        if (userId) {
          const db = getFirestore(); // Get Firestore reference
          const userRef = doc(db, "users", userId); // Reference to the user's document
          await updateDoc(userRef, {
            profileImageId: result.imageId, // Update the profile image ID in Firestore
          });
          setUserData((prevData: any) => ({
            ...prevData,
            profileImageId: result.imageId, // Update the local state with the new image ID
          }));
        }
      } else {
        console.error("Failed to upload image:", result.error); // Log upload errors
        Alert.alert("Failed to upload image"); // Show error alert
      }
    } catch (error) {
      console.error("Error uploading image:", error); // Log upload error
      Alert.alert("Error uploading image"); // Show error alert
    }
  };

  // Show loading indicator if data is still being fetched
  if (loading) return <ActivityIndicator size="large" color="#A0A897" />;

  // Construct profile image URL using backend (or use placeholder if no image)
  const profilePicUrl = userData?.profileImageId
    ? `http://192.168.0.16:5000/uploads/${userData.profileImageId}`
    : "https://via.placeholder.com/100";

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: "#1C2C22" }, // Apply background color
      ]}
    >
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/")} // Navigate back to the home screen
      >
        <Ionicons name="arrow-back" size={24} color="#FFF" /> {/* Back icon */}
      </TouchableOpacity>

      {/* Profile section */}
      <View style={styles.profileContainer}>
                <TouchableOpacity onPress={handleImageUpload}>
          {/* Display the profile image */}
          <Image
            source={{ uri: profilePicUrl }}
            style={styles.profileImage} // Image styling
          />
        </TouchableOpacity>

        {/* Display the user's name */}
        <Text style={styles.username}>{userData?.name}</Text>

        {/* Display the user's email */}
        <Text style={styles.email}>{userData?.email}</Text>
      </View>

      {/* Edit Profile Button */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => router.push("/profile/edit-profile")}
      >
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Styling for the ProfileScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  backButton: {
    position: "absolute",
    top: 30,
    left: 20,
    zIndex: 1,
  },
  profileContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#C2C2C2",
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: "#A0A897",
    padding: 15,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
    marginBottom: 15,
  },
  editButtonText: {
    color: "#1C2C22",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#D9534F", // Red color for logout
    padding: 15,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ProfileScreen;

