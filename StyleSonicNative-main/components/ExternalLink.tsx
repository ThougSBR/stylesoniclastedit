import { Link } from 'expo-router'; // Import Link component from expo-router for navigation
import { openBrowserAsync } from 'expo-web-browser'; // Import method to open links in an in-app browser
import { type ComponentProps } from 'react'; // Import ComponentProps for type safety
import { Platform } from 'react-native'; // Import Platform to handle platform-specific code

// Define Props type for ExternalLink, omitting 'href' from Link component props and adding our own 'href' prop
type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

// ExternalLink component for handling external URLs
export function ExternalLink({ href, ...rest }: Props) {
  return (
    // The Link component is used for navigation, but we're customizing its behavior here
    <Link
      target="_blank" // Ensure the link opens in a new tab on web
      {...rest} // Spread remaining props (e.g., style, className) onto Link component
      href={href} // The URL to navigate to
      onPress={async (event) => {
        // onPress handler that executes when the link is pressed
        if (Platform.OS !== 'web') {
          // Check if the platform is not web (i.e., iOS or Android)
          event.preventDefault(); // Prevent the default browser behavior for native platforms
          
          // Open the link in an in-app browser on non-web platforms (iOS and Android)
          await openBrowserAsync(href);
        }
      }}
    />
  );
}
