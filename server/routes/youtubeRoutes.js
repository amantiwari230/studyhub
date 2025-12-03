
import express from 'express';
import db from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM youtube ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { title, url } = req.body;
  const created_at = new Date().toISOString();
  
  // Extract video ID for thumbnail
  // Matches: v=ID or youtu.be/ID
  let videoId = null;
  if (url.includes('v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  }

  const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : 'https://picsum.photos/320/180';

  db.run('INSERT INTO youtube (title, url, thumbnail, created_at) VALUES (?, ?, ?, ?)', [title, url, thumbnail, created_at], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, title, url, thumbnail, created_at });
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM youtube WHERE id = ?', req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

export default router;
