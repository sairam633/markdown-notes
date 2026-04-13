const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT,
      pinned INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

app.get("/notes", (req, res) => {
  db.all(
    `SELECT * FROM notes ORDER BY pinned DESC, updatedAt DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    },
  );
});

app.get("/notes/search/:term", (req, res) => {
  const q = `%${req.params.term}%`;

  db.all(
    `SELECT * FROM notes
     WHERE title LIKE ? OR content LIKE ?
     ORDER BY updatedAt DESC`,
    [q, q],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    },
  );
});

app.post("/notes", (req, res) => {
  const { title, content, tags } = req.body;

  db.run(
    `INSERT INTO notes(title, content, tags) VALUES (?, ?, ?)`,
    [title, content, tags],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    },
  );
});

app.put("/notes/:id", (req, res) => {
  const { title, content, tags, pinned } = req.body;

  db.run(
    `UPDATE notes
     SET title=?, content=?, tags=?, pinned=?, updatedAt=CURRENT_TIMESTAMP
     WHERE id=?`,
    [title, content, tags, pinned, req.params.id],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ updated: true });
    },
  );
});

app.delete("/notes/:id", (req, res) => {
  db.run(`DELETE FROM notes WHERE id=?`, [req.params.id], function (err) {
    if (err) return res.status(500).json(err);
    res.json({ deleted: true });
  });
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
