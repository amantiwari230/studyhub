
import express from 'express';
import db from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM notes ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { title, content } = req.body;
  const created_at = new Date().toISOString();
  db.run('INSERT INTO notes (title, content, created_at) VALUES (?, ?, ?)', [title, content, created_at], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, title, content, created_at });
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM notes WHERE id = ?', req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

export default router;
