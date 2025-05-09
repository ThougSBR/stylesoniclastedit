import { auth } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const db = getFirestore();

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
  } | null
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // 🔹 Save additional user info in Firestore under "users/{userId}"
    await setDoc(doc(db, "users", user.uid), {
      fullName,
      username,
      email,
      location,
      bio,
      gender,
      measurements: measurements || null,
      profilePic: "",
      createdAt: new Date(),
    });

    return user;
  } catch (error) {
    console.error("Signup Error:", error);
    throw error;
  }
};

export const login = async (
  email: string,
  password: string
): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return "Reset link sent! Check your email.";
  } catch (error) {
    console.error("Reset Password Error:", error);
    throw error;
  }
};

/** ✅ Get User Profile from Firestore */
export const getUserProfile = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error("User profile not found!");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/** ✅ Change User Password */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is currently signed in.");
  }

  const credential = EmailAuthProvider.credential(user.email!, currentPassword);

  try {
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error("Change Password Error:", error);
    throw error;
  }
};
