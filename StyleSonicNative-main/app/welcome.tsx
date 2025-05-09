import { useRouter } from "expo-router";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to StyleSonic</Text>
        <Text style={styles.subtitle}>Your Personal Fashion Advisor</Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="color-palette" size={32} color="#FFC1A1" />
            <Text style={styles.featureText}>Personalized Style Analysis</Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="shirt" size={32} color="#FFC1A1" />
            <Text style={styles.featureText}>Smart Outfit Suggestions</Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="chatbubble" size={32} color="#FFC1A1" />
            <Text style={styles.featureText}>AI Fashion Advisor</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2C22",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "90%",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    color: "#FFC1A1",
    fontFamily: "PlayfairDisplay",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#FFC1A1",
    marginBottom: 40,
    textAlign: "center",
  },
  features: {
    width: "100%",
    marginBottom: 40,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C3E2D",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  featureText: {
    color: "#FFC1A1",
    fontSize: 16,
    marginLeft: 15,
    fontFamily: "Poppins",
  },
  button: {
    backgroundColor: "#FFC1A1",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: "#1C2C22",
    fontSize: 18,
    fontWeight: "bold",
  },
});
