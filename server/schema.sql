

-- Large values are stored out-of-line automatically (TOAST). Word and PDF files
-- are already compressed, so skip Postgres's compression attempt.

CREATE TABLE IF NOT EXISTS documents (
  id           BIGSERIAL PRIMARY KEY,
  proposal_id  TEXT,
  filename     TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes   BIGINT NOT NULL,
  data         BYTEA NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS documents_proposal_id_idx ON documents (proposal_id);