import React, { useState, useEffect } from "react"; // Importing React and hooks
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native"; // Importing core React Native components
import { Ionicons } from "@expo/vector-icons"; // Importing Ionicons for icons
import { useRouter } from "expo-router"; // Importing useRouter for navigation
import axios from "axios"; // Importing axios for API requests
import { getUserProfile } from "../../services/authService"; // Import getUserProfile function from authService
import { auth } from "@/services/firebaseConfig"; // Import Firebase authentication

const ARLIAI_API_KEY = "be3a5908-5798-481b-a952-c0c6466a36dd"; // API Key for the ARLIAI API

export default function ChatScreen() {
  const router = useRouter(); // Router instance for navigation
  const [messages, setMessages] = useState<
    { id: number; text: string; sender: string }[] // Array to store messages
  >([]);
  const [inputText, setInputText] = useState(""); // Store the user's input text
  const [isTyping, setIsTyping] = useState(false); // Track if the assistant is typing
  const [userData, setUserData] = useState<any>(null); // Store the user data

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = auth.currentUser?.uid; // Get current user's ID
        if (userId) {
          const profileData = await getUserProfile(userId); // Fetch user profile data
          setUserData(profileData); // Store profile data
          setMessages([
            {
              id: 1,
              text: `Hello! I'm StyloSonic, your AI fashion advisor. How can I assist you today?`,
              sender: "agent",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching profile:", error); // Log error if fetching fails
      }
    };

    fetchUserData(); // Call the function to fetch user data
  }, []);

  // Function to handle sending the message
  const handleSend = async () => {
    if (inputText.trim()) {
      const userMessage = {
        id: messages.length + 1, // Generate a new message ID
        text: inputText, // User's message text
        sender: "user", // Set the sender to 'user'
      };
      setMessages([...messages, userMessage]); // Add the user's message to the message list
      setInputText(""); // Clear input field
      setIsTyping(true); // Set typing state to true while waiting for response

      try {
        // Send a POST request to the ARLIAI API to get the assistant's response
        const response = await axios.post(
          "https://api.arliai.com/v1/chat/completions",
          {
            model: "Mistral-Nemo-12B-Instruct-2407",
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              ...messages.map((msg) => ({
                role: msg.sender === "user" ? "user" : "assistant",
                content: msg.text,
              })),
              { role: "user", content: inputText }, // Send user's input
              {
                role: "user",
                content: `User Info: 
                Name: ${userData?.fullName || "John Doe"}
                Username: @${userData?.username || "johndoe"}
                Email: ${userData?.email || "johndoe@example.com"}
                Bio: ${userData?.bio || "This is a sample bio."}
                Location: ${userData?.location || "New York, USA"}
                Dominant Color: ${userData?.dominantColor || "#FFFFFF"}
                Detected Season: ${userData?.detectedSeason || "Unknown"}
                Suggested Colors: ${
                  userData?.colorPalette?.join(", ") || "None"
                }
                Outfit Suggestions: ${
                  userData?.outfitSuggestions?.join(", ") || "None"
                }`, // Add user data for personalized response
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
              Authorization: `Bearer ${ARLIAI_API_KEY}`, // Add API authorization header
            },
          }
        );

        // Create assistant's response message and add to messages
        const assistantMessage = {
          id: messages.length + 2, // Generate a new message ID for assistant's response
          text: response.data.choices[0].message.content, // Extract assistant's response from API
          sender: "agent", // Set sender to 'agent'
        };

        setMessages((prevMessages) => [...prevMessages, assistantMessage]); // Update messages with assistant's response
      } catch (error) {
        console.error("Error sending message:", error); // Log error if message sending fails
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: prevMessages.length + 2,
            text: "Sorry, I couldn't connect to the server. Please try again later.",
            sender: "agent", // Show error message from agent
          },
        ]);
      } finally {
        setIsTyping(false); // Set typing state to false after response
      }
    }
  };

  // Handle back press action (navigate to home screen)
  const handleBackPress = () => {
    router.replace("/(tabs)"); // Navigate to the home screen
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1C2C22" /> {/* Back button */}
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerText}>StyloSonic</Text> {/* Header Title */}
        </View>
      </View>

      {/* Scrollable Messages Container */}
      <ScrollView style={styles.messagesContainer}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={
              message.sender === "agent"
                ? styles.agentMessage
                : styles.userMessage
            }
          >
            <Text style={styles.messageText}>{message.text}</Text> {/* Display each message */}
          </View>
        ))}

        {/* Show typing indicator while the agent is typing */}
        {isTyping && (
          <View style={styles.agentMessage}>
            <Text style={styles.messageText}>...</Text> {/* Typing indicator */}
          </View>
        )}
      </ScrollView>

      {/* Input Section */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText} // Update input text state
          placeholder="Ask StyloSonic anything..." // Placeholder text
          placeholderTextColor="#888" // Placeholder text color
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={24} color="#1C2C22" /> {/* Send button */}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2C22", // Set background color for the screen
  },
  header: {
    flexDirection: "row", // Arrange header elements in a row
    alignItems: "center", // Center items vertically
    padding: 16,
    backgroundColor: "#A0A897", // Background color for header
    borderRadius: 8, // Rounded corners for header
    marginBottom: 16,
    paddingTop: 32, // Padding at the top for spacing
    position: "relative", // Position the back button
  },
  backButton: {
    position: "absolute", // Position back button at top left
    left: 26,
    top: 30,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center", // Center the header title horizontally
  },
  headerText: {
    color: "#1C2C22",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center", // Center the header text
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  agentMessage: {
    alignSelf: "flex-start", // Align agent's message to the left
    backgroundColor: "#A0A897", // Background color for agent's message
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: "flex-end", // Align user's message to the right
    backgroundColor: "#FFC1A1", // Background color for user's message
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageText: {
    color: "#1C2C22", // Text color for messages
  },
  inputContainer: {
    flexDirection: "row", // Arrange input and send button in a row
    alignItems: "center", // Center the input field and button vertically
    padding: 16,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff", // White background for the input field
    padding: 10,
    borderRadius: 8,
    marginRight: 8, // Space between input and send button
    color: "#1C2C22", // Dark text color for the input
  },
  sendButton: {
    backgroundColor: "#FFC1A1", // Background color for send button
    padding: 10,
    borderRadius: 8, // Rounded corners for the send button
    justifyContent: "center", // Center the icon inside the button
    alignItems: "center", // Center the icon vertically
  },
}); 

