import { useRouter } from "expo-router"; // Importing useRouter hook for navigation
import { useState, useEffect } from "react"; // Importing hooks
import {
  Image,
  StyleSheet,
  Platform,
  View,
  Text,
  ScrollView,
  TouchableOpacity, // Import TouchableOpacity for handling clicks
} from "react-native"; // Importing core React Native components
import { Calendar } from "react-native-calendars"; // Importing calendar component
import chatmock from "../../assets/images/chatmock.png"; // Importing chat mock image
import axios from "axios"; // Import axios for API requests
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for the profile icon
import { auth } from "../../services/firebaseConfig"; // Importing Firebase authentication
import { getUserProfile } from "../../services/authService"; // Importing user profile fetching service
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore"; // Import Firebase functions

const ARLIAI_API_KEY = "be3a5908-5798-481b-a952-c0c6466a36dd"; // Define ARLIAI API key

// Defining the Suggestion interface to type suggestion data
interface Suggestion {
  id: number;
  text: string;
}

export default function HomeScreen() {
  const router = useRouter(); // Get navigation object from useRouter
  const [userName, setUserName] = useState<string>(""); // State to store the user's name
  const [suggestionsVisible, setSuggestionsVisible] = useState(true); // State to control visibility of suggestions
  const [needsAnalysis, setNeedsAnalysis] = useState(false); // State to determine if analysis is needed
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]); // State to store outfit suggestions
  const [loading, setLoading] = useState(false); // State to track if suggestions are loading

  useEffect(() => {
    const checkUserMeasurements = async () => {
      try {
        const user = auth.currentUser; // Get current authenticated user
        if (user) {
          const userProfile = await getUserProfile(user.uid); // Fetch user profile data
          if (userProfile.gender === "Female" && !userProfile.measurements) {
            router.push("/profile/measurements"); // Redirect to measurements page if not available
          }
        }
      } catch (error) {
        console.error("Error checking user measurements:", error); // Log any errors
      }
    };

    checkUserMeasurements();
  }, []); // Run once when component mounts

  useEffect(() => {
    const checkUserAnalysis = async () => {
      try {
        const user = auth.currentUser; // Get current authenticated user
        if (user) {
          const db = getFirestore(); // Initialize Firestore
          const userRef = doc(db, "users", user.uid); // Reference to user document
          const userDoc = await getDoc(userRef); // Get user document

          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (!userData.dominantColor) {
              setNeedsAnalysis(true); // Set flag if color analysis is needed
            }
          }
        }
      } catch (error) {
        console.error("Error checking user analysis:", error); // Log any errors
      }
    };

    checkUserAnalysis();
  }, []); // Run once when component mounts

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const user = auth.currentUser; // Get current authenticated user
        if (user) {
          const userProfile = await getUserProfile(user.uid); // Fetch user profile data
          if (userProfile.fullName) {
            setUserName(userProfile.fullName); // Set user name if available
          }
        }
      } catch (error) {
        console.error("Error fetching user name:", error); // Log any errors
      }
    };

    fetchUserName();
  }, []); // Run once when component mounts

  useEffect(() => {
    const fetchSuggestionsFromFirebase = async () => {
      try {
        const user = auth.currentUser; // Get current authenticated user
        if (!user) return;

        const db = getFirestore(); // Initialize Firestore
        const userRef = doc(db, "users", user.uid); // Reference to user document
        const userDoc = await getDoc(userRef); // Get user document

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.suggestions) {
            setSuggestions(
              userData.suggestions.map((suggestion: any, index: number) => ({
                id: index + 1, // Assign ID to each suggestion
                text: suggestion.text, // Store suggestion text
              }))
            );
          }
        }
      } catch (error) {
        console.error("Error fetching suggestions from Firebase:", error); // Log any errors
      }
    };

    fetchSuggestionsFromFirebase();
  }, []); // Run once when component mounts

  // Function to fetch new outfit suggestions from ARLIAI API
  const fetchSuggestions = async () => {
    try {
      const user = auth.currentUser; // Get current authenticated user
      if (!user) return;

      const userProfile = await getUserProfile(user.uid); // Fetch user profile data
      const db = getFirestore(); // Initialize Firestore
      const userRef = doc(db, "users", user.uid); // Reference to user document
      const userDoc = await getDoc(userRef); // Get user document
      const userData = userDoc.data();

      if (userData?.dominantColor && userData?.bodyType) {
        const response = await axios.post(
          "https://api.arliai.com/v1/chat/completions", // API endpoint for outfit suggestions
          {
            model: "Mistral-Nemo-12B-Instruct-2407",
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              {
                role: "user",
                content: `Generate three outfit suggestions in text format that would suit me based on:
                - Color Palette: ${userData.colorPalette?.join(", ") || ""}
                - Dominant Color: ${userData.dominantColor || ""}
                - Detected Season: ${userData.detectedSeason || ""}
                - Body Type: ${userData.bodyType || ""}
                
                IMPORTANT REQUIREMENTS:
                1. Each suggestion must be a concise description (max 24 words).
                2. Format the response as a JSON array with only 'text' property.
                
                Example of valid response format:
                [
                  { "text": "A navy blazer with beige chinos and brown loafers." },
                  { "text": "A floral summer dress with white sneakers." }
                ]`,
              },
            ],
            repetition_penalty: 1.1,
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
            max_tokens: 1024,
            stream: false,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${ARLIAI_API_KEY}`,
            },
          }
        );

        const content = response.data.choices[0]?.message?.content;
        console.log("API Response:", content);

        if (!content) {
          console.error("No content received from API");
          return;
        }

        try {
          const newSuggestions = JSON.parse(content); // Parse the API response
          const formattedSuggestions = newSuggestions.map(
            (suggestion: any, index: number) => ({
              id: index + 1, // Assign ID to each suggestion
              text: suggestion.text, // Store suggestion text
            })
          );

          setSuggestions(formattedSuggestions); // Update suggestions state

          // Save suggestions to Firebase
          await updateDoc(userRef, {
            suggestions: formattedSuggestions.map((s) => ({ text: s.text })),
          });
        } catch (parseError) {
          console.error("Error parsing API response:", parseError); // Log parsing errors
        }
      }
    } catch (error) {
      console.error("Error generating suggestions:", error); // Log any errors
    }
  };

  // Function to handle refreshing suggestions
  const handleRefreshSuggestions = async () => {
    setLoading(true); // Set loading state to true
    try {
      await fetchSuggestions(); // Fetch new suggestions
    } catch (error) {
      console.error("Error refreshing suggestions:", error); // Log any errors
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Function to toggle suggestions visibility
  const toggleSuggestions = () => {
    setSuggestionsVisible(!suggestionsVisible); // Toggle visibility
  };

  // Function to handle navigating to the Chat screen
  const handleChatPress = () => {
    router.replace("/chat/main"); // Navigate to the Chat screen
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Add header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>StyleSonic</Text>
          <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/profile/profile")}>
          <Ionicons name="person-circle-outline" size={32} color="#FFC1A1" />
        </TouchableOpacity>
      </View>

      {/* Display analysis reminder if analysis is needed */}
      {needsAnalysis && (
        <TouchableOpacity
          style={styles.analysisReminder}
          onPress={() => router.push("/analyser/main")}
        >
          <Ionicons name="color-palette" size={24} color="#FFC1A1" />
          <Text style={styles.analysisReminderText}>
            Complete your color analysis to get personalized recommendations
          </Text>
          <Ionicons name="arrow-forward" size={24} color="#FFC1A1" />
        </TouchableOpacity>
      )}

      {/* Content area */}
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={[styles.heading, styles.centerText]}>
            Welcome To StyleSonic!
          </Text>
          <Text style={[styles.tagline, styles.centerText]}>
            Your Personal Fashion Advisor
          </Text>
        </View>

        {/* Suggestions section */}
        <View style={styles.sectionContainer}>
          <View style={styles.suggestionsHeader}>
            <Text style={[styles.title, styles.Subheading]}>
              Suggested Outfits
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefreshSuggestions}
              disabled={loading}
            >
              <Ionicons
                name="refresh"
                size={24}
                color={loading ? "#A0A897" : "#FFC1A1"}
              />
            </TouchableOpacity>
          </View>

          {/* Render suggestions */}
          {suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <View key={suggestion.id} style={styles.suggestionMock}>
                <Text style={styles.suggestionText}>{suggestion.text}</Text>
              </View>
            ))
          ) : needsAnalysis ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Complete your color analysis to get personalized outfit
                suggestions
              </Text>
              <TouchableOpacity
                style={styles.analysisButton}
                onPress={() => router.push("/analyser/main")}
              >
                <Text style={styles.analysisButtonText}>Start Analysis</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Get personalized outfit suggestions based on your profile
              </Text>
              <TouchableOpacity
                style={styles.analysisButton}
                onPress={handleRefreshSuggestions}
                disabled={loading}
              >
                <Text style={styles.analysisButtonText}>
                  {loading ? "Loading..." : "Get Suggestions"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Chat section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.title, styles.Subheading]}>
            Talk with AI Advisor
          </Text>
          <TouchableOpacity style={styles.chatMock} onPress={handleChatPress}>
            <Image source={chatmock} style={styles.chatImage} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1C2C22", // Set background color for the whole screen
    borderColor: "#ffffff", // Added border color to match background color
    borderWidth: 1, // Added border width to match background color
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#1C2C22",
  },
  contentContainer: {
    backgroundColor: "#1C2C22", // Ensure content container background color is also set
    width: "90%",
    margin: "auto",
    marginTop: "15%",
    overflow: "hidden",
  },
  titleContainer: {},
  featureContainer: {
    marginBottom: 16,
  },
  stepContainer: {},
  sectionContainer: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#A0A897",
    borderRadius: 8,
    shadowColor: "#1C2C22",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 20,
  },
  calendarMock: {
    height: 400,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1C2C22",
    borderRadius: 8,
    marginTop: 8,
  },
  suggestionMock: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1C2C22",
    borderRadius: 8,
    marginTop: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionText: {
    color: "#FFC1A1",
    fontSize: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FFC1A1",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#FFC1A1",
  },
  buttonText: {
    color: "#1C2C22",
    fontWeight: "bold",
  },
  chatMock: {
    height: 300,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1C2C22",
    borderRadius: 8,
    marginTop: 8,
  },
  chatImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  heading: {
    fontFamily: "PlayfairDisplay",
    color: "#FFC1A1",
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
  },
  centerText: {
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    color: "#FFC1A1",
    marginTop: 8,
    fontFamily: "PlayfairDisplay",
  },
  Subheading: {
    fontSize: 22,
    color: "#1C2C22",
    fontFamily: "PlayfairDisplay",
    margin: "auto",
  },
  calendar: {
    borderRadius: 8,
    overflow: "hidden",
  },
  toggleText: {
    color: "#FFC1A1",
    textAlign: "center",
    marginVertical: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  mainImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    marginBottom: 16,
  },
  newSuggestionsButton: {
    backgroundColor: "#FFC1A1",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
    marginTop: 16,
    alignItems: "center",
  },
  header: {
    marginTop: 10,
    flexDirection: "row",
    fontWeight: "bold",
    fontSize: 24,
    color: "#FFC1A1",
    backgroundColor: "#1C2C22",
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
    textAlign: "center",
  },
  headerTitle: {
    fontSize: 20,
    color: "#FFC1A1",
    fontFamily: "PlayfairDisplay",
  },
  welcomeText: {
    fontSize: 16,
    color: "#FFC1A1",
    fontFamily: "PlayfairDisplay",
    marginTop: 8,
  },
  newSuggestionsButtonText: {
    color: "#1C2C22",
    fontWeight: "bold",
    fontSize: 16,
  },
  analysisReminder: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C3E2D",
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    justifyContent: "space-between",
  },
  analysisReminderText: {
    color: "#FFC1A1",
    fontSize: 14,
    flex: 1,
    marginHorizontal: 10,
    fontFamily: "Poppins",
  },
  placeholderImage: {
    backgroundColor: "#A0A897",
    justifyContent: "center",
    alignItems: "center",
  },
  suggestionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    color: "#FFC1A1",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 16,
  },
  analysisButton: {
    backgroundColor: "#FFC1A1",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
  },
  analysisButtonText: {
    color: "#1C2C22",
    fontWeight: "bold",
    fontSize: 16,
  },
}); 


