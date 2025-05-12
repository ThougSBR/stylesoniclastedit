import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth } from './firebaseConfig'; // Import the initialized Firebase authentication instance

// Create a reference to the Firestore database
const db = getFirestore();

/**
 * Function to fetch the user profile from Firestore.
 * It uses the user ID from Firebase Authentication to fetch the user data.
 * 
 * @param userId - The unique ID of the user in Firebase Authentication
 * @returns {Promise<any>} - A promise that resolves to the user data
 */
export const getUserProfile = async (userId: string): Promise<any> => {
  try {
    const userRef = doc(db, 'users', userId); // Reference to the user's document in Firestore
    const userDoc = await getDoc(userRef); // Fetch the user document

    if (userDoc.exists()) {
      return userDoc.data(); // If the user exists, return the user data
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
};

/
