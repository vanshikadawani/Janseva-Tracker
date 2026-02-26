# Janseva Tracker - AI-Powered Civic Complaint System

A civic engagement platform for reporting and tracking urban issues with AI-powered features.

## 🎯 Objective

Automatically:
- Categorize complaints (Image + Text)
- Detect duplicate complaints
- Assign smart priority scores

**No heavy training. No complex dataset required.**

---

## 🚀 AI MVP Features

### 1️⃣ Image Classification (MobileNet)

**Model:** MobileNet (Pretrained CNN)

**Approach:**
- Use pretrained CNN to extract predicted labels
- Map labels to civic categories

**Category Mapping:**
| Prediction | Civic Category |
|------------|----------------|
| garbage / trash | Garbage Dept |
| pothole / road | Road Dept |
| lamp / streetlight | Electrical Dept |
| faucet / water | Water Dept |
| sewer / drain | Drainage Dept |

**Why MVP-level:**
- No dataset training required
- Fast integration
- Works for demo

---

### 2️⃣ Text Classification (BART Zero-shot)

**Model:** `facebook/bart-large-mnli`

**Labels:**
- Garbage
- Road Damage
- Streetlight Issue
- Water Leakage
- Drainage

**Output Example:**
```json
{
  "predictedCategory": "Garbage",
  "confidence": 0.92,
  "scores": {
    "Garbage": 0.92,
    "Road Damage": 0.05,
    "Streetlight Issue": 0.02,
    "Water Leakage": 0.01,
    "Drainage": 0.00
  }
}
```

**Why MVP-level:**
- No training needed
- Direct category prediction
- Zero-shot classification

---

### 3️⃣ Duplicate Detection (Sentence Transformers)

**Model:** `all-MiniLM-L6-v2`

**Process:**
1. Convert complaint text → embedding vector
2. Store embedding in MongoDB
3. New complaint → cosine similarity compare
4. If similarity > 0.85 → mark duplicate

**Why MVP-level:**
- No training required
- Pre-trained sentence embeddings
- Fast similarity computation

---

### 4️⃣ Priority Scoring (Rule-based)

**Formula:**
```
Priority Score = (ComplaintCount × 0.4) + (TimePending × 0.3) + (AreaWeight × 0.3)
```

**Components:**
| Component | Weight | Description |
|-----------|--------|-------------|
| ComplaintCount | 0.4 | Number of similar complaints in area |
| TimePending | 0.3 | Hours since complaint was filed |
| AreaWeight | 0.3 | Population density of area |

**Category Multipliers:**
| Category | Multiplier |
|----------|------------|
| Drainage | 1.5x |
| Garbage | 1.3x |
| Water Leakage | 1.2x |
| Road Damage | 1.1x |
| Streetlight Issue | 1.0x |

**Severity Levels:**
| Score | Severity |
|-------|----------|
| 80-100 | Critical |
| 60-79 | High |
| 40-59 | Medium |
| 0-39 | Low |

---

### 5️⃣ Speech-to-Text (Optional)

**Model:** OpenAI Whisper

**Features:**
- Supports Hindi and English
- Converts voice complaint → text
- Integrates with classification pipeline

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- MongoDB Atlas account (free tier available)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd janseva-tracker
```

### 2. Create Virtual Environment (Optional but Recommended)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Node.js Dependencies

```bash
npm install
```

All dependencies are listed in `requirements.txt` and `package.json`. Key packages include:
- **Express.js** - Web framework
- **MongoDB/Mongoose** - Database
- **TensorFlow.js** - Image classification
- **Transformers** - Text classification & duplicate detection
- **Multer** - File uploads
- **JWT** - Authentication

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database (MongoDB Atlas)
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/janseva

# JWT & Session
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_key_here

# AI Features
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Feature Flags
USE_TENSORFLOW=true
USE_TRANSFORMERS=true
USE_WHISPER=true

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Note:** Copy from `.env.example` if available:
```bash
cp .env.example .env
```

### 5. Run the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start at `http://localhost:3000`

### 6. Verify Installation

- Open browser: `http://localhost:3000`
- You should see the Janseva Tracker home page
- Try creating a test complaint to verify all features work

---

## � Troubleshooting

### Common Issues

**Issue: `npm install` fails**
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**Issue: MongoDB connection error**
- Verify `MONGO_URL` in `.env` is correct
- Check MongoDB Atlas IP whitelist includes your IP
- Ensure database user has correct permissions

**Issue: Port 3000 already in use**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

**Issue: AI models not loading**
- Ensure `USE_TENSORFLOW=true` and `USE_TRANSFORMERS=true` in `.env`
- First run may take time downloading models (~500MB)
- Check internet connection for model downloads

**Issue: File upload not working**
- Verify `uploads/` folder exists and is writable
- Check file size limits in multer configuration
- Ensure proper MIME types are allowed

---

## 📦 Dependencies Overview

See `requirements.txt` for complete list. Key dependencies:

| Package | Purpose | Version |
|---------|---------|---------|
| express | Web framework | ^5.2.1 |
| mongoose | MongoDB ODM | ^9.2.1 |
| @tensorflow/tfjs | ML framework | ^4.22.0 |
| transformers | NLP models | ^4.44.2 |
| bcrypt | Password hashing | ^6.0.0 |
| jsonwebtoken | JWT auth | ^9.0.3 |
| multer | File uploads | ^2.0.2 |
| ejs | Template engine | ^4.0.1 |
| nodemon | Dev auto-reload | ^3.1.14 |

### Complaints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/complaints` | Create complaint with AI analysis |
| GET | `/api/complaints/priority` | Get complaints by priority |
| POST | `/api/complaints/classify/image` | Classify image |
| POST | `/api/complaints/classify/text` | Classify text |
| POST | `/api/complaints/duplicate-check` | Check duplicates |
| POST | `/api/complaints/priority/calculate` | Calculate priority |

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/protected` | Protected route |

---

## 📁 Project Structure

```
janseva-tracker/
├── server.js                    # Entry point
├── src/
│   ├── app.js                   # Express app config
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   └── complaint.js         # Complaint schema with AI fields
│   ├── routes/
│   │   ├── auth.routes.js       # Auth endpoints
│   │   └── complaint.routes.js  # Complaint endpoints
│   └── services/
│       └── ai.service.js        # AI models integration
├── views/
│   ├── pages/                   # EJS pages
│   └── includes/                # Navbar, footer
├── public/                      # Static assets
├── uploads/                     # Uploaded images
└── package.json
```

---

## 🧪 Testing AI Features

### Test Image Classification
```bash
curl -X POST http://localhost:3000/api/complaints/classify/image \
  -H "Content-Type: application/json" \
  -d '{"image": "photo.jpg"}'
```

### Test Text Classification
```bash
curl -X POST http://localhost:3000/api/complaints/classify/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Large garbage pile near the park entrance"}'
```

### Test Duplicate Check
```bash
curl -X POST http://localhost:3000/api/complaints/duplicate-check \
  -H "Content-Type: application/json" \
  -d '{"description": "Pothole on main road", "location": "Sector 15"}'
```

### Test Priority Calculation
```bash
curl -X POST http://localhost:3000/api/complaints/priority/calculate \
  -H "Content-Type: application/json" \
  -d '{"category": "Road Damage", "description": "Large pothole", "location": "Main Street"}'
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Express.js 5.x |
| Database | MongoDB + Mongoose |
| Frontend | EJS + Bootstrap |
| Image Classification | MobileNet + TensorFlow.js |
| Text Classification | BART zero-shot + Transformers |
| Duplicate Detection | Sentence Transformers |
| Priority Scoring | Rule-based formula |
| Auth | JWT + cookies |
| File Upload | Multer |

---

## 📝 License

ISC