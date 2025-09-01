# 🚀 ODIADEV Frontend Quick Start Script
# This script gets you up and running quickly

Write-Host "🚀 ODIADEV Frontend Quick Start" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "🔧 Setting up environment variables..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "✅ Environment file created from template" -ForegroundColor Green
        Write-Host "📝 Please edit .env.local with your Supabase credentials" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  .env.example not found. Creating basic .env.local" -ForegroundColor Yellow
        
        $envContent = @"
# Local Environment Variables
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_ENV=development
"@
        
        Set-Content -Path ".env.local" -Value $envContent -Encoding UTF8
        Write-Host "✅ Basic environment file created" -ForegroundColor Green
        Write-Host "📝 Please edit .env.local with your actual credentials" -ForegroundColor Yellow
    }
}

# Test build
Write-Host "🧪 Testing build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix the errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Start development server
Write-Host "🌐 Starting development server..." -ForegroundColor Yellow
Write-Host "📱 Your app will be available at: http://localhost:5173" -ForegroundColor Green
Write-Host "🔄 Press Ctrl+C to stop the server" -ForegroundColor Yellow

npm run dev
