# ODIADEV Frontend Deployment Script
# This script helps deploy the frontend to various platforms

param(
    [string]$Platform = "vercel",
    [string]$ProjectName = "odiadev-frontend",
    [string]$SupabaseUrl = "",
    [string]$SupabaseKey = ""
)

Write-Host "🚀 ODIADEV Frontend Deployment Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Build the project
Write-Host "📦 Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix the errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Create production environment file
if ($SupabaseUrl -and $SupabaseKey) {
    Write-Host "🔧 Creating production environment file..." -ForegroundColor Yellow
    
    $envContent = @"
# Production Environment Variables
VITE_SUPABASE_URL=$SupabaseUrl
VITE_SUPABASE_ANON_KEY=$SupabaseKey
VITE_API_BASE_URL=https://api.odiadev.com
VITE_APP_ENV=production
"@
    
    Set-Content -Path ".env.production" -Value $envContent -Encoding UTF8
    Write-Host "✅ Production environment file created" -ForegroundColor Green
}

# Platform-specific deployment
switch ($Platform.ToLower()) {
    "vercel" {
        Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
        
        # Check if Vercel CLI is installed
        try {
            $vercelVersion = vercel --version 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
                vercel --prod
            } else {
                Write-Host "❌ Vercel CLI not found. Please install it first:" -ForegroundColor Red
                Write-Host "npm install -g vercel" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "❌ Vercel CLI not found. Please install it first:" -ForegroundColor Red
            Write-Host "npm install -g vercel" -ForegroundColor Yellow
        }
    }
    
    "netlify" {
        Write-Host "🚀 Deploying to Netlify..." -ForegroundColor Yellow
        
        # Check if Netlify CLI is installed
        try {
            $netlifyVersion = netlify --version 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Netlify CLI found: $netlifyVersion" -ForegroundColor Green
                netlify deploy --prod --dir=dist
            } else {
                Write-Host "❌ Netlify CLI not found. Please install it first:" -ForegroundColor Red
                Write-Host "npm install -g netlify-cli" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "❌ Netlify CLI not found. Please install it first:" -ForegroundColor Red
            Write-Host "npm install -g netlify-cli" -ForegroundColor Yellow
        }
    }
    
    "github-pages" {
        Write-Host "🚀 Preparing for GitHub Pages deployment..." -ForegroundColor Yellow
        
        # Create GitHub Pages configuration
        $ghPagesConfig = @"
{
  "homepage": "https://yourusername.github.io/$ProjectName",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
"@
        
        # Update package.json
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        $packageJson.homepage = "https://yourusername.github.io/$ProjectName"
        
        if (-not $packageJson.scripts) {
            $packageJson.scripts = @{}
        }
        $packageJson.scripts.predeploy = "npm run build"
        $packageJson.scripts.deploy = "gh-pages -d dist"
        
        $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json" -Encoding UTF8
        
        Write-Host "✅ GitHub Pages configuration added to package.json" -ForegroundColor Green
        Write-Host "📝 Please update the homepage URL in package.json with your actual GitHub username" -ForegroundColor Yellow
        Write-Host "📝 Then run: npm install gh-pages --save-dev" -ForegroundColor Yellow
        Write-Host "📝 Finally run: npm run deploy" -ForegroundColor Yellow
    }
    
    "manual" {
        Write-Host "📁 Manual deployment prepared!" -ForegroundColor Green
        Write-Host "📂 Your built files are in the 'dist' directory" -ForegroundColor Yellow
        Write-Host "📝 You can upload these files to any web hosting service" -ForegroundColor Yellow
        Write-Host "📝 Remember to set up your environment variables on your hosting platform" -ForegroundColor Yellow
    }
    
    default {
        Write-Host "❌ Unknown platform: $Platform" -ForegroundColor Red
        Write-Host "Available platforms: vercel, netlify, github-pages, manual" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Deployment process completed!" -ForegroundColor Green
Write-Host "📚 Check DEPLOYMENT.md for detailed instructions" -ForegroundColor Yellow
