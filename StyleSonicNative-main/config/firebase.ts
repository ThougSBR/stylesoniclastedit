// Importing Firebase functions for initialization, authentication, and Firestore
import { initializeApp } from "firebase/app"; // Initializes Firebase app
import { getAuth } from "firebase/auth"; // Provides authentication methods
import { getFirestore } from "firebase/firestore"; // Provides Firestore database methods

// Firebase configuration object with the necessary keys and details
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY, // Public API key for Firebase
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN, // Firebase Authentication domain
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID, // Firebase project ID
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET, // Firebase Storage bucket URL
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, // Sender ID for Firebase Cloud Messaging
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID, // Firebase app ID
};

// Initialize Firebase with the provided configuration
const app = initializeApp(firebaseConfig);

// Export Firebase Authentication and Firestore for use in other parts of the app
export const auth = getAuth(app); // Firebase Authentication instance
export const db = getFirestore(app); // Firestore instance
