const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  image: {
    type: String   // stores filename
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "Assigned"
  },
   createdBy: {
    type: String,
    default: "Vanshika"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Complaint", complaintSchema);