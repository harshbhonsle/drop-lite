import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import db from '../db/db.js';
import generateCode from '../utils/generateCode.js';
import uploadLimit from '../middleware/uploadLimit.js';
import fsp from 'fs/promises';

dotenv.config();

const requiredEnv = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'BASE_URL',
];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Ensure temp storage exists
const tempDir = path.join('uploads', 'tempStorage');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});
const uploadFiles = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
]);

function isNoFileUploaded(req) {
  return (
    !req.files ||
    (!req.files.images && !req.files.video) ||
    ((!req.files.images || req.files.images.length === 0) &&
      (!req.files.video || req.files.video.length === 0))
  );
}

// Helper to wrap DB insert in a Promise for async/await usage
function insertFileRecord(fileId, code, originalName, url, publicId, expiresAt) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO files (id, code, original_name, cloudinary_url, public_id, expires_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [fileId, code, originalName, url, publicId, expiresAt],
      (err) => (err ? reject(err) : resolve())
    );
  });
}

const router = express.Router();

router.post('/upload', uploadLimit, uploadFiles, async (req, res) => {
  if (isNoFileUploaded(req)) {
    return res.status(400).json({
      success: false,
      error: 'No files uploaded. Please select at least one image or video.',
    });
  }

  try {
    const uploadedFiles = { images: [], video: null };
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days expiry
    const downloadLinks = [];

    // Upload images
    if (req.files.images) {
      for (const file of req.files.images) {
        const fileId = nanoid(6);
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'drop-lite/images',
            resource_type: 'image',
          });

          try {
            await insertFileRecord(
              fileId,
              code,
              file.originalname,
              result.secure_url,
              result.public_id,
              expiresAt
            );
          } catch (dbErr) {
            console.error('DB insert error (image):', dbErr);
            // Cleanup Cloudinary upload on failure
            await cloudinary.uploader.destroy(result.public_id, { resource_type: 'image' });
            throw new Error('Failed to save file metadata');
          }

          uploadedFiles.images.push(result.secure_url);
          downloadLinks.push(`${process.env.BASE_URL}/f/${fileId}`);
        } finally {
          await fsp.unlink(file.path);
        }
      }
    }

    // Upload video
    if (req.files.video && req.files.video[0]) {
      const videoFile = req.files.video[0];
      const fileId = nanoid(6);
      try {
        const result = await cloudinary.uploader.upload(videoFile.path, {
          folder: 'drop-lite/videos',
          resource_type: 'video',
        });

        try {
          await insertFileRecord(
            fileId,
            code,
            videoFile.originalname,
            result.secure_url,
            result.public_id,
            expiresAt
          );
        } catch (dbErr) {
          console.error('DB insert error (video):', dbErr);
          // Cleanup Cloudinary upload on failure
          await cloudinary.uploader.destroy(result.public_id, { resource_type: 'video' });
          throw new Error('Failed to save video metadata');
        }

        uploadedFiles.video = result.secure_url;
        downloadLinks.push(`${process.env.BASE_URL}/f/${fileId}`);
      } finally {
        await fsp.unlink(videoFile.path);
      }
    }

    return res.json({
      success: true,
      code,
      uploadedFiles,
      downloadLinks,
    });
  } catch (err) {
    console.error('Upload failed:', err);
    return res.status(500).json({
      success: false,
      error: 'Upload failed. Please try again.',
    });
  }
});

export default router;
