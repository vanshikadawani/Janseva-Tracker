/**
 * Complaint Model
 * 
 * Mongoose schema for storing citizen complaints.
 * Includes AI-generated fields for:
 * - Image classification (MobileNet)
 * - Text classification (BART zero-shot)
 * - Duplicate detection (Sentence Transformers)
 * - Priority scoring (Rule-based formula)
 */

const mongoose = require("mongoose");

/**
 * Complaint Schema
 * 
 * Core Fields:
 * - image: Filename of uploaded photo
 * - category: Type of issue (water leakage, garbage, etc.)
 * - description: Detailed description from citizen
 * - location: Address or GPS location
 * - status: Current status (Assigned → In Progress → Completed)
 * - createdBy: Username of complainant
 * 
 * AI-Generated Fields:
 * - imageClassification: MobileNet prediction results
 * - textClassification: BART zero-shot classification
 * - embedding: Sentence transformer vector for duplicate detection
 * - priorityScore: Calculated priority score (0-100)
 * - priorityBreakdown: Component scores for transparency
 * - aiDuplicateCheck: Duplicate detection results
 */
const complaintSchema = new mongoose.Schema({
  // ============================================
  // CORE FIELDS
  // ============================================
  
  image: {
    type: String,
    default: null  // stores filename only
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Garbage",
      "Road Damage", 
      "Streetlight Issue",
      "Water Leakage",
      "Drainage",
      "Other"
    ]
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
    default: "Assigned",
    enum: ["Assigned", "In Progress", "Completed"]
  },
  createdBy: {
    type: String,
    default: "Anonymous"
  },

  // ============================================
  // 1️⃣ IMAGE CLASSIFICATION (MobileNet)
  // ============================================
  
  /**
   * Image classification results from MobileNet
   */
  imageClassification: {
    predictedLabel: { type: String, default: null },
    confidence: { type: Number, default: 0 },
    mappedCategory: { type: String, default: null },
    allPredictions: [{
      label: String,
      confidence: Number
    }]
  },

  // ============================================
  // 2️⃣ TEXT CLASSIFICATION (BART Zero-shot)
  // ============================================
  
  /**
   * Text classification results from BART zero-shot
   */
  textClassification: {
    predictedCategory: { type: String, default: null },
    confidence: { type: Number, default: 0 },
    scores: {
      Garbage: { type: Number, default: 0 },
      "Road Damage": { type: Number, default: 0 },
      "Streetlight Issue": { type: Number, default: 0 },
      "Water Leakage": { type: Number, default: 0 },
      Drainage: { type: Number, default: 0 }
    }
  },

  // ============================================
  // 3️⃣ DUPLICATE DETECTION (Sentence Transformers)
  // ============================================
  
  /**
   * Text embedding for cosine similarity comparison
   */
  embedding: {
    type: [Number],  // Array of floats representing the vector
    default: null
  },

  /**
   * Duplicate detection results
   */
  aiDuplicateCheck: {
    isDuplicate: { type: Boolean, default: false },
    similarity: { type: Number, default: 0 },
    matchingComplaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", default: null },
    matchedField: { type: String, default: null }  // 'image', 'text', or 'both'
  },

  // ============================================
  // 4️⃣ PRIORITY SCORING (Rule-based Formula)
  // ============================================
  
  /**
   * Calculated priority score (0-100)
   * Higher score = more urgent
   */
  priorityScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },

  /**
   * Breakdown of priority score components
   * Formula: (ComplaintCount × 0.4) + (TimePending × 0.3) + (AreaWeight × 0.3)
   */
  priorityBreakdown: {
    complaintCountScore: { type: Number, default: 0 },    // Weight: 0.4
    timePendingScore: { type: Number, default: 0 },       // Weight: 0.3
    areaWeightScore: { type: Number, default: 0 },        // Weight: 0.3
    categoryMultiplier: { type: Number, default: 1 }      // Category-based adjustment
  },

  /**
   * AI-assessed severity level (derived from priority)
   */
  aiSeverityLevel: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
  },

  /**
   * AI's reasoning for priority assignment
   */
  aiReasoning: {
    type: String,
    default: ""
  },

  // ============================================
  // TIMESTAMPS
  // ============================================
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
complaintSchema.pre("save", function() {
  this.updatedAt = Date.now();
});

// Index for efficient duplicate search
complaintSchema.index({ embedding: "2dsphere" });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model("Complaint", complaintSchema);