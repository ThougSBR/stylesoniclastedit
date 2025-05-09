import React, { useState, useEffect, useCallback } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { auth } from "../../services/firebaseConfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { useRouter } from "expo-router";

export default function Explore() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [faceCoords, setFaceCoords] = useState(null);
  const [hairCoords, setHairCoords] = useState(null);
  const [eyeCoords, setEyeCoords] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [detectedSeason, setDetectedSeason] = useState("");
  const [outfitSuggestions, setOutfitSuggestions] = useState([]);
  const [faceSelected, setFaceSelected] = useState(false);
  const [hairSelected, setHairSelected] = useState(false);
  const [eyeSelected, setEyeSelected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
      fetchExistingAnalysis();
    })();
  }, []);

  const handleBackPress = () => {
    if (analysisStarted) {
      setAnalysisStarted(false);
    } else {
      router.replace("/profile/profile");
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setSelectedImage(null);
    setFaceCoords(null);
    setHairCoords(null);
    setEyeCoords(null);
    setFaceSelected(false);
    setHairSelected(false);
    setEyeSelected(false);
    setDetectedSeason("");
    setAnalysisStarted(false);
    setOutfitSuggestions([]);
    await fetchExistingAnalysis();
    setRefreshing(false);
  }, []);

  /** ✅ Function to Pick Image from Gallery */
  const handleChoosePhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log("Image Picker Result:", result); // Debugging Step

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setFaceCoords(null);
      setHairCoords(null);
      setEyeCoords(null);
      setFaceSelected(false);
      setHairSelected(false);
      setEyeSelected(false);

      Image.getSize(result.assets[0].uri, (width, height) => {
        setImageSize({ width, height });
      });
    }
  };

  /** ✅ Function to Capture Photo */
  const handleTakePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log("Camera Capture Result:", result); // Debugging Step

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setFaceCoords(null);
      setHairCoords(null);
      setEyeCoords(null);
      setFaceSelected(false);
      setHairSelected(false);
      setEyeSelected(false);
      Image.getSize(result.assets[0].uri, (width, height) => {
        setImageSize({ width, height });
      });
    }
  };

  const handleImageTap = (event: any, type: any) => {
    console.log("Image Tap Event:", event.nativeEvent); // Debugging Step
    if (!selectedImage) {
      alert("Please select an image first.");
      return;
    }

    const { locationX, locationY } = event.nativeEvent;
    const screenWidth = Dimensions.get("window").width - 40;
    const scaleFactor = imageSize.width ? screenWidth / imageSize.width : 1;

    const adjustedX = Math.floor(locationX / scaleFactor);
    const adjustedY = Math.floor(locationY / scaleFactor);

    console.log(`Tapped at (${adjustedX}, ${adjustedY}) for ${type}`); // Debugging Step

    if (!faceSelected) {
      setFaceCoords({ x: adjustedX, y: adjustedY });
      setFaceSelected(true);
    } else if (!hairSelected) {
      setHairCoords({ x: adjustedX, y: adjustedY });
      setHairSelected(true);
    } else if (!eyeSelected) {
      setEyeCoords({ x: adjustedX, y: adjustedY });
      setEyeSelected(true);
    }
  };

  /** ✅ Upload Image & Coordinates to Backend */
  const uploadImageToServer = async () => {
    if (!selectedImage || !faceCoords || !hairCoords || !eyeCoords) {
      alert(
        "Please select an image and tap to pick face, hair, and eye colors."
      );
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", {
        uri: selectedImage,
        type: "image/jpeg",
        name: "uploaded-image.jpg",
      });

      formData.append("faceCoords", JSON.stringify(faceCoords));
      formData.append("hairCoords", JSON.stringify(hairCoords));
      formData.append("eyeCoords", JSON.stringify(eyeCoords));

      console.log("Uploading Image Data:", formData); // Debugging Step

      const response = await fetch("http://192.168.0.16:5000/analyse", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = await response.json();
      console.log("Server Response:", data); // Debugging Step

      if (data.detectedSeason) {
        setFaceCoords(null);
        setHairCoords(null);
        setEyeCoords(null);
        setFaceSelected(false);
        setHairSelected(false);
        setEyeSelected(false);
        setDetectedSeason(data.detectedSeason);
        setOutfitSuggestions(data.outfitSuggestions);

        saveDataToFirebase(data);
        router.replace("/profile/profile");
      } else {
        alert("Failed to analyze image.");
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  /** ✅ Save Data to Firebase */
  const saveDataToFirebase = async (data: any) => {
    try {
      const user = auth.currentUser;
      const db = getFirestore();
      if (!user) {
        alert("User not logged in.");
        return;
      }

      await updateDoc(doc(db, "users", user.uid), {
        dominantColor: data.dominantColor,
        colorPalette: data.colorPalette,
        detectedSeason: data.detectedSeason,
        outfitSuggestions: data.outfitSuggestions,
      });

      alert("Image & color analysis saved in Firebase!");
    } catch (error) {
      console.error("Error saving image data:", error);
    }
  };

  /** ✅ Fetch Existing Analysis from Firebase */
  const fetchExistingAnalysis = async () => {
    try {
      const user = auth.currentUser;
      const db = getFirestore();
      if (!user) {
        alert("User not logged in.");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setDetectedSeason(data.detectedSeason || "");
        setOutfitSuggestions(data.outfitSuggestions || []);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching existing analysis:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {detectedSeason && (
          <Text style={styles.resultText}>
            Detected Season: {detectedSeason}
          </Text>
        )}
        {outfitSuggestions.map((suggestion, index) => (
          <Text key={index} style={styles.suggestionText}>
            {suggestion}
          </Text>
        ))}
        {!analysisStarted && (
          <TouchableOpacity
            onPress={() => setAnalysisStarted(true)}
            style={styles.startButton}
          >
            <Text style={styles.startButtonText}>Analyse Colour</Text>
          </TouchableOpacity>
        )}
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
              disabled={uploading}
            >
              <MaterialIcons name="camera-alt" size={50} color="#666" />
            </TouchableOpacity>

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
