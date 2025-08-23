import express from 'express';
import db from '../db/db.js';
import dotenv from 'dotenv';
import verifyLimiter from '../middleware/verifyLimit.js';

const router = express.Router();

dotenv.config();

// Basic id validation (alphanumeric, 6 chars for nanoid)
function isValidId(id) {
  return /^[a-zA-Z0-9_-]{6}$/.test(id);
}

// GET metadata by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ success: false, error: 'Invalid file ID' });
  }

  db.get(`SELECT * FROM files WHERE id = ?`, [id], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    const now = new Date();
    const expiry = new Date(row.expires_at);

    if (now > expiry) {
      return res.status(410).json({ success: false, error: 'Link expired' });
    }

    res.json({
      success: true,
      id: row.id,
      fileName: row.original_name,
      expiresAt: row.expires_at,
    });
  });
});

// POST verify 4-digit code
router.post('/:id/verify', verifyLimiter, (req, res) => {
  const { id } = req.params;
  const { code } = req.body;

  if (!isValidId(id)) {
    return res.status(400).json({ success: false, error: 'Invalid file ID' });
  }

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, error: 'Verification code is required' });
  }

  db.get(`SELECT * FROM files WHERE id = ?`, [id], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    if (code.trim() === row.code) {
      return res.json({
        success: true,
        url: row.cloudinary_url,
        fileName: row.original_name,
        cloudinary_url: row.cloudinary_url,
      });
    } else {
      return res.status(403).json({ success: false, error: 'Invalid code' });
    }
  });
});

export default router;






// import express from 'express';
// import db from '../db/db.js';
// import dotenv from 'dotenv';
// import verifyLimiter from '../middleware/verifyLimit.js';
// const router = express.Router();

// dotenv.config();


// // GET metadata by ID
// router.get('/:id', (req, res) => {
//   const { id } = req.params;

//   db.get(`SELECT * FROM files WHERE id = ?`, [id], (err, row) => {
//     if (err || !row) {
//       return res.status(404).json({ error: 'File not found' });
//     }

//     const now = new Date();
//     const expiry = new Date(row.expires_at);

//     if (now > expiry) {
//       return res.status(410).json({ error: 'Link expired' });
//     }

//     res.json({
//       id: row.id,
//       fileName: row.original_name,
//       expiresAt: row.expires_at,
//     });
//   });
// });

// // POST verify 4-digit code
// router.post('/:id/verify',verifyLimiter, (req, res) => {
//   const { id } = req.params;
//   const { code } = req.body;

//   db.get(`SELECT * FROM files WHERE id = ?`, [id], (err, row) => {
//     if (err || !row) {
//       return res.status(404).json({ error: 'File not found' });
//     }

//     if (code === row.code) {
//       return res.json({
//         url: row.cloudinary_url,
//         fileName: row.original_name,
//         cloudinary_url: row.cloudinary_url,
//       });
//     } else {
//       return res.status(403).json({ error: 'Invalid code' });
//     }
//   });
// });

// export default router;
