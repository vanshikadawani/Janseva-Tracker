/**
 * AI Service - Multi-Model MVP Implementation
 * 
 * Provides AI-powered features for complaint management:
 * 1. Image Classification - MobileNet pretrained model
 * 2. Text Classification - BART zero-shot classification
 * 3. Duplicate Detection - Sentence Transformers with cosine similarity
 * 4. Priority Scoring - Rule-based formula
 * 5. Speech-to-Text - Whisper (Hindi support)
 * 
 * Configuration:
 * - Set GEMINI_API_KEY in .env to enable Gemini features
 * - Without AI packages installed, uses fallback functions with basic rules
 */

require("dotenv").config();
const Complaint = require("../models/complaint");

// ============================================
// CATEGORY MAPPING (Image → Civic Category)
// ============================================

/**
 * Maps MobileNet predictions to civic categories
 * MobileNet predicts ~1000 ImageNet classes
 */
const CATEGORY_MAPPING = {
  "Garbage": ["garbage", "trash", "litter", "dumpster", "ashcan", "wastebin", "dustbin"],
  "Road Damage": ["pothole", "road", "highway", "street", "asphalt", "concrete", "gravel"],
  "Streetlight Issue": ["lamp", "light", "streetlight", "lantern", "torch", "flashlight"],
  "Water Leakage": ["faucet", "tap", "water", "pipe", "plumbing", "hydrant"],
  "Drainage": ["sewer", "drain", "sewage", "gutter", "storm", "drainage"]
};

// ============================================
// FALLBACK FUNCTIONS (When AI models unavailable)
// ============================================

/**
 * Fallback image classification (keyword-based)
 */
function fallbackImageClassification(imagePath) {
  return {
    predictedLabel: "unknown",
    confidence: 0,
    mappedCategory: "Other",
    allPredictions: []
  };
}

/**
 * Fallback text classification (keyword-based)
 */
function fallbackTextClassification(text) {
  const lowerText = text.toLowerCase();
  const scores = {
    Garbage: 0,
    "Road Damage": 0,
    "Streetlight Issue": 0,
    "Water Leakage": 0,
    Drainage: 0
  };
  
  // Simple keyword matching
  const keywords = {
    Garbage: ["garbage", "trash", "waste", "litter", "dirty", "smell"],
    "Road Damage": ["pothole", "road", "crack", "broken", "damage", "hole"],
    "Streetlight Issue": ["light", "streetlight", "dark", "lamp", "no light"],
    "Water Leakage": ["water", "leak", "pipe", "tap", "overflow"],
    "Drainage": ["drain", "sewer", "clog", "flood", "water logging"]
  };
  
  let maxScore = 0;
  let maxCategory = "Other";
  
  for (const [category, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (lowerText.includes(word)) {
        scores[category] += 0.2;
      }
    }
    if (scores[category] > maxScore) {
      maxScore = scores[category];
      maxCategory = category;
    }
  }
  
  return {
    predictedCategory: maxScore > 0 ? maxCategory : "Other",
    confidence: Math.min(maxScore, 1),
    scores
  };
}

/**
 * Fallback duplicate detection (no embedding)
 */
function fallbackDetectDuplicate() {
  return { isDuplicate: false, similarity: 0, matchingComplaint: null, matchedField: null };
}

/**
 * Fallback priority scoring (simple rules)
 */
function fallbackCalculatePriority(complaint) {
  const category = complaint.category?.toLowerCase() || "";
  let score = 50;
  let breakdown = {
    complaintCountScore: 50,
    timePendingScore: 50,
    areaWeightScore: 50,
    categoryMultiplier: 1
  };
  
  // Category-based adjustment
  if (category.includes("drainage") || category.includes("sewage")) {
    score = 85;
    breakdown.categoryMultiplier = 1.5;
  } else if (category.includes("garbage")) {
    score = 70;
    breakdown.categoryMultiplier = 1.2;
  } else if (category.includes("water")) {
    score = 65;
    breakdown.categoryMultiplier = 1.1;
  } else if (category.includes("road") || category.includes("pothole")) {
    score = 60;
    breakdown.categoryMultiplier = 1.0;
  } else if (category.includes("light")) {
    score = 55;
    breakdown.categoryMultiplier = 0.9;
  }
  
  return { score, breakdown };
}

// ============================================
// HELPER: Safe require with fallback
// ============================================

/**
 * Try to require a module, return null if not available
 */
function safeRequire(moduleName) {
  try {
    return require(moduleName);
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') {
      console.warn(`Warning: Failed to load ${moduleName}:`, error.message);
    }
    return null;
  }
}

// ============================================
// 1️⃣ IMAGE CLASSIFICATION (MobileNet)
// ============================================

/**
 * Classify complaint image using MobileNet
 * 
 * Process:
 * 1. Load MobileNet model (pretrained on ImageNet)
 * 2. Preprocess image
 * 3. Get predictions
 * 4. Map to civic categories
 * 
 * @param {string} imagePath - Path to uploaded image
 * @returns {Object} Classification results
 */
async function classifyImage(imagePath) {
  try {
    // Check if TensorFlow.js and MobileNet are available
    const tf = safeRequire("@tensorflow/tfjs");
    const mobilenet = safeRequire("@tensorflow-models/mobilenet");
    
    if (!tf || !mobilenet) {
      console.log("TensorFlow/MobileNet not installed, using fallback image classification");
      return fallbackImageClassification(imagePath);
    }
    
    // Load model (cached after first load)
    const model = await mobilenet.load();
    
    // Classify image
    const predictions = await model.classify(imagePath);
    
    // Map predictions to civic categories
    let bestMatch = { category: "Other", confidence: 0, label: predictions[0]?.className || "unknown" };
    
    for (const pred of predictions) {
      const lowerLabel = pred.className.toLowerCase();
      
      for (const [category, keywords] of Object.entries(CATEGORY_MAPPING)) {
        for (const keyword of keywords) {
          if (lowerLabel.includes(keyword)) {
            if (pred.probability > bestMatch.confidence) {
              bestMatch = {
                category,
                confidence: pred.probability,
                label: pred.className
              };
            }
            break;
          }
        }
      }
    }
    
    return {
      predictedLabel: bestMatch.label,
      confidence: bestMatch.confidence,
      mappedCategory: bestMatch.category,
      allPredictions: predictions.map(p => ({
        label: p.className,
        confidence: p.probability
      }))
    };
  } catch (error) {
    console.error("Image Classification Error:", error.message);
    return fallbackImageClassification(imagePath);
  }
}

// ============================================
// 2️⃣ TEXT CLASSIFICATION (BART Zero-shot)
// ============================================

/**
 * Classify complaint text using BART zero-shot
 * 
 * Process:
 * 1. Load BART model for zero-shot classification
 * 2. Send text with candidate labels
 * 3. Get probability scores for each category
 * 
 * @param {string} text - Complaint description
 * @returns {Object} Classification with confidence scores
 */
async function classifyText(text) {
  try {
    // Check if transformers library is available
    const transformers = safeRequire("xenova/transformers");
    
    if (!transformers) {
      console.log("Transformers not installed, using fallback text classification");
      return fallbackTextClassification(text);
    }
    
    const { pipeline } = transformers;
    
    // Zero-shot classification pipeline
    const classifier = await pipeline("zero-shot-classification", "facebook/bart-large-mnli");
    
    const candidateLabels = [
      "Garbage",
      "Road Damage",
      "Streetlight Issue",
      "Water Leakage",
      "Drainage"
    ];
    
    // Run classification
    const result = await classifier(text, candidateLabels);
    
    // Format scores
    const scores = {};
    result.labels.forEach((label, i) => {
      scores[label] = result.scores[i];
    });
    
    return {
      predictedCategory: result.labels[0],
      confidence: result.scores[0],
      scores
    };
  } catch (error) {
    console.error("Text Classification Error:", error.message);
    return fallbackTextClassification(text);
  }
}

// ============================================
// 3️⃣ DUPLICATE DETECTION (Sentence Transformers)
// ============================================

/**
 * Detect duplicate complaints using Sentence Transformers
 * 
 * Process:
 * 1. Convert complaint text → embedding vector
 * 2. Store embedding in DB
 * 3. New complaint → cosine similarity compare
 * 4. If similarity > 0.85 → mark duplicate
 * 
 * @param {Object} newComplaint - Complaint to check
 * @returns {Object} Duplicate check results
 */
async function detectDuplicate(newComplaint) {
  try {
    // Check if transformers library is available
    const transformers = safeRequire("xenova/transformers");
    
    if (!transformers) {
      console.log("Transformers not installed, using fallback duplicate detection");
      return fallbackDetectDuplicate();
    }
    
    const { pipeline } = transformers;
    
    // Load sentence transformer model
    const extractor = await pipeline("feature-extraction", "all-MiniLM-L6-v2");
    
    // Generate embedding for new complaint
    const newEmbedding = await extractor(newComplaint.description, {
      pooling: "mean",
      normalize: true
    });
    
    // Get recent complaints (last 7 days, max 50)
    const recentComplaints = await Complaint.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).limit(50);
    
    if (recentComplaints.length === 0) {
      return { isDuplicate: false, similarity: 0, matchingComplaint: null, matchedField: null };
    }
    
    // Calculate cosine similarity with each recent complaint
    let bestMatch = { similarity: 0, complaint: null };
    
    for (const complaint of recentComplaints) {
      if (!complaint.embedding || complaint.embedding.length === 0) continue;
      
      const similarity = cosineSimilarity(newEmbedding, complaint.embedding);
      
      if (similarity > bestMatch.similarity) {
        bestMatch = { similarity, complaint };
      }
    }
    
    // Threshold for duplicate detection
    const DUPLICATE_THRESHOLD = 0.85;
    
    return {
      isDuplicate: bestMatch.similarity > DUPLICATE_THRESHOLD,
      similarity: bestMatch.similarity,
      matchingComplaint: bestMatch.complaint?._id || null,
      matchedField: "text"
    };
  } catch (error) {
    console.error("Duplicate Detection Error:", error.message);
    return fallbackDetectDuplicate();
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generate and store embedding for a complaint
 * 
 * @param {Object} complaint - Complaint document
 * @returns {Array} Embedding vector
 */
async function generateEmbedding(complaint) {
  try {
    const transformers = safeRequire("xenova/transformers");
    
    if (!transformers) {
      return null;
    }
    
    const { pipeline } = transformers;
    const extractor = await pipeline("feature-extraction", "all-MiniLM-L6-v2");
    
    const embedding = await extractor(complaint.description, {
      pooling: "mean",
      normalize: true
    });
    
    return Array.from(embedding);
  } catch (error) {
    console.error("Embedding Generation Error:", error.message);
    return null;
  }
}

// ============================================
// 4️⃣ PRIORITY SCORING (Rule-based Formula)
// ============================================

/**
 * Calculate priority score using rule-based formula
 * 
 * Formula:
 * Priority Score = (ComplaintCount × 0.4) + (TimePending × 0.3) + (AreaWeight × 0.3)
 * 
 * @param {Object} complaint - Complaint to assess
 * @param {Object} options - Additional options
 * @returns {Object} Priority score with breakdown
 */
async function calculatePriority(complaint, options = {}) {
  try {
    const breakdown = {
      complaintCountScore: 50,
      timePendingScore: 50,
      areaWeightScore: 50,
      categoryMultiplier: 1
    };
    
    // 1. Complaint Count Score (0-100)
    // More complaints in same area = higher priority
    const sameLocationCount = await Complaint.countDocuments({
      location: { $regex: complaint.location, $options: "i" },
      _id: { $ne: complaint._id }
    });
    
    breakdown.complaintCountScore = Math.min(sameLocationCount * 10 + 50, 100);
    
    // 2. Time Pending Score (0-100)
    // Older complaints = higher priority
    const hoursPending = options.hoursPending || 0;
    breakdown.timePendingScore = Math.min(hoursPending * 2 + 50, 100);
    
    // 3. Area Weight Score (0-100)
    // High-density areas = higher priority
    breakdown.areaWeightScore = options.areaWeight || 50;
    
    // 4. Category Multiplier
    const categoryMultipliers = {
      "Drainage": 1.5,
      "Garbage": 1.3,
      "Water Leakage": 1.2,
      "Road Damage": 1.1,
      "Streetlight Issue": 1.0
    };
    breakdown.categoryMultiplier = categoryMultipliers[complaint.category] || 1.0;
    
    // Calculate final score
    const rawScore = (
      breakdown.complaintCountScore * 0.4 +
      breakdown.timePendingScore * 0.3 +
      breakdown.areaWeightScore * 0.3
    );
    
    const finalScore = Math.min(Math.round(rawScore * breakdown.categoryMultiplier), 100);
    
    // Determine severity level
    let severityLevel = "low";
    if (finalScore >= 80) severityLevel = "critical";
    else if (finalScore >= 60) severityLevel = "high";
    else if (finalScore >= 40) severityLevel = "medium";
    
    // Generate reasoning
    const reasoning = `Score: ${finalScore}/100. ` +
      `Location complaints: ${sameLocationCount}, ` +
      `Category: ${complaint.category}, ` +
      `Multiplier: ${breakdown.categoryMultiplier}x`;
    
    return {
      score: finalScore,
      breakdown,
      severityLevel,
      reasoning
    };
  } catch (error) {
    console.error("Priority Calculation Error:", error.message);
    const fallback = fallbackCalculatePriority(complaint);
    return {
      score: fallback.score,
      breakdown: fallback.breakdown,
      severityLevel: fallback.score >= 80 ? "critical" : fallback.score >= 60 ? "high" : fallback.score >= 40 ? "medium" : "low",
      reasoning: "Default assessment (AI disabled)"
    };
  }
}

// ============================================
// 5️⃣ SPEECH-TO-TEXT (Whisper - Optional)
// ============================================

/**
 * Convert voice complaint to text using Whisper
 * Supports Hindi and English
 * 
 * @param {string} audioPath - Path to audio file
 * @returns {Object} Transcription with language detection
 */
async function transcribeAudio(audioPath) {
  try {
    const transformers = safeRequire("xenova/transformers");
    
    if (!transformers) {
      return { text: null, error: "Whisper not installed" };
    }
    
    const { pipeline } = transformers;
    
    // Load Whisper model
    const transcriber = await pipeline("automatic-speech-recognition", "openai/whisper");
    
    // Transcribe audio
    const result = await transcriber(audioPath);
    
    return {
      text: result.text,
      language: result.language || "en",
      confidence: result.confidence || 0
    };
  } catch (error) {
    console.error("Speech-to-Text Error:", error.message);
    return { text: null, error: error.message };
  }
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Classification
  classifyImage,
  classifyText,
  
  // Duplicate Detection
  detectDuplicate,
  generateEmbedding,
  cosineSimilarity,
  
  // Priority Scoring
  calculatePriority,
  
  // Speech-to-Text
  transcribeAudio,
  
  // Fallbacks
  fallbackImageClassification,
  fallbackTextClassification,
  fallbackDetectDuplicate,
  fallbackCalculatePriority
};