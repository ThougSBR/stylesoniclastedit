import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth } from "../../services/firebaseConfig";
import {
  doc,
  getFirestore,
  getDoc,
  updateDoc,
  arrayRemove,
  addDoc,
  collection,
} from "firebase/firestore";

const PantsScreen = () => {
  // State to hold the list of pants items
  const [pants, setPants] = useState<
    { imageId: string; name: string; imageUrl: string }[]
  >([]);
  const router = useRouter(); // Router for navigation
  const [showShareModal, setShowShareModal] = useState(false); // State for showing the share modal
  const [selectedPants, setSelectedPants] = useState<{
    imageId: string;
    name: string;
    imageUrl: string;
  } | null>(null); // Selected pants for sharing
  const [caption, setCaption] = useState(""); // Caption for shared pants

  useEffect(() => {
    // Function to fetch pants from the user's data
    const fetchPants = async () => {
      try {
        const userId = auth.currentUser?.uid; // Get current user's ID
        if (userId) {
          const db = getFirestore();
          const userRef = doc(db, "users", userId);
          const userDoc = await getDoc(userRef); // Get user document
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const pantsList = userData.pants || []; // Get pants list from user data
            // Ensure each pants item has an imageUrl
            const pantsWithUrls = pantsList.map((pant: any) => ({
              ...pant,
              imageUrl:
                pant.imageUrl ||
                `http://192.168.0.16:5000/uploads/${pant.imageId}`, // Default image URL if missing
            }));
            setPants(pantsWithUrls); // Set the pants in state
          }
        }
      } catch (error) {
        console.error("Error fetching pants:", error); // Log error
        Alert.alert("Error", "Failed to fetch pants"); // Alert on failure
      }
    };

    fetchPants(); // Call function to fetch pants
  }, []);

  // Function to handle sharing a selected pant
  const handleShare = async (pants: {
    imageId: string;
    name: string;
    imageUrl: string;
  }) => {
    if (!pants.imageUrl) {
      Alert.alert("Error", "Cannot share outfit: Image URL is missing");
      return; // Prevent sharing if image URL is missing
    }
    setSelectedPants(pants); // Set selected pants
    setShowShareModal(true); // Show the share modal
  };

  // Function to handle posting the shared pant
  const handlePost = async () => {
    if (!selectedPants || !caption.trim()) {
      Alert.alert("Error", "Please enter a caption");
      return; // Check if there's a selected pant and a caption
    }

    if (!selectedPants.imageUrl) {
      Alert.alert("Error", "Cannot share outfit: Image URL is missing");
      return; // Prevent sharing if image URL is missing
    }

    try {
      const user = auth.currentUser; // Get current user
      if (user) {
        const db = getFirestore();
        await addDoc(collection(db, "posts"), {
          userId: user.uid,
          userName: user.fullName || "Anonymous", // Use full name or default to "Anonymous"
          imageUrl: selectedPants.imageUrl,
          caption: caption.trim(),
          timestamp: new Date(),
          likes: 0, // Initialize likes as 0
        });

        setShowShareModal(false); // Close the share modal
        setCaption(""); // Clear the caption field
        Alert.alert("Success", "Outfit shared successfully!"); // Success message
      }
    } catch (error) {
      console.error("Error sharing outfit:", error); // Log error
      Alert.alert("Error", "Failed to share outfit"); // Alert on failure
    }
  };

  // Function to handle deleting a pant
  const handleDelete = async (pants: { imageId: string; name: string }) => {
    try {
      // Delete the image from the backend
      const response = await fetch(
        `http://192.168.0.16:5000/delete/${pants.imageId}`,
        {
          method: "DELETE", // DELETE request to backend
        }
      );

      const result = await response.json(); // Get response from server
      if (result.success) {
        const userId = auth.currentUser?.uid; // Get current user's ID
        if (userId) {
          const db = getFirestore();
          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, {
            pants: arrayRemove(pants), // Remove the deleted pant from user's data
          });
          setPants((prevPants) =>
            prevPants.filter((p) => p.imageId !== pants.imageId) // Remove from state
          );
          Alert.alert("Success", "Image deleted successfully"); // Success message
        }
      } else {
        console.error("Failed to delete image from backend:", result.error);
        Alert.alert("Error", "Failed to delete image from backend"); // Alert on failure
      }
    } catch (error) {
      console.error("Error deleting image:", error); // Log error
      Alert.alert("Error", "Failed to delete image"); // Alert on failure
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome5 name="arrow-left" size={24} color="#A0A897" />
      </TouchableOpacity>

      <Text style={styles.title}>My Pants</Text>

      <View style={styles.imageGrid}>
        {pants.map((pants) => (
          <View key={pants.imageId} style={styles.imageContainer}>
            <Image source={{ uri: pants.imageUrl }} style={styles.image} />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageName}>{pants.name}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => handleShare(pants)} // Handle share
                >
                  <Ionicons name="share-social" size={24} color="#FFC1A1" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(pants)} // Handle delete
                >
                  <FontAwesome5 name="trash" size={24} color="#FFC1A1" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/closet/upload?category=pants")}
      >
        <Text style={styles.addButtonText}>Add New Pants</Text>
      </TouchableOpacity>

      {showShareModal && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Outfit</Text>
            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption..."
              value={caption}
              onChangeText={setCaption} // Update caption
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowShareModal(false);
                  setCaption(""); // Reset caption on cancel
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.shareButtonStyle]}
                onPress={handlePost} // Handle post
              >
                <Text style={styles.modalButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
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
    marginTop: 60,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
  },
  imageContainer: {
    width: "45%",
    margin: "2.5%",
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(28, 44, 34, 0.8)",
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  imageName: {
    color: "#FFC1A1",
    fontSize: 14,
    flex: 1,
  },
  shareButton: {
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
  addButton: {
    backgroundColor: "#A0A897",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: "90%",
    alignItems: "center",
  },
  addButtonText: {
    color: "#1C2C22",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1C2C22",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "PlayfairDisplay",
    color: "#FFC1A1",
    marginBottom: 15,
    textAlign: "center",
  },
  captionInput: {
    backgroundColor: "#A0A897",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    minHeight: 100,
    color: "#1C2C22",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#A0A897",
  },
  shareButtonStyle: {
    backgroundColor: "#FFC1A1",
  },
  modalButtonText: {
    color: "#1C2C22",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PantsScreen;
