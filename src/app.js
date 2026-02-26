/**
 * Janseva Tracker - Express Application
 * 
 * Main application configuration and route setup.
 * Handles:
 * - Static file serving (CSS, JS, images, uploads)
 * - EJS template rendering
 * - Session management with flash messages
 * - File upload handling with Multer
 * - API and page routes
 */

// Load environment variables
require("dotenv").config();

// Import required modules
const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const ejsMate = require("ejs-mate");  // EJS template engine helper
const mongoose = require("mongoose"); // MongoDB ODM (used for schema reference)
const session = require("express-session");
const flash = require("connect-flash");

// Import routes
const authRouter = require("./routes/auth.routes");
const complaintRouter = require("./routes/complaint.routes");
const cookieParser = require("cookie-parser");

// Import models
const Complaint = require("./models/complaint");

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Parse JSON bodies and cookies
app.use(express.json());
app.use(cookieParser());

// Mount API routes
app.use("/api/auth", authRouter);       // Authentication endpoints (register, login)
app.use("/api/complaints", complaintRouter); // Complaint CRUD endpoints

// Configure EJS as the view engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration for flash messages
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
  })
);
app.use(flash());

// ============================================
// FILE UPLOAD CONFIGURATION (Multer)
// ============================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save uploaded files to uploads/ directory
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// ============================================
// PAGE ROUTES
// ============================================

/**
 * Home page
 * Route: GET /
 */
app.get("/", (req, res) => {
  res.render("pages/home", { activePage: 'home' });
});

/**
 * Login page
 * Route: GET /login
 */
app.get("/login", (req, res) => {
  res.render("pages/login", { activePage: 'login' });
});

/**
 * Registration page
 * Route: GET /register
 */
app.get("/register", (req, res) => {
  res.render("pages/register", { activePage: 'login' });
});

/**
 * Logout - clears auth cookie and redirects to home
 * Route: GET /logout
 */
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

/**
 * Report issue page
 * Route: GET /report
 * Displays the complaint submission form
 */
app.get("/report", (req, res) => {
  res.render("pages/report", { 
    activePage: 'how-to',
    error: req.flash("error")[0] || null,
    duplicate: req.flash("duplicate")[0] || null
  });
});

/**
 * Submit complaint
 * Route: POST /report
 * Handles form submission with image upload
 * 
 * Process:
 * 1. Upload image to uploads/ directory
 * 2. Send data to /api/complaints endpoint
 * 3. Handle duplicate detection response (409 status)
 * 4. Redirect to complaints page on success
 */
app.post("/report", upload.single("image"), async (req, res) => {
  try {
    const imageData = req.file ? req.file.filename : undefined;

    // Call the AI complaint API
    const response = await fetch(`http://localhost:${process.env.PORT || 3000}/api/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: req.body.category,
        description: req.body.description,
        location: req.body.location,
        image: imageData,
        createdBy: "Vanshika", // TODO: Replace with actual logged-in user
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Complaint submitted successfully
      res.redirect("/complaints");
    } else if (response.status === 409) {
      // Duplicate detected - show warning with details
      req.flash("duplicate", {
        message: data.message,
        similarity: data.similarity,
        matchingComplaint: data.matchingComplaint
      });
      res.redirect("/report");
    } else {
      // Handle other errors
      req.flash("error", data.message || "Error submitting complaint");
      res.redirect("/report");
    }
  } catch (error) {
    console.error("Report Submission Error:", error);
    req.flash("error", "Error submitting complaint");
    res.redirect("/report");
  }
});

/**
 * View all complaints
 * Route: GET /complaints
 * Displays user's complaints and others' complaints
 */
app.get("/complaints", async (req, res) => {
  // TODO: Replace 'Vanshika' with actual logged-in user from auth
  const myComplaints = await Complaint.find({ createdBy: "Vanshika" });
  const otherComplaints = await Complaint.find({ createdBy: { $ne: "Vanshika" } });
  res.render("pages/complaint", {
    myComplaints,
    otherComplaints,
    activePage: 'complaints'
  });
});

/**
 * FAQ page
 * Route: GET /faq
 */
app.get("/faq", (req, res) => {
  res.render("pages/faq", { activePage: "faq" });
});

// Export app for server.js
module.exports = app