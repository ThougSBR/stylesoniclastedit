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

const JacketsScreen = () => {
  const [jackets, setJackets] = useState<
    { imageId: string; name: string; imageUrl: string }[]
  >([]);
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedJacket, setSelectedJacket] = useState<{
    imageId: string;
    name: string;
    imageUrl: string;
  } | null>(null);
  const [caption, setCaption] = useState("");

  useEffect(() => {
    const fetchJackets = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const db = getFirestore();
          const userRef = doc(db, "users", userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const jacketsList = userData.jackets || [];
            // Ensure each jacket item has an imageUrl
            const jacketsWithUrls = jacketsList.map((jacket: any) => ({
              ...jacket,
              imageUrl:
                jacket.imageUrl ||
                `http://192.168.0.16:5000/uploads/${jacket.imageId}`,
            }));
            setJackets(jacketsWithUrls);
          }
        }
      } catch (error) {
        console.error("Error fetching jackets:", error);
        Alert.alert("Error", "Failed to fetch jackets");
      }
    };

    fetchJackets();
  }, []);

  const handleShare = async (jacket: {
    imageId: string;
    name: string;
    imageUrl: string;
  }) => {
    if (!jacket.imageUrl) {
      Alert.alert("Error", "Cannot share outfit: Image URL is missing");
      return;
    }
    setSelectedJacket(jacket);
    setShowShareModal(true);
  };

  const handlePost = async () => {
    if (!selectedJacket || !caption.trim()) {
      Alert.alert("Error", "Please enter a caption");
      return;
    }

    if (!selectedJacket.imageUrl) {
      Alert.alert("Error", "Cannot share outfit: Image URL is missing");
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        const db = getFirestore();
        await addDoc(collection(db, "posts"), {
          userId: user.uid,
          userName: "Anonymous",
          imageUrl: selectedJacket.imageUrl,
          caption: caption.trim(),
          timestamp: new Date(),
          likes: 0,
        });

        setShowShareModal(false);
        setCaption("");
        Alert.alert("Success", "Outfit shared successfully!");
      }
    } catch (error) {
      console.error("Error sharing outfit:", error);
      Alert.alert("Error", "Failed to share outfit");
    }
  };

  const handleDelete = async (jacket: { imageId: string; name: string }) => {
    try {
      // Delete the image from the backend
      const response = await fetch(
        `http://192.168.0.16:5000/delete/${jacket.imageId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();
      if (result.success) {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const db = getFirestore();
          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, {
            jackets: arrayRemove(jacket),
          });
          setJackets((prevJackets) =>
            prevJackets.filter((j) => j.imageId !== jacket.imageId)
          );
          Alert.alert("Success", "Image deleted successfully");
        }
      } else {
        console.error("Failed to delete image from backend:", result.error);
        Alert.alert("Error", "Failed to delete image from backend");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      Alert.alert("Error", "Failed to delete image");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome5 name="arrow-left" size={24} color="#A0A897" />
      </TouchableOpacity>

      <Text style={styles.title}>My Jackets</Text>

      <View style={styles.imageGrid}>
        {jackets.map((jacket) => (
          <View key={jacket.imageId} style={styles.imageContainer}>
            <Image source={{ uri: jacket.imageUrl }} style={styles.image} />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageName}>{jacket.name}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => handleShare(jacket)}
                >
                  <Ionicons name="share-social" size={24} color="#FFC1A1" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(jacket)}
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
        onPress={() => router.push("/closet/upload?category=jackets")}
      >
        <Text style={styles.addButtonText}>Add New Jacket</Text>
      </TouchableOpacity>

      {showShareModal && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Outfit</Text>
            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption..."
              value={caption}
              onChangeText={setCaption}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowShareModal(false);
                  setCaption("");
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.shareButtonStyle]}
                onPress={handlePost}
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

export default JacketsScreen;
