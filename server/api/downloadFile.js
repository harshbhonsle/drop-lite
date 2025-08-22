import express from 'express';
import db from '../db/db.js';
import dotenv from 'dotenv';
const router = express.Router();

const app = express();

dotenv.config();
app.use(express.json())

// GET metadata by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM files WHERE id = ?`, [id], (err, row) => {
    if (err || !row) {
      return res.status(400).json({ error: 'File not found' });
    }

    const now = new Date();
    const expiry = new Date(row.expires_at);

    if (now > expiry) {
      return res.status(410).json({ error: 'Link expired' });
    }

    res.json({
      id: row.id,
      fileName: row.original_name,
      expiresAt: row.expires_at,
    });
  });
});

// POST verify 4-digit code
router.post('/:id/verify', (req, res) => {
  const { id } = req.params;
  const { code } = req.body;

  db.get(`SELECT * FROM files WHERE id = ?`, [id], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (code === row.code) {
      return res.json({
        url: row.cloudinary_url,
        fileName: row.original_name,
        cloudinary_url: row.cloudinary_url,
      });
    } else {
      return res.status(403).json({ error: 'Invalid code' });
    }
  });
});

export default router;
