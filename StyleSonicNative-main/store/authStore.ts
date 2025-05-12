import { create } from "zustand"; // Importing Zustand to create a store for managing state
import { onAuthStateChanged, signOut, getAuth } from "firebase/auth"; // Importing Firebase auth methods for managing user authentication
import { auth } from "../services/firebaseConfig"; // Importing the Firebase authentication configuration

// Defining the AuthState interface to describe the structure of the authentication state
interface AuthState {
  user: any | null; // The current authenticated user, or null if not logged in
  loading: boolean; // Whether the app is currently loading/authenticating
  logout: () => void; // Function to log out the user
}

// Creating the auth store using Zustand
export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Initial user state is null (no user logged in)
  loading: true, // Initial loading state is true, since the app needs to check auth status

  // logout function that signs the user out and updates the state
  logout: async () => {
    try {
      await signOut(auth); // Firebase signOut function
      set({ user: null, loading: false }); // Set the user to null and loading to false after successful logout
    } catch (error) {
      console.error("Logout Error:", error); // Log any errors during logout
    }
  },
}));

// Automatically listens for changes in the authentication state
