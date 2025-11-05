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
