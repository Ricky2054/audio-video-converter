# Production Deployment Guide

## Changes Made to Fix Production Issues

### 1. **Dynamic Port Configuration**
- Changed from hardcoded `PORT = 5000` to `process.env.PORT || 5000`
- Production platforms (Heroku, Render, Railway) assign dynamic ports
- The app now reads the PORT from environment variables

### 2. **Network Binding**
- Changed from `app.listen(PORT)` to `app.listen(PORT, '0.0.0.0')`
- Binds to all network interfaces, not just localhost
- Essential for cloud platforms to route traffic correctly

### 3. **CORS Headers**
- Added Cross-Origin Resource Sharing headers
- Allows frontend to communicate with backend in production
- Prevents "Network Error" issues when API calls are made

### 4. **Configuration Files Added**

#### `.env.example`
- Template for environment variables
- Copy to `.env` for local development

#### `Procfile` (for Heroku)
```
web: node server.js
```

#### `render.yaml` (for Render)
```yaml
services:
  - type: web
    name: video-creator
    env: node
    buildCommand: npm install
    startCommand: npm start
```

#### `vercel.json` (for Vercel - if needed)
Note: Vercel has limitations with ffmpeg; consider Render or Railway instead

### 5. **Package.json Updates**
- Added `engines` field specifying Node.js version requirements
- Ensures consistent runtime across environments

## Deployment Steps

### Option 1: Render (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Add production configuration"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render auto-detects Node.js and uses `render.yaml`
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

3. **Your app will be live at:**
   ```
   https://your-app-name.onrender.com
   ```

### Option 2: Railway

1. **Install Railway CLI** (optional)
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**
   - Go to [railway.app](https://railway.app)
   - Click "Start New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects and deploys
   - Your app will be live in minutes

### Option 3: Heroku

1. **Install Heroku CLI**
   Download from [heroku.com/cli](https://devcenter.heroku.com/articles/heroku-cli)

2. **Deploy**
   ```bash
   heroku login
   heroku create your-app-name
   git push heroku main
   heroku open
   ```

### Option 4: Fly.io

1. **Install Fly CLI**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Deploy**
   ```bash
   fly launch
   fly deploy
   ```

## Environment Variables

Most platforms auto-set these, but verify:

| Variable | Value | Required |
|----------|-------|----------|
| `PORT` | Auto-assigned by platform | Yes (auto) |
| `NODE_ENV` | `production` | Recommended |
| `MAX_FILE_SIZE` | `100` (MB) | Optional |

## Testing Production Deployment

1. **Open your production URL**
2. **Upload test files:**
   - A small image (< 5MB)
   - A short audio file (< 10MB)
3. **Check browser console for errors:**
   - Press F12
   - Go to "Console" tab
   - Look for network errors
4. **Monitor platform logs:**
   - Render: Dashboard → Logs
   - Railway: Project → Deployments → Logs
   - Heroku: `heroku logs --tail`

## Common Production Issues

### Issue: "Network Error" in browser

**Causes:**
- PORT not set correctly
- Server not binding to `0.0.0.0`
- CORS headers missing
- Firewall blocking requests

**Solutions:**
✅ Already fixed in the code updates above

### Issue: "Module not found" errors

**Cause:** Dependencies not installed

**Solution:**
```bash
npm install
# Commit package-lock.json
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

### Issue: Video processing timeout

**Cause:** Platform has execution time limits

**Solutions:**
- Use smaller test files
- Upgrade to paid tier (removes time limits)
- Consider background job processing

### Issue: FFmpeg not found

**Cause:** Platform missing ffmpeg binaries

**Solution:**
- ✅ `ffmpeg-static` package includes binaries
- Render/Railway: Works out of the box
- Heroku: May need buildpack:
  ```bash
  heroku buildpacks:add https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest
  ```

## Platform Recommendations

| Platform | FFmpeg Support | Free Tier | Best For |
|----------|---------------|-----------|----------|
| **Render** | ✅ Excellent | 750 hrs/month | Recommended |
| **Railway** | ✅ Excellent | $5 credit/month | Great option |
| **Fly.io** | ✅ Good | Limited | Good choice |
| **Heroku** | ⚠️ Needs buildpack | 550 hrs/month | Okay |
| **Vercel** | ❌ Limitations | Yes | Not recommended |

## Next Steps

1. ✅ Code is now production-ready
2. Choose a deployment platform
3. Push code to GitHub
4. Deploy using steps above
5. Test with real files
6. Share your live URL!

## Support

If you encounter issues:
1. Check platform logs
2. Verify environment variables
3. Test locally first: `npm start`
4. Ensure all dependencies are in `package.json`
