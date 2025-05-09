import { create } from "zustand";
import { onAuthStateChanged, signOut, getAuth } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

interface AuthState {
  user: any | null;
  loading: boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null, loading: false });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  },
}));

// Automatically listen to auth state changes
onAuthStateChanged(auth, (user) => {
  useAuthStore.setState({ user, loading: false });
});
