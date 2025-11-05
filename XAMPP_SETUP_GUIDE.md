# 🚀 Complete Setup Guide for Windows + XAMPP

## Overview
This guide will help you run both **ShareSavings.io** (static site) and **AutoAffiliatePublisher** (full-stack app) on your Windows PC using XAMPP.

## 📋 Prerequisites

### Required Software:
1. **XAMPP** (for Apache web server)
   - Download: https://www.apachefriends.org/download.html
   - Install to: `C:\xampp`

2. **Node.js** (for React frontend)
   - Download: https://nodejs.org/ (LTS version)
   - Version: 18.x or higher

3. **Python** (for FastAPI backend)
   - Download: https://www.python.org/downloads/
   - Version: 3.11 or higher
   - ⚠️ Check "Add Python to PATH" during installation

4. **MongoDB** (for database)
   - Download: https://www.mongodb.com/try/download/community
   - Install as Windows Service

5. **Git** (optional, for version control)
   - Download: https://git-scm.com/download/win

---

## 📁 Project Structure

```
C:\xampp\htdocs\
├── sharesavings\              # Static website (runs on Apache)
│   ├── index.html
│   ├── login.html
│   ├── privacy.html
│   └── ... (all other pages)
│
└── autoaffiliate\             # Full-stack app (runs separately)
    ├── backend\               # FastAPI (Python)
    │   ├── server.py
    │   ├── requirements.txt
    │   └── .env
    └── frontend\              # React
        ├── src\
        ├── package.json
        └── .env
```

---

## 🔧 Step-by-Step Setup

### Step 1: Install XAMPP

1. Download and install XAMPP
2. Start XAMPP Control Panel
3. Start **Apache** module (for static site)
4. Start **MySQL** (optional, we use MongoDB)

### Step 2: Copy ShareSavings.io to XAMPP

```bash
# Open Command Prompt or PowerShell
# Navigate to your downloads/project folder
cd C:\Users\YourName\Downloads

# Copy ShareSavings website to XAMPP
xcopy /E /I sharesavings-website C:\xampp\htdocs\sharesavings
```

**Manual Method:**
1. Open File Explorer
2. Copy the entire `sharesavings-website` folder
3. Paste into `C:\xampp\htdocs\`
4. Rename to `sharesavings`

**Access:** http://localhost/sharesavings/index.html

### Step 3: Install MongoDB

1. Download MongoDB Community Server
2. Install with default settings
3. MongoDB will run as Windows Service automatically
4. Verify it's running:
   ```bash
   # Open Command Prompt
   mongosh
   # You should see MongoDB shell
   # Type 'exit' to quit
   ```

### Step 4: Setup AutoAffiliatePublisher Backend

1. **Copy Backend Files:**
   ```bash
   # Create directory
   mkdir C:\xampp\htdocs\autoaffiliate
   mkdir C:\xampp\htdocs\autoaffiliate\backend
   
   # Copy backend files to this location
   ```

2. **Install Python Dependencies:**
   ```bash
   # Open Command Prompt
   cd C:\xampp\htdocs\autoaffiliate\backend
   
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Configure Backend (.env file):**
   ```bash
   # Edit C:\xampp\htdocs\autoaffiliate\backend\.env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=autoaffiliate_db
   CORS_ORIGINS=http://localhost:3000,http://localhost:8001
   JWT_SECRET_KEY=your-secret-key-change-in-production-2024
   ```

4. **Start Backend Server:**
   ```bash
   cd C:\xampp\htdocs\autoaffiliate\backend
   venv\Scripts\activate
   python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```
   
   **Access:** http://localhost:8001/api/

### Step 5: Setup AutoAffiliatePublisher Frontend

1. **Copy Frontend Files:**
   ```bash
   mkdir C:\xampp\htdocs\autoaffiliate\frontend
   # Copy all frontend files here
   ```

2. **Install Node Dependencies:**
   ```bash
   # Open NEW Command Prompt
   cd C:\xampp\htdocs\autoaffiliate\frontend
   
   # Install Yarn (if not installed)
   npm install -g yarn
   
   # Install dependencies
   yarn install
   ```

3. **Configure Frontend (.env file):**
   ```bash
   # Edit C:\xampp\htdocs\autoaffiliate\frontend\.env
   REACT_APP_BACKEND_URL=http://localhost:8001
   REACT_APP_ENABLE_VISUAL_EDITS=false
   ENABLE_HEALTH_CHECK=false
   ```

4. **Start Frontend Server:**
   ```bash
   cd C:\xampp\htdocs\autoaffiliate\frontend
   yarn start
   ```
   
   **Access:** http://localhost:3000

---

## 🔗 Connecting ShareSavings.io to AutoAffiliatePublisher

### Method 1: Link Admin Button

Edit `C:\xampp\htdocs\sharesavings\index.html`:

Find this line:
```html
<a href="/login.html" class="text-gray-700 hover:text-indigo-600 font-medium transition">Admin</a>
```

Change to:
```html
<a href="http://localhost:3000" class="text-gray-700 hover:text-indigo-600 font-medium transition" target="_blank">Admin</a>
```

### Method 2: Embed Admin Link in Footer

Add to footer section:
```html
<div class="mt-4 text-center">
    <a href="http://localhost:3000" target="_blank" class="text-pink-400 hover:text-pink-300">
        Admin Dashboard →
    </a>
</div>
```

---

## 🎯 Quick Start Commands

### Starting Everything:

**Terminal 1 - Backend:**
```bash
cd C:\xampp\htdocs\autoaffiliate\backend
venv\Scripts\activate
python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend:**
```bash
cd C:\xampp\htdocs\autoaffiliate\frontend
yarn start
```

**Terminal 3 - Check MongoDB:**
```bash
mongosh
show dbs
use autoaffiliate_db
show collections
```

**XAMPP:**
- Open XAMPP Control Panel
- Start Apache

### Access URLs:
- 📄 ShareSavings.io: http://localhost/sharesavings/index.html
- 🎛️ Admin Dashboard: http://localhost:3000
- 🔧 Backend API: http://localhost:8001/api/
- 📊 MongoDB: localhost:27017

---

## 🛠️ Troubleshooting

### Issue: Port Already in Use

**Backend (Port 8001):**
```bash
# Find process using port
netstat -ano | findstr :8001

# Kill process
taskkill /PID <process_id> /F
```

**Frontend (Port 3000):**
```bash
# Find and kill
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

### Issue: MongoDB Not Running

```bash
# Check MongoDB service
net start MongoDB

# If not installed as service, run manually
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath C:\data\db
```

### Issue: Python Not Found

```bash
# Check Python installation
python --version

# If not found, add to PATH:
# 1. Search "Environment Variables" in Windows
# 2. Edit "Path" under System Variables
# 3. Add: C:\Users\YourName\AppData\Local\Programs\Python\Python311
```

### Issue: Node/Yarn Not Found

```bash
# Check Node installation
node --version
npm --version

# Install Yarn globally
npm install -g yarn
```

### Issue: XAMPP Apache Won't Start

**Port 80 conflict:**
1. Open XAMPP Control Panel
2. Click "Config" next to Apache
3. Select "httpd.conf"
4. Change `Listen 80` to `Listen 8080`
5. Save and restart Apache
6. Access: http://localhost:8080/sharesavings/

---

## 📝 Creating Desktop Shortcuts

### Create Start Scripts:

**1. start-backend.bat**
```batch
@echo off
cd C:\xampp\htdocs\autoaffiliate\backend
call venv\Scripts\activate
python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
pause
```

**2. start-frontend.bat**
```batch
@echo off
cd C:\xampp\htdocs\autoaffiliate\frontend
yarn start
pause
```

**3. start-all.bat**
```batch
@echo off
echo Starting AutoAffiliatePublisher...
start "Backend" cmd /k "cd C:\xampp\htdocs\autoaffiliate\backend && venv\Scripts\activate && python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
timeout /t 5
start "Frontend" cmd /k "cd C:\xampp\htdocs\autoaffiliate\frontend && yarn start"
echo.
echo Starting XAMPP Apache...
"C:\xampp\xampp-control.exe"
echo.
echo All services started!
echo ShareSavings: http://localhost/sharesavings/
echo Admin: http://localhost:3000
pause
```

Save these as `.bat` files on your Desktop for easy access.

---

## 🔒 Security Notes for Production

If you want to deploy this publicly later:

1. Change JWT_SECRET_KEY in backend .env
2. Use environment-specific .env files
3. Enable HTTPS
4. Use production MongoDB instance
5. Implement rate limiting
6. Add CSRF protection
7. Enable CORS only for your domain

---

## 📊 Default Credentials

**Admin Account (AutoAffiliatePublisher):**
- Username: `admin`
- Password: `Admin123`

(Change after first login!)

---

## 🎓 Next Steps

1. ✅ Verify all services are running
2. ✅ Access ShareSavings.io homepage
3. ✅ Login to Admin Dashboard
4. ✅ Configure API keys in Integrations page
5. ✅ Test scheduler functionality
6. ✅ Monitor logs for errors

---

## 📞 Need Help?

- Check logs in Command Prompt windows
- Verify all ports are free
- Ensure MongoDB is running
- Check .env files are configured correctly

---

**Estimated Setup Time:** 30-45 minutes
**Difficulty:** Intermediate
**Requirements:** Windows 10/11, 8GB RAM, 5GB free space
