#!/usr/bin/env node

/**
 * This script is used to reset the project to a blank state.
 * It moves the /app, /components, /hooks, /scripts, and /constants directories to /app-example and creates a new /app directory with an index.tsx and _layout.tsx file.
 * You can remove the reset-project script from package.json and safely delete this file after running it.
 */

// Importing file system module to work with the filesystem
const fs = require("fs");
// Importing path module to handle and transform file paths
const path = require("path");

// Get the current working directory
const root = process.cwd();
// List of old directories that will be moved
const oldDirs = ["app", "components", "hooks", "constants", "scripts"];
// Name for the new directory where old directories will be moved
const newDir = "app-example";
// Name of the new directory that will be created
const newAppDir = "app";
// Full path to the new app-example directory
const newDirPath = path.join(root, newDir);

// Content for the new index.tsx file
const indexContent = import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}

// Content for the new _layout.tsx file
const layoutContent = import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
};

// Function to move directories and create new ones
const moveDirectories = async () => {
  try {
    // Create the app-example directory
    await fs.promises.mkdir(newDirPath, { recursive: true });
    console.log(`📁 /${newDir} directory created.`);

    // Move the old directories to the new app-example directory
    for (const dir of oldDirs) {
      const oldDirPath = path.join(root, dir); // Get the path of the old directory
      const newDirPath = path.join(root, newDir, dir); // Get the new path inside app-example
      if (fs.existsSync(oldDirPath)) {
        await fs.promises.rename(oldDirPath, newDirPath); // Move the directory
        console.log(`➡️ /${dir} moved to /${newDir}/${dir}.`);
      } else {
        console.log(`➡️ /${dir} does not exist, skipping.`);
      }
    }

    // Create the new /app directory
    const newAppDirPath = path.join(root, newAppDir);
    await fs.promises.mkdir(newAppDirPath, { recursive: true });
    console.log("\n📁 New /app directory created.");

    // Create index.tsx file in the new /app directory
    const indexPath = path.join(newAppDirPath, "index.tsx");
    await fs.promises.writeFile(indexPath, indexContent);
    console.log("📄 app/index.tsx created.");

    // Create _layout.tsx file in the new /app directory
    const layoutPath = path.join(newAppDirPath, "_layout.tsx");
    await fs.promises.writeFile(layoutPath, layoutContent);
    console.log("📄 app/_layout.tsx created.");

    console.log("\n✅ Project reset complete. Next steps:");
    console.log(
      "1. Run npx expo start to start a development server.\n2. Edit app/index.tsx to edit the main screen.\n3. Delete the /app-example directory when you're done referencing it."
    );
  } catch (error) {
    console.error(`Error during script execution: ${error}`);
  }
};

// Execute the moveDirectories function to start the project reset
moveDirectories();

