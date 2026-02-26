/**
 * MongoDB Database Connection
 * 
 * Establishes connection to MongoDB Atlas using Mongoose.
 * Handles connection errors gracefully - server runs even if DB is unavailable.
 */

const mongoose = require("mongoose")

/**
 * Connect to MongoDB
 * @returns {Promise<mongoose.Connection|null>} Database connection or null on failure
 */
async function connectToDB(){
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 5000,  // Timeout after 5s if can't connect
            socketTimeoutMS: 45000,          // Socket timeout
        })
        console.log("connected to DB")
        return mongoose
    } catch (err) {
        console.log("MongoDB connection error (AI features will be disabled):", err.message)
        console.log("Server will run without database - for full functionality, set up MongoDB Atlas")
        return null
    }
}

module.exports = connectToDB