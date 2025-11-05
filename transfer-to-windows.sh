#!/bin/bash

echo "Creating Windows XAMPP Package..."

# Create package directory
mkdir -p /app/xampp-package
mkdir -p /app/xampp-package/sharesavings
mkdir -p /app/xampp-package/autoaffiliate/backend
mkdir -p /app/xampp-package/autoaffiliate/frontend

# Copy ShareSavings website
cp -r /app/sharesavings-website/* /app/xampp-package/sharesavings/

# Copy AutoAffiliatePublisher backend
cp -r /app/backend/* /app/xampp-package/autoaffiliate/backend/

# Copy AutoAffiliatePublisher frontend
cp -r /app/frontend/* /app/xampp-package/autoaffiliate/frontend/

# Copy setup guide
cp /app/XAMPP_SETUP_GUIDE.md /app/xampp-package/

# Create batch files
cat > /app/xampp-package/autoaffiliate/start-backend.bat << 'BACKEND'
@echo off
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)
echo Starting Backend Server on http://localhost:8001
python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
pause
BACKEND

cat > /app/xampp-package/autoaffiliate/start-frontend.bat << 'FRONTEND'
@echo off
cd frontend
if not exist node_modules (
    echo Installing dependencies...
    call npm install -g yarn
    call yarn install
)
echo Starting Frontend on http://localhost:3000
yarn start
pause
FRONTEND

cat > /app/xampp-package/autoaffiliate/START-ALL.bat << 'STARTALL'
@echo off
title AutoAffiliatePublisher Launcher
color 0A
echo.
echo ========================================
echo   AutoAffiliatePublisher
echo   Starting All Services...
echo ========================================
echo.

echo [1/3] Starting Backend Server...
start "Backend API" cmd /k "cd backend && (if not exist venv (python -m venv venv && call venv\Scripts\activate && pip install -r requirements.txt) else call venv\Scripts\activate) && python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload"

timeout /t 8 /nobreak >nul

echo [2/3] Starting Frontend...
start "Frontend React" cmd /k "cd frontend && (if not exist node_modules (npm install -g yarn && yarn install)) && yarn start"

timeout /t 5 /nobreak >nul

echo [3/3] Opening Admin Dashboard...
timeout /t 10 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo   ShareSavings:  http://localhost/sharesavings/
echo   Admin Panel:   http://localhost:3000
echo   Backend API:   http://localhost:8001/api/
echo.
echo   Press any key to exit this window...
echo   (Services will continue running)
echo ========================================
pause >nul
STARTALL

cat > /app/xampp-package/README.txt << 'README'
========================================
  AutoAffiliatePublisher + ShareSavings.io
  Windows XAMPP Installation Package
========================================

CONTENTS:
---------
1. sharesavings/        - Static website (HTML)
2. autoaffiliate/       - Full-stack app (React + FastAPI)
3. XAMPP_SETUP_GUIDE.md - Complete setup instructions

QUICK START:
-----------
1. Install XAMPP from: https://www.apachefriends.org/
2. Install Node.js from: https://nodejs.org/
3. Install Python 3.11+ from: https://www.python.org/
4. Install MongoDB from: https://www.mongodb.com/try/download/community

5. Copy "sharesavings" folder to: C:\xampp\htdocs\
6. Copy "autoaffiliate" folder to: C:\xampp\htdocs\

7. Open XAMPP Control Panel and Start Apache
8. Run: C:\xampp\htdocs\autoaffiliate\START-ALL.bat

URLS:
-----
ShareSavings:  http://localhost/sharesavings/
Admin Panel:   http://localhost:3000
Backend API:   http://localhost:8001/api/

For detailed instructions, see XAMPP_SETUP_GUIDE.md

========================================
