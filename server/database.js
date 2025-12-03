import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

// Ensure the database file location exists
const dbPath = './studyhub.db';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeTables();
  }
});

function initializeTables() {
  db.serialize(() => {
    // PDFs Table
    db.run(`CREATE TABLE IF NOT EXISTS pdfs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      file_path TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`);

    // Notes Table
    db.run(`CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`);

    // Links Table
    db.run(`CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`);

    // YouTube Table
    db.run(`CREATE TABLE IF NOT EXISTS youtube (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      thumbnail TEXT,
      created_at TEXT NOT NULL
    )`);
  });
}

export default db;