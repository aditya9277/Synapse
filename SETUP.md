# 🧠 Project Synapse - Setup Guide

## Prerequisites

- **Node.js 20+** installed
- **Docker & Docker Compose** (for database)
- **Chrome browser** (for extension)
- **Git** (optional)

## Quick Start

### 1. Clone or Extract the Project

```bash
cd d:\Super Dream\Projects\Appointy
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

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

### 3. Setup Environment Files

**Backend** - Create `backend/.env`:
```env
DATABASE_URL="postgresql://synapse:synapse_dev_password@localhost:5432/synapse_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production-min-32-chars"
GEMINI_API_KEY="AIzaSyDc0PQCAE9sqyWfMgIxPIPUQwEIG9dc2hw"
PORT=3000
NODE_ENV=development
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
CORS_ORIGIN="http://localhost:5173"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend** - Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME="Project Synapse"
```

### 4. Start Database

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Wait a few seconds for PostgreSQL to start...
```

### 5. Run Database Migrations

```bash
cd backend
npm run generate
npm run migrate
cd ..
```

### 6. Start Development Servers

**Option A: Start All (Recommended)**
```bash
npm run dev
```

**Option B: Start Individually**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 7. Build and Install Chrome Extension

```bash
cd extension
npm run build
```

Then:
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `d:\Super Dream\Projects\Appointy\extension\dist` folder

### 8. Access the Application

- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs

## First Time Usage

1. **Register an Account**: Go to http://localhost:5173/register
2. **Login**: Use your credentials
3. **Start Capturing**: Use the dashboard or Chrome extension to save content

### Using the Chrome Extension

1. Click the extension icon in Chrome toolbar
2. Or right-click on any page → "Save to Synapse"
3. Use keyboard shortcut: `Ctrl+Shift+S` (Windows) or `Cmd+Shift+S` (Mac)

## Development

### Backend Development

```bash
cd backend

# Watch mode
npm run dev

# Build
npm run build

# Run tests
npm run test

# Database operations
npm run db:studio  # Open Prisma Studio
npm run migrate    # Run migrations
```

### Frontend Development

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Extension Development

```bash
cd extension

# Build (production)
npm run build

# Watch mode (development)
npm run dev
```

After building, reload the extension in Chrome:
1. Go to `chrome://extensions/`
2. Click the reload icon on your extension

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database
docker-compose down
docker-compose up -d

# View logs
docker-compose logs postgres
```

### Port Already in Use

If port 3000 or 5173 is in use:

1. Change backend port in `backend/.env`: `PORT=3001`
2. Change frontend port in `frontend/vite.config.ts`
3. Update API URL in `frontend/.env`: `VITE_API_URL=http://localhost:3001`

### Extension Not Working

1. Check if logged in at http://localhost:5173
2. Open Chrome DevTools on extension popup (right-click → Inspect)
3. Check background script logs in `chrome://extensions/` → Details → Inspect views: background page
4. Make sure API is running at http://localhost:3000

### Gemini API Issues

If AI features aren't working:
1. Verify API key in `backend/.env`
2. Check API quota at https://makersuite.google.com/
3. Check backend logs for error messages

## Production Deployment

### Backend

```bash
cd backend
npm run build
npm start
```

Set `NODE_ENV=production` and update all security-related environment variables.

### Frontend

```bash
cd frontend
npm run build
```

Deploy the `dist` folder to any static hosting service (Vercel, Netlify, etc.)

### Database

Use a managed PostgreSQL service (AWS RDS, Digital Ocean, etc.) and update `DATABASE_URL`.

## Key Features to Test

✅ **Authentication**: Register, Login, Logout  
✅ **Content Capture**: Create notes, save URLs, upload images  
✅ **AI Search**: Use natural language queries  
✅ **Tags & Categories**: Organize content  
✅ **Chrome Extension**: Save pages, selections, images  
✅ **Collections**: Group related content  
✅ **OCR**: Upload handwritten notes (images)  

## Useful Commands

```bash
# Root
npm run dev          # Start all services
npm run docker:up    # Start database
npm run docker:down  # Stop database

# Backend
cd backend
npm run dev         # Development mode
npm run migrate     # Run migrations
npm run db:studio   # Open Prisma Studio
npm run test        # Run tests

# Frontend
cd frontend
npm run dev         # Development mode
npm run build       # Production build

# Extension
cd extension
npm run build       # Build extension
npm run dev         # Watch mode
```

## Architecture Overview

```
Project Synapse/
├── backend/          # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, validation, etc.
│   │   └── schemas/       # Zod validation schemas
│   └── prisma/            # Database schema
├── frontend/         # React + TypeScript + Vite
│   └── src/
│       ├── pages/         # Route pages
│       ├── components/    # Reusable components
│       ├── contexts/      # React contexts
│       └── services/      # API clients
└── extension/        # Chrome Extension
    └── src/
        ├── background.ts  # Background script
        ├── content.ts     # Content script
        └── popup.ts       # Popup UI
```

## Support & Documentation

- **API Docs**: http://localhost:3000/api-docs
- **Architecture**: See `ARCHITECTURE.md`
- **Backend API**: RESTful API with JWT auth
- **Frontend**: React with Material-UI
- **Extension**: Chrome Manifest V3

---

**Made with ❤️ for Appointy's Project Synapse Challenge**

**Ready for Production • Secure • Scalable • AI-Powered**
