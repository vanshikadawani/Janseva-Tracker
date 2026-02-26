# Janseva Tracker - Quick Start Guide

Get up and running in 5 minutes!

## ⚡ Quick Setup

### Step 1: Install Node.js
Download from [nodejs.org](https://nodejs.org/) (v16+)

### Step 2: Clone & Install
```bash
git clone <repository-url>
cd janseva-tracker
npm install
```

### Step 3: Setup MongoDB
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create a cluster
4. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/janseva`)

### Step 4: Configure Environment
```bash
# Copy example file
cp .env.example .env

# Edit .env and add:
# - MONGO_URL (from MongoDB Atlas)
# - JWT_SECRET (any random string)
# - SESSION_SECRET (any random string)
```

### Step 5: Run Server
```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## 🎯 What You Can Do

✅ Register & Login  
✅ Report complaints with photos  
✅ View all complaints  
✅ AI categorizes complaints automatically  
✅ Duplicate detection  
✅ Priority scoring  

---

## 📁 Project Structure

```
janseva-tracker/
├── server.js              # Start here
├── src/
│   ├── app.js            # Express setup
│   ├── config/           # Database config
│   ├── models/           # Data schemas
│   ├── routes/           # API endpoints
│   └── services/         # AI logic
├── views/                # Web pages (EJS)
├── public/               # CSS, JS, images
├── uploads/              # User uploaded files
├── .env                  # Your secrets (create this)
├── .env.example          # Template
├── package.json          # Dependencies
└── requirements.txt      # Dependency list
```

---

## 🔧 Common Commands

```bash
# Start development server (auto-reload)
npm run dev

# Start production server
npm start

# Install dependencies
npm install

# Clear npm cache if install fails
npm cache clean --force
```

---

## 🐛 Troubleshooting

**Port 3000 in use?**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

**MongoDB connection error?**
- Check MONGO_URL in .env
- Verify IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

**npm install fails?**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Next Steps

1. Read [README.md](README.md) for full documentation
2. Check [API Endpoints](README.md#-api-endpoints) section
3. Explore AI features in `src/services/ai.service.js`
4. Customize styling in `public/css/style.css`

---

## 🚀 Deployment

Ready to deploy? Check hosting options:
- **Heroku** - Free tier available
- **Railway** - Simple deployment
- **Render** - Free tier with MongoDB
- **AWS/Azure** - Enterprise options

See README.md for deployment guides.

---

## 💡 Tips

- First run downloads AI models (~500MB) - be patient!
- Keep `.env` file secret - never commit to git
- Use `.env.example` as template for new developers
- Check `uploads/` folder for user-submitted images

---

Need help? Check the full [README.md](README.md) or create an issue!
