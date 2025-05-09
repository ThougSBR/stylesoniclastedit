import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useRouter } from "expo-router";
import { FontAwesome5, FontAwesome } from "@expo/vector-icons";
import { auth } from "../../services/firebaseConfig";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const markedDates = {
  "2023-10-10": { marked: true, dotColor: "#FFC1A1" },
  "2023-10-15": { marked: true, dotColor: "#FFC1A1" },
  "2023-10-20": { marked: true, dotColor: "#FFC1A1" },
};

const PlannerHome = () => {
  const router = useRouter();
  const [outfitDetails, setOutfitDetails] = useState([]);
  const [showOlderOutfits, setShowOlderOutfits] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOutfits = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const db = getFirestore();
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        const sortedOutfits = (data.outfits || []).sort((a, b) =>
          new Date(a.date) > new Date(b.date) ? 1 : -1
        );
        setOutfitDetails(sortedOutfits);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOutfits();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOutfits();
  }, []);

  const deleteOutfit = (index) => {
    Alert.alert(
      "Delete Outfit",
      "Are you sure you want to delete this outfit?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            const userId = auth.currentUser?.uid;
            if (userId) {
              const db = getFirestore();
              const userRef = doc(db, "users", userId);
              const userDoc = await getDoc(userRef);
              if (userDoc.exists()) {
                const data = userDoc.data();
                const updatedOutfits = [...outfitDetails];
                updatedOutfits.splice(index, 1);
                await updateDoc(userRef, { outfits: updatedOutfits });
                setOutfitDetails(updatedOutfits);
              }
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const currentDate = new Date().toISOString().split("T")[0];
  const filteredOutfits = showOlderOutfits
    ? outfitDetails
    : outfitDetails.filter((outfit) => outfit.date >= currentDate);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Outfit Planner</Text>
      <Calendar
        style={styles.calendar}
        markedDates={markedDates}
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
      <TouchableOpacity
        style={styles.planButton}
        onPress={() => router.push("/planner/plan-outfit")}
      >
        <Text style={styles.planButtonText}>Plan Outfit</Text>
      </TouchableOpacity>
      {filteredOutfits.map((outfit, index) => (
        <View key={index} style={styles.outfitContainer}>
          <View style={styles.outfitHeader}>
            <Text style={styles.outfitDate}>{outfit.date}</Text>
            <TouchableOpacity onPress={() => deleteOutfit(index)}>
              <FontAwesome name="trash" size={24} color="#1C2C22" />
            </TouchableOpacity>
          </View>
          <Text style={styles.outfitDetails}>{outfit.details}</Text>
        </View>
      ))}
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
