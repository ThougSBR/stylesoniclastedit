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

const baseCategories = ["Pants", "Shoes", "Shirts", "Jackets", "Accessories"];
const femaleCategories = ["Dresses", "Abayas"];

const UploadScreen = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [isFemale, setIsFemale] = useState(false);
  const [categories, setCategories] = useState(baseCategories);
  const router = useRouter();

  useEffect(() => {
    const checkUserGender = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userProfile = await getUserProfile(user.uid);
          if (userProfile.gender === "Female") {
            setIsFemale(true);
            setCategories([...baseCategories, ...femaleCategories]);
          }
        }
      } catch (error) {
        console.error("Error checking user gender:", error);
      }
    };

    checkUserGender();
  }, []);

  const handleImagePick = async () => {
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

    if (!pickerResult.canceled) {
      setSelectedImage(pickerResult.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!name) {
      Alert.alert("Error", "Please enter a name for the item");
      return;
    }
    if (!selectedImage) {
      Alert.alert("Error", "Please select an image");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", {
        uri: selectedImage,
        name: "clothing.jpg",
        type: "image/jpeg",
      });

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
            [`${selectedCategory.toLowerCase()}`]: arrayUnion({
              imageId: result.imageId,
              name: name,
              imageUrl: `http://192.168.0.16:5000/uploads/${result.imageId}`,
            }), // Save name and full image URL with the item
          });
          Alert.alert("Success", "Image uploaded successfully");
          router.navigate("/explore");
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

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome5 name="arrow-left" size={24} color="#A0A897" />
      </TouchableOpacity>
      <Text style={styles.title}>Upload Clothes</Text>
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
      <TextInput
        style={styles.input}
        placeholder="Enter Name"
        placeholderTextColor="#A0A897"
        value={name}
        onChangeText={setName}
      />
      <Picker
        selectedValue={selectedCategory}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
      >
        <Picker.Item label="Select Category" value={null} />
        {categories.map((category, index) => (
          <Picker.Item key={index} label={category} value={category} />
        ))}
      </Picker>
      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
        <Text style={styles.uploadButtonText}>Upload</Text>
      </TouchableOpacity>
    </View>
  );
};

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
