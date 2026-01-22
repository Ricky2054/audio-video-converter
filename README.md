# Video Creator

Convert image and audio files into YouTube Shorts ready videos (1080x1920 vertical format).

## Description

This is a Node.js web application that allows you to upload an image and an audio file to create a video optimized for YouTube Shorts. The image will be displayed in vertical format (9:16 aspect ratio) for the duration of the audio.

## Features

- Web-based interface for easy file uploads
- **YouTube Shorts optimized** - 1080x1920 vertical format (9:16 aspect ratio)
- Supports multiple image formats (PNG, JPG, JPEG, GIF, BMP)
- Supports multiple audio formats (MP3, WAV, M4A, AAC, OGG)
- Automatic image resizing with black borders to maintain aspect ratio
- High-quality video encoding (5000k bitrate)
- Download generated video directly from the browser
- File size limit: 100MB
- Perfect for YouTube Shorts, Instagram Reels, TikTok

## Installation

1. Make sure you have Node.js installed (version 14 or higher)

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:5000
```
(In production, use your deployed URL)

3. Upload an image and audio file

4. Click "Create Video" and wait for processing

5. Download the generated video

## Technical Details

- Backend: Node.js with Express
- Video Processing: FFmpeg (via fluent-ffmpeg and ffmpeg-static)
- Image Processing: Sharp (optimized for serverless environments)
- File Uploads: Multer

## Requirements

- Node.js 14+
- NPM or Yarn package manager 

## Production Deployment

### Environment Variables

Set `PORT` environment variable (most platforms do this automatically)
Set `NODE_ENV=production` for optimized production mode

### Deploy to Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Render will auto-detect settings from `render.yaml`

### Deploy to Heroku

1. Install Heroku CLI
2. Run: `heroku create your-app-name`
3. Run: `git push heroku main`
4. Heroku will use the `Procfile` automatically

### Deploy to Railway/Fly.io

1. These platforms auto-detect Node.js apps
2. They use `npm start` by default
3. PORT is automatically configured

## Troubleshooting

**Network Error in Production:**
- Ensure PORT environment variable is set correctly
- Check that the server binds to `0.0.0.0` (not just localhost)
- Verify CORS headers are configured
- Check platform logs for errors 