import React, { useState, useEffect, useCallback } from "react"; // Importing React and hooks
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Alert,
  SafeAreaView,
  Text,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native"; // Importing core React Native components
import * as ImagePicker from "expo-image-picker"; // Importing Image Picker for gallery and camera access
import { MaterialIcons } from "@expo/vector-icons"; // Importing MaterialIcons for icons
import { auth } from "../../services/firebaseConfig"; // Firebase authentication
import { doc, updateDoc, getDoc } from "firebase/firestore"; // Firestore functions for data handling
import { getFirestore } from "firebase/firestore"; // Import Firestore instance
import { useRouter } from "expo-router"; // Import router for navigation

export default function Explore() {
  // Declare state variables for handling the app functionality
  const [selectedImage, setSelectedImage] = useState(null); // Store selected image URI
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 }); // Store image dimensions
  const [faceCoords, setFaceCoords] = useState(null); // Coordinates of the face
  const [hairCoords, setHairCoords] = useState(null); // Coordinates of the hair
  const [eyeCoords, setEyeCoords] = useState(null); // Coordinates of the eyes
  const [uploading, setUploading] = useState(false); // Uploading state for image processing
  const [detectedSeason, setDetectedSeason] = useState(""); // Detected season from analysis
  const [outfitSuggestions, setOutfitSuggestions] = useState([]); // Outfit suggestions based on analysis
  const [faceSelected, setFaceSelected] = useState(false); // Track if face is selected
  const [hairSelected, setHairSelected] = useState(false); // Track if hair is selected
  const [eyeSelected, setEyeSelected] = useState(false); // Track if eye is selected
  const [refreshing, setRefreshing] = useState(false); // Refreshing state for pull-to-refresh
  const [analysisStarted, setAnalysisStarted] = useState(false); // State to track if analysis has started

  const router = useRouter(); // Router instance for navigation

  // Request camera permissions on app startup (only for non-web platforms)
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
      fetchExistingAnalysis(); // Fetch existing analysis data from Firebase
    })();
  }, []);

  // Handle the back button press logic
  const handleBackPress = () => {
    if (analysisStarted) {
      setAnalysisStarted(false); // Stop analysis if in progress
    } else {
      router.replace("/profile/profile"); // Navigate to profile screen if not analyzing
    }
  };

  // Function for pull-to-refresh logic
  const onRefresh = useCallback(async () => {
    setRefreshing(true); // Set refreshing state to true
    setSelectedImage(null); // Clear selected image
    setFaceCoords(null); // Reset coordinates
    setHairCoords(null);
    setEyeCoords(null);
    setFaceSelected(false); // Reset selection states
    setHairSelected(false);
    setEyeSelected(false);
    setDetectedSeason(""); // Reset detected season
    setAnalysisStarted(false); // Reset analysis started state
    setOutfitSuggestions([]); // Reset outfit suggestions
    await fetchExistingAnalysis(); // Fetch data again from Firebase
    setRefreshing(false); // Set refreshing state to false after data is fetched
  }, []);

  // Function to pick image from the gallery
  const handleChoosePhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Limit to image files
      allowsEditing: true, // Allow editing of the image
      aspect: [4, 3], // Aspect ratio for cropping
      quality: 1, // Max quality of the image
    });

    console.log("Image Picker Result:", result); // Debugging step to check the result

    if (!result.canceled) {
      // If user picks an image
      setSelectedImage(result.assets[0].uri); // Set the image URI
      setFaceCoords(null); // Reset selected coordinates
      setHairCoords(null);
      setEyeCoords(null);
      setFaceSelected(false); // Reset selection flags
      setHairSelected(false);
      setEyeSelected(false);

      // Get the image size to calculate scale factor for tap locations
      Image.getSize(result.assets[0].uri, (width, height) => {
        setImageSize({ width, height });
      });
    }
  };

  // Function to capture an image using the camera
  const handleTakePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Limit to image files
      allowsEditing: true, // Allow editing of the image
      aspect: [4, 3], // Aspect ratio for cropping
      quality: 1, // Max quality of the image
    });

    console.log("Camera Capture Result:", result); // Debugging step to check the result

    if (!result.canceled) {
      // If user takes a photo
      setSelectedImage(result.assets[0].uri); // Set the image URI
      setFaceCoords(null); // Reset selected coordinates
      setHairCoords(null);
      setEyeCoords(null);
      setFaceSelected(false); // Reset selection flags
      setHairSelected(false);
      setEyeSelected(false);

      // Get the image size to calculate scale factor for tap locations
      Image.getSize(result.assets[0].uri, (width, height) => {
        setImageSize({ width, height });
      });
    }
  };

  // Function to handle image taps for selecting face, hair, or eye regions
  const handleImageTap = (event: any, type: any) => {
    console.log("Image Tap Event:", event.nativeEvent); // Debugging step to check event details
    if (!selectedImage) {
      alert("Please select an image first."); // Alert if no image is selected
      return;
    }

    const { locationX, locationY } = event.nativeEvent; // Get tap coordinates
    const screenWidth = Dimensions.get("window").width - 40; // Calculate screen width
    const scaleFactor = imageSize.width ? screenWidth / imageSize.width : 1; // Calculate scale factor

    // Adjust coordinates according to the image scale
    const adjustedX = Math.floor(locationX / scaleFactor);
    const adjustedY = Math.floor(locationY / scaleFactor);

    console.log(`Tapped at (${adjustedX}, ${adjustedY}) for ${type}`); // Debugging step

    if (!faceSelected) {
      setFaceCoords({ x: adjustedX, y: adjustedY });
      setFaceSelected(true); // Mark face selected
    } else if (!hairSelected) {
      setHairCoords({ x: adjustedX, y: adjustedY });
      setHairSelected(true); // Mark hair selected
    } else if (!eyeSelected) {
      setEyeCoords({ x: adjustedX, y: adjustedY });
      setEyeSelected(true); // Mark eye selected
    }
  };

  // Function to upload the image and coordinates to the server for analysis
  const uploadImageToServer = async () => {
    if (!selectedImage || !faceCoords || !hairCoords || !eyeCoords) {
      alert("Please select an image and tap to pick face, hair, and eye colors.");
      return; // Ensure all selections are made before uploading
    }

    try {
      setUploading(true); // Set uploading state to true

      // Prepare form data for the request
      const formData = new FormData();
      formData.append("image", {
        uri: selectedImage,
        type: "image/jpeg",
        name: "uploaded-image.jpg",
      });

      formData.append("faceCoords", JSON.stringify(faceCoords));
      formData.append("hairCoords", JSON.stringify(hairCoords));
      formData.append("eyeCoords", JSON.stringify(eyeCoords));

      console.log("Uploading Image Data:", formData); // Debugging step

      const response = await fetch("http://192.168.0.16:5000/analyse", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = await response.json(); // Parse server response
      console.log("Server Response:", data); // Debugging step

      if (data.detectedSeason) {
        // If analysis was successful
        setFaceCoords(null); // Reset the selected coordinates
        setHairCoords(null);
        setEyeCoords(null);
        setFaceSelected(false); // Reset selection flags
        setHairSelected(false);
        setEyeSelected(false);
        setDetectedSeason(data.detectedSeason); // Set the detected season
        setOutfitSuggestions(data.outfitSuggestions); // Set the outfit suggestions

        saveDataToFirebase(data); // Save the analysis data to Firebase
        router.replace("/profile/profile"); // Navigate back to the profile screen
      } else {
        alert("Failed to analyze image."); // Show error if analysis failed
      }
    } catch (error) {
      console.error("Upload error:", error); // Log any errors during upload
    } finally {
      setUploading(false); // Reset uploading state
    }
  };

  // Function to save analysis data to Firebase
  const saveDataToFirebase = async (data: any) => {
    try {
      const user = auth.currentUser; // Get current authenticated user
      const db = getFirestore(); // Initialize Firestore
      if (!user) {
        alert("User not logged in.");
        return; // Ensure user is logged in
      }

      // Update user's document with analysis data
      await updateDoc(doc(db, "users", user.uid), {
        dominantColor: data.dominantColor,
        colorPalette: data.colorPalette,
        detectedSeason: data.detectedSeason,
        outfitSuggestions: data.outfitSuggestions,
      });

      alert("Image & color analysis saved in Firebase!"); // Show success message
    } catch (error) {
      console.error("Error saving image data:", error); // Log any errors while saving
    }
  };

  // Function to fetch existing analysis data from Firebase
  const fetchExistingAnalysis = async () => {
    try {
      const user = auth.currentUser; // Get current authenticated user
      const db = getFirestore(); // Initialize Firestore
      if (!user) {
        alert("User not logged in.");
        return; // Ensure user is logged in
      }

      const docRef = doc(db, "users", user.uid); // Reference to user's document in Firestore
      const docSnap = await getDoc(docRef); // Get user document

      if (docSnap.exists()) {
        const data = docSnap.data(); // Extract data from Firestore document
        setDetectedSeason(data.detectedSeason || ""); // Set the detected season
        setOutfitSuggestions(data.outfitSuggestions || []); // Set outfit suggestions
      } else {
        console.log("No such document!"); // Handle case where document doesn't exist
      }
    } catch (error) {
      console.error("Error fetching existing analysis:", error); // Log any errors
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity
        onPress={() => handleBackPress()}
        style={styles.backButton}
      >
        <MaterialIcons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          !analysisStarted && styles.centeredContainer,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // Refresh control for pull-to-refresh
        }
      >
        {detectedSeason && (
          <Text style={styles.resultText}>
            Detected Season: {detectedSeason} {/* Display detected season */}
          </Text>
        )}

        {/* Display outfit suggestions */}
        {outfitSuggestions.map((suggestion, index) => (
          <Text key={index} style={styles.suggestionText}>
            {suggestion} {/* Display each outfit suggestion */}
          </Text>
        ))}

        {/* Start analysis button */}
        {!analysisStarted && (
          <TouchableOpacity
            onPress={() => setAnalysisStarted(true)}
            style={styles.startButton}
          >
            <Text style={styles.startButtonText}>Analyse Colour</Text>
          </TouchableOpacity>
        )}

        {/* Show analysis tools after starting analysis */}
        {analysisStarted && (
          <>
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Upload Options", "Choose an option", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Gallery", onPress: handleChoosePhoto },
                  { text: "Camera", onPress: handleTakePhoto },
                ])
              }
              style={styles.imagePlaceholder}
              disabled={uploading} // Disable if uploading
            >
              <MaterialIcons name="camera-alt" size={50} color="#666" />
            </TouchableOpacity>

            {/* If image is selected, show the selected image */}
            {selectedImage ? (
              <>
                <TouchableOpacity
                  onPress={(event) => handleImageTap(event, "face")}
                  disabled={uploading}
                >
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.uploadedImage}
                  />
                </TouchableOpacity>
                <Text style={styles.infoText}>
                  Tap on the image to select: Face, Hair, and Eye colors.
                </Text>

                {/* Show checkboxes for face, hair, and eye selections */}
                <View style={styles.checkContainer}>
                  <View style={styles.checkItem}>
                    <Text style={styles.checkText}>Face</Text>
                    <MaterialIcons
                      name={
                        faceSelected ? "check-box" : "check-box-outline-blank"
                      }
                      size={24}
                      color="#FFF"
                    />
                  </View>
                  <View style={styles.checkItem}>
                    <Text style={styles.checkText}>Hair</Text>
                    <MaterialIcons
                      name={
                        hairSelected ? "check-box" : "check-box-outline-blank"
                      }
                      size={24}
                      color="#FFF"
                    />
                  </View>
                  <View style={styles.checkItem}>
                    <Text style={styles.checkText}>Eye</Text>
                    <MaterialIcons
                      name={
                        eyeSelected ? "check-box" : "check-box-outline-blank"
                      }
                      size={24}
                      color="#FFF"
                    />
                  </View>
                </View>

                {/* Upload button */}
                <TouchableOpacity
                  onPress={uploadImageToServer}
                  style={styles.uploadButton}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.uploadText}>Upload</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.infoText}>No image selected</Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2C22",
    alignItems: "center",
    paddingVertical: 20,
  },
  scrollContainer: { alignItems: "center", paddingBottom: 50 },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 30,
    left: 10,
    zIndex: 1,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFC1A1",
    marginBottom: 20,
  },
  uploadedImage: {
    width: Dimensions.get("window").width - 40,
    height: 300,
    resizeMode: "contain",
    borderRadius: 10,
  },
  infoText: { color: "#FFF", textAlign: "center", marginVertical: 10 },
  uploadButton: {
    backgroundColor: "#FFC1A1",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  uploadText: { color: "#000", fontWeight: "bold" },
  resultText: {
    color: "#FFC1A1",
    fontSize: 20,
    textAlign: "center",
    marginTop: 20,
  },
  suggestionText: { color: "#FFF", textAlign: "center", marginVertical: 2 },
  checkContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkText: {
    color: "#FFF",
    marginRight: 5,
  },
  startButton: {
    backgroundColor: "#FFC1A1",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  startButtonText: {
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
  },
}); 


