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
