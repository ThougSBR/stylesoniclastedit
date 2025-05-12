import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native"; // Import themes for navigation
import { useFonts } from "expo-font"; // Hook to load custom fonts
import { Stack } from "expo-router"; // Stack navigation from expo-router
import * as SplashScreen from "expo-splash-screen"; // SplashScreen for initial loading
import { StatusBar } from "expo-status-bar"; // Status bar for handling status bar styles
import { useEffect, useState } from "react"; // React hooks for side effects and state management
import "react-native-reanimated"; // Import for animations
import { useColorScheme } from "@/hooks/useColorScheme"; // Custom hook to get the system's color scheme (light or dark)
import Middleware from "../app/_middleware"; // Custom middleware component for the app

SplashScreen.preventAutoHideAsync(); // Prevent splash screen from hiding automatically until app is ready

// Main layout component for the root of the app
export default function RootLayout() {
  const colorScheme = useColorScheme(); // Use the custom hook to get the system color scheme
  const [loaded] = useFonts({
    // Load custom fonts used in the app
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    PlayfairDisplay: require("../assets/fonts/PlayfairDisplay-Regular.ttf"),
    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
  });
  const [appReady, setAppReady] = useState(false); // State to check if app is ready to be displayed

  // Effect hook to hide splash screen once fonts are loaded
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync(); // Hide splash screen when fonts are loaded
      setAppReady(true); // Set appReady to true to indicate app is ready to be shown
    }
  }, [loaded]);

  // If fonts or app are not ready, return null to prevent rendering
  if (!loaded || !appReady) {
    return null; 
  }

  return (
    // ThemeProvider applies the appropriate theme based on the system color scheme (dark or light mode)
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Middleware /> {/* Middleware component for the app */}
      
      <Stack>
        {/* Stack navigation screen definitions with specific routes */}
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/forgot-password"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="profile/change-password-screen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="profile/edit-profile"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="chat/main" options={{ headerShown: false }} />
        <Stack.Screen name="analyser/main" options={{ headerShown: false }} />
        <Stack.Screen name="planner/home" options={{ headerShown: false }} />
        <Stack.Screen name="closet/upload" options={{ headerShown: false }} />
        <Stack.Screen name="closet/pants" options={{ headerShown: false }} />
        <Stack.Screen name="closet/shoes" options={{ headerShown: false }} />
        <Stack.Screen name="closet/shirts" options={{ headerShown: false }} />
        <Stack.Screen name="closet/jackets" options={{ headerShown: false }} />
        <Stack.Screen name="profile/profile" options={{ headerShown: false }} />
        <Stack.Screen
          name="profile/measurements"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="closet/accessories"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="planner/plan-outfit"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" /> {/* Screen for handling not found route */}
      </Stack>

      {/* Status bar handling */}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
