import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Calendar } from "react-native-calendars";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { auth } from "../../services/firebaseConfig";
import {
  getFirestore,
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
} from "firebase/firestore";

// Main component for planning an outfit
const PlanOutfitScreen = () => {
  // State hooks to store selected outfit details
  const [selectedPants, setSelectedPants] = useState<string | null>(null);
  const [selectedShirt, setSelectedShirt] = useState<string | null>(null);
  const [selectedDress, setSelectedDress] = useState<string | null>(null);
  const [selectedAbaya, setSelectedAbaya] = useState<string | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [selectedJacket, setSelectedJacket] = useState<string | null>(null);
  const [selectedShoes, setSelectedShoes] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState<string | null>(null); // Control which picker to display
  const [categories, setCategories] = useState<Record<string, any[]>>({}); // Stores outfit categories (e.g., pants, shirts, etc.)
  const router = useRouter(); // Router for navigation

  // Fetches categories (e.g., dresses, shirts) from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      const userId = auth.currentUser?.uid; // Get the current user's ID
      if (userId) {
        const db = getFirestore(); // Get Firestore database reference
        const userRef = doc(db, "users", userId); // Reference to the user's document
        const userDoc = await getDoc(userRef); // Fetch user data
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCategories(data); // Set the categories from the Firestore data
        }
      }
    };
    fetchCategories(); // Call function to fetch categories
  }, []); // Empty dependency array, so it runs only once on mount

  // Handles saving the outfit selection to Firestore
  const handleSave = async () => {
    // Validation: Ensure a date is selected
    if (!selectedDate) {
      Alert.alert("Error", "Please select a date");
      return;
    }
    // Validation: Ensure either pants & shirt or dress/abaya is selected
    if (
      (!selectedPants || !selectedShirt) &&
      !selectedDress &&
      !selectedAbaya
    ) {
      Alert.alert(
        "Error",
        "Please select either pants and shirt, or a dress/abaya"
      );
      return;
    }
    // Validation: Ensure shoes are selected
    if (!selectedShoes) {
      Alert.alert("Error", "Please select shoes");
      return;
    }

    // Combine the selected outfit details into a single string
    const outfitDetails = [
      selectedPants,
      selectedShirt,
      selectedDress,
      selectedAbaya,
      ...selectedAccessories,
      selectedJacket,
      selectedShoes,
    ]
      .filter(Boolean) // Remove any null or undefined values
      .join(", "); // Join the items into a comma-separated string

    // Save outfit details to Firestore
    try {
      const userId = auth.currentUser?.uid; // Get current user ID
      if (userId) {
        const db = getFirestore(); // Get Firestore database reference
        const userRef = doc(db, "users", userId); // Reference to the user's document
        await updateDoc(userRef, {
          outfits: arrayUnion({ // Add the new outfit to the "outfits" array
            date: selectedDate,
            details: outfitDetails,
          }),
        });
        Alert.alert("Success", "Outfit saved successfully"); // Notify the user
        router.back(); // Navigate back to the previous screen
      }
    } catch (error) {
      console.error("Error saving outfit:", error); // Log error
      Alert.alert("Error saving outfit"); // Notify the user if saving fails
    }
  };

  // Handles the change of accessory selection
  const handleAccessoryChange = (itemValue: string) => {
    // Add or remove the accessory from the selected list
    if (selectedAccessories.includes(itemValue)) {
      setSelectedAccessories(
        selectedAccessories.filter((item) => item !== itemValue)
      );
    } else if (selectedAccessories.length < 3) {
      setSelectedAccessories([...selectedAccessories, itemValue]);
    } else {
      // Limit to 3 accessories only
      Alert.alert("You can select up to 3 accessories only");
    }
  };

  // Renders the picker for selecting categories (e.g., pants, shirts, jackets)
  const renderPicker = (
    category: string,
    selectedValue: string | null,
    setSelectedValue: (value: string | null) => void
  ) => (
    <View>
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => setShowPicker(showPicker === category ? null : category)} // Toggle category picker visibility
      >
        <Text style={styles.categoryName}>
          {selectedValue || `Select ${category}`} // Display selected item or placeholder text
        </Text>
      </TouchableOpacity>
      {showPicker === category && ( // Show the picker if the category is selected
        <Picker
          selectedValue={selectedValue} // Set the currently selected value
          style={styles.picker}
          onValueChange={(itemValue) => {
            setSelectedValue(itemValue); // Update the selected value
            setShowPicker(null); // Close the picker
          }}
        >
          <Picker.Item label={`Select ${category}`} value={null} />
          {categories[category]?.map((item, index) => (
            <Picker.Item key={index} label={item.name} value={item.name} /> // Render category items
          ))}
        </Picker>
      )}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome5 name="arrow-left" size={24} color="#A0A897" />
      </TouchableOpacity>
      <Text style={styles.title}>Plan Outfit</Text>
      {/* Render category pickers for each outfit item */}
      {renderPicker("dresses", selectedDress, setSelectedDress)}
      {renderPicker("abayas", selectedAbaya, setSelectedAbaya)}
      {renderPicker("pants", selectedPants, setSelectedPants)}
      {renderPicker("shirts", selectedShirt, setSelectedShirt)}
      
      {/* Render Accessories Picker */}
      <Text style={styles.label}>Select Accessories (up to 3)</Text>
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() =>
          setShowPicker(showPicker === "accessories" ? null : "accessories") // Toggle accessories picker visibility
        }
      >
        <Text style={styles.categoryName}>Select Accessories</Text>
      </TouchableOpacity>
      {showPicker === "accessories" && (
        <Picker
          selectedValue={null}
          style={styles.picker}
          onValueChange={handleAccessoryChange} // Handle accessory selection
        >
          <Picker.Item label="Select Accessories" value={null} />
          {categories.accessories?.map((item, index) => (
            <Picker.Item key={index} label={item.name} value={item.name} />
          ))}
        </Picker>
      )}
      {/* Display selected accessories */}
      <View style={styles.selectedItemsContainer}>
        {selectedAccessories.map((item, index) => (
          <Text key={index} style={styles.selectedItem}>
            {item}
          </Text>
        ))}
      </View>
      
      {/* Render category pickers for jackets and shoes */}
      {renderPicker("jackets", selectedJacket, setSelectedJacket)}
      {renderPicker("shoes", selectedShoes, setSelectedShoes)}
      
      {/* Render Calendar for date selection */}
      <Text style={styles.label}>Select Date</Text>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)} // Handle date selection
        markedDates={
          selectedDate
            ? { [selectedDate]: { selected: true, marked: true } }
            : {}
        }
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
        }}
      />
      
      {/* Save button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Styles for the component
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
  label: {
    fontSize: 18,
    color: "#FFC1A1",
    marginBottom: 10,
    fontFamily: "PlayfairDisplay",
  },
  picker: {
    height: 50,
    width: 300,
    color: "#A0A897",
    marginBottom: 20,
  },
  categoryCard: {
    width: 300,
    height: 50,
    backgroundColor: "#A0A897",
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryName: {
    fontSize: 16,
    color: "#1C2C22",
    fontWeight: "bold",
  },
  selectedItemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  selectedItem: {
    backgroundColor: "#A0A897",
    color: "#1C2C22",
    padding: 5,
    borderRadius: 5,
    margin: 5,
  },
  saveButton: {
    backgroundColor: "#A0A897",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: "90%",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#1C2C22",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PlanOutfitScreen;
