/**
 * Janseva Tracker - Server Entry Point
 * 
 * This file initializes the application by:
 * 1. Loading environment variables from .env
 * 2. Connecting to MongoDB database
 * 3. Starting the Express server on port 3000
 * 
 * The server runs with or without database connection.
 * If DB is unavailable, complaints will not be saved but the app remains functional.
 */

require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database");

// Connect to database and start server
connectToDB().then((db) => {
  app.listen(3000, () => {
    console.log("server is running on port 3000");
    if (!db) {
      console.log("Warning: MongoDB not available - complaints will not be saved");
    }
  });
}).catch(err => {
  console.log("Server startup error:", err.message);
  // Start server anyway (without database functionality)
  app.listen(3000, () => {
    console.log("server is running on port 3000 (without database)");
  });
});