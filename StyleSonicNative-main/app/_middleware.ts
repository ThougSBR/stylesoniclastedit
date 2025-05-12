import { useAuthStore } from "../store/authStore"; // Import the custom authentication store hook to access user data
import { useRouter, useSegments } from "expo-router"; // Use the router and segments for navigation and URL path segments
import { useEffect, useState } from "react"; // Import React hooks for managing state and side effects

export default function Middleware() {
  const { user, loading } = useAuthStore(); // Get user data and loading state from the auth store
  const router = useRouter(); // Initialize the router for navigation
  const segments = useSegments(); // Get the URL path segments (i.e., different parts of the URL)
  const [appMounted, setAppMounted] = useState(false); // Track if the app has finished mounting

  // Effect to mark the app as mounted after the initial render
  useEffect(() => {
    setAppMounted(true);
  }, []);

  // Effect to handle user authentication and routing logic
  useEffect(() => {
    if (!appMounted || loading) return; // Wait until app is fully mounted and loading is complete

    // Check if the current segment is part of the "auth" or "profile" path
    const inAuthGroup = segments[0] === "auth";
    const inProfileGroup = segments[0] === "profile";

    // If there's no user and we're not in the "auth" group, redirect to the login screen
    if (!user && !inAuthGroup) {
      router.replace("/auth/login"); // Redirect to login
    } else if (user && inAuthGroup) {
      // If user is authenticated and we are in the "auth" group (e.g., signup or login), redirect to the homepage
      if (segments[1] !== "signup") {
        router.replace("/"); // Redirect to home page if not in the signup flow
      }
    }
  }, [user, loading, segments, appMounted]); // Dependencies: user, loading, segments, and appMounted

  return null; // This component doesn't render anything to the UI
}
