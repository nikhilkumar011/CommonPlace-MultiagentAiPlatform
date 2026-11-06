# Commonplace

Commonplace is a dark, multi-agent workspace for conversations, coding help,
web research, PDF question answering, and image generation. It consists of a
Next.js frontend and a set of Node.js/TypeScript services.

## Features

- Account registration and login with password hashing, JWT cookies, and
  Redis-backed sessions.
- Conversation and message persistence in MongoDB.
- Agent routing for general chat, coding, image generation, PDF questions, and
  web search.
- Gemini-powered chat, coding assistance, PDF embeddings, and answer
  synthesis.
- Tavily web search with source links.
- PDF retrieval-augmented generation (RAG) using Gemini embeddings and
  Pinecone.
- Cloudflare Workers AI image generation and image editing.
- Per-user, per-agent Redis rate limits:

  | Agent | Requests per 60 seconds |
  | --- | ---: |
  | Chat | 10 |
  | Coding | 5 |
  | Image | 1 |
  | PDF | 1 |
  | Search | 2 |

- Monaco rendering for code blocks in assistant responses.

## Architecture

```text
Browser (Next.js :3004)
        |
        | /api/* rewrite
        v
Gateway ( :3000 )
  |          |           |
  v          v           v
Auth       Chat        Agent
:3001      :3002       :3003
  |          |           |
  +----------+-----------+
       MongoDB / Redis

Agent integrations: Gemini, Tavily, Cloudflare Workers AI, Pinecone
```

The gateway verifies the JWT and corresponding Redis session before forwarding
protected chat and agent requests. The frontend calls the gateway through its
same-origin `/api` rewrite.

## Repository layout

```text
backend/
  .env.example
  shared/redis.js
  gateaway/             API gateway (directory spelling as in repository)
  services/
    auth/               Registration, login, logout, current-user routes
    chat/               Conversation and message routes
    agent/              LangGraph workflow and agent implementations
frontend/               Next.js application
```

## Requirements

- Node.js 22.13 or later (the PDF.js version used by the agent requires it).
- npm.
- A MongoDB instance.
- A Redis instance.
- Provider credentials for the features you intend to use (see below).

## Configuration

Create `backend/.env` from the sample:

```powershell
Copy-Item backend\.env.example backend\.env
```

Then replace the placeholder values. Never commit `backend/.env` or expose its
secrets in logs, screenshots, or source control.

| Variable | Required for | Notes |
| --- | --- | --- |
| `GATEAWAY_PORT` | Gateway | Defaults to `3000` if unset. |
| `AUTH_SERVICE_PORT` | Auth service | Defaults to `3001` if unset. |
| `CHAT_SERVICE_PORT` | Chat service | Defaults to `3002` if unset. |
| `AGENT_SERVICE_PORT` | Agent service | Defaults to `3003` if unset. |
| `NODE_ENV` | Backend services | Usually `development` locally. |
| `MONGO_URI` | Auth and chat services | MongoDB connection string for local runs. |
| `COMPOSE_MONGO_URI` | Docker Compose | Optional external MongoDB URI; defaults to the included MongoDB container. |
| `JWT_SECRET` | Auth and gateway | Use a long, random secret. |
| `REDIS_URL` | Sessions and rate limits | Redis connection URL. |
| `GEMINI_API_KEY` | Chat, coding, PDF, routing | Gemini API key. |
| `TAVILY_API_KEY` | Search agent | Tavily API key. |
| `CLOUDFLARE_API_TOKEN` | Image agent | Token with Workers AI access. |
| `CLOUDFLARE_ACCOUNT_ID` | Image agent | Cloudflare account ID. |
| `PINECONE_API_KEY` | PDF agent | Pinecone API key. |
| `PINECONE_INDEX_NAME` | PDF agent | Configured Pinecone index name. |
| `PINECONE_HOST` | PDF agent | Pinecone index host. |

Optional model overrides:

- `GEMINI_MODEL` selects the Gemini text model. The current default is
  `gemini-3.6-flash`.
- `CLOUDFLARE_IMAGE_MODEL` selects the Workers AI image model. The current
  default is `@cf/black-forest-labs/flux-2-klein-4b`.

The Gemini embedding model used for PDF indexing is `gemini-embedding-001`.
Create the Pinecone index with a dimension supported by that embedding model;
the agent reads the index dimension and requests matching embeddings.

## Run the backend with Docker Compose

Create `backend/.env` from the example if needed, set `JWT_SECRET`, and add
provider keys for the agents you plan to use:

```powershell
if (-not (Test-Path backend\.env)) { Copy-Item backend\.env.example backend\.env }
Set-Location backend
docker compose --parallel 1 up --build -d
docker compose ps
```

Compose runs the gateway, auth, chat, agent, MongoDB, and Redis. Only the
gateway is exposed at `http://localhost:3000`; database and service data are
kept in named volumes. By default MongoDB runs in Compose; set
`COMPOSE_MONGO_URI` in `backend/.env` to use an external MongoDB. Shut down
with `docker compose down`.

The `--parallel 1` option builds one service image at a time to reduce memory
and CPU pressure on small servers.

## Deploy the frontend to Vercel

Set the Vercel project root to `frontend`. Configure
`BACKEND_API_URL=http://16.178.242.208:3000` in the Vercel project settings for
the environments you use, then redeploy. The frontend calls same-origin
`/api` paths and Next.js proxies those requests to the backend, avoiding
browser CORS and mixed-content restrictions. The production build uses this
EC2 address as a fallback if the variable is omitted.

The EC2 security group and host firewall must allow inbound TCP port `3000`.
For production, put the backend behind HTTPS and change `BACKEND_API_URL` to
its HTTPS endpoint; the current HTTP connection from Vercel to EC2 is not
encrypted.

## Install dependencies

Install dependencies in each independently managed package:

```powershell
Set-Location backend\gateaway
npm install

Set-Location ..\services\auth
npm install

Set-Location ..\chat
npm install

Set-Location ..\agent
npm install

Set-Location ..\..\..\frontend
npm install
```

Alternatively, open a separate terminal in each of these directories and run
`npm install`:

- `backend/gateaway`
- `backend/services/auth`
- `backend/services/chat`
- `backend/services/agent`
- `frontend`

## Run locally

Start MongoDB and Redis first, configure `backend/.env`, then run each service
in a separate terminal from its package directory:

```powershell
# Terminal 1
Set-Location backend\services\auth
npm run dev

# Terminal 2
Set-Location backend\services\chat
npm run dev

# Terminal 3
Set-Location backend\services\agent
npm run dev

# Terminal 4
Set-Location backend\gateaway
npm run dev

# Terminal 5
Set-Location frontend
npm run dev
```

Open [http://localhost:3004](http://localhost:3004). The frontend proxies
`/api/*` to `http://localhost:3000` by default. To use another gateway URL,
set `BACKEND_API_URL` in the frontend process environment before starting
Next.js.

## Build and lint

Each backend service has `build` and `start` scripts. Build them from their
package directories:

```powershell
Set-Location backend\gateaway
npm run build

Set-Location ..\services\auth
npm run build

Set-Location ..\chat
npm run build

Set-Location ..\agent
npm run build
```

Build and lint the frontend:

```powershell
Set-Location frontend
npm run build
npm run lint
```

The root backend package does not provide an aggregate build or test script;
run commands in each service package.

## API overview

Requests below are available through the gateway at `http://localhost:3000`.
From the browser, use the same paths prefixed with `/api`.

### Authentication

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Create an account and start a session. |
| `POST` | `/auth/login` | Sign in and start a session. |
| `POST` | `/auth/logout` | End the session. |
| `GET` | `/auth/me` | Get the authenticated user. |

The auth service sets the JWT in an HttpOnly cookie. Protected routes also
check the session in Redis.

### Chat

All chat routes require authentication.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/chat/conversations` | List the current user's conversations. |
| `POST` | `/chat/conversations` | Create a conversation. |
| `GET` | `/chat/conversations/:conversationId` | Get a conversation. |
| `GET` | `/chat/conversations/:conversationId/messages` | List its messages. |
| `POST` | `/chat/conversations/:conversationId/messages` | Save a message. |

### Agents

`POST /agent/invoke` routes a message to an agent. The request accepts a
`message`, optional conversation `history`, and an optional base64 `attachment`
with `name`, `mimeType`, and `data`. PDF and supported image attachments are
limited to 6 MB. The response includes the selected `route`, assistant
`response`, and optional generated `artifact`.

Rate-limited requests return HTTP `429` and a `Retry-After` header.

## Agent behavior and limits

- **Chat:** General conversation using the configured Gemini text model.
- **Coding:** Coding explanations, debugging, and code generation using
  Gemini. Code blocks in responses are rendered using Monaco; the agent does
  not execute code or edit repository files.
- **Image:** Image generation and editing via Cloudflare Workers AI.
- **PDF:** Extracts selectable PDF text, chunks it, embeds it with Gemini, and
  stores vectors in Pinecone. Questions retrieve relevant chunks for a
  Gemini-generated answer with page references. PDFs are isolated by user and
  document. Current ingestion limits are 1,000 pages and 2,000 chunks;
  scanned/image-only PDFs need OCR.
- **Search:** Searches with Tavily and uses Gemini to synthesize an answer with
  source links.

Agent limits are per authenticated user in a Redis-backed fixed 60-second
window. Requests are routed before counting against the selected agent's
limit.

## Security notes

- Keep all API credentials in `backend/.env`; only use placeholders in
  `.env.example`.
- Do not expose provider keys to the browser.
- Use HTTPS and secure cookie settings when deploying outside local
  development.
- Apply least-privilege permissions to Cloudflare and database credentials.
- Review provider quotas, rate limits, and data-retention policies before
  production use.
