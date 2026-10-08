```md
# PXR 2.0 Database Practice

A prototype dossier review application with:

- PXR 2.0 wireframes — a clickable, static front-end prototype for reviewing proposals, managing priorities, viewing archives, and preparing weekly emails.
- Document API — a FastAPI service backed by PostgreSQL for uploading, listing, downloading, and deleting proposal documents.

> This repository contains prototype material. The wireframes use placeholder content and are not an official U.S. government website.

## Repository structure

```text
.
├── pxr-wireframes/       # Static HTML/CSS/JavaScript prototype
│   ├── index.html        # Wireframe landing page
│   ├── signin.html       # Sign-in screen
│   ├── this-week.html    # Weekly proposal review
│   ├── dossier.html      # Dossier review
│   ├── weekly-email.html # Weekly email preview
│   ├── archive.html      # Dossier archive
│   ├── priorities.html   # Priorities and sources administration
│   ├── weekly-run.html   # Weekly run configuration and history
│   └── assets/           # Shared styles and client-side behavior
└── server/
    ├── app.py            # FastAPI document service
    ├── schema.sql        # PostgreSQL schema
    └── README.md         # API-specific notes and examples
```

## Run the wireframes

The wireframes are static files and do not require a build step.

### Option 1: Open locally

Open `pxr-wireframes/index.html` in a browser and select a screen from the landing page.

### Option 2: Serve with a local HTTP server

Serving the files over HTTP is recommended for more consistent browser behavior:

```bash
cd pxr-wireframes
python -m http.server 8000
```

Then visit <http://localhost:8000>.

The prototype includes Blue, EU, American, Dark, and Grayscale themes. The selected theme is shared across screens using the URL and browser local storage.

## Run the document API

The API stores uploaded file contents in PostgreSQL using a `bytea` column.

### Requirements

- Python 3.10+
- PostgreSQL
- Python packages: `fastapi`, `uvicorn`, and `asyncpg`

Install the Python dependencies:

```bash
python -m pip install fastapi uvicorn asyncpg
```

Create a database, set the connection string, and start the service:

```bash
createdb pxr
cd server
DATABASE_URL=postgres://USER:PASS@localhost:5432/pxr python app.py
```

The schema is created automatically on startup. By default, the API listens on port `3000`.

Use a different port or upload limit when needed:

```bash
DATABASE_URL=postgres://USER:PASS@localhost:5432/pxr \
PORT=8000 \
MAX_UPLOAD_MB=50 \
python app.py
```

## API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/documents?filename=report.pdf&proposal_id=COM(2026)123` | Upload a file from the raw request body. |
| `GET` | `/api/documents` | List document metadata. |
| `GET` | `/api/documents?proposal_id=COM(2026)123` | Filter documents by proposal ID. |
| `GET` | `/api/documents/{id}` | Download a stored file. |
| `DELETE` | `/api/documents/{id}` | Delete a stored file. |

### Upload a document

```bash
curl -X POST \
  -H "Content-Type: application/pdf" \
  --data-binary @brief.pdf \
  "http://localhost:3000/api/documents?filename=brief.pdf&proposal_id=COM(2026)123"
```

### List documents

```bash
curl "http://localhost:3000/api/documents?proposal_id=COM(2026)123"
```

### Download a document

```bash
curl -o brief.pdf http://localhost:3000/api/documents/1
```

### Delete a document

```bash
curl -X DELETE http://localhost:3000/api/documents/1
```

## Storage considerations

- The default upload limit is **100 MB**. Configure it with `MAX_UPLOAD_MB`.
- Uploads and downloads are held in memory by the current implementation. Keep the limit appropriate for the server's available memory.
- PostgreSQL stores file contents in the `documents.data` `bytea` column.
- Do not select the `data` column when listing or searching documents; the API intentionally returns metadata only for list requests.
- Use `pg_dump` to back up the database and stored files.

## Development notes

The wireframes currently use placeholder proposal data in `pxr-wireframes/assets/app.js`; they are not connected to the document API. The backend is a separate prototype service intended to support document storage.

## License

No license has been specified for this repository.
```

If you want, I can also tailor it to a more polished project-style README with a stronger product introduction and screenshots.
