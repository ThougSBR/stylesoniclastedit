import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore();

/** ✅ Get User Details by ID */
export const getUserDetails = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};
