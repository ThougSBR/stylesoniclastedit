import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import CustomTextInput from "../../components/CustomTextInput";
import { auth } from "../../services/firebaseConfig";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { calculateBodyType } from "../../utils/bodyTypeCalculator";

const MeasurementsScreen = () => {
  const router = useRouter();
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [bust, setBust] = useState("");
  const [shoulders, setShoulders] = useState("");

  const handleSave = async () => {
    if (!waist || !hips || !bust || !shoulders) {
      alert("Please fill in all measurements!");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently signed in.");
      }

      // Calculate body type
      const bodyType = calculateBodyType(
        Number(bust),
        Number(waist),
        Number(hips),
        Number(shoulders)
      );

      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        measurements: {
          waist,
          hips,
          bust,
          shoulders,
        },
        bodyType,
        updatedAt: new Date(),
      });

      alert(`Measurements saved successfully! Your body type is: ${bodyType}`);
      router.replace("/analyser/main");
    } catch (error: any) {
      alert("Failed to save measurements: " + error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Body Measurements</Text>
          <Text style={styles.subtitle}>
            Please enter your measurements in centimeters (cm)
          </Text>

          <View style={styles.measurementsContainer}>
            <CustomTextInput
              placeholder="Waist measurement"
              value={waist}
              onChangeText={setWaist}
              keyboardType="numeric"
            />

            <CustomTextInput
              placeholder="Hips measurement"
              value={hips}
              onChangeText={setHips}
              keyboardType="numeric"
            />

            <CustomTextInput
              placeholder="Bust measurement"
              value={bust}
              onChangeText={setBust}
              keyboardType="numeric"
            />

            <CustomTextInput
              placeholder="Shoulders measurement"
              value={shoulders}
              onChangeText={setShoulders}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Measurements</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "#1C2C22",
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 10,
    fontFamily: "PlayfairDisplay",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#C2C2C2",
    marginBottom: 30,
    fontFamily: "Poppins",
    textAlign: "center",
  },
  measurementsContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#A0A897",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1C2C22",
    fontFamily: "Poppins",
  },
});

export default MeasurementsScreen;
