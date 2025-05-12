// Import necessary Firebase modules and React Native AsyncStorage
import { initializeApp } from "firebase/app"; // To initialize Firebase App
import {
  getAuth, // To get the Firebase Auth instance
  initializeAuth, // To initialize Firebase Authentication with persistence
  getReactNativePersistence, // To use React Native's AsyncStorage for persistence
  onAuthStateChanged, // To listen to authentication state changes
} from "firebase/auth"; // Import Firebase Auth functionalities
import AsyncStorage from "@react-native-async-storage/async-storage"; // AsyncStorage for persisting authentication data across app restarts

// Firebase configuration object containing project credentials and Firebase settings
const firebaseConfig = {
  apiKey: "AIzaSyBcErAl3qP7EtN8GF2sz_bhUm7mY7d-cQI", // API key for accessing Firebase services
  authDomain: "stylesonic.firebaseapp.com", // Firebase Authentication domain
  projectId: "stylesonic", // Firebase project ID
  storageBucket: "stylesonic.firebasestorage.app", // Firebase Storage bucket
  messagingSenderId: "1000791091261", // Sender ID for Firebase Cloud Messaging
  appId: "1:1000791091261:web:919f06a0b7014513d76254", // Firebase App ID
};

// Initialize Firebase App using the configuration
const app = initializeApp(firebaseConfig);

// Enable Persistent Login State by using AsyncStorage to persist the authentication state across app restarts
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage), // Use AsyncStorage for persisting auth data
});

// ✅ Listen for Auth State Changes
let currentUser: any = null; // Variable to store the current user

// Subscribe to authentication state changes
onAuthStateChanged(auth, (user) => {
  currentUser = user; // Update the current user when authentication state changes
});

// Export Firebase Auth and the currentUser for use in other parts of the application
export { auth, currentUser };
export default app; // Export the Firebase app instance for use elsewhere
