import { getFirestore, doc, updateDoc } from "firebase/firestore";

const db = getFirestore();

export const updateUserProfile = async (
  userId: string,
  fullName: string,
  username: string,
  bio: string,
  location: string,
  measurements?: {
    waist: string;
    hips: string;
    bust: string;
    shoulders: string;
  } | null
) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      fullName,
      username,
      bio,
      location,
      measurements: measurements || null,
      updatedAt: new Date(),
    });
    return "Profile updated successfully!";
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};
