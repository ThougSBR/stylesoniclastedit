import { createUserWithEmailAndPassword } from "firebase/auth"; // Firebase method to create a new user with email and password
import { auth, db } from "../config/firebase"; // Import Firebase authentication and Firestore instances
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // Firestore methods to set document and timestamp

/**
 * The `signUp` function handles user registration, both by creating a Firebase user
 * and setting up their profile in Firestore.
 *
 * @param email - The user's email address
 * @param password - The user's chosen password
 * @param fullName - The user's full name
 * @param username - The user's desired username
 * @param location - The user's location
 * @param bio - A short biography about the user
 * @param gender - The user's gender
 * @returns The created user object on success
 * @throws Throws an error if the registration process fails
 */
export const signUp = async (
  email: string,
  password: string,
  fullName: string,
  username: string,
  location: string,
  bio: string,
  gender: string
) => {
  try {
    // Attempt to create a new user with the provided email and password using Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth, // The Firebase auth instance
      email, // User's email
      password // User's password
    );
    const user = userCredential.user; // The created user object from Firebase Auth

    // Once the user is created, create their profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email, // Store user's email in Firestore
      fullName, // Store user's full name in Firestore
      username, // Store user's username in Firestore
      location, // Store user's location in Firestore
      bio, // Store user's bio in Firestore
      gender, // Store user's gender in Firestore
      createdAt: serverTimestamp(), // Automatically add a timestamp for when the profile was created
      updatedAt: serverTimestamp(), // Set the update timestamp (initially same as createdAt)
    });

    return user; // Return the created user object

  } catch (error: any) {
    // If an error occurs during the process, throw a new error with the message
    throw new Error(error.message); // Provide the error message to the caller
  }
};


