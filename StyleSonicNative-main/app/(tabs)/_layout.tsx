import { Tabs } from "expo-router"; // Importing Tabs from expo-router for tab navigation
import React from "react"; // Importing React
import { Platform } from "react-native"; // Importing Platform for handling platform-specific styles

// Importing custom components and utilities
import { HapticTab } from "@/components/HapticTab"; // Custom tab button with haptic feedback
import { IconSymbol } from "@/components/ui/IconSymbol"; // Custom icon component
import TabBarBackground from "@/components/ui/TabBarBackground"; // Custom background for tab bar
import { Colors } from "@/constants/Colors"; // Access to theme colors
import { useColorScheme } from "@/hooks/useColorScheme"; // Hook to get the current color scheme
import { Ionicons } from "@expo/vector-icons"; // Ionicons library for icons

export default function TabLayout() {
  const colorScheme = useColorScheme(); // Getting the current color scheme (light or dark)

  return (
    <Tabs
      screenOptions={{
        // Setting the active tint color for the tab bar icons based on the current color scheme
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint, 
        headerShown: false, // Hiding the header for the tabs
        tabBarButton: HapticTab, // Using the custom HapticTab component for tab buttons
        tabBarBackground: TabBarBackground, // Setting a custom background for the tab bar
        tabBarStyle: Platform.select({
          ios: {
            // Platform-specific styles for iOS
            // Using a transparent background to show the blur effect on iOS
            position: "absolute",
            backgroundColor: "#1C2C22", // Setting background color for the tab bar on iOS
          },
          default: {
            // Default style for other platforms (e.g., Android)
            backgroundColor: "#1C2C22", // Setting background color for the tab bar
          },
        }),
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index" // Screen name
        options={{
          title: "Home", // Tab title
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={20} color={color} /> // Home icon
          ),
        }}
      />

      {/* Closet Tab */}
      <Tabs.Screen
        name="explore" // Screen name
        options={{
          title: "Closet", // Tab title
          tabBarIcon: ({ color }) => (
            <Ionicons name="shirt" size={20} color={color} /> // Shirt icon for Closet tab
          ),
        }}
      />

      {/* Friends Tab */}
      <Tabs.Screen
        name="friends" // Screen name
        options={{
          title: "Friends", // Tab title
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={20} color={color} /> // People icon for Friends tab
          ),
        }}
      />

      {/* Planner Tab */}
      <Tabs.Screen
        name="outfitPlanner" // Screen name
        options={{
          title: "Planner", // Tab title
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar" size={20} color={color} /> // Calendar icon for Planner tab
          ),
        }}
      />
    </Tabs>
  );
}
