/**
 * Complaint API Routes
 * 
 * RESTful API endpoints for complaint management.
 * Integrates with AI service for:
 * - Image classification (MobileNet)
 * - Text classification (BART zero-shot)
 * - Duplicate detection (Sentence Transformers)
 * - Priority scoring (Rule-based)
 * 
 * Endpoints:
 * - POST /api/complaints       : Create new complaint with AI analysis
 * - GET /api/complaints/priority : Get complaints sorted by priority
 * - POST /api/complaints/classify : Classify image/text
 * - POST /api/complaints/duplicate-check : Check for duplicates
 */

const express = require("express");
const router = express.Router();
const Complaint = require("../models/complaint");
const path = require("path");
const {
  classifyImage,
  classifyText,
  detectDuplicate,
  generateEmbedding,
  calculatePriority
} = require("../services/ai.service");

/**
 * Create new complaint with full AI analysis
 * Route: POST /api/complaints
 * 
 * Process:
 * 1. Receive complaint data with optional image
 * 2. Classify image (if provided) using MobileNet
 * 3. Classify text using BART zero-shot
 * 4. Check for duplicates using Sentence Transformers
 * 5. Calculate priority score
 * 6. Save to database with all AI insights
 * 
 * @body {string} category - Issue type (optional, can be AI-determined)
 * @body {string} description - Detailed description
 * @body {string} location - Address/GPS
 * @body {string} image - Uploaded filename
 * @body {string} createdBy - Username
 * @returns {Object} Created complaint with full AI analysis
 */
router.post("/", async (req, res) => {
  try {
    const { category, description, location, image, createdBy } = req.body;

    // ============================================
    // STEP 1: IMAGE CLASSIFICATION (MobileNet)
    // ============================================
    
    let imageClassification = {
      predictedLabel: null,
      confidence: 0,
      mappedCategory: null,
      allPredictions: []
    };

    if (image) {
      const imagePath = path.join(__dirname, "../../uploads", image);
      imageClassification = await classifyImage(imagePath);
    }

    // ============================================
    // STEP 2: TEXT CLASSIFICATION (BART Zero-shot)
    // ============================================
    
    const textClassification = await classifyText(description);

    // ============================================
    // STEP 3: DUPLICATE DETECTION (Sentence Transformers)
    // ============================================
    
    const duplicateCheck = await detectDuplicate({ description, location });

    // ============================================
    // STEP 4: PRIORITY SCORING (Rule-based)
    // ============================================
    
    const priorityResult = await calculatePriority({
      category: category || textClassification.predictedCategory,
      description,
      location
    });

    // ============================================
    // STEP 5: GENERATE EMBEDDING
    // ============================================
    
    const embedding = await generateEmbedding({ description });

    // ============================================
    // STEP 6: CHECK DUPLICATE THRESHOLD
    // ============================================
    
    // If duplicate detected with >85% similarity, return warning
    if (duplicateCheck.isDuplicate && duplicateCheck.similarity > 0.85) {
      return res.status(409).json({
        message: "Potential duplicate complaint detected",
        similarity: Math.round(duplicateCheck.similarity * 100),
        matchingComplaint: duplicateCheck.matchingComplaint,
        aiInsights: {
          imageClassification,
          textClassification,
          priority: priorityResult
        }
      });
    }

    // ============================================
    // STEP 7: CREATE COMPLAINT
    // ============================================
    
    // Use AI-determined category if user didn't specify
    const finalCategory = category || textClassification.predictedCategory || "Other";

    const complaint = await Complaint.create({
      image,
      category: finalCategory,
      description,
      location,
      createdBy: createdBy || "Anonymous",
      
      // Image classification results
      imageClassification: {
        predictedLabel: imageClassification.predictedLabel,
        confidence: imageClassification.confidence,
        mappedCategory: imageClassification.mappedCategory,
        allPredictions: imageClassification.allPredictions
      },
      
      // Text classification results
      textClassification: {
        predictedCategory: textClassification.predictedCategory,
        confidence: textClassification.confidence,
        scores: textClassification.scores
      },
      
      // Embedding for future duplicate detection
      embedding,
      
      // Duplicate check results
      aiDuplicateCheck: {
        isDuplicate: duplicateCheck.isDuplicate,
        similarity: Math.round(duplicateCheck.similarity * 100),
        matchingComplaintId: duplicateCheck.matchingComplaint,
        matchedField: duplicateCheck.matchedField
      },
      
      // Priority scoring
      priorityScore: priorityResult.score,
      priorityBreakdown: priorityResult.breakdown,
      aiSeverityLevel: priorityResult.severityLevel,
      aiReasoning: priorityResult.reasoning
    });

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint,
      aiInsights: {
        imageClassification,
        textClassification,
        duplicateCheck: {
          isDuplicate: duplicateCheck.isDuplicate,
          similarity: Math.round(duplicateCheck.similarity * 100)
        },
        priority: priorityResult
      }
    });
  } catch (error) {
    console.error("Complaint Creation Error:", error);
    res.status(500).json({ message: "Error creating complaint", error: error.message });
  }
});

/**
 * Get complaints sorted by AI priority
 * Route: GET /api/complaints/priority
 * 
 * Returns complaints grouped by priority level
 * 
 * @query {string} level - Filter by specific priority level
 * @returns {Object} Complaints grouped by priority
 */
router.get("/priority", async (req, res) => {
  try {
    const { level } = req.query;
    
    let query = {};
    if (level) {
      // Filter by severity level
      const severityMap = {
        critical: { $gte: 80 },
        high: { $gte: 60, $lt: 80 },
        medium: { $gte: 40, $lt: 60 },
        low: { $lt: 40 }
      };
      
      if (severityMap[level]) {
        query.priorityScore = severityMap[level];
      }
    }
    
    const complaints = await Complaint.find(query)
      .sort({ priorityScore: -1, createdAt: -1 })
      .select("-embedding");  // Exclude embeddings from response
    
    // Group by severity
    const grouped = {
      critical: complaints.filter(c => c.priorityScore >= 80),
      high: complaints.filter(c => c.priorityScore >= 60 && c.priorityScore < 80),
      medium: complaints.filter(c => c.priorityScore >= 40 && c.priorityScore < 60),
      low: complaints.filter(c => c.priorityScore < 40)
    };
    
    res.json({
      total: complaints.length,
      grouped,
      all: complaints
    });
  } catch (error) {
    console.error("Priority Filtering Error:", error);
    res.status(500).json({ message: "Error filtering complaints", error: error.message });
  }
});

/**
 * Classify image using MobileNet
 * Route: POST /api/complaints/classify/image
 * 
 * @body {string} image - Uploaded filename
 * @returns {Object} Image classification results
 */
router.post("/classify/image", async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ message: "Image filename required" });
    }
    
    const imagePath = path.join(__dirname, "../../uploads", image);
    const result = await classifyImage(imagePath);
    
    res.json(result);
  } catch (error) {
    console.error("Image Classification Error:", error);
    res.status(500).json({ message: "Error classifying image", error: error.message });
  }
});

/**
 * Classify text using BART zero-shot
 * Route: POST /api/complaints/classify/text
 * 
 * @body {string} text - Complaint description
 * @returns {Object} Text classification results
 */
router.post("/classify/text", async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: "Text required" });
    }
    
    const result = await classifyText(text);
    
    res.json(result);
  } catch (error) {
    console.error("Text Classification Error:", error);
    res.status(500).json({ message: "Error classifying text", error: error.message });
  }
});

/**
 * Check for duplicate complaints
 * Route: POST /api/complaints/duplicate-check
 * 
 * @body {string} description - Complaint description
 * @body {string} location - Complaint location
 * @returns {Object} Duplicate check results
 */
router.post("/duplicate-check", async (req, res) => {
  try {
    const { description, location } = req.body;
    
    if (!description) {
      return res.status(400).json({ message: "Description required" });
    }
    
    const result = await detectDuplicate({ description, location });
    
    res.json({
      isDuplicate: result.isDuplicate,
      similarity: Math.round(result.similarity * 100),
      matchingComplaintId: result.matchingComplaint,
      matchedField: result.matchedField
    });
  } catch (error) {
    console.error("Duplicate Check Error:", error);
    res.status(500).json({ message: "Error checking for duplicates", error: error.message });
  }
});

/**
 * Calculate priority score for a complaint
 * Route: POST /api/complaints/priority/calculate
 * 
 * @body {Object} complaint - Complaint data
 * @returns {Object} Priority score with breakdown
 */
router.post("/priority/calculate", async (req, res) => {
  try {
    const { category, description, location } = req.body;
    
    const result = await calculatePriority({ category, description, location });
    
    res.json(result);
  } catch (error) {
    console.error("Priority Calculation Error:", error);
    res.status(500).json({ message: "Error calculating priority", error: error.message });
  }
});

module.exports = router;