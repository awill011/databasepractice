# PXR document storage (Postgres + bytea)

Files are stored in one table, `documents`, with the file bytes in a `bytea` column.

## Run it

```bash
createdb pxr                                   # or use an existing database
cd server
npm install
DATABASE_URL=postgres://USER:PASS@localhost:5432/pxr npm start
```

The table is created automatically on startup (`schema.sql`). The API listens on port 3000.

## API

| Method | Path | What it does |
|---|---|---|
| POST | `/api/documents?filename=report.docx&proposal_id=COM(2026)123` | Upload. The request body is the raw file. Returns the new row (no file bytes). |
| GET | `/api/documents` | List documents. Optional `?proposal_id=` filter. |
| GET | `/api/documents/:id` | Download the file. |
| DELETE | `/api/documents/:id` | Delete it. |

```bash
curl -X POST -H "Content-Type: application/pdf" --data-binary @brief.pdf \
  "http://localhost:3000/api/documents?filename=brief.pdf&proposal_id=COM(2026)123"
curl -o brief.pdf http://localhost:3000/api/documents/1
```

## Size limits

- Default upload limit is **100 MB**. Change it with `MAX_UPLOAD_MB`. Larger files get a 413.
- Postgres allows up to 1 GB in a single `bytea` value, but this version holds the whole file in memory
  on upload and download. Peak server memory is roughly **10x the file size** (measured: ~1 GB peak
  while handling a 90 MB file). Size the server for that, or keep the limit low.
- To go beyond ~100 MB, store each file as several 4 MB `bytea` rows and stream them.

## Good habits

- Never `SELECT *` from `documents` in a list or search query. Leave out `data`, or every file loads into memory.
- Back up with `pg_dump`. Files are in the database dump, so dumps grow with your documents.
