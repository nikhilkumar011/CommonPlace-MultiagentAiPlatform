# Agent service

## PDF retrieval-augmented generation

The PDF agent extracts selectable text from an uploaded PDF, splits it into
overlapping page-level chunks, embeds the chunks with Gemini
`gemini-embedding-001`, and stores them in the configured Pinecone index. It
retrieves the most relevant chunks for each question and asks the configured
Gemini text model to answer with page citations.

Configure these variables in `backend/.env`:

- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- `PINECONE_HOST`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (used to generate the answer)

The service reads the index dimension from Pinecone and requests embeddings of
that size. The Pinecone index dimension must be supported by
`gemini-embedding-001`. PDF vectors are namespaced by authenticated user and
PDF content, so different users and documents remain isolated and repeat
questions do not re-index an unchanged document.

PDF ingestion currently supports selectable text, up to 1,000 pages and 2,000
chunks. Scanned/image-only PDFs need OCR before upload.

## Agent rate limits

Agent invocations are rate-limited per authenticated user in Redis, in
60-second windows, after routing and before the selected agent runs:

- Chat: 10 requests
- Coding: 5 requests
- Image generation: 1 request
- PDF: 1 request
- Search: 2 requests

When a limit is exceeded, the API responds with HTTP 429 and a `Retry-After`
header. Requests fail closed if Redis is unavailable.
