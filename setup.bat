@echo off
REM Janseva Tracker - Windows Setup Script

echo.
echo ========================================
echo   Janseva Tracker - Setup Script
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download from: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Node.js found: 
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

echo [2/4] npm found: 
npm --version

REM Install dependencies
echo.
echo [3/4] Installing dependencies...
echo This may take a few minutes...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    echo Try: npm cache clean --force
    pause
    exit /b 1
)

REM Check if .env exists
if not exist .env (
    echo.
    echo [4/4] Creating .env file...
    copy .env.example .env
    echo.
    echo ========================================
    echo   Setup Complete!
    echo ========================================
    echo.
    echo NEXT STEPS:
    echo 1. Edit .env file with your settings:
    echo    - Add MongoDB URL (MONGO_URL)
    echo    - Add JWT_SECRET (any random string)
    echo    - Add SESSION_SECRET (any random string)
    echo.
    echo 2. Start the server:
    echo    npm run dev
    echo.
    echo 3. Open browser:
    echo    http://localhost:3000
    echo.
) else (
    echo.
    echo ========================================
    echo   Setup Complete!
    echo ========================================
    echo.
    echo .env file already exists
    echo.
    echo To start the server:
    echo    npm run dev
    echo.
)

pause
