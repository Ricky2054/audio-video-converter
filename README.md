# Video Creator

Convert image and audio files into a single MP4 video using a web interface.

## Description

This is a Node.js web application that allows you to upload an image and an audio file to create a video. The image will be displayed for the duration of the audio, creating a simple video file that can be used for various purposes like YouTube uploads.

## Features

- Web-based interface for easy file uploads
- Supports multiple image formats (PNG, JPG, JPEG, GIF, BMP)
- Supports multiple audio formats (MP3, WAV, M4A, AAC, OGG)
- Automatic image resizing to 1280x720 (maintains aspect ratio with black borders)
- Download generated video directly from the browser
- File size limit: 100MB

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