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

const ShoesScreen = () => {
  const [shoes, setShoes] = useState<
    { imageId: string; name: string; imageUrl: string }[] // State to store shoes list
  >([]);
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false); // State for controlling modal visibility
  const [selectedShoe, setSelectedShoe] = useState<{
    imageId: string;
    name: string;
    imageUrl: string;
  } | null>(null); // State for the selected shoe
  const [caption, setCaption] = useState(""); // State for the caption to be added to the post

  useEffect(() => {
    const fetchShoes = async () => {
      try {
        const userId = auth.currentUser?.uid; // Get the current user ID
        if (userId) {
          const db = getFirestore(); // Firestore database reference
          const userRef = doc(db, "users", userId); // User document reference
          const userDoc = await getDoc(userRef); // Get the user document
          if (userDoc.exists()) {
            const userData = userDoc.data(); // Extract data from user document
            const shoesList = userData.shoes || []; // Get shoes from user data
            // Ensure each shoe item has an imageUrl
            const shoesWithUrls = shoesList.map((shoe: any) => ({
              ...shoe,
              imageUrl:
                shoe.imageUrl ||
                `http://192.168.0.16:5000/uploads/${shoe.imageId}`, // Default imageUrl if not provided
            }));
            setShoes(shoesWithUrls); // Set shoes list in state
          }
        }
      } catch (error) {
        console.error("Error fetching shoes:", error); // Error handling
        Alert.alert("Error", "Failed to fetch shoes");
      }
    };

    fetchShoes(); // Fetch shoes when component mounts
  }, []);

  const handleShare = async (shoe: {
    imageId: string;
    name: string;
    imageUrl: string;
  }) => {
    if (!shoe.imageUrl) {
      Alert.alert("Error", "Cannot share outfit: Image URL is missing"); // Image URL validation
      return;
    }
    setSelectedShoe(shoe); // Set selected shoe for sharing
    setShowShareModal(true); // Show the share modal
  };

  const handlePost = async () => {
    if (!selectedShoe || !caption.trim()) {
      Alert.alert("Error", "Please enter a caption"); // Validation for caption input
      return;
    }

    try {
      const user = auth.currentUser; // Get current user
      if (user) {
        const db = getFirestore(); // Firestore database reference
        await addDoc(collection(db, "posts"), { // Add a new post in Firestore
          userId: user.uid,
          userName: "Anonymous", // Username (can be modified later)
          imageUrl: selectedShoe.imageUrl, // Image URL of the selected shoe
          caption: caption.trim(), // Caption for the post
          timestamp: new Date(), // Current timestamp
          likes: 0, // Initial likes count
        });

        setShowShareModal(false); // Close modal after post
        setCaption(""); // Clear caption input
        Alert.alert("Success", "Outfit shared successfully!"); // Success message
      }
    } catch (error) {
      console.error("Error sharing outfit:", error); // Error handling
      Alert.alert("Error", "Failed to share outfit");
    }
  };

  const handleDelete = async (shoe: {
    imageId: string;
    name: string;
    imageUrl: string;
  }) => {
    try {
      const user = auth.currentUser; // Get current user
      if (user) {
        const db = getFirestore(); // Firestore database reference
        const shoeRef = doc(db, "clothes", shoe.imageId); // Reference to shoe document in Firestore
        await updateDoc(shoeRef, {
          deleted: true, // Mark the shoe as deleted
        });
        setShoes((prevShoes) =>
          prevShoes.filter((s) => s.imageId !== shoe.imageId) // Remove the deleted shoe from the list
        );
        Alert.alert("Success", "Shoe deleted successfully"); // Success message
      }
    } catch (error) {
      console.error("Error deleting shoe:", error); // Error handling
      Alert.alert("Error", "Failed to delete shoe");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome5 name="arrow-left" size={24} color="#A0A897" />
      </TouchableOpacity>

      <Text style={styles.title}>My Shoes</Text>

      <View style={styles.imageGrid}>
        {shoes.map((shoe) => (
          <View key={shoe.imageId} style={styles.imageContainer}>
            <Image source={{ uri: shoe.imageUrl }} style={styles.image} />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageName}>{shoe.name}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => handleShare(shoe)} // Share button
                >
                  <Ionicons name="share-social" size={24} color="#FFC1A1" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(shoe)} // Delete button
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
        onPress={() => router.push("/closet/upload?category=shoes")} // Button to add new shoes
      >
        <Text style={styles.addButtonText}>Add New Shoes</Text>
      </TouchableOpacity>

      {showShareModal && ( // Share modal
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Outfit</Text>
            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption..."
              value={caption}
              onChangeText={setCaption} // Caption input field
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowShareModal(false); // Close modal
                  setCaption(""); // Clear caption input
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.shareButtonStyle]}
                onPress={handlePost} // Post the outfit with caption
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

export default ShoesScreen;

