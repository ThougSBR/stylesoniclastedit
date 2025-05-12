const express = require("express"); // Importing express to create the server
const multer = require("multer"); // Importing multer for handling file uploads
const cors = require("cors"); // Importing CORS middleware to enable cross-origin requests
const fs = require("fs"); // Importing file system module to handle file operations
const path = require("path"); // Importing path module to work with file and directory paths
const getColors = require("get-image-colors"); // Importing get-image-colors to extract dominant colors from images
const getPixels = require("get-pixels"); // Importing get-pixels to extract pixel colors from specific coordinates in the image

const app = express(); // Creating an instance of the express app
app.use(cors()); // Enabling CORS for all requests
app.use(express.json()); // Middleware to parse incoming JSON request bodies

// 🔹 Create "uploads" directory if it doesn't exist
const uploadDir = path.join(__dirname, "uploads"); // Define the path for the "uploads" directory
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir); // Create the directory if it doesn't exist
}

// 🔹 Configure Multer for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set the destination folder for uploads
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`; // Generate a unique filename using the current timestamp
    cb(null, fileName); // Set the final filename
  },
});

const upload = multer({ storage }); // Initialize multer with the defined storage settings

/** ✅ Convert RGB to HSL */
const rgbToHsl = (r, g, b) => {
  // Convert RGB values to HSL (Hue, Saturation, Lightness)
  (r /= 255), (g /= 255), (b /= 255); // Normalize RGB to [0, 1]
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6; // Normalize hue to [0, 1]
  }

  return { h: h * 360, s: s * 100, l: l * 100 }; // Return HSL values scaled to [0-360] for hue and [0-100] for saturation and lightness
};

/** ✅ Determine Season Based on HSL */
const determineSeason = (faceHsl, hairHsl, eyeHsl) => {
  // Calculate the average HSL values of the face, hair, and eyes
  const avgHue = (faceHsl.h + hairHsl.h + eyeHsl.h) / 3;
  const avgSat = (faceHsl.s + hairHsl.s + eyeHsl.s) / 3;
  const avgLight = (faceHsl.l + hairHsl.l + eyeHsl.l) / 3;

  console.log("Average HSL:", avgHue, avgSat, avgLight);
  console.log("Face HSL:", faceHsl);
  console.log("Hair HSL:", hairHsl);
  console.log("Eye HSL:", eyeHsl);

  // Determine season based on HSL values
  if (avgLight > 75) {
    if (avgHue >= 0 && avgHue <= 50) return "Light Spring";
    if (avgHue > 50 && avgHue <= 150) return "Light Summer";
  } else if (avgLight >= 40 && avgLight <= 75) {
    if (avgHue >= 0 && avgHue <= 50)
      return avgSat > 50 ? "True Spring" : "Soft Spring";
    if (avgHue > 50 && avgHue <= 150)
      return avgSat > 50 ? "True Summer" : "Soft Summer";
    if (avgHue > 150 && avgHue <= 280)
      return avgSat > 50 ? "True Autumn" : "Soft Autumn";
    if (avgHue > 280 && avgHue <= 360)
      return avgSat > 50 ? "True Winter" : "Cool Winter";
  } else {
    if (avgHue >= 0 && avgHue <= 50) return "Warm Spring";
    if (avgHue > 50 && avgHue <= 150) return "Cool Summer";
    if (avgHue > 150 && avgHue <= 280) return "Deep Autumn";
    if (avgHue > 280 && avgHue <= 360) return "Deep Winter";
  }

  return "Unknown Season"; // Default return if no season is detected
};

/** ✅ Suggested Colors for Each Season */
const getOutfitSuggestions = (season) => {
  // Define color suggestions for different seasons
  const outfitColors = {
    "Light Spring": ["Soft peach", "Warm pink", "Pale gold"],
    "True Spring": ["Bright coral", "Leaf green", "Golden yellow"],
    "Warm Spring": ["Sunny orange", "Turquoise", "Rich cream"],
    "Light Summer": ["Lavender", "Powder blue", "Cool mint"],
    "True Summer": ["Soft navy", "Rose pink", "Cool taupe"],
    "Cool Summer": ["Dusky teal", "Ice blue", "Slate grey"],
    "Soft Autumn": ["Warm olive", "Dusty rose", "Burnt sienna"],
    "True Autumn": ["Rust", "Pumpkin", "Mustard yellow"],
    "Deep Autumn": ["Espresso", "Dark teal", "Burgundy"],
    "Cool Winter": ["Deep emerald", "Ruby red", "Icy silver"],
    "True Winter": ["Black", "Royal blue", "Pure white"],
    "Deep Winter": ["Dark charcoal", "Electric blue", "Jewel tones"],
  };

  return outfitColors[season] || ["No specific outfit recommendations."]; // Return outfit colors for the detected season
};

app.post("/upload", upload.single("image"), async (req, res) => {
  // Endpoint to upload an image and return the image ID
  try {
    console.log("Processing image...");
    console.log("Uploaded file:", req.file);
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" }); // Handle missing file error
    }

    const previousImageId = req.body.previousImageId;
    if (previousImageId) {
      const previousImagePath = path.join(
        __dirname,
        "uploads",
        previousImageId
      );
      // Delete the previous image if there is one
      fs.unlink(previousImagePath, (err) => {
        if (err) {
          console.error("Error deleting image:", err);
        } else {
          console.log("Image deleted:", previousImagePath);
        }
      });
    }

    const imageId = req.file.filename;
    res.json({
      success: true,
      message: "Image uploaded",
      imageId,
    });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Internal server error" }); // Handle internal server error
  }
});

/** ✅ Upload Image, Extract Colors & Return Data */
app.post("/analyse", upload.single("image"), async (req, res) => {
  try {
    console.log("Processing image...");
    console.log("Uploaded file:", req.file);
    console.log("Request body:", req.body);
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" }); // Handle missing file error
    }

    const imageId = req.file.filename;
    const imagePath = path.join(__dirname, "uploads", imageId);
    const faceCoords = JSON.parse(req.body.faceCoords);
    const hairCoords = JSON.parse(req.body.hairCoords);
    const eyeCoords = JSON.parse(req.body.eyeCoords);

    // 🔹 Extract dominant colors from the uploaded image
    const colors = await getColors(imagePath);
    const colorPalette = colors.map((color) => color.hex());
    const dominantColor = colorPalette[0] || "#000000"; // Get the first color as the dominant color

    getPixels(imagePath, function (err, pixels) {
      if (err) {
        return res.status(500).json({ error: "Error processing image" }); // Handle pixel extraction error
      }

      const getColorAt = (coords) => {
        const index = (coords.y * pixels.shape[0] + coords.x) * 4;
        return {
          r: pixels.data[index],
          g: pixels.data[index + 1],
          b: pixels.data[index + 2],
        };
      };

      // Extract colors from user-selected coordinates
      const faceRgb = getColorAt(faceCoords);
      const hairRgb = getColorAt(hairCoords);
      const eyeRgb = getColorAt(eyeCoords);

      const faceHsl = rgbToHsl(faceRgb.r, faceRgb.g, faceRgb.b);
      const hairHsl = rgbToHsl(hairRgb.r, hairRgb.g, hairRgb.b);
      const eyeHsl = rgbToHsl(eyeRgb.r, eyeRgb.g, eyeRgb.b);

      // 🔹 Determine the season based on the extracted colors
      const detectedSeason = determineSeason(faceHsl, hairHsl, eyeHsl);
      const outfitSuggestions = getOutfitSuggestions(detectedSeason);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting image:", err);
        } else {
          console.log("Image deleted:", imagePath);
        }
      });
      res.json({
        message: "Image uploaded",
        imageId,
        dominantColor,
        colorPalette,
        detectedSeason,
        outfitSuggestions,
        faceColor: `rgb(${faceRgb.r},${faceRgb.g},${faceRgb.b})`,
        hairColor: `rgb(${hairRgb.r},${hairRgb.g},${hairRgb.b})`,
        eyeColor: `rgb(${eyeRgb.r},${eyeRgb.g},${eyeRgb.b})`,
      });
    });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Internal server error" }); // Handle internal server error
  }
});

/** ✅ Serve Uploaded Images */
app.use("/uploads", express.static("uploads")); // Serve static files from the "uploads" directory

app.delete("/delete/:imageId", (req, res) => {
  const imageId = req.params.imageId; // Get the image ID from the URL parameter
  const imagePath = path.join(__dirname, "uploads", imageId); // Define the image file path

  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error("Error deleting image:", err); // Handle image deletion error
      return res.status(500).json({ error: "Error deleting image" });
    }
    console.log("Image deleted:", imagePath); // Log successful deletion
    res.json({ success: true, message: "Image deleted" }); // Send success response
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!"); // Basic hello world endpoint
});

/** ✅ Start Server */
const PORT = process.env.PORT || 5000; // Set port from environment variable or default to 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Start the server

