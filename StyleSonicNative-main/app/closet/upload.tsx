import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth } from "../../services/firebaseConfig";
import {
  doc,
  getFirestore,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { getUserProfile } from "../../services/authService";

// Define base categories for clothing
const baseCategories = ["Pants", "Shoes", "Shirts", "Jackets", "Accessories"];
const femaleCategories = ["Dresses", "Abayas"];

const UploadScreen = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // State for the selected image
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // State for the selected category
  const [name, setName] = useState<string>(""); // State for the name input field
  const [isFemale, setIsFemale] = useState(false); // State to check if user is female
  const [categories, setCategories] = useState(baseCategories); // Categories list to display in picker
  const router = useRouter(); // Router for navigation

  // Effect hook to check if user is female and set categories accordingly
  useEffect(() => {
    const checkUserGender = async () => {
      try {
        const user = auth.currentUser; // Get the current user
        if (user) {
          const userProfile = await getUserProfile(user.uid); // Fetch user profile
          if (userProfile.gender === "Female") {
            setIsFemale(true); // If user is female, set the isFemale state
            setCategories([...baseCategories, ...femaleCategories]); // Add female categories
          }
        }
      } catch (error) {
        console.error("Error checking user gender:", error);
      }
    };

    checkUserGender(); // Call the function to check gender
  }, []);

  // Handle image picking from the gallery
  const handleImagePick = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync(); // Request permission to access media library

    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!"); // Show alert if permission denied
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Aspect ratio of the picked image
    });

    if (!pickerResult.canceled) {
      setSelectedImage(pickerResult.assets[0].uri); // Set the selected image URI
    }
  };

  // Handle the upload of the selected image
  const handleUpload = async () => {
    if (!name) {
      Alert.alert("Error", "Please enter a name for the item"); // Alert if name is not entered
      return;
    }
    if (!selectedImage) {
      Alert.alert("Error", "Please select an image"); // Alert if no image is selected
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category"); // Alert if no category is selected
      return;
    }

    try {
      const formData = new FormData(); // Prepare the form data for the image upload
      formData.append("image", {
        uri: selectedImage, // Image URI
        name: "clothing.jpg", // Name of the image file
        type: "image/jpeg", // Type of the image file
      });

      // Send the image to the backend for upload
      const response = await fetch("http://192.168.0.16:5000/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data", // Set content type to multipart/form-data
        },
      });

      const result = await response.json(); // Get the response data
      console.log("Image upload result:", result);
      if (result.success) {
        const userId = auth.currentUser?.uid; // Get the user ID
        if (userId) {
          const db = getFirestore(); // Initialize Firestore
          const userRef = doc(db, "users", userId); // Reference to the user's document
          await updateDoc(userRef, {
            [`${selectedCategory.toLowerCase()}`]: arrayUnion({
              imageId: result.imageId, // Image ID from the response
              name: name, // Name of the item
              imageUrl: `http://192.168.0.16:5000/uploads/${result.imageId}`, // Full image URL
            }), // Add new item to the selected category
          });
          Alert.alert("Success", "Image uploaded successfully"); // Show success message
          router.navigate("/explore"); // Navigate to the explore page
        }
      } else {
        console.error("Failed to upload image:", result.error);
        Alert.alert("Failed to upload image"); // Show error message
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error uploading image"); // Show error message
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome5 name="arrow-left" size={24} color="#A0A897" /> {/* Back button */}
      </TouchableOpacity>
      <Text style={styles.title}>Upload Clothes</Text>

      {/* Image Picker */}
      <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
        {selectedImage ? (
          <>
            <Image source={{ uri: selectedImage }} style={styles.image} />
            <Text style={styles.imageName}>{name}</Text>
            {/* Show name under the item */}
          </>
        ) : (
          <Text style={styles.imagePickerText}>Select Image</Text>
        )}
      </TouchableOpacity>

      {/* Name input */}
      <TextInput
        style={styles.input}
        placeholder="Enter Name"
        placeholderTextColor="#A0A897"
        value={name}
        onChangeText={setName} // Update name state on input change
      />

      {/* Category Picker */}
      <Picker
        selectedValue={selectedCategory} // Selected category state
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)} // Update category on change
      >
        <Picker.Item label="Select Category" value={null} />
        {categories.map((category, index) => (
          <Picker.Item key={index} label={category} value={category} />
        ))}
      </Picker>

      {/* Upload Button */}
      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
        <Text style={styles.uploadButtonText}>Upload</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the upload screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1C2C22",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "PlayfairDisplay",
    color: "#FFC1A1",
    marginBottom: 20,
  },
  imagePicker: {
    width: 200,
    height: 200,
    backgroundColor: "#A0A897",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 20,
  },
  imagePickerText: {
    color: "#1C2C22",
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  picker: {
    height: 50,
    width: 200,
    color: "#A0A897",
    marginBottom: 20,
  },
  input: {
    width: "90%",
    height: 50,
    borderColor: "#A0A897",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: "#A0A897",
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#A0A897",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#1C2C22",
    fontSize: 16,
    fontWeight: "bold",
  },
  viewPantsButton: {
    backgroundColor: "#A0A897",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    marginTop: 10,
  },
  viewPantsButtonText: {
    color: "#1C2C22",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageName: {
    color: "#A0A897",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
});

export default UploadScreen;

