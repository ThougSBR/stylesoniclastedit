import React, { useState, useEffect } from "react"; // Importing React and hooks
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native"; // Importing core React Native components
import { Calendar } from "react-native-calendars"; // Importing Calendar component for selecting dates
import { useRouter } from "expo-router"; // Importing router for navigation
import { FontAwesome5, FontAwesome } from "@expo/vector-icons"; // Importing FontAwesome icons
import { auth } from "../../services/firebaseConfig"; // Importing Firebase authentication
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore"; // Importing Firebase Firestore functions

// Sample marked dates for the calendar
const markedDates = {
  "2023-10-10": { marked: true, dotColor: "#FFC1A1" },
  "2023-10-15": { marked: true, dotColor: "#FFC1A1" },
  "2023-10-20": { marked: true, dotColor: "#FFC1A1" },
};

const PlannerHome = () => {
  const router = useRouter(); // Get navigation object from useRouter
  const [outfitDetails, setOutfitDetails] = useState([]); // State to store the list of outfits
  const [showOlderOutfits, setShowOlderOutfits] = useState(false); // State to toggle visibility of older outfits
  const [refreshing, setRefreshing] = useState(false); // State to manage pull-to-refresh behavior

  // Function to fetch outfit details from Firestore
  const fetchOutfits = async () => {
    const userId = auth.currentUser?.uid; // Get the current user's ID from Firebase authentication
    if (userId) {
      const db = getFirestore(); // Initialize Firestore
      const userRef = doc(db, "users", userId); // Reference to user's document in Firestore
      const userDoc = await getDoc(userRef); // Get the user's document

      if (userDoc.exists()) {
        const data = userDoc.data();
        const sortedOutfits = (data.outfits || []).sort((a, b) =>
          new Date(a.date) > new Date(b.date) ? 1 : -1 // Sort outfits by date
        );
        setOutfitDetails(sortedOutfits); // Set the sorted outfit details in state
      }
    }
  };

  // Function to handle pull-to-refresh action
  const onRefresh = async () => {
    setRefreshing(true); // Set refreshing state to true
    await fetchOutfits(); // Fetch updated outfit details
    setRefreshing(false); // Set refreshing state to false after data is fetched
  };

  // Fetch outfits when the component mounts
  useEffect(() => {
    fetchOutfits();
  }, []);

  // Function to delete an outfit from the list
  const deleteOutfit = (index) => {
    Alert.alert(
      "Delete Outfit", // Title for the confirmation dialog
      "Are you sure you want to delete this outfit?", // Message for the confirmation dialog
      [
        {
          text: "Cancel", // Cancel button
          style: "cancel",
        },
        {
          text: "Delete", // Delete button
          onPress: async () => {
            const userId = auth.currentUser?.uid; // Get current user's ID
            if (userId) {
              const db = getFirestore(); // Initialize Firestore
              const userRef = doc(db, "users", userId); // Reference to user's document in Firestore
              const userDoc = await getDoc(userRef); // Get the user's document

              if (userDoc.exists()) {
                const data = userDoc.data();
                const updatedOutfits = [...outfitDetails]; // Create a copy of the outfits array
                updatedOutfits.splice(index, 1); // Remove the selected outfit from the array
                await updateDoc(userRef, { outfits: updatedOutfits }); // Update Firestore with the new outfits array
                setOutfitDetails(updatedOutfits); // Update the state with the new outfits array
              }
            }
          },
          style: "destructive", // Make the delete button red
        },
      ]
    );
  };

  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in 'YYYY-MM-DD' format
  // Filter outfits to show only those that are today or in the future, based on the toggle state
  const filteredOutfits = showOlderOutfits
    ? outfitDetails
    : outfitDetails.filter((outfit) => outfit.date >= currentDate);

  return (
    <ScrollView
      contentContainerStyle={styles.container} // Apply container styles
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // Enable pull-to-refresh functionality
      }
    >
      {/* Page title */}
      <Text style={styles.title}>Outfit Planner</Text>

      {/* Calendar component for selecting dates */}
      <Calendar
        style={styles.calendar}
        markedDates={markedDates} // Pass marked dates to highlight specific dates
        theme={{
          backgroundColor: "#1C2C22",
          calendarBackground: "#1C2C22",
          textSectionTitleColor: "#FFC1A1",
          selectedDayBackgroundColor: "#FFC1A1",
          selectedDayTextColor: "#1C2C22",
          todayTextColor: "#FFC1A1",
          dayTextColor: "#ffffff",
          textDisabledColor: "#d9e1e8",
          monthTextColor: "#FFC1A1",
          arrowColor: "#1C2C22",
          textDayFontFamily: "PlayfairDisplay",
          textMonthFontFamily: "PlayfairDisplay",
          textDayHeaderFontFamily: "PlayfairDisplay",
        }} // Customize the calendar theme
      />

      {/* Button to navigate to outfit planning screen */}
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
            <Text style={styles.outfitDate}>{outfit.date}</Text> {/* Outfit date */}
            <TouchableOpacity onPress={() => deleteOutfit(index)}>
              <FontAwesome name="trash" size={24} color="#1C2C22" /> {/* Trash icon for deleting an outfit */}
            </TouchableOpacity>
          </View>
          <Text style={styles.outfitDetails}>{outfit.details}</Text> {/* Outfit details */}
        </View>
      ))}

      {/* Button to toggle visibility of older outfits */}
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

// Styles for the PlannerHome screen
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1C2C22", // Background color for the entire screen
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

export default PlannerHome;

