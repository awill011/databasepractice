CREATE TABLE IF NOT EXISTS documents (
  id           bigserial PRIMARY KEY,
  proposal_id  text,                                   -- e.g. 'COM(2026) 123'
  filename     text NOT NULL,
  content_type text NOT NULL DEFAULT 'application/octet-stream',
  size_bytes   bigint NOT NULL,
  data         bytea NOT NULL,                         -- the file itself
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Large values are stored out-of-line automatically (TOAST). Word and PDF files
-- are already compressed, so skip Postgres's compression attempt.
ALTER TABLE documents ALTER COLUMN data SET STORAGE EXTERNAL;
