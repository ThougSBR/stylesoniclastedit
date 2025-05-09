import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  onAuthStateChanged,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBcErAl3qP7EtN8GF2sz_bhUm7mY7d-cQI",
  authDomain: "stylesonic.firebaseapp.com",
  projectId: "stylesonic",
  storageBucket: "stylesonic.firebasestorage.app",
  messagingSenderId: "1000791091261",
  appId: "1:1000791091261:web:919f06a0b7014513d76254",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Enable Persistent Login State
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ✅ Listen for Auth State Changes
let currentUser: any = null;
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

export { auth, currentUser };
export default app;
