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
