// Import the Firebase Admin SDK for interacting with Firebase services
const admin = require("firebase-admin");

// Load environment variables from the .env file using dotenv
require("dotenv").config();

// Load Firebase Admin credentials from the service account JSON file
// The `firebase-admin-key.json` file contains the private key and project details for Firebase Admin SDK
const serviceAccount = require("./firebase-admin-key.json");

// Initialize the Firebase Admin SDK with the credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount), // Using the service account credentials for authentication
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Set the Firebase Storage Bucket from environment variables
});

// Get a reference to Firestore database and Firebase Storage bucket
const db = admin.firestore(); // Initialize Firestore database
const bucket = admin.storage().bucket(); // Initialize Firebase Storage bucket

// Export the `admin` object, `db` (Firestore reference), and `bucket` (Firebase Storage reference) for use in other parts of the app
module.exports = { admin, db, bucket };
