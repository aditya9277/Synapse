# Installation script for Project Synapse
# Run this from the project root: .\install.ps1

Write-Host "🧠 Project Synapse - Installation Script" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Check Node.js
Write-Host "✓ Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Node.js $nodeVersion installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js not found! Please install Node.js 20+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check Docker
Write-Host "✓ Checking Docker..." -ForegroundColor Yellow
$dockerVersion = docker --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Docker installed: $dockerVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Docker not found! Please install Docker Desktop from https://docker.com" -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Installing Dependencies...`n" -ForegroundColor Cyan

# Backend
Write-Host "1️⃣ Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Backend installation failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "  ✓ Backend dependencies installed" -ForegroundColor Green
Set-Location ..

# Frontend
Write-Host "2️⃣ Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Frontend installation failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "  ✓ Frontend dependencies installed" -ForegroundColor Green
Set-Location ..

# Extension
Write-Host "3️⃣ Installing extension dependencies..." -ForegroundColor Yellow
Set-Location extension
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Extension installation failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "  ✓ Extension dependencies installed" -ForegroundColor Green
Set-Location ..

Write-Host "`n⚙️ Setting up environment files...`n" -ForegroundColor Cyan

# Backend .env
if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "  ✓ Created backend\.env" -ForegroundColor Green
} else {
    Write-Host "  ⚠ backend\.env already exists (skipping)" -ForegroundColor Yellow
}

# Frontend .env
if (-not (Test-Path "frontend\.env")) {
    Copy-Item "frontend\.env.example" "frontend\.env"
    Write-Host "  ✓ Created frontend\.env" -ForegroundColor Green
} else {
    Write-Host "  ⚠ frontend\.env already exists (skipping)" -ForegroundColor Yellow
}

Write-Host "`n🐳 Starting Docker containers...`n" -ForegroundColor Cyan

docker-compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ PostgreSQL started successfully" -ForegroundColor Green
    Write-Host "  Waiting for database to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
} else {
    Write-Host "  ✗ Failed to start Docker containers!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🗄️ Setting up database...`n" -ForegroundColor Cyan

Set-Location backend

# Generate Prisma Client
Write-Host "  Generating Prisma Client..." -ForegroundColor Yellow
npm run generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to generate Prisma Client!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Run migrations
Write-Host "  Running database migrations..." -ForegroundColor Yellow
npm run migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to run migrations!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "  ✓ Database setup complete" -ForegroundColor Green
Set-Location ..

Write-Host "`n🔨 Building Chrome Extension...`n" -ForegroundColor Cyan

Set-Location extension
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Extension built successfully" -ForegroundColor Green
    Write-Host "  Extension files are in: extension\dist" -ForegroundColor Cyan
} else {
    Write-Host "  ✗ Extension build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host "`n✅ Installation Complete!`n" -ForegroundColor Green

Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start backend:  cd backend && npm run dev" -ForegroundColor White
Write-Host "  2. Start frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "  3. Install extension:" -ForegroundColor White
Write-Host "     • Open Chrome: chrome://extensions/" -ForegroundColor Gray
Write-Host "     • Enable 'Developer mode'" -ForegroundColor Gray
Write-Host "     • Click 'Load unpacked'" -ForegroundColor Gray
Write-Host "     • Select: extension\dist folder" -ForegroundColor Gray
Write-Host "  4. Open: http://localhost:5173" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "  • Quick Start: QUICKSTART.md" -ForegroundColor White
Write-Host "  • Setup Guide: SETUP.md" -ForegroundColor White
Write-Host "  • Architecture: ARCHITECTURE.md" -ForegroundColor White

Write-Host "`nHappy coding! 🎉`n" -ForegroundColor Green
