import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios"; // Add axios for API requests
import { getUserProfile } from "../../services/authService"; // Import getUserProfile
import { auth } from "@/services/firebaseConfig";

const ARLIAI_API_KEY = "be3a5908-5798-481b-a952-c0c6466a36dd"; // Add API key

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<
    { id: number; text: string; sender: string }[]
  >([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const profileData = await getUserProfile(userId);
          setUserData(profileData);
          setMessages([
            {
              id: 1,
              text: `Hello! I'm StyloSonic, your AI fashion advisor. How can I assist you today?`,
              sender: "agent",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleSend = async () => {
    if (inputText.trim()) {
      const userMessage = {
        id: messages.length + 1,
        text: inputText,
        sender: "user",
      };
      setMessages([...messages, userMessage]);
      setInputText("");
      setIsTyping(true);

      try {
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
              { role: "user", content: inputText },
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
                }`,
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

        const assistantMessage = {
          id: messages.length + 2,
          text: response.data.choices[0].message.content,
          sender: "agent",
        };

        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: prevMessages.length + 2,
            text: "Sorry, I couldn't connect to the server. Please try again later.",
            sender: "agent",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleBackPress = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1C2C22" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerText}>StyloSonic</Text>
        </View>
      </View>
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
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
        {isTyping && (
          <View style={styles.agentMessage}>
            <Text style={styles.messageText}>...</Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask StyloSonic anything..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={24} color="#1C2C22" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2C22",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#A0A897",
    borderRadius: 8,
    marginBottom: 16,
    paddingTop: 32,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 26,
    top: 30,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerText: {
    color: "#1C2C22",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  agentMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#A0A897",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#FFC1A1",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageText: {
    color: "#1C2C22",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
    color: "#1C2C22",
  },
  sendButton: {
    backgroundColor: "#FFC1A1",
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
