import React, { useState, useEffect } from "react"; // Import necessary React hooks
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native"; // Import React Native components
import { Calendar } from "react-native-calendars"; // Calendar component to show a calendar
import { useRouter } from "expo-router"; // Router for navigation
import { FontAwesome5, FontAwesome } from "@expo/vector-icons"; // FontAwesome icons for UI
import { auth } from "../../services/firebaseConfig"; // Firebase authentication
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore"; // Firestore methods

// Predefined marked dates for the calendar
const markedDates = {
  "2023-10-10": { marked: true, dotColor: "#FFC1A1" },
  "2023-10-15": { marked: true, dotColor: "#FFC1A1" },
  "2023-10-20": { marked: true, dotColor: "#FFC1A1" },
};

const PlannerHome = () => {
  const router = useRouter(); // Router hook for navigation
  const [outfitDetails, setOutfitDetails] = useState([]); // State for outfit details
  const [showOlderOutfits, setShowOlderOutfits] = useState(false); // State to show older outfits
  const [refreshing, setRefreshing] = useState(false); // State for refresh control

  // Function to fetch outfit details from Firestore
  const fetchOutfits = async () => {
    const userId = auth.currentUser?.uid; // Get current user ID from Firebase Auth
    if (userId) {
      const db = getFirestore(); // Get Firestore instance
      const userRef = doc(db, "users", userId); // Reference to the user's document
      const userDoc = await getDoc(userRef); // Get the document
      if (userDoc.exists()) {
        const data = userDoc.data(); // Extract data from the document
        // Sort outfits by date in ascending order
        const sortedOutfits = (data.outfits || []).sort((a, b) =>
          new Date(a.date) > new Date(b.date) ? 1 : -1
        );
        setOutfitDetails(sortedOutfits); // Update state with sorted outfits
      }
    }
  };

  // Function to refresh outfits when pulling down on the list
  const onRefresh = async () => {
    setRefreshing(true); // Set refreshing state to true
    await fetchOutfits(); // Fetch updated outfit details
    setRefreshing(false); // Set refreshing state to false after fetching
  };

  // Fetch outfits when the component mounts
  useEffect(() => {
    fetchOutfits(); // Call fetchOutfits on component mount
  }, []);

  // Function to delete an outfit when the delete button is pressed
  const deleteOutfit = (index) => {
    Alert.alert(
      "Delete Outfit", // Alert title
      "Are you sure you want to delete this outfit?", // Alert message
      [
        {
          text: "Cancel", // Cancel button
          style: "cancel",
        },
        {
          text: "Delete", // Delete button
          onPress: async () => {
            const userId = auth.currentUser?.uid; // Get current user ID from Firebase Auth
            if (userId) {
              const db = getFirestore(); // Get Firestore instance
              const userRef = doc(db, "users", userId); // Reference to the user's document
              const userDoc = await getDoc(userRef); // Get the document
              if (userDoc.exists()) {
                const data = userDoc.data(); // Extract data from the document
                const updatedOutfits = [...outfitDetails]; // Copy current outfit details
                updatedOutfits.splice(index, 1); // Remove the selected outfit
                await updateDoc(userRef, { outfits: updatedOutfits }); // Update Firestore document with new outfits list
                setOutfitDetails(updatedOutfits); // Update state with updated outfits
              }
            }
          },
          style: "destructive", // Style the button as destructive (red)
        },
      ]
    );
  };

  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
  const filteredOutfits = showOlderOutfits
    ? outfitDetails // If showOlderOutfits is true, show all outfits
    : outfitDetails.filter((outfit) => outfit.date >= currentDate); // Otherwise, only show outfits for future or today

  return (
    <ScrollView
      contentContainerStyle={styles.container} // Style for the scroll view container
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // Refresh control for pull-to-refresh functionality
      }
    >
      {/* Back button to navigate to the outfit planner */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/outfitPlanner")}
      >
        <FontAwesome5 name="arrow-left" size={24} color="#A0A897" />
      </TouchableOpacity>
      <Text style={styles.title}>Outfit Planner</Text>
      
      {/* Calendar component to show marked dates */}
      <Calendar
        style={styles.calendar}
        markedDates={markedDates} // Dates to be marked
        theme={{
          backgroundColor: "#1C2C22", // Dark background color for the calendar
          calendarBackground: "#1C2C22",
          textSectionTitleColor: "#FFC1A1", // Section title color
          selectedDayBackgroundColor: "#FFC1A1", // Color for selected days
          selectedDayTextColor: "#1C2C22", // Text color for selected days
          todayTextColor: "#FFC1A1", // Color for today's date
          dayTextColor: "#ffffff", // Color for day text
          textDisabledColor: "#d9e1e8", // Color for disabled dates
          monthTextColor: "#FFC1A1", // Color for month text
          arrowColor: "#1C2C22", // Arrow color for navigation
          textDayFontFamily: "PlayfairDisplay", // Font for day text
          textMonthFontFamily: "PlayfairDisplay", // Font for month text
          textDayHeaderFontFamily: "PlayfairDisplay", // Font for day header text
        }}
      />
      
      {/* Button to navigate to the plan-outfit page */}
      <TouchableOpacity
        style={styles.planButton}
        onPress={() => router.push("/planner/plan-outfit")}
      >
        <Text style={styles.planButtonText}>Plan Outfit</Text>
      </TouchableOpacity>

      {/* Display the list of outfits */}
      {filteredOutfits.map((outfit, index) => (
        <View key={index} style={styles.outfitContainer}>
          <View style={styles.outfitHeader}>
            <Text style={styles.outfitDate}>{outfit.date}</Text>
            {/* Delete button to remove the outfit */}
            <TouchableOpacity onPress={() => deleteOutfit(index)}>
              <FontAwesome name="trash" size={24} color="#1C2C22" />
            </TouchableOpacity>
          </View>
          {/* Outfit details */}
          <Text style={styles.outfitDetails}>{outfit.details}</Text>
        </View>
      ))}

      {/* Button to show older outfits */}
      {!showOlderOutfits && (
        <TouchableOpacity
          style={styles.showOlderButton}
          onPress={() => setShowOlderOutfits(true)}
        >
          <Text style={styles.showOlderButtonText}>Show Older Outfits</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

// Styles for the components
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
  },
  calendar: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
  },
  planButton: {
    backgroundColor: "#A0A897",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: "90%",
    alignItems: "center",
  },
  planButtonText: {
    color: "#1C2C22",
    fontSize: 16,
    fontWeight: "bold",
  },
  outfitContainer: {
    width: "100%",
    backgroundColor: "#A0A897",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  outfitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  outfitDate: {
    fontSize: 16,
    color: "#1C2C22",
    fontWeight: "bold",
    marginBottom: 5,
  },
  outfitDetails: {
    fontSize: 14,
    color: "#1C2C22",
  },
  showOlderButton: {
    backgroundColor: "#A0A897",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: "90%",
    alignItems: "center",
  },
  showOlderButtonText: {
    color: "#1C2C22",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PlannerHome; // Export the PlannerHome component

