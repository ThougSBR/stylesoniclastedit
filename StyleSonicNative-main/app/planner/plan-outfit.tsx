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

const PlanOutfitScreen = () => {
  const [selectedPants, setSelectedPants] = useState<string | null>(null);
  const [selectedShirt, setSelectedShirt] = useState<string | null>(null);
  const [selectedDress, setSelectedDress] = useState<string | null>(null);
  const [selectedAbaya, setSelectedAbaya] = useState<string | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [selectedJacket, setSelectedJacket] = useState<string | null>(null);
  const [selectedShoes, setSelectedShoes] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState<string | null>(null);
  const [categories, setCategories] = useState<Record<string, any[]>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const db = getFirestore();
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCategories(data);
        }
      }
    };
    fetchCategories();
  }, []);

  const handleSave = async () => {
    if (!selectedDate) {
      Alert.alert("Error", "Please select a date");
      return;
    }
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
    if (!selectedShoes) {
      Alert.alert("Error", "Please select shoes");
      return;
    }

    const outfitDetails = [
      selectedPants,
      selectedShirt,
      selectedDress,
      selectedAbaya,
      ...selectedAccessories,
      selectedJacket,
      selectedShoes,
    ]
      .filter(Boolean)
      .join(", ");

    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const db = getFirestore();
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          outfits: arrayUnion({
            date: selectedDate,
            details: outfitDetails,
          }),
        });
        Alert.alert("Success", "Outfit saved successfully");
        router.back();
      }
    } catch (error) {
      console.error("Error saving outfit:", error);
      Alert.alert("Error saving outfit");
    }
  };

  const handleAccessoryChange = (itemValue: string) => {
    if (selectedAccessories.includes(itemValue)) {
      setSelectedAccessories(
        selectedAccessories.filter((item) => item !== itemValue)
      );
    } else if (selectedAccessories.length < 3) {
      setSelectedAccessories([...selectedAccessories, itemValue]);
    } else {
      Alert.alert("You can select up to 3 accessories only");
    }
  };

  const renderPicker = (
    category: string,
    selectedValue: string | null,
    setSelectedValue: (value: string | null) => void
  ) => (
    <View>
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => setShowPicker(showPicker === category ? null : category)}
      >
        <Text style={styles.categoryName}>
          {selectedValue || `Select ${category}`}
        </Text>
      </TouchableOpacity>
      {showPicker === category && (
        <Picker
          selectedValue={selectedValue}
          style={styles.picker}
          onValueChange={(itemValue) => {
            setSelectedValue(itemValue);
            setShowPicker(null);
          }}
        >
          <Picker.Item label={`Select ${category}`} value={null} />
          {categories[category]?.map((item, index) => (
            <Picker.Item key={index} label={item.name} value={item.name} />
          ))}
        </Picker>
      )}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <FontAwesome5 name="arrow-left" size={24} color="#A0A897" />
      </TouchableOpacity>
      <Text style={styles.title}>Plan Outfit</Text>
      {renderPicker("dresses", selectedDress, setSelectedDress)}
      {renderPicker("abayas", selectedAbaya, setSelectedAbaya)}
      {renderPicker("pants", selectedPants, setSelectedPants)}
      {renderPicker("shirts", selectedShirt, setSelectedShirt)}
      <Text style={styles.label}>Select Accessories (up to 3)</Text>
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() =>
          setShowPicker(showPicker === "accessories" ? null : "accessories")
        }
      >
        <Text style={styles.categoryName}>Select Accessories</Text>
      </TouchableOpacity>
      {showPicker === "accessories" && (
        <Picker
          selectedValue={null}
          style={styles.picker}
          onValueChange={handleAccessoryChange}
        >
          <Picker.Item label="Select Accessories" value={null} />
          {categories.accessories?.map((item, index) => (
            <Picker.Item key={index} label={item.name} value={item.name} />
          ))}
        </Picker>
      )}
      <View style={styles.selectedItemsContainer}>
        {selectedAccessories.map((item, index) => (
          <Text key={index} style={styles.selectedItem}>
            {item}
          </Text>
        ))}
      </View>
      {renderPicker("jackets", selectedJacket, setSelectedJacket)}
      {renderPicker("shoes", selectedShoes, setSelectedShoes)}
      <Text style={styles.label}>Select Date</Text>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
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
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
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
    backgroundColor: "#1C2C22",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  backButtonText: {
    color: "#A0A897",
    fontSize: 16,
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
  sectionTitle: {
    fontSize: 20,
    color: "#FFC1A1",
    marginVertical: 15,
    fontFamily: "PlayfairDisplay",
    alignSelf: "flex-start",
    marginLeft: 20,
  },
});

export default PlanOutfitScreen;
