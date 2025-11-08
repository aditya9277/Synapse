# 🚀 Installation Instructions - Start Here!

Welcome to **Project Synapse**! Follow these steps to get everything running.

## ⏱️ Estimated Time: 10 minutes

---

## Prerequisites Check

Before you begin, make sure you have:

- [ ] **Node.js 20+** installed → [Download](https://nodejs.org/)
- [ ] **Docker Desktop** running → [Download](https://www.docker.com/products/docker-desktop/)
- [ ] **Chrome Browser** installed → [Download](https://www.google.com/chrome/)
- [ ] **Git** (optional) → [Download](https://git-scm.com/)
- [ ] **Code Editor** (VS Code recommended) → [Download](https://code.visualstudio.com/)

### Verify Prerequisites

Open PowerShell and run:

```powershell
# Check Node.js
node --version
# Should show: v20.x.x or higher

# Check npm
npm --version
# Should show: 10.x.x or higher

# Check Docker
docker --version
# Should show: Docker version 24.x.x or higher
```

---

## 🎯 Quick Installation (Automated)

### Option A: Run Installation Script (Recommended)

```powershell
# Navigate to project directory
cd "d:\Super Dream\Projects\Appointy"

# Run the installation script
.\install.ps1
```

The script will:
1. ✅ Check prerequisites
2. ✅ Install all dependencies (backend, frontend, extension)
3. ✅ Create environment files
4. ✅ Start Docker containers
5. ✅ Run database migrations
6. ✅ Build Chrome extension

**Then skip to Step 6 below!**

---

## 📝 Manual Installation (Step by Step)

### Step 1: Install Dependencies

```powershell
# Navigate to project root
cd "d:\Super Dream\Projects\Appointy"

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install extension dependencies
cd extension
npm install
cd ..
```

⏱️ This takes ~3-5 minutes depending on internet speed.

### Step 2: Setup Environment Files

```powershell
# Copy environment templates
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

**Optional**: Edit `backend\.env` to customize settings. The defaults work for local development!

### Step 3: Start Database

```powershell
# Make sure Docker Desktop is running!
# Then start PostgreSQL container:
docker-compose up -d

# Check it's running:
docker ps
# Should show: postgres:16 container
```

Wait ~10 seconds for PostgreSQL to initialize...

### Step 4: Initialize Database

```powershell
cd backend

# Generate Prisma Client
npm run generate

# Run database migrations
npm run migrate

cd ..
```

You should see: ✅ Database migrations completed!

### Step 5: Build Chrome Extension

```powershell
cd extension
npm run build
cd ..
```

---

## 🎬 Start the Application

### Open 3 Terminal Windows (or tabs)

**Terminal 1 - Backend:**
```powershell
cd "d:\Super Dream\Projects\Appointy\backend"
npm run dev
```

Wait for: `🚀 Server running on http://localhost:3000`

**Terminal 2 - Frontend:**
```powershell
cd "d:\Super Dream\Projects\Appointy\frontend"
npm run dev
```

Wait for: `➜  Local:   http://localhost:5173/`

**Terminal 3 - Keep open for commands**

---

## 🔌 Install Chrome Extension

### Step 6: Load Extension in Chrome

1. Open Chrome browser
2. Go to: `chrome://extensions/`
3. Toggle **"Developer mode"** (top right corner)
4. Click **"Load unpacked"** button
5. Navigate to: `d:\Super Dream\Projects\Appointy\extension\dist`
6. Click **"Select Folder"**

✅ The Project Synapse extension should now appear in your extensions list!

**Pin it to toolbar:**
- Click the puzzle icon (extensions) in Chrome toolbar
- Find "Project Synapse"
- Click the pin icon

---

## ✅ Verify Everything Works

### 1. Check Backend
Open: http://localhost:3000/health

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-..."
}
```

### 2. Check Frontend
Open: http://localhost:5173

You should see:
- ✅ Login page with Project Synapse branding
- ✅ "Register" link
- ✅ No console errors (press F12)

### 3. Check Extension
- Click the Project Synapse icon in Chrome toolbar
- Should show popup with "Save to Synapse" form
- If not logged in yet, shows "Please login" message

### 4. Check Database
```powershell
cd backend
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555 - browse your database!

---

## 🎯 First Time Setup

### Create Your Account

1. Go to: http://localhost:5173/register
2. Fill in:
   - **Name**: Your Name
   - **Email**: test@synapse.ai
   - **Password**: password123 (at least 6 characters)
3. Click **"Sign Up"**
4. Should redirect to Dashboard!

### Try Your First Capture

#### From Dashboard:
1. Click the blue **"+"** button (bottom right)
2. Add a URL:
   - **URL**: https://github.com/microsoft/vscode
   - **Title**: VS Code on GitHub
   - **Type**: URL
3. Click **"Save"**
4. Watch AI extract metadata! ✨

#### From Extension:
1. Visit any website (e.g., https://github.com)
2. Right-click anywhere → "Save to Synapse"
3. Or press `Ctrl+Shift+S`
4. Check your dashboard - it's there!

### Try AI Search

1. Click **"Search"** in sidebar
2. Try natural language:
   - "show me programming content"
   - "find all URLs I saved"
   - "code related items"
3. See semantic search in action! 🤖

---

## 🐛 Troubleshooting

### Issue: Backend won't start

**Error**: "Port 3000 already in use"

**Solution**:
```powershell
# Find process on port 3000
netstat -ano | findstr :3000

# Kill it (replace <PID> with actual number)
taskkill /PID <PID> /F

# Or change port in backend\.env
# PORT=3001
```

### Issue: Database connection failed

**Error**: "Can't reach database server"

**Solution**:
```powershell
# Check Docker is running
docker ps

# Restart containers
docker-compose down
docker-compose up -d

# Wait 10 seconds, then try again
```

### Issue: Frontend won't start

**Error**: "Port 5173 already in use"

**Solution**:
```powershell
# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or Vite will prompt to use a different port - just accept it
```

### Issue: Extension not working

**Problem**: Extension shows errors or doesn't capture

**Solutions**:
1. Make sure backend is running (http://localhost:3000/health)
2. Reload extension:
   - Go to `chrome://extensions/`
   - Click reload icon on Project Synapse
3. Check extension console:
   - Right-click extension icon → "Inspect"
   - Look for errors in console
4. Make sure you're logged in at http://localhost:5173

### Issue: AI features not working

**Problem**: Search doesn't work, tags not generated

**Solution**:
1. Check Gemini API key in `backend\.env`:
   ```
   GEMINI_API_KEY="AIzaSyDc0PQCAE9sqyWfMgIxPIPUQwEIG9dc2hw"
   ```
2. Verify quota at: https://makersuite.google.com/app/apikey
3. Check backend terminal for error messages
4. Restart backend server

### Issue: npm install fails

**Error**: "EACCES: permission denied" or "network error"

**Solutions**:
```powershell
# Clear npm cache
npm cache clean --force

# Try again
npm install

# If still fails, delete node_modules and package-lock.json:
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## 📚 Next Steps

Now that everything is installed:

1. **Read the Docs**:
   - `QUICKSTART.md` - 5-minute feature tour
   - `ARCHITECTURE.md` - System design
   - `TESTING_CHECKLIST.md` - Test all features

2. **Test the Features**:
   - Try all 14 content types
   - Test extension capture methods
   - Experiment with AI search
   - Create collections
   - Upload images for OCR

3. **Explore the Code**:
   - Backend: `backend/src/`
   - Frontend: `frontend/src/`
   - Extension: `extension/src/`

4. **API Documentation**:
   - Open: http://localhost:3000/api-docs
   - Try API endpoints in Swagger UI

5. **Prepare Presentation**:
   - Review `SUMMARY.md`
   - Practice demo
   - Prepare answers to technical questions

---

## 🎓 Useful Commands

### Development
```powershell
# Start everything (from root)
# Terminal 1:
cd backend; npm run dev

# Terminal 2:
cd frontend; npm run dev

# Terminal 3 (if you make extension changes):
cd extension; npm run dev
```

### Database
```powershell
cd backend

# Open Prisma Studio (GUI)
npm run db:studio

# Create migration
npm run migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Docker
```powershell
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f postgres

# Restart containers
docker-compose restart
```

### Building for Production
```powershell
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview

# Extension (already built)
cd extension
npm run build
```

---

## 🎯 What's Running?

| Service | URL | Status Check |
|---------|-----|--------------|
| **Backend API** | http://localhost:3000 | http://localhost:3000/health |
| **API Docs** | http://localhost:3000/api-docs | Open in browser |
| **Frontend** | http://localhost:5173 | Open in browser |
| **Database** | localhost:5432 | `docker ps` |
| **Prisma Studio** | http://localhost:5555 | `npm run db:studio` |
| **Extension** | chrome://extensions/ | Check installed extensions |

---

## 🆘 Still Having Issues?

### Get Help:
1. Check the troubleshooting section above
2. Review terminal logs for error messages
3. Check browser console (F12) for frontend errors
4. Check Docker logs: `docker-compose logs postgres`

### Common Error Messages:

**"Cannot find module 'X'"**
→ Run `npm install` in that directory

**"Database migration failed"**
→ Reset database: `npx prisma migrate reset`

**"CORS error"**
→ Check `CORS_ORIGIN` in `backend\.env` matches frontend URL

**"Extension error: Invalid token"**
→ Logout and login again at http://localhost:5173

---

## 🎉 Success!

If you can:
- ✅ See the login page at http://localhost:5173
- ✅ Register an account
- ✅ Create content
- ✅ Use the Chrome extension
- ✅ Search with AI

**You're all set! The application is fully functional!** 🚀

---

## 📖 Documentation Index

- **Start Here**: `INSTALLATION.md` (this file)
- **Quick Tour**: `QUICKSTART.md`
- **Complete Guide**: `SETUP.md`
- **System Design**: `ARCHITECTURE.md`
- **Testing**: `TESTING_CHECKLIST.md`
- **Project Summary**: `SUMMARY.md`
- **Project Info**: `README.md`

---

## 🚀 Ready to Impress Appointy!

You now have a fully functional, production-ready AI-powered knowledge management system!

**Good luck with your presentation! You've got this! 💪**

---

**Made with ❤️ for Appointy's Project Synapse Challenge**

**Questions? Review the documentation or check the code - it's all commented!** 📚
