import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs'; // Importing types for Bottom Tab Bar button props
import { PlatformPressable } from '@react-navigation/elements'; // Importing pressable component with platform-specific behavior
import * as Haptics from 'expo-haptics'; // Importing the Haptics module from Expo to provide haptic feedback

// HapticTab component provides a custom tab button that triggers haptic feedback on iOS
export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    // PlatformPressable handles platform-specific press behavior (Android/iOS)
    <PlatformPressable
      {...props} // Spread the received props (e.g., onPress, onPressIn)
      
      // onPressIn is triggered when the user presses down on the tab button
      onPressIn={(ev) => {
        // Check if the platform is iOS
        if (process.env.EXPO_OS === 'ios') {
          // If it's iOS, trigger a soft haptic feedback
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Call the original onPressIn function if it's provided in props
        props.onPressIn?.(ev);
      }}
    />
  );
}
