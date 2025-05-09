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

const ShirtsScreen = () => {
  // State to hold the list of shirts
  const [shirts, setShirts] = useState<
    { imageId: string; name: string; imageUrl: string }[]
  >([]);
  const router = useRouter(); // Router for navigation
  const [showShareModal, setShowShareModal] = useState(false); // Modal visibility state
  const [selectedShirt, setSelectedShirt] = useState<{
    imageId: string;
    name: string;
    imageUrl: string;
  } | null>(null); // Selected shirt for sharing
  const [caption, setCaption] = useState(""); // Caption for sharing

  useEffect(() => {
    // Function to fetch shirts from the user's data
    const fetchShirts = async () => {
      try {
        const userId = auth.currentUser?.uid; // Get the current user's ID
        if (userId) {
          const db = getFirestore();
          const userRef = doc(db, "users", userId); // Reference to user's data in Firestore
          const userDoc = await getDoc(userRef); // Get user document
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const shirtsList = userData.shirts || []; // Get shirts list from user data
            // Ensure each shirt item has an imageUrl
            const shirtsWithUrls = shirtsList.map((shirt: any) => ({
              ...shirt,
              imageUrl:
                shirt.imageUrl ||
                `http://192.168.0.16:5000/uploads/${shirt.imageId}`, // Default image URL if missing
            }));
            setShirts(shirtsWithUrls); // Set the shirts in state
          }
        }
      } catch (error) {
        console.error("Error fetching shirts:", error); // Log error
        Alert.alert("Error", "Failed to fetch shirts"); // Alert on failure
      }
    };

    fetchShirts(); // Fetch shirts when the component mounts
  }, []);

  // Function to handle sharing a selected shirt
  const handleShare = async (shirt: {
    imageId: string;
    name: string;
    imageUrl: string;
  }) => {
    setSelectedShirt(shirt); // Set the selected shirt
    setShowShareModal(true); // Show the share modal
  };

  // Function to handle posting the shared shirt
  const handlePost = async () => {
    if (!selectedShirt || !caption.trim()) {
      Alert.alert("Error", "Please enter a caption");
      return; // Check if there's a selected shirt and a caption
    }

    try {
      const user = auth.currentUser; // Get the current user
      if (user) {
        const db = getFirestore();
        await addDoc(collection(db, "posts"), {
          userId: user.uid,
          userName: "Anonymous", // Use "Anonymous" as a default name for the user
          imageUrl: selectedShirt.imageUrl, // Use selected shirt's image
          caption: caption.trim(), // Use the caption inputted by the user
          timestamp: new Date(), // Add a timestamp for the post
          likes: 0, // Initialize likes as 0
        });

        setShowShareModal(false); // Close the share modal
        setCaption(""); // Clear the caption
        Alert.alert("Success", "Outfit shared successfully!"); // Success message
      }
    } catch (error) {
      console.error("Error sharing outfit:", error); // Log error
      Alert.alert("Error", "Failed to share outfit"); // Alert on failure
    }
  };

  // Function to handle deleting a shirt
  const handleDelete = async (shirt: { imageId: string; name: string }) => {
    try {
      // Delete the image from the backend
      const response = await fetch(
        `http://192.168.0.16:5000/delete/${shirt.imageId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();
      if (result.success) {
        const userId = auth.currentUser?.uid; // Get the current user's ID
        if (userId) {
          const db = getFirestore();
          const userRef = doc(db, "users", userId); // Reference to user's data in Firestore
          await updateDoc(userRef, {
            shirts: arrayRemove(shirt), // Remove the shirt from the user's collection in Firestore
          });
          setShirts((prevShirts) =>
            prevShirts.filter((s) => s.imageId !== shirt.imageId) // Update the state after deletion
          );
          Alert.alert("Success", "Image deleted successfully"); // Success message
        }
      } else {
        console.error("Failed to delete image from backend:", result.error); // Log error
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

      <Text style={styles.title}>My Shirts</Text>

      <View style={styles.imageGrid}>
        {shirts.map((shirt) => (
          <View key={shirt.imageId} style={styles.imageContainer}>
            <Image source={{ uri: shirt.imageUrl }} style={styles.image} />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageName}>{shirt.name}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => handleShare(shirt)} // Trigger handleShare when share button is pressed
                >
                  <Ionicons name="share-social" size={24} color="#FFC1A1" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(shirt)} // Trigger handleDelete when delete button is pressed
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
        onPress={() => router.push("/closet/upload?category=shirts")} // Navigate to upload page
      >
        <Text style={styles.addButtonText}>Add New Shirt</Text>
      </TouchableOpacity>

      {showShareModal && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Outfit</Text>
            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption..."
              value={caption}
              onChangeText={setCaption} // Update the caption state as user types
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowShareModal(false); // Close the share modal
                  setCaption(""); // Clear the caption
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.shareButtonStyle]}
                onPress={handlePost} // Post the shared shirt
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
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
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

export default ShirtsScreen;

