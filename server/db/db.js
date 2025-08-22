import sqlite3 from 'sqlite3';
sqlite3.verbose();

const db = new sqlite3.Database('./files.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      original_name TEXT,
      cloudinary_url TEXT,
      public_id TEXT,
      expires_at TEXT
    )
  `);
});

export default db;
