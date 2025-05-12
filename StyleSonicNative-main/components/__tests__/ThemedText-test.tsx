import * as React from 'react'; // Import React for rendering the component
import renderer from 'react-test-renderer'; // Import the React Test Renderer for snapshot testing

import { ThemedText } from '../ThemedText'; // Import the ThemedText component to test

// Jest test case using snapshot testing
it(`renders correctly`, () => {
  // Create a snapshot of the ThemedText component with the text 'Snapshot test!'
  const tree = renderer.create(<ThemedText>Snapshot test!</ThemedText>).toJSON();

  // Compare the snapshot with the previous one (or create a new one if it doesn't exist)
  expect(tree).toMatchSnapshot(); // This ensures that the rendered output matches the saved snapshot
});
