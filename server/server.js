import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from './database.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Static folder for uploaded PDFs
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
// Serve files at http://localhost:5000/uploads/filename.pdf
app.use('/uploads', express.static(uploadDir));

// Multer Setup for PDF Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // IMPORTANT: Use the absolute path variable 'uploadDir' defined above
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDFs are allowed'));
  }
});

// --- ROUTES ---

// 1. NOTES
app.get('/notes', (req, res) => {
  db.all('SELECT * FROM notes ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/notes', (req, res) => {
  const { title, content } = req.body;
  const created_at = new Date().toISOString();
  db.run('INSERT INTO notes (title, content, created_at) VALUES (?, ?, ?)', [title, content, created_at], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, title, content, created_at });
  });
});

app.delete('/notes/:id', (req, res) => {
  db.run('DELETE FROM notes WHERE id = ?', req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

// 2. LINKS
app.get('/links', (req, res) => {
  db.all('SELECT * FROM links ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/links', (req, res) => {
  const { title, url } = req.body;
  const created_at = new Date().toISOString();
  db.run('INSERT INTO links (title, url, created_at) VALUES (?, ?, ?)', [title, url, created_at], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, title, url, created_at });
  });
});

app.delete('/links/:id', (req, res) => {
  db.run('DELETE FROM links WHERE id = ?', req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

// 3. YOUTUBE
app.get('/youtube', (req, res) => {
  db.all('SELECT * FROM youtube ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/youtube', (req, res) => {
  const { title, url } = req.body;
  const created_at = new Date().toISOString();
  // Extract video ID for thumbnail
  const videoId = url.split('v=')[1]?.split('&')[0];
  const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null;

  db.run('INSERT INTO youtube (title, url, thumbnail, created_at) VALUES (?, ?, ?, ?)', [title, url, thumbnail, created_at], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, title, url, thumbnail, created_at });
  });
});

app.delete('/youtube/:id', (req, res) => {
  db.run('DELETE FROM youtube WHERE id = ?', req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

// 4. PDFS
app.get('/pdf/all', (req, res) => {
  db.all('SELECT * FROM pdfs ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/pdf/upload', upload.single('pdf'), (req, res) => {
  const { title } = req.body;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  const file_path = `uploads/${req.file.filename}`;
  const created_at = new Date().toISOString();

  db.run('INSERT INTO pdfs (title, file_path, created_at) VALUES (?, ?, ?)', [title, file_path, created_at], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, title, file_path, created_at });
  });
});

app.get('/pdf/download/:id', (req, res) => {
  db.get('SELECT file_path, title FROM pdfs WHERE id = ?', req.params.id, (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'PDF not found' });
    
    // Construct the absolute path
    const filePath = path.join(__dirname, row.file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found on server storage.");
    }

    // Sanitize filename for download
    const safeTitle = row.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const extension = path.extname(row.file_path);
    const downloadName = `${safeTitle}${extension}`;

    res.download(filePath, downloadName);
  });
});

app.delete('/pdf/:id', (req, res) => {
  // First get file path to delete from disk
  db.get('SELECT file_path FROM pdfs WHERE id = ?', req.params.id, (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'PDF not found' });
    
    const filePath = path.join(__dirname, row.file_path);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error("Error deleting file:", e);
      }
    }

    db.run('DELETE FROM pdfs WHERE id = ?', req.params.id, function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Deleted' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});