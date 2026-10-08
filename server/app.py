import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional
from urllib.parse import quote

import asyncpg
import uvicorn
from fastapi import FastAPI, Query, Request, Response
from fastapi.responses import JSONResponse

# asyncpg returns bigint as a Python int, so no type-parser tweak is needed.
DATABASE_URL = os.environ["DATABASE_URL"]  # e.g. postgres://user:pass@localhost:5432/pxr
MAX_MB = int(os.environ.get("MAX_UPLOAD_MB", 100))
MAX_BYTES = MAX_MB * 1024 * 1024
PORT = int(os.environ.get("PORT", 3000))


class ApiError(Exception):
    def __init__(self, status: int, message: str):
        self.status = status
        self.message = message


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create the table on startup if it isn't there.
    try:
        app.state.pool = await asyncpg.create_pool(DATABASE_URL)
        schema = (Path(__file__).parent / "schema.sql").read_text(encoding="utf-8")
        async with app.state.pool.acquire() as conn:
            await conn.execute(schema)
    except Exception as e:
        print(f"Could not reach Postgres: {e}", file=sys.stderr)
        sys.exit(1)
    print(f"Document API on http://localhost:{PORT}")
    yield
    await app.state.pool.close()


app = FastAPI(lifespan=lifespan)


@app.exception_handler(ApiError)
async def api_error_handler(request: Request, exc: ApiError):
    return JSONResponse({"error": exc.message}, status_code=exc.status)


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, exc: Exception):
    print(f"Unhandled error: {exc!r}", file=sys.stderr)
    return JSONResponse({"error": "Server error"}, status_code=500)


async def read_body(request: Request) -> bytes:
    """Read the raw request body (the file's bytes), enforcing the size limit."""
    declared = request.headers.get("content-length")
    if declared and declared.isdigit() and int(declared) > MAX_BYTES:
        raise ApiError(413, f"File is over {MAX_MB} MB")
    chunks, size = [], 0
    async for chunk in request.stream():
        size += len(chunk)
        if size > MAX_BYTES:
            raise ApiError(413, f"File is over {MAX_MB} MB")
        chunks.append(chunk)
    return b"".join(chunks)


# Upload: POST /api/documents?filename=report.docx&proposal_id=COM(2026)123  (body = file bytes)
@app.post("/api/documents", status_code=201)
async def upload(
    request: Request,
    filename: Optional[str] = Query(None),
    proposal_id: Optional[str] = Query(None),
):
    body = await read_body(request)
    if not filename or not body:
        raise ApiError(400, "filename and a file body are required")
    row = await request.app.state.pool.fetchrow(
        """INSERT INTO documents (proposal_id, filename, content_type, size_bytes, data)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, proposal_id, filename, content_type, size_bytes, created_at""",
        proposal_id or None,
        os.path.basename(filename),
        request.headers.get("content-type") or "application/octet-stream",
        len(body),
        body,
    )
    return dict(row)


# List: never select "data" here, or you pull every file into memory.
@app.get("/api/documents")
async def list_documents(request: Request, proposal_id: Optional[str] = Query(None)):
    rows = await request.app.state.pool.fetch(
        """SELECT id, proposal_id, filename, content_type, size_bytes, created_at
           FROM documents WHERE ($1::text IS NULL OR proposal_id = $1)
           ORDER BY created_at DESC""",
        proposal_id or None,
    )
    return [dict(r) for r in rows]


# Download
@app.get("/api/documents/{doc_id}")
async def download(request: Request, doc_id: int):
    row = await request.app.state.pool.fetchrow(
        "SELECT filename, content_type, data FROM documents WHERE id = $1", doc_id
    )
    if row is None:
        raise ApiError(404, "Not found")
    return Response(
        content=bytes(row["data"]),
        headers={
            "Content-Type": row["content_type"],
            "Content-Disposition": f"attachment; filename*=UTF-8''{quote(row['filename'], safe='')}",
            "X-Content-Type-Options": "nosniff",
        },
    )


# Delete
@app.delete("/api/documents/{doc_id}")
async def delete(request: Request, doc_id: int):
    result = await request.app.state.pool.execute("DELETE FROM documents WHERE id = $1", doc_id)
    if result == "DELETE 0":
        raise ApiError(404, "Not found")
    return Response(status_code=204)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)