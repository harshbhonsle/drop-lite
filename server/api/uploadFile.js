import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import db from '../db/db.js';
import generateCode from '../utils/generateCode.js';
import archiver from 'archiver';
dotenv.config();

const router = express.Router();

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

router.post('/upload', uploadFiles, async (req, res) => {
  if (isNoFileUploaded(req)) {
    return res.status(400).json({
      success: false,
      error: 'No files uploaded. Please select at least one image or video.',
    });
  }

  try {
    const uploadedFiles = { images: [], video: null };
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const downloadLinks = [];

    if (req.files.images) {
      for (const file of req.files.images) {
        const fileId = nanoid(6);
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'drop-lite/images',
            resource_type: 'image',
          });
          uploadedFiles.images.push(result.secure_url);

          db.run(
            `INSERT INTO files (id, code, original_name, cloudinary_url, public_id, expires_at) VALUES (?, ?, ?, ?, ?, ?)`,
            [fileId, code, file.originalname, result.secure_url, result.public_id, expiresAt],
            (err) => {
              if (err) console.error('DB insert error (image):', err);
            }
          );

          downloadLinks.push(`${process.env.BASE_URL}/f/${fileId}`);
        } finally {
          fs.unlinkSync(file.path);
        }
      }
    }

    if (req.files.video && req.files.video[0]) {
      const videoFile = req.files.video[0];
      const fileId = nanoid(6);
      try {
        const result = await cloudinary.uploader.upload(videoFile.path, {
          folder: 'drop-lite/videos',
          resource_type: 'video',
        });
        uploadedFiles.video = result.secure_url;

        db.run(
          `INSERT INTO files (id, code, original_name, cloudinary_url, public_id, expires_at) VALUES (?, ?, ?, ?, ?, ?)`,
          [fileId, code, videoFile.originalname, result.secure_url, result.public_id, expiresAt],
          (err) => {
            if (err) console.error('DB insert error (video):', err);
          }
        );

        downloadLinks.push(`${process.env.BASE_URL}/f/${fileId}`);
      } finally {
        fs.unlinkSync(videoFile.path);
      }
    }

    res.json({
      success: true,
      code,
      uploadedFiles,
      downloadLinks,
    });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({
      success: false,
      error: 'Upload failed. Please try again.',
    });
  }
});

export default router;








// import multer from "multer"
// import { v2 as cloudinary } from 'cloudinary'
// import dotenv from "dotenv"
// import express from "express"
// import fs from 'fs'
// import path from 'path';
// dotenv.config()

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // Ensure temp storage directory exists
// const tempDir = path.join('uploads', 'tempStorage');
// if (!fs.existsSync(tempDir)) {
//   fs.mkdirSync(tempDir, { recursive: true });
// }

// // multer storage (store file temporarily)
// const storage = multer.diskStorage({
//     destination:(req,file,cb)=> cb(null,tempDir),
//     filename:(req,file,cb)=> cb(null,Date.now()+'-' + file.originalname)
// });
// // const upload = multer({storage});

// const router = express.Router();

// // multer instance with 100 MB file size limit no filtering
//   const upload = multer({
//             storage,
//             limits: {fileSize: 100*1024*1024},
            
//         })
//     const uploadFiles = upload.fields([
//         {name:'images', maxCount:10},
//         {name:'video', maxCount:1}
//     ])

// router.post('/upload', uploadFiles, async (req, res) => {
//   if (
//   !req.files ||
//   ( !req.files.images && !req.files.video ) ||
//   ( (!req.files.images || req.files.images.length === 0) &&
//     (!req.files.video || req.files.video.length === 0) )
// ) {
//   return res.status(400).json({
//     success: false,
//     error: "No files uploaded. Please select at least one image or video.",
//   });
// }
//     // console.log("Received files:", req.files);
//   try {
//     const uploadedFiles = { images: [], video: null };

//     if (req.files.images) {
//       for (const file of req.files.images) {
//         const result = await cloudinary.uploader.upload(file.path, {
//           folder: 'drop-lite/images',
//           resource_type: 'image'
//         });
//         uploadedFiles.images.push(result.secure_url);
//         fs.unlinkSync(file.path);
//       }
//     }

//     if (req.files.video && req.files.video[0]) {
//       const videoFile = req.files.video[0];
//       const result = await cloudinary.uploader.upload(videoFile.path, {
//         folder: 'drop-lite/videos',
//         resource_type: 'video'
//       });
//       uploadedFiles.video = result.secure_url;
//       fs.unlinkSync(videoFile.path);
//     }

//     res.json({
//       success: true,
//       uploadedFiles
//     });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       success: false,
//       error: err.message || 'Upload failed',
//     });
//   }
// });


// export default router;