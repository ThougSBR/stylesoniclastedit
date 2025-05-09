import React, { useState, useEffect } from "react"; // Importing React and necessary hooks
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native"; // Importing core React Native components
import { FontAwesome5 } from "@expo/vector-icons"; // Importing FontAwesome5 icons for category icons
import { useRouter } from "expo-router"; // Importing useRouter hook from expo-router for navigation
import { auth } from "../../services/firebaseConfig"; // Importing Firebase auth
import { getUserProfile } from "../../services/authService"; // Importing user profile fetching service

// Default categories displayed for the closet
const baseCategories = [
  { name: "Pants", icon: "user-tie", route: "/closet/pants" },
  { name: "Shoes", icon: "shoe-prints", route: "/closet/shoes" },
  { name: "Shirts", icon: "tshirt", route: "/closet/shirts" },
  { name: "Jackets", icon: "user-secret", route: "/closet/jackets" },
  { name: "Accessories", icon: "hat-cowboy", route: "/closet/accessories" },
];

// Additional categories for female users
const femaleCategories = [
  { name: "Dresses", icon: "female", route: "/closet/dresses" },
  { name: "Abayas", icon: "pray", route: "/closet/abayas" },
];

const ExploreScreen = () => {
  const router = useRouter(); // Using the useRouter hook for navigation
  const [isFemale, setIsFemale] = useState(false); // State to determine if the user is female
  const [categories, setCategories] = useState(baseCategories); // State to store categories to display

  useEffect(() => {
    const checkUserGender = async () => {
      try {
        const user = auth.currentUser; // Get the current authenticated user
        if (user) {
          const userProfile = await getUserProfile(user.uid); // Fetch user profile data
          if (userProfile.gender === "Female") { // Check if the user is female
            setIsFemale(true); // Update state if the user is female
            setCategories([...baseCategories, ...femaleCategories]); // Add female-specific categories
          }
        }
      } catch (error) {
        console.error("Error checking user gender:", error); // Log any errors
      }
    };

    checkUserGender(); // Run the gender check when the component mounts
  }, []);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container, // Apply container styles
        { backgroundColor: "#1C2C22" }, // Set the background color
      ]}
    >
      <Text style={styles.title}>My Closet</Text> {/* Title for the screen */}
      <View style={styles.categoriesContainer}>
        {/* Mapping through the categories array and displaying each category */}
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index} // Unique key for each category
            style={styles.categoryCard} // Category card styles
            onPress={() => router.push(category.route)} // Navigate to category route on press
          >
            <FontAwesome5
              name={category.icon} // Icon for the category
              size={50} // Icon size
              color="#1C2C22" // Icon color
              style={styles.categoryIcon} // Icon styling
            />
            <Text style={styles.categoryName}>{category.name}</Text> {/* Display category name */}
          </TouchableOpacity>
        ))}
      </View>
      {/* Button to add new clothes to the closet */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/closet/upload")} // Navigate to upload page
      >
        <Text style={styles.addButtonText}>Add Clothes</Text> {/* Button text */}
      </TouchableOpacity>
    </ScrollView>
  );
};

// Styles for the ExploreScreen component
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
    color: "#FFC1A1", // Light color for the title
    marginBottom: 20,
  },
  categoriesContainer: {
    flexDirection: "row", // Row layout for the categories
    flexWrap: "wrap", // Allow categories to wrap on multiple lines
    justifyContent: "center", // Center align the categories
  },
  categoryCard: {
    width: 150,
    height: 180,
    backgroundColor: "#A0A897", // Card background color
    borderRadius: 10, // Rounded corners for the card
    margin: 10, // Margin between cards
    justifyContent: "center",
    alignItems: "center", // Center the content inside the card
  },
  categoryIcon: {
    marginBottom: 10, // Margin below the icon
  },
  categoryName: {
    fontSize: 16,
    color: "#1C2C22", // Category name color
    fontWeight: "bold", // Bold category name
  },
  addButton: {
    backgroundColor: "#A0A897", // Button background color
    padding: 15, // Padding inside the button
    borderRadius: 10, // Rounded corners for the button
    marginTop: 20, // Margin above the button
    width: "90%", // Button width
    alignItems: "center", // Center the button text
  },
  addButtonText: {
    color: "#1C2C22", // Button text color
    fontSize: 16,
    fontWeight: "bold", // Bold button text
  },
});

export default ExploreScreen;
