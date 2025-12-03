
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mime from 'mime-types';
import db from '../database.js';

const router = express.Router();

// Path Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique safe filename: timestamp + random + extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDFs are allowed'));
  }
});

// Helper to get Base URL
const getBaseUrl = (req) => {
  return process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
};

// --- ROUTES ---

// GET All PDFs
router.get('/all', (req, res) => {
  db.all('SELECT * FROM pdfs ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const baseUrl = getBaseUrl(req);
    const pdfs = rows.map(row => ({
      ...row,
      fileUrl: `${baseUrl}/uploads/${row.stored_name}`,
      downloadUrl: `${baseUrl}/api/pdf/download/${row.id}`
    }));
    
    res.json(pdfs);
  });
});

// POST Upload PDF
router.post('/upload', upload.single('pdf'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { title } = req.body;
  const original_name = req.file.originalname;
  const stored_name = req.file.filename;
  const file_path = `uploads/${stored_name}`; // Relative path for DB
  const created_at = new Date().toISOString();

  db.run(
    'INSERT INTO pdfs (title, original_name, stored_name, file_path, created_at) VALUES (?, ?, ?, ?, ?)', 
    [title, original_name, stored_name, file_path, created_at], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      const baseUrl = getBaseUrl(req);
      res.json({ 
        id: this.lastID, 
        title, 
        original_name,
        stored_name,
        created_at,
        fileUrl: `${baseUrl}/uploads/${stored_name}`,
        downloadUrl: `${baseUrl}/api/pdf/download/${this.lastID}`
      });
    }
  );
});

// GET Download/View PDF (Streaming)
router.get('/download/:id', (req, res) => {
  db.get('SELECT * FROM pdfs WHERE id = ?', req.params.id, (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'PDF not found' });

    const absolutePath = path.join(uploadDir, row.stored_name);
    
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).send('File not found on server disk.');
    }

    // Determine content type
    const mimeType = mime.lookup(row.stored_name) || 'application/pdf';
    
    // Check if inline view is requested
    const disposition = req.query.inline === 'true' ? 'inline' : 'attachment';
    
    // Encode filename for headers to handle special characters
    const filename = encodeURIComponent(row.original_name);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);

    // Stream the file
    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);
  });
});

// DELETE PDF
router.delete('/:id', (req, res) => {
  db.get('SELECT stored_name FROM pdfs WHERE id = ?', req.params.id, (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'PDF not found' });

    // Delete file from disk
    const absolutePath = path.join(uploadDir, row.stored_name);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (e) {
        console.error("Error deleting file from disk:", e);
      }
    }

    // Delete from DB
    db.run('DELETE FROM pdfs WHERE id = ?', req.params.id, function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Deleted successfully' });
    });
  });
});

export default router;
