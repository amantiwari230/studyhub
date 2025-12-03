
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import Routes
import pdfRoutes from './routes/pdfRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import linkRoutes from './routes/linkRoutes.js';
import youtubeRoutes from './routes/youtubeRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow all origins for simplicity in this demo, configure for prod
app.use(express.json());

// 1. Static File Serving (Critical for "View PDF")
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// 2. API Routes
app.use('/api/pdf', pdfRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/youtube', youtubeRoutes);

// 3. Root/Health Check
app.get('/', (req, res) => {
  res.send('StudyHub API is running.');
});

// 4. Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads directory: ${uploadDir}`);
  console.log(`Base URL: ${process.env.BASE_URL || 'http://localhost:' + PORT}`);
});
