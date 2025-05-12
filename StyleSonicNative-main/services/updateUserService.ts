import { getFirestore, doc, updateDoc } from "firebase/firestore"; // Importing Firestore methods to interact with the database

// Initialize Firestore
const db = getFirestore();

// Function to update a user's profile in Firestore
export const updateUserProfile = async (
  userId: string, // User's unique ID (Firebase user ID)
  fullName: string, // Full name of the user
  username: string, // Username chosen by the user
  bio: string, // Short biography of the user
  location: string, // Location of the user
  measurements?: { // Optional measurements object for the user
    waist: string;
    hips: string;
    bust: string;
    shoulders: string;
  } | null
) => {
  try {
    // Reference to the user's document in Firestore
    const userDocRef = doc(db, "users", userId);

    // Update the user's profile in Firestore
    await updateDoc(userDocRef, {
      fullName, // Update the full name in the Firestore document
      username, // Update the username in the Firestore document
      bio, // Update the bio in the Firestore document
      location, // Update the location in the Firestore document
      measurements: measurements || null, // Update the measurements if provided (otherwise set as null)
      updatedAt: new Date(), // Update the `updatedAt` field with the current date
    });

    return "Profile updated successfully!"; // Return success message
  } catch (error) {
    console.error("Error updating profile:", error); // Log any errors that occur
    throw error; // Rethrow the error to be handled by the calling function
  }
};
