import React, { useState, useEffect } from "react"; // Importing React and hooks
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  TextInput,
} from "react-native"; // Importing necessary React Native components
import { FontAwesome5, Ionicons } from "@expo/vector-icons"; // Importing icons
import { useRouter } from "expo-router"; // Importing useRouter for navigation
import { auth } from "../../services/firebaseConfig"; // Firebase authentication service
import {
  doc,
  getFirestore,
  getDoc,
  updateDoc,
  arrayRemove,
  addDoc,
  collection,
} from "firebase/firestore"; // Firebase Firestore functions

const AbayasScreen = () => {
  const [abayas, setAbayas] = useState<
    { imageId: string; name: string; imageUrl: string }[]
  >([]); // State for storing abayas data
  const router = useRouter(); // Router for navigation
  const [showShareModal, setShowShareModal] = useState(false); // State to show or hide share modal
  const [selectedAbaya, setSelectedAbaya] = useState<{
    imageId: string;
    name: string;
    imageUrl: string;
  } | null>(null); // State for selected abaya
  const [caption, setCaption] = useState(""); // State for storing caption for shared outfit

  // Fetch user abayas data from Firestore
  useEffect(() => {
    const fetchAbayas = async () => {
      try {
        const userId = auth.currentUser?.uid; // Get current user's ID
        if (userId) {
          const db = getFirestore();
          const userRef = doc(db, "users", userId); // Get user document reference
          const userDoc = await getDoc(userRef); // Fetch user document
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const abayasList = userData.abayas || []; // Get user's abayas list
            // Ensure each abaya item has an imageUrl
            const abayasWithUrls = abayasList.map((abaya: any) => ({
              ...abaya,
              imageUrl:
                abaya.imageUrl ||
                `http://192.168.0.16:5000/uploads/${abaya.imageId}`, // Default URL if not provided
            }));
            setAbayas(abayasWithUrls); // Set the abayas state
          }
        }
      } catch (error) {
        console.error("Error fetching abayas:", error);
        Alert.alert("Error", "Failed to fetch abayas"); // Show alert if there's an error
      }
    };

    fetchAbayas(); // Call fetchAbayas function
  }, []);

  // Function to handle sharing the abaya
  const handleShare = async (abaya: {
    imageId: string;
    name: string;
    imageUrl: string;
  }) => {
    if (!abaya.imageUrl) {
      Alert.alert("Error", "Cannot share outfit: Image URL is missing");
      return;
    }
    setSelectedAbaya(abaya); // Set the selected abaya for sharing
    setShowShareModal(true); // Show the share modal
  };

  // Function to handle posting the outfit with a caption
  const handlePost = async () => {
    if (!selectedAbaya || !caption.trim()) {
      Alert.alert("Error", "Please enter a caption"); // Show alert if caption is missing
      return;
    }

    if (!selectedAbaya.imageUrl) {
      Alert.alert("Error", "Cannot share outfit: Image URL is missing");
      return;
    }

    try {
      const user = auth.currentUser; // Get current user
      if (user) {
        const db = getFirestore();
        await addDoc(collection(db, "posts"), {
          userId: user.uid, // Store user ID
          userName: user.displayName || "Anonymous", // Use display name or fallback to "Anonymous"
          imageUrl: selectedAbaya.imageUrl, // Store abaya image URL
          caption: caption.trim(), // Store the caption
          timestamp: new Date(), // Store the current timestamp
          likes: 0, // Initialize likes to 0
        });

        setShowShareModal(false); // Close share modal after posting
        setCaption(""); // Clear caption input field
        Alert.alert("Success", "Outfit shared successfully!"); // Show success message
      }
    } catch (error) {
      console.error("Error sharing outfit:", error);
      Alert.alert("Error", "Failed to share outfit"); // Show error message if posting fails
    }
  };

  // Function to handle deleting an abaya from the list
  const handleDelete = async (abaya: { imageId: string; name: string }) => {
    try {
      // Delete the image from the backend server
      const response = await fetch(
        `http://192.168.0.16:5000/delete/${abaya.imageId}`,
        {
          method: "DELETE", // HTTP method for deletion
        }
      );

      const result = await response.json();
      if (result.success) {
        const userId = auth.currentUser?.uid; // Get current user ID
        if (userId) {
          const db = getFirestore();
          const userRef = doc(db, "users", userId); // Get user document reference
          await updateDoc(userRef, {
            abayas: arrayRemove(abaya), // Remove abaya from Firestore
          });
          setAbayas((prevAbayas) =>
            prevAbayas.filter((a) => a.imageId !== abaya.imageId)
          ); // Remove abaya from the state
          Alert.alert("Success", "Image deleted successfully");
        }
      } else {
        console.error("Failed to delete image from backend:", result.error);
        Alert.alert("Error", "Failed to delete image from backend");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      Alert.alert("Error", "Failed to delete image"); // Show error message if deletion fails
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back button to navigate to the previous screen */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome5 name="arrow-left" size={24} color="#A0A897" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>My Abayas</Text>

      {/* Display Abayas */}
      <View style={styles.imageGrid}>
        {abayas.map((abaya) => (
          <View key={abaya.imageId} style={styles.imageContainer}>
            <Image source={{ uri: abaya.imageUrl }} style={styles.image} />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageName}>{abaya.name}</Text>
              <View style={styles.buttonContainer}>
                {/* Share button */}
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => handleShare(abaya)}
                >
                  <Ionicons name="share-social" size={24} color="#FFC1A1" />
                </TouchableOpacity>
                {/* Delete button */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(abaya)}
                >
                  <FontAwesome5 name="trash" size={24} color="#FFC1A1" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Add New Abaya Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/closet/upload?category=abayas")}
      >
        <Text style={styles.addButtonText}>Add New Abaya</Text>
      </TouchableOpacity>

      {/* Share Modal */}
      {showShareModal && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Outfit</Text>
            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption..."
              value={caption}
              onChangeText={setCaption} // Update caption state when text changes
              multiline // Allow multi-line text input
            />
            <View style={styles.modalButtons}>
              {/* Cancel Button */}
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowShareModal(false); // Close modal on cancel
                  setCaption(""); // Clear caption input field
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              {/* Share Button */}
              <TouchableOpacity
                style={[styles.modalButton, styles.shareButtonStyle]}
                onPress={handlePost} // Call handlePost function to share the outfit
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

// Styles for the AbayasScreen
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

export default AbayasScreen;

