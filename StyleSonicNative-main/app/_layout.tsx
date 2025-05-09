import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import Middleware from "../app/_middleware";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    PlayfairDisplay: require("../assets/fonts/PlayfairDisplay-Regular.ttf"),
    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
  });
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      setAppReady(true);
    }
  }, [loaded]);

  if (!loaded || !appReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Middleware />
      <Stack>
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
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
