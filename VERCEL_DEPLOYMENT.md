# Vercel Deployment Guide

## ⚠️ IMPORTANT LIMITATIONS

Vercel has significant limitations for this video processing app:

| Issue | Impact | Solution |
|-------|--------|----------|
| **10s timeout** (free) / 60s (Pro) | Video processing may timeout | Use **short audio files** (< 30s) or upgrade to Pro |
| **Serverless architecture** | No persistent file storage | Files stored in `/tmp` (cleared after execution) |
| **50MB deployment limit** | FFmpeg binaries are large | May fail to deploy |
| **Cold starts** | First request slow | Expect 5-10s initial delay |

### Recommended Alternatives
- **Render.com** - No timeouts, better for media processing
- **Railway.app** - Persistent containers, no serverless limits
- **Fly.io** - Great for long-running processes

## 🚀 Deploy to Vercel (If You Still Want To)

### Prerequisites
1. Vercel account (free tier may not work - **Pro recommended**)
2. GitHub repository with your code
3. Vercel CLI (optional)

### Method 1: Vercel Dashboard (Easiest)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Deploy to Vercel"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - **Framework Preset:** Other
   - **Build Command:** `npm install`
   - **Output Directory:** (leave empty)
   - Click "Deploy"

3. **Wait for deployment** (may take 5-10 minutes)

4. **Your app will be at:**
   ```
   https://your-app-name.vercel.app
   ```

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Choose your project settings
   - Confirm deployment

4. **For production deployment**
   ```bash
   vercel --prod
   ```

## ⚙️ Configuration

The `vercel.json` is already configured with:
- **maxDuration: 60** - Maximum execution time (requires Pro plan)
- **memory: 3008** - Maximum memory allocation
- **maxLambdaSize: 50mb** - Includes FFmpeg binaries

### Environment Variables (Optional)

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add these (optional):

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MAX_FILE_SIZE` | `50` (reduce for Vercel) |

## 🧪 Testing on Vercel

### Recommended Test Files:
- **Image:** Small PNG/JPG (< 2MB)
- **Audio:** Very short MP3 (< 30 seconds, < 5MB)

### Why Small Files?
Vercel's timeout limits mean:
- Free tier: ~10 second limit
- Pro tier: ~60 second limit
- Longer videos = timeout errors

### Testing Steps:
1. Open your Vercel URL
2. Upload a small image (< 2MB)
3. Upload a short audio clip (< 30s)
4. Click "Create Video"
5. **If it times out:** Files too large or need Pro plan

## 🐛 Common Vercel Issues

### Issue 1: "Function execution timed out"

**Cause:** Video processing took too long

**Solutions:**
- ✅ Use smaller/shorter files
- ✅ Upgrade to Vercel Pro ($20/month)
- ✅ Switch to Render/Railway (free, no limits)

### Issue 2: "Module not found: ffmpeg-static"

**Cause:** Deployment size exceeded limits

**Solutions:**
- Check deployment logs
- May need to exclude dev dependencies
- Consider alternative platforms

### Issue 3: "Cannot write to file system"

**Cause:** Serverless functions have limited `/tmp` access

**Solution:**
- Already handled in code (uses `os.tmpdir()`)
- Files automatically cleaned up

### Issue 4: "Network Error" in browser

**Cause:** CORS or routing issues

**Solutions:**
- ✅ Already fixed in server.js
- Check browser console (F12) for details
- Verify Vercel deployment logs

## 📊 Vercel vs Alternatives

| Feature | Vercel Free | Vercel Pro | Render Free | Railway |
|---------|-------------|------------|-------------|---------|
| **Timeout** | 10s | 60s | None | None |
| **Cost** | Free | $20/mo | Free | $5 credit |
| **Video Processing** | ❌ Poor | ⚠️ Limited | ✅ Excellent | ✅ Excellent |
| **FFmpeg Support** | ⚠️ Limited | ⚠️ Limited | ✅ Native | ✅ Native |
| **Recommendation** | ❌ No | ⚠️ Maybe | ✅ Yes | ✅ Yes |

## 🔄 If Vercel Doesn't Work

### Quick Migration to Render:

1. **Same GitHub repo works**
2. **Go to render.com**
3. **Create Web Service**
4. **Uses `render.yaml` already in your project**
5. **Deploy** - no timeout limits!

### Quick Migration to Railway:

1. **Go to railway.app**
2. **Deploy from GitHub**
3. **Auto-detects Node.js**
4. **Works immediately**

## ✅ Success Indicators

If Vercel works for you:
- ✅ Video processes in < 10s (free) or < 60s (Pro)
- ✅ Small file sizes (< 5MB combined)
- ✅ Download link appears
- ✅ Video plays correctly

If it doesn't work:
- ❌ Timeout errors
- ❌ "Function execution failed"
- ❌ Large files fail
- 👉 **Switch to Render or Railway**

## 💡 Final Recommendation

**For this video processing app, I strongly recommend:**
1. **First choice:** Render.com (free, unlimited processing time)
2. **Second choice:** Railway.app ($5 free credit)
3. **Last resort:** Vercel Pro ($20/month, still has limits)

Vercel is great for static sites and APIs, but not ideal for media processing.

---

**Ready to deploy?** Run:
```bash
vercel
```

**Having issues?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for Render/Railway instructions.
