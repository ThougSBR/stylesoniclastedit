import { auth } from "./firebaseConfig"; // Import Firebase authentication instance
import {
  createUserWithEmailAndPassword, // Firebase method to create a new user
  signInWithEmailAndPassword, // Firebase method to sign in with email and password
  sendPasswordResetEmail, // Firebase method to send password reset email
  signOut, // Firebase method to sign out the user
  User, // Firebase User type for the user object
  updatePassword, // Firebase method to update the user's password
  reauthenticateWithCredential, // Firebase method to reauthenticate the user
  EmailAuthProvider, // Firebase provider for email authentication
} from "firebase/auth"; // Firebase authentication methods

import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"; // Firestore methods to interact with the Firestore database

// Initialize Firestore database
const db = getFirestore();

// ✅ Sign Up function for creating a new user and saving additional info to Firestore
export const signUp = async (
  email: string,
  password: string,
  fullName: string,
  username: string,
  location: string,
  bio: string,
  gender: string,
  measurements?: {
    waist: string;
    hips: string;
    bust: string;
    shoulders: string;
  } | null // Optional measurements object
) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user; // Get user information after sign-up

    // 🔹 Save additional user info to Firestore under "users/{userId}"
    await setDoc(doc(db, "users", user.uid), {
      fullName,
      username,
      email,
      location,
      bio,
      gender,
      measurements: measurements || null, // Save measurements if provided, otherwise null
      profilePic: "", // Default profile picture path (empty initially)
      createdAt: new Date(), // Save the user creation date
    });

    return user; // Return the created user object
  } catch (error) {
    console.error("Signup Error:", error); // Log any error that occurs during sign-up
    throw error; // Rethrow the error to be handled elsewhere
  }
};

// ✅ Login function to sign in a user with email and password
export const login = async (
  email: string,
  password: string
): Promise<User | null> => {
  try {
    // Sign in the user with email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user; // Return the signed-in user object
  } catch (error) {
    console.error("Login Error:", error); // Log any error that occurs during login
    throw error; // Rethrow the error to be handled elsewhere
  }
};

// ✅ Logout function to sign out the current user
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth); // Sign out the user from Firebase
  } catch (error) {
    console.error("Logout Error:", error); // Log any error that occurs during logout
    throw error; // Rethrow the error to be handled elsewhere
  }
};

// ✅ Reset password function to send a password reset email
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email); // Send password reset email to the provided email address
    return "Reset link sent! Check your email."; // Return success message
  } catch (error) {
    console.error("Reset Password Error:", error); // Log any error that occurs during password reset
    throw error; // Rethrow the error to be handled elsewhere
  }
};

// ✅ Get User Profile from Firestore using the user ID
export const getUserProfile = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId)); // Get the user's document from Firestore
    if (userDoc.exists()) {
      return userDoc.data(); // Return the user's data if the document exists
    } else {
      throw new Error("User profile not found!"); // If no document is found, throw an error
    }
  } catch (error) {
    console.error("Error fetching user profile:", error); // Log any error that occurs during profile fetch
    throw error; // Rethrow the error to be handled elsewhere
  }
};

// ✅ Change User Password function: Re-authenticate the user and update their password
export const changePassword = async (
  currentPassword: string, // Current password for re-authentication
  newPassword: string // New password to set
): Promise<void> => {
  const user = auth.currentUser; // Get the current authenticated user
  if (!user) {
    throw new Error("No user is currently signed in."); // If no user is signed in, throw an error
  }

  // Create a credential using the current email and password for reauthentication
  const credential = EmailAuthProvider.credential(user.email!, currentPassword);

  try {
    // Reauthenticate the user with the current credentials
    await reauthenticateWithCredential(user, credential);
    // Once reauthenticated, update the user's password
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error("Change Password Error:", error); // Log any error that occurs during password change
    throw error; // Rethrow the error to be handled elsewhere
  }
};

