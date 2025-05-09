import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

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
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email,
      fullName,
      username,
      location,
      bio,
      gender,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
