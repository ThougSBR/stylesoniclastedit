import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth } from "../../services/firebaseConfig";
import { getUserProfile } from "../../services/authService";

const baseCategories = [
  { name: "Pants", icon: "user-tie", route: "/closet/pants" },
  { name: "Shoes", icon: "shoe-prints", route: "/closet/shoes" },
  { name: "Shirts", icon: "tshirt", route: "/closet/shirts" },
  { name: "Jackets", icon: "user-secret", route: "/closet/jackets" },
  { name: "Accessories", icon: "hat-cowboy", route: "/closet/accessories" },
];

const femaleCategories = [
  { name: "Dresses", icon: "female", route: "/closet/dresses" },
  { name: "Abayas", icon: "pray", route: "/closet/abayas" },
];

const ExploreScreen = () => {
  const router = useRouter();
  const [isFemale, setIsFemale] = useState(false);
  const [categories, setCategories] = useState(baseCategories);

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

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: "#1C2C22" }, // Apply Dominant Color
      ]}
    >
      <Text style={styles.title}>My Closet</Text>
      <View style={styles.categoriesContainer}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={styles.categoryCard}
            onPress={() => router.push(category.route)}
          >
            <FontAwesome5
              name={category.icon}
              size={50}
              color="#1C2C22"
              style={styles.categoryIcon}
            />
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/closet/upload")}
      >
        <Text style={styles.addButtonText}>Add Clothes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "PlayfairDisplay",
    color: "#FFC1A1",
    marginBottom: 20,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  categoryCard: {
    width: 150,
    height: 180,
    backgroundColor: "#A0A897",
    borderRadius: 10,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryIcon: {
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 16,
    color: "#1C2C22",
    fontWeight: "bold",
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
});

export default ExploreScreen;
