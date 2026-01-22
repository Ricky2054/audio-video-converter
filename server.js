const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const os = require('os');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
const PORT = 5000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
    dest: os.tmpdir(),
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB max file size
});

const ALLOWED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'bmp'];
const ALLOWED_AUDIO_EXTENSIONS = ['mp3', 'wav', 'm4a', 'aac', 'ogg'];

// Helper function to check allowed file extensions
function allowedFile(filename, allowedExtensions) {
    const ext = path.extname(filename).toLowerCase().slice(1);
    return allowedExtensions.includes(ext);
}

// Function to convert video
async function convertVideo(imagePath, audioPath, outputPath) {
    try {
        console.log('Starting conversion...');
        console.log(`Image: ${imagePath}`);
        console.log(`Audio: ${audioPath}`);
        console.log(`Output: ${outputPath}`);

        // Get audio duration
        const audioDuration = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(audioPath, (err, metadata) => {
                if (err) reject(err);
                else resolve(metadata.format.duration);
            });
        });
        console.log(`Audio duration: ${audioDuration} seconds`);

        // Load and process image
        console.log('Loading and resizing image...');
        const targetWidth = 1280;
        const targetHeight = 720;
        
        // Get image metadata
        const metadata = await sharp(imagePath).metadata();
        
        // Calculate scaling to fit within 1280x720 while maintaining aspect ratio
        const scale = Math.min(targetWidth / metadata.width, targetHeight / metadata.height);
        const newWidth = Math.floor(metadata.width * scale);
        const newHeight = Math.floor(metadata.height * scale);
        
        // Save processed image with black background
        const tempImagePath = path.join(os.tmpdir(), 'temp_resized.jpg');
        
        await sharp(imagePath)
            .resize(newWidth, newHeight, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 1 }
            })
            .extend({
                top: Math.floor((targetHeight - newHeight) / 2),
                bottom: Math.ceil((targetHeight - newHeight) / 2),
                left: Math.floor((targetWidth - newWidth) / 2),
                right: Math.ceil((targetWidth - newWidth) / 2),
                background: { r: 0, g: 0, b: 0, alpha: 1 }
            })
            .jpeg({ quality: 90 })
            .toFile(tempImagePath);
        
        console.log(`Temporary image saved: ${tempImagePath}`);

        // Create video using ffmpeg
        console.log('Creating video...');
        return new Promise((resolve, reject) => {
            ffmpeg()
                .input(tempImagePath)
                .inputOptions(['-loop 1'])
                .input(audioPath)
                .outputOptions([
                    '-c:v libx264',
                    '-tune stillimage',
                    '-c:a aac',
                    '-b:a 192k',
                    '-pix_fmt yuv420p',
                    '-preset ultrafast',
                    `-t ${audioDuration}`,
                    '-shortest'
                ])
                .output(outputPath)
                .on('start', (commandLine) => {
                    console.log('FFmpeg command:', commandLine);
                })
                .on('progress', (progress) => {
                    if (progress.percent) {
                        console.log(`Processing: ${Math.floor(progress.percent)}% done`);
                    }
                })
                .on('end', async () => {
                    console.log('Video creation successful!');
                    // Cleanup temp image
                    try {
                        await fs.unlink(tempImagePath);
                    } catch (err) {
                        console.log('Cleanup error:', err);
                    }
                    resolve(true);
                })
                .on('error', async (err) => {
                    console.error('FFmpeg error:', err);
                    // Cleanup temp image
                    try {
                        await fs.unlink(tempImagePath);
                    } catch (cleanupErr) {
                        console.log('Cleanup error:', cleanupErr);
                    }
                    reject(err);
                })
                .run();
        });
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]), async (req, res) => {
    try {
        // Check if files are present
        if (!req.files || !req.files.image || !req.files.audio) {
            return res.status(400).json({ error: 'Both image and audio files are required' });
        }

        const imageFile = req.files.image[0];
        const audioFile = req.files.audio[0];

        // Validate file types
        if (!allowedFile(imageFile.originalname, ALLOWED_IMAGE_EXTENSIONS)) {
            await cleanupFiles([imageFile.path, audioFile.path]);
            return res.status(400).json({ error: 'Invalid image format. Use PNG, JPG, JPEG, GIF, or BMP' });
        }

        if (!allowedFile(audioFile.originalname, ALLOWED_AUDIO_EXTENSIONS)) {
            await cleanupFiles([imageFile.path, audioFile.path]);
            return res.status(400).json({ error: 'Invalid audio format. Use MP3, WAV, M4A, AAC, or OGG' });
        }

        // Generate output path
        const outputFilename = `output_video_${Date.now()}.mp4`;
        const outputPath = path.join(os.tmpdir(), outputFilename);

        // Convert to video
        await convertVideo(imageFile.path, audioFile.path, outputPath);

        // Cleanup uploaded files
        await cleanupFiles([imageFile.path, audioFile.path]);

        // Store output path temporarily (in production, use a database or session)
        global.lastOutputPath = outputPath;

        res.json({
            success: true,
            message: 'Video created successfully!',
            download_url: `/download/${outputFilename}`
        });
    } catch (error) {
        console.error('Upload error:', error);
        
        // Cleanup files on error
        if (req.files) {
            const filesToClean = [];
            if (req.files.image) filesToClean.push(req.files.image[0].path);
            if (req.files.audio) filesToClean.push(req.files.audio[0].path);
            await cleanupFiles(filesToClean);
        }

        res.status(500).json({ error: 'Failed to create video. Check the console for details.' });
    }
});

app.get('/download/:filename', (req, res) => {
    const filePath = global.lastOutputPath || path.join(os.tmpdir(), req.params.filename);
    
    if (!fsSync.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, 'video-output.mp4', async (err) => {
        if (err) {
            console.error('Download error:', err);
        }
        // Cleanup the output file after download
        try {
            await fs.unlink(filePath);
        } catch (cleanupErr) {
            console.log('Cleanup error:', cleanupErr);
        }
    });
});

// Helper function to cleanup files
async function cleanupFiles(filePaths) {
    for (const filePath of filePaths) {
        try {
            if (fsSync.existsSync(filePath)) {
                await fs.unlink(filePath);
            }
        } catch (err) {
            console.log(`Warning: Could not delete ${filePath}:`, err);
        }
    }
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fsSync.existsSync(publicDir)) {
    fsSync.mkdirSync(publicDir);
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});
