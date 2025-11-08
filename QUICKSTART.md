# ⚡ Project Synapse - Quick Start (5 Minutes)

## 🚀 One-Command Setup

### Step 1: Install Everything
```powershell
# From project root (d:\Super Dream\Projects\Appointy)
# Install backend dependencies
cd backend; npm install; cd ..

# Install frontend dependencies  
cd frontend; npm install; cd ..

# Install extension dependencies
cd extension; npm install; cd ..
```

### Step 2: Setup Environment
```powershell
# Copy environment files
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env

# Edit backend\.env if needed (Gemini API key is already set)
```

### Step 3: Start Database
```powershell
# Make sure Docker Desktop is running, then:
docker-compose up -d

# Wait 10 seconds for PostgreSQL to initialize...
timeout /t 10
```

### Step 4: Initialize Database
```powershell
cd backend
npm run generate
npm run migrate
cd ..
```

### Step 5: Start Everything
```powershell
# Terminal 1 - Backend (keep this running)
cd backend
npm run dev

# Terminal 2 - Frontend (keep this running)
cd frontend
npm run dev

# Terminal 3 - Build Extension
cd extension
npm run build
```

### Step 6: Install Chrome Extension
1. Open Chrome: `chrome://extensions/`
2. Toggle "Developer mode" (top right)
3. Click "Load unpacked"
4. Navigate to: `d:\Super Dream\Projects\Appointy\extension\dist`
5. Click "Select Folder"

## ✅ Verify Installation

Open: http://localhost:5173

You should see the Project Synapse login page!

## 🎯 Test the Application

### 1. Register Account
- Go to http://localhost:5173/register
- Create account: `test@synapse.ai` / `password123`

### 2. Create Content
- Click the blue "+" button (bottom right)
- Add a URL: `https://github.com/microsoft/vscode`
- Watch AI extract metadata automatically!

### 3. AI Search
- Go to "Search" in sidebar
- Try: "show me all code related content"
- See semantic search in action!

### 4. Test Chrome Extension
Three ways to capture:
1. **Right-click**: Right-click anywhere → "Save to Synapse"
2. **Keyboard**: Press `Ctrl+Shift+S`
3. **Extension Icon**: Click extension icon → Quick Save

## 🐛 Troubleshooting

### Database Connection Failed
```powershell
# Check Docker status
docker ps

# Restart containers
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs postgres
```

### Port Already in Use
```powershell
# Find process on port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in backend\.env
# PORT=3001
```

### Extension Not Showing
1. Check if backend is running: http://localhost:3000/health
2. Reload extension: Chrome → Extensions → Reload icon
3. Check console: Right-click extension → Inspect

### AI Features Not Working
- Verify Gemini API key in `backend\.env`
- Check quota: https://makersuite.google.com/app/apikey
- View backend logs for errors

## 📊 What's Running

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | React dashboard |
| Backend | http://localhost:3000 | REST API |
| API Docs | http://localhost:3000/api-docs | Swagger UI |
| Database | localhost:5432 | PostgreSQL |
| Extension | chrome://extensions | Chrome extension |

## 🎨 Key Features to Demo

### ✨ AI-Powered Features
- **Smart Tagging**: Auto-generates tags from content
- **Semantic Search**: Natural language queries
- **OCR**: Upload handwritten notes
- **Content Classification**: Auto-detects type (article/video/product/etc.)

### 📝 Content Types Supported
- URLs/Bookmarks
- Articles
- Videos (YouTube embeds)
- Images (with OCR)
- Notes
- Code Snippets
- PDFs
- Screenshots
- Todos
- Products (with price tracking)

### 🔌 Chrome Extension
- **Context Menus**: Right-click to save page/selection/link/image
- **Keyboard Shortcut**: `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac)
- **Popup UI**: Click icon for quick save with full form
- **Auto-fill**: Automatically extracts page metadata

### 🔍 Search Capabilities
- Natural language: "find my coding tutorials"
- Filter by type, tags, dates
- AI-ranked results (most relevant first)
- Full-text search with PostgreSQL

### 🗂️ Organization
- **Collections**: Group related content
- **Tags**: Auto & manual tagging
- **Favorites**: Star important items
- **Archive**: Hide old content

## 🎯 Demo Script for Presentation

### Part 1: Authentication & Dashboard (1 min)
1. Show register/login flow
2. Highlight clean Material-UI interface
3. Show empty state with onboarding

### Part 2: Content Capture (2 min)
1. Manual add via dashboard
2. Chrome extension right-click capture
3. Extension keyboard shortcut
4. Show auto-extracted metadata

### Part 3: AI Features (2 min)
1. Search with natural language
2. Upload handwritten note image (OCR)
3. Show auto-generated tags
4. Demonstrate content classification

### Part 4: Organization (1 min)
1. Create collection
2. Add items to collection
3. Filter by tags
4. Show favorites/archive

### Part 5: Technical Deep Dive (2 min)
1. Show architecture diagram
2. Highlight security (JWT, bcrypt, rate limiting)
3. Mention tech stack (React, Node, PostgreSQL, Gemini AI)
4. Show API documentation (Swagger)

### Part 6: X-Factor Features (2 min)
Mention planned features:
- Knowledge graph visualization
- Collaborative spaces
- Voice note capture
- Price tracking
- Export to Notion/Obsidian
- Browser history integration

## 📈 Production Readiness

### ✅ What's Implemented
- [x] **Security**: JWT auth, bcrypt, rate limiting, CORS, Helmet
- [x] **Database**: PostgreSQL with Prisma ORM, migrations
- [x] **AI Integration**: Google Gemini for search, OCR, tagging
- [x] **Error Handling**: Global error middleware, validation
- [x] **Logging**: Winston structured logging
- [x] **API Docs**: OpenAPI/Swagger auto-generated
- [x] **Type Safety**: Full TypeScript coverage
- [x] **Docker**: Containerized PostgreSQL & Redis
- [x] **SOLID**: Clean architecture principles

### 🔜 Next Steps for Production
- [ ] Unit & integration tests (Jest, Supertest)
- [ ] E2E tests (Playwright)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Environment-based config
- [ ] Performance monitoring
- [ ] SSL certificates
- [ ] CDN for static assets
- [ ] Database backups
- [ ] Rate limiting per user
- [ ] Email notifications

## 📚 Documentation

- **Setup Guide**: See `SETUP.md` for detailed instructions
- **Architecture**: See `ARCHITECTURE.md` for system design
- **API Docs**: http://localhost:3000/api-docs (when running)
- **README**: See `README.md` for project overview

## 🎓 Tech Stack Highlights

**Backend:**
- Node.js 20+ with TypeScript 5.6
- Express.js 4.21 (REST API)
- PostgreSQL 16 with Prisma ORM 5.22
- Google Gemini AI for semantic features
- Tesseract.js for OCR

**Frontend:**
- React 18.3 with TypeScript
- Material-UI (MUI) 6.1
- TanStack Query 5.59
- React Router v6.27
- Vite 5.4 (build tool)

**Extension:**
- Chrome Manifest V3
- TypeScript + Webpack
- Chrome APIs (Storage, Context Menus, Commands)

**Infrastructure:**
- Docker & Docker Compose
- Redis (caching - future)
- Winston (logging)
- JWT with refresh tokens

## 🏆 Competitive Advantages

1. **AI-First**: Semantic search, not just keyword matching
2. **Universal Capture**: Extension works anywhere on the web
3. **OCR Support**: Extract text from images/handwritten notes
4. **Smart Organization**: Auto-tagging, auto-classification
5. **Production Ready**: Security, logging, error handling
6. **Modern Stack**: Latest dependencies, TypeScript everywhere
7. **Developer Experience**: Swagger docs, type safety, clean code
8. **Extensible**: Service layer pattern, easy to add features

## 💡 Tips for Presentation

1. **Practice the demo**: Test everything before presenting
2. **Prepare backup**: Have screenshots in case of tech issues
3. **Explain decisions**: Why Gemini? Why PostgreSQL? Why MUI?
4. **Show code quality**: Mention TypeScript, SOLID, security
5. **Highlight X-factors**: What makes this unique?
6. **Future vision**: What would you add with more time?
7. **Answer questions**: Be ready to explain any technical choice

---

## ⏱️ Time Estimate

- **Installation**: 5 minutes
- **Testing**: 5 minutes
- **Understanding**: 10 minutes
- **Demo Practice**: 10 minutes
- **Total**: ~30 minutes

## 🆘 Need Help?

Check these files:
- `SETUP.md` - Detailed setup instructions
- `ARCHITECTURE.md` - System design documentation
- `README.md` - Project overview

Backend logs: Check terminal running `npm run dev`
Frontend logs: Check browser DevTools console
Extension logs: Chrome → Extensions → Inspect views: background page

---

**Made with ❤️ for Appointy's Project Synapse Challenge**

**You've got this! 🚀**
