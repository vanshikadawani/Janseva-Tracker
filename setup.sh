#!/bin/bash

# Janseva Tracker - macOS/Linux Setup Script

echo ""
echo "========================================"
echo "  Janseva Tracker - Setup Script"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please download from: https://nodejs.org/"
    exit 1
fi

echo "[1/4] Node.js found:"
node --version

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed!"
    exit 1
fi

echo "[2/4] npm found:"
npm --version

# Install dependencies
echo ""
echo "[3/4] Installing dependencies..."
echo "This may take a few minutes..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: npm install failed!"
    echo "Try: npm cache clean --force"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "[4/4] Creating .env file..."
    cp .env.example .env
    echo ""
    echo "========================================"
    echo "  Setup Complete!"
    echo "========================================"
    echo ""
    echo "NEXT STEPS:"
    echo "1. Edit .env file with your settings:"
    echo "   - Add MongoDB URL (MONGO_URL)"
    echo "   - Add JWT_SECRET (any random string)"
    echo "   - Add SESSION_SECRET (any random string)"
    echo ""
    echo "2. Start the server:"
    echo "   npm run dev"
    echo ""
    echo "3. Open browser:"
    echo "   http://localhost:3000"
    echo ""
else
    echo ""
    echo "========================================"
    echo "  Setup Complete!"
    echo "========================================"
    echo ""
    echo ".env file already exists"
    echo ""
    echo "To start the server:"
    echo "   npm run dev"
    echo ""
fi
