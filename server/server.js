const fs = require('fs');
const path = require('path');
const express = require('express');
const { Pool, types } = require('pg');

types.setTypeParser(20, Number);   // bigint comes back as a number, not a string

const pool = new Pool({ connectionString: process.env.DATABASE_URL });   // e.g. postgres://user:pass@localhost:5432/pxr
const MAX_MB = Number(process.env.MAX_UPLOAD_MB || 100);
const app = express();
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);   // Express 4 doesn't catch async errors itself

// The request body arrives as a Buffer in req.body (the file's raw bytes).
app.use('/api/documents', express.raw({ type: () => true, limit: MAX_MB + 'mb' }));

// Upload: POST /api/documents?filename=report.docx&proposal_id=COM(2026)123  (body = file bytes)
app.post('/api/documents', wrap(async (req, res) => {
  if (!req.query.filename || !req.body.length) return res.status(400).json({ error: 'filename and a file body are required' });
  const { rows } = await pool.query(
    `INSERT INTO documents (proposal_id, filename, content_type, size_bytes, data)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, proposal_id, filename, content_type, size_bytes, created_at`,
    [req.query.proposal_id || null, path.basename(req.query.filename), req.get('content-type') || 'application/octet-stream', req.body.length, req.body]
  );
  res.status(201).json(rows[0]);
}));

// List: never select "data" here, or you pull every file into memory.
app.get('/api/documents', wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, proposal_id, filename, content_type, size_bytes, created_at
     FROM documents WHERE ($1::text IS NULL OR proposal_id = $1) ORDER BY created_at DESC`,
    [req.query.proposal_id || null]
  );
  res.json(rows);
}));

// Download
app.get('/api/documents/:id(\\d+)', wrap(async (req, res) => {
  const { rows } = await pool.query('SELECT filename, content_type, data FROM documents WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.set({
    'Content-Type': rows[0].content_type,
    'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(rows[0].filename)}`,
    'X-Content-Type-Options': 'nosniff'
  });
  res.send(rows[0].data);
}));

// Delete
app.delete('/api/documents/:id(\\d+)', wrap(async (req, res) => {
  const r = await pool.query('DELETE FROM documents WHERE id = $1', [req.params.id]);
  res.sendStatus(r.rowCount ? 204 : 404);
}));

app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ error: `File is over ${MAX_MB} MB` });
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// Create the table on startup if it isn't there, then listen.
pool.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'))
  .then(() => app.listen(process.env.PORT || 3000, () => console.log('Document API on http://localhost:' + (process.env.PORT || 3000))))
  .catch((e) => { console.error('Could not reach Postgres:', e.message); process.exit(1); });
