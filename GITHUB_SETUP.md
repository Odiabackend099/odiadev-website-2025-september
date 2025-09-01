# 🚀 GitHub Repository Setup & Deployment Guide

## 📋 Prerequisites

Before setting up your GitHub repository, ensure you have:
- [Git](https://git-scm.com/) installed on your machine
- A [GitHub account](https://github.com/)
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## 🔧 Step 1: Create GitHub Repository

### Option A: Using GitHub Web Interface (Recommended)

1. **Go to GitHub**: Visit [github.com](https://github.com) and sign in
2. **Create New Repository**: Click the "+" icon in the top right corner → "New repository"
3. **Repository Settings**:
   - **Repository name**: `odiadev-frontend` (or your preferred name)
   - **Description**: `ODIADEV Frontend - AI Voice Technology for Nigerian Businesses`
   - **Visibility**: Choose Public or Private (Public recommended for open source)
   - **Initialize with**: 
     - ✅ Add a README file
     - ✅ Add .gitignore (Choose Node.js template)
     - ✅ Choose a license (MIT recommended)
4. **Click "Create repository"**

### Option B: Using GitHub CLI

```bash
# Install GitHub CLI first
npm install -g gh

# Login to GitHub
gh auth login

# Create repository
gh repo create odiadev-frontend --public --description "ODIADEV Frontend - AI Voice Technology for Nigerian Businesses" --add-remote
```

## 🔗 Step 2: Connect Local Repository to GitHub

After creating the GitHub repository, you'll see setup instructions. Use these commands:

```bash
# Add the remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/odiadev-frontend.git

# Set the main branch as upstream
git branch -M main

# Push your code to GitHub
git push -u origin main
```

## 🌐 Step 3: Set Up GitHub Pages (Optional)

If you want to deploy to GitHub Pages:

1. **Go to Repository Settings**: In your GitHub repository, click "Settings"
2. **Pages Section**: Scroll down to "Pages" in the left sidebar
3. **Source**: Choose "Deploy from a branch"
4. **Branch**: Select "main" and "/ (root)" folder
5. **Save**: Click "Save"

## 🔑 Step 4: Set Up Environment Variables

### For Local Development

1. **Copy environment template**:
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### For Production Deployment

Set these environment variables in your hosting platform:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_API_BASE_URL`: Your API base URL (if applicable)

## 🚀 Step 5: Deploy Your Application

### Option A: Vercel (Recommended for React apps)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Follow the prompts** to connect to your GitHub repository

### Option B: Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod --dir=dist
   ```

### Option C: GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install gh-pages --save-dev
   ```

2. **Update package.json** (already done by our script):
   ```json
   {
     "homepage": "https://YOUR_USERNAME.github.io/odiadev-frontend",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

### Option D: Manual Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to your web hosting service

## 🔄 Step 6: Set Up Continuous Deployment

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build project
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

### Required Secrets

In your GitHub repository settings → Secrets and variables → Actions, add:

- `VERCEL_TOKEN`: Your Vercel API token
- `ORG_ID`: Your Vercel organization ID
- `PROJECT_ID`: Your Vercel project ID
- `VITE_SUPABASE_URL`: Your Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 📱 Step 7: PWA Configuration

Your app is already PWA-ready! To customize:

1. **Update `index.html`** with your app details
2. **Customize `src/sw.js`** for service worker behavior
3. **Update icons** in the `public` folder
4. **Test PWA features** using Chrome DevTools → Application → Manifest

## 🔍 Step 8: Testing Your Deployment

1. **Check your deployed URL**
2. **Test all pages and functionality**
3. **Verify PWA installation**
4. **Test on mobile devices**
5. **Check performance** using Lighthouse

## 🛠️ Troubleshooting

### Common Issues

1. **Build fails**: Check for TypeScript errors, run `npm run build` locally
2. **Environment variables not working**: Ensure they're set in your hosting platform
3. **PWA not working**: Check service worker registration and manifest
4. **Routing issues**: Ensure your hosting platform supports SPA routing

### Getting Help

- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) file for detailed instructions
- Review [README.md](./README.md) for project setup
- Use the deployment script: `.\deploy.ps1 -Platform vercel`

## 🎉 Congratulations!

Your ODIADEV frontend is now:
- ✅ Version controlled with Git
- ✅ Hosted on GitHub
- ✅ Ready for deployment
- ✅ PWA optimized
- ✅ Supabase integrated
- ✅ Production ready

## 📚 Next Steps

1. **Customize your app** with your branding
2. **Set up your Supabase backend**
3. **Configure your domain** (if applicable)
4. **Set up monitoring and analytics**
5. **Implement CI/CD pipelines**

---

**Need help?** Check the project documentation or create an issue in your GitHub repository!
