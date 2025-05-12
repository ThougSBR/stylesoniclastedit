import { useEffect, useState } from 'react'; // Importing hooks for side effects and state management
import { useColorScheme as useRNColorScheme } from 'react-native'; // Importing the useColorScheme hook from React Native

/**
 * Custom hook to determine the current color scheme (light or dark) on the web.
 * This hook ensures that the color scheme value is calculated on the client-side 
 * after the component has hydrated, which is necessary for static rendering.
 */
export function useColorScheme() {
  // State to track whether the component has hydrated (mounted)
  const [hasHydrated, setHasHydrated] = useState(false);

  // useEffect hook to mark hydration completion once the component is mounted
  useEffect(() => {
    setHasHydrated(true); // Set hydration state to true once the component mounts
  }, []);

  // Using the useColorScheme hook from React Native to get the current color scheme
  const colorScheme = useRNColorScheme(); // This gives us 'light' or 'dark' based on system preference

  // After hydration, return the color scheme fetched from React Native's useColorScheme
  if (hasHydrated) {
    return colorScheme;
  }

  // Return 'light' as the default color scheme until the component has hydrated
  return 'light';
}
