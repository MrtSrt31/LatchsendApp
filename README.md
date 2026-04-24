# LatchSend

> **Controlled file sharing — the link alone is never enough.**

LatchSend is a self-hosted, privacy-first file transfer platform built around a single principle: **the sender stays in control after the share**. Traditional platforms grant permanent access to anyone who obtains a link. LatchSend wraps every upload in a configurable *latch* — a set of server-enforced conditions that must all be satisfied before a single byte is delivered.

---

## Table of Contents

- [The Concept](#the-concept)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Security Model](#security-model)
- [Local P2P Mode](#local-p2p-mode)
- [Internationalisation](#internationalisation)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Known Issues & Patches](#known-issues--patches)
- [Roadmap](#roadmap)
- [License](#license)

---

## The Concept

Most file sharing tools treat a link as a permanent key. Once the URL leaves your hands, access is effectively unconditional:

```
Traditional model:  Upload → Get link → Anyone with the link downloads forever
```

LatchSend inverts this. The link is only the beginning. Every download attempt hits a server-side enforcement chain before a single byte is transmitted:

```
LatchSend model:    Upload → Configure latch → Share link
                                                    ↓
                    Recipient opens link → Server checks:
                      1. Has the link expired?        (time lock)
                      2. Has it already been used?    (single-use lock)
                      3. Does the password match?      (secret lock)
                    All checks pass → File streams to recipient
                    Any check fails → Request rejected, no data served
```

The latch is **always enforced server-side**. The download page is purely presentational — it cannot be bypassed by disabling JavaScript, manipulating network requests, or any other client-side trick.

---

## Features

### File Sharing with Latch Controls

| Feature | Detail |
|---|---|
| **Time lock** | Link expires automatically after a chosen duration. Presets: 1 h, 6 h, 12 h, 24 h, 48 h, 7 d, 30 d |
| **Single-use lock** | File and its on-disk data are permanently deleted after the first successful download |
| **Password lock** | Recipient must supply a bcrypt-verified secret before any data is served |
| **Revocation** | Sender can instantly invalidate any active link from their dashboard |
| **Auto-delete** | When a link expires or a single-use download completes, the physical file is removed from disk and the storage quota is reclaimed |
| **Storage quotas** | System-wide and per-user upload limits enforced at upload time |
| **File type policy** | Admin-defined allowlist of permitted extensions; configurable per-deployment |
| **Soft deletes** | Files are marked deleted in the database before disk cleanup, preventing race conditions |

### Dashboard

The sender dashboard gives full visibility and control over every shared file:

- **Drag-and-drop upload zone** with a file picker fallback
- **Real-time upload progress bar** via `XMLHttpRequest`
- **Latch configuration panel** — set expiry, toggle single-use, optionally add a password — all before uploading
- **File list table** showing: file name, size, expiry countdown, download count, live status badge (Active / Expired / Used)
- **One-click copy link** that copies the public-facing `/d/[token]` URL to the clipboard
- **Per-file revocation** with immediate effect

### Public Download Page

Recipients who open a share link see a clean, minimal page that:

- Shows the file name, size, and remaining validity
- Displays badges for single-use and password-protected files
- Presents a password entry form when required
- Streams the file directly from the server on confirmation — no intermediate storage, no redirects

### Local Network P2P Mode (Guest)

An optional guest mode modelled after Snapdrop enables **direct, serverless file transfer** between devices on the same network:

- Devices are discovered via a lightweight WebSocket signaling server
- All data travels **peer-to-peer over WebRTC data channels** — nothing touches the server
- Supports large files that would exceed the server's storage quota
- Configurable by the admin; can be disabled entirely

### Administration Panel

- **First-run setup wizard** — creates the admin account and configures the instance before the first user can log in
- **System settings**: site name, base URL, WebSocket port and path
- **Upload rules**: global storage quota, per-user upload cap, default link TTL, auto-delete toggle, allowed file extension list, admin bypass flag
- **User management**: create users, assign roles (`ADMIN` / `USER`), set status (`PENDING` / `ACTIVE` / `DISABLED`), override upload limits per user

---

## Architecture

```
Browser                    Next.js Server                    SQLite (dev.db)
  │                              │                                  │
  │  POST /api/files/upload      │                                  │
  │ ─────────────────────────►  │  validate extension/size/quota   │
  │                              │ ──────────────────────────────► │
  │                              │  write file to /uploads/         │
  │                              │  INSERT FileRecord               │
  │                              │ ◄────────────────────────────── │
  │  { downloadToken }           │                                  │
  │ ◄─────────────────────────  │                                  │
  │                              │                                  │
  │  GET /api/d/[token]          │                                  │
  │ ─────────────────────────►  │  SELECT FileRecord               │
  │                              │ ──────────────────────────────► │
  │                              │  check: deleted? expired?        │
  │                              │         singleUse used? pw ok?   │
  │  ReadableStream (file data)  │  UPDATE downloadCount            │
  │ ◄─────────────────────────  │  ReadableStream from /uploads/   │
```

**Stack at a glance:**

| Layer | Technology | Role |
|---|---|---|
| Framework | Next.js 16 (App Router) | Full-stack React with server components and route handlers |
| UI | React 19 + Tailwind CSS v4 | Dark/light adaptive, multi-language client components |
| Database | SQLite + Prisma 7 | Relational persistence via `@prisma/adapter-better-sqlite3` |
| Auth | Session cookies (HTTP-only) | 64-hex-char tokens, 7-day TTL, bcrypt password hashing |
| File I/O | Node.js `fs` streams | Streaming upload ingestion and streaming download serving |
| WebSocket | `ws` (standalone server) | Signaling channel for WebRTC peer discovery in P2P mode |
| Crypto | Node.js `crypto` module | Cryptographically random tokens, file storage names |

---

## Getting Started

### Prerequisites

- **Node.js 20.9+**
- **npm 10+**
- Git

### Installation

```bash
git clone https://github.com/MrtSrt31/LatchsendApp.git
cd LatchsendApp
npm install          # automatically applies the Next.js raw-body patch
npm rebuild better-sqlite3   # required if your Node.js version changed
```

### Database

```bash
npx prisma migrate deploy    # apply all migrations to dev.db
npx prisma generate          # generate the Prisma client
```

### Environment

Create `.env` at the project root:

```env
DATABASE_URL="file:./dev.db"
```

That is the only required variable for local development.

### Running in Development

LatchSend needs **two processes** running simultaneously:

```bash
# Terminal 1 — Next.js dev server (port 3000)
npm run dev

# Terminal 2 — WebSocket signaling server (port 8080, required for local P2P)
npm run signal
```

Open `http://localhost:3000`. On the very first visit you will be redirected to `/setup` to create the administrator account and configure the site name. After that you will be redirected to `/login` on every subsequent visit.

### Running in Production

```bash
npm run build
npm run start        # Next.js production server on port 3000
npm run signal       # Run the signaling server as a separate process
```

For production deployments, run both processes under a process manager such as **pm2** or **systemd** and place a reverse proxy (nginx, Caddy) in front of the Next.js server.

---

## Configuration

All runtime settings are managed through the Admin Panel at `/admin` after logging in with an administrator account.

| Setting | Default | Description |
|---|---|---|
| Site name | `Latchsend` | Displayed in the UI and download pages |
| Base URL | — | Used to construct absolute share links |
| Default link TTL | 24 hours | Applied to new uploads when the user does not override |
| Storage quota | 20 GB | Total on-disk limit across all users |
| Per-user upload cap | 4 GB | Maximum single-upload size for regular users |
| Auto-delete | Enabled | Removes files from disk when their link expires |
| Allowed extensions | jpg, png, pdf, txt, … | File types regular users may upload |
| Admin bypass | Enabled | Allows admin accounts to upload any file type |
| Guest local share | Disabled | Enables the P2P mode for unauthenticated visitors |

---

## API Reference

### Public Endpoints (no authentication required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/d/[token]` | Public download page — shows file metadata and a password form if required |
| `GET` | `/api/d/[token]` | File serving endpoint. Enforces all latch conditions and streams the file. Accepts `?pw=<password>` for password-protected files. |

**Download API response codes:**

| Code | Meaning |
|---|---|
| `200` | All conditions passed; file body is the response |
| `401` | Password required or incorrect |
| `404` | Token does not exist or file has been deleted |
| `410` | Link has expired or single-use link was already consumed |

---

### Authenticated Endpoints (session cookie required)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/login` | Create a session. Body: `{ username, password }` |
| `POST` | `/api/logout` | Destroy the current session |
| `GET` | `/api/files` | List the authenticated user's active (non-deleted) files |
| `POST` | `/api/files/upload` | Upload a file. `multipart/form-data` with fields: `file`, `ttlHours`, `singleUse` (`"true"`/`"false"`), `password` (optional) |
| `DELETE` | `/api/files/[id]` | Revoke a file by its database ID. Soft-deletes the record, decrements the storage counter, and removes the file from disk |

**Upload request fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File | Yes | The file to upload |
| `ttlHours` | Number | No (default: system setting) | Link expiry in hours (1 – 8760) |
| `singleUse` | `"true"` / `"false"` | No (default: `"false"`) | Delete after first download |
| `password` | String | No | If provided, a bcrypt hash is stored and the recipient must supply this value |

**Upload response:**
```json
{ "downloadToken": "d97a8afc4fdd45c5369c64927557bc89acbafbe3479efed38dfe8237" }
```

---

### Admin-Only Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/settings` | Fetch current system settings |
| `PATCH` | `/api/admin/settings` | Update system settings |
| `GET` | `/api/admin/users` | List all user accounts |
| `POST` | `/api/admin/users` | Create a new user account |
| `POST` | `/api/setup` | First-run setup — creates the admin account. Disabled after initial setup. |

---

## Security Model

### Tokens

Every share link contains a **56-character cryptographically random hex token** generated with `crypto.randomBytes(28)`. At ~224 bits of entropy, brute-forcing a valid token against a running server is computationally infeasible.

```
Share URL:  https://yourdomain.com/d/d97a8afc4fdd45c5369c64927557bc89acbafbe3479efed38dfe8237
                                      └────────────────────────────────────────────────────────┘
                                               56-char token (28 random bytes, hex-encoded)
```

Session tokens are **64-character hex strings** (`crypto.randomBytes(32)`) stored in an HTTP-only, `SameSite=Lax` cookie. They are never exposed to JavaScript.

### Passwords

User account passwords and file access passwords are both hashed with **bcrypt (cost factor 10–12)**. The raw password is never logged or persisted. Password hashes are never returned by any API endpoint.

### Storage Names

Files on disk are stored under names generated from `crypto.randomBytes(20).toString("hex")`, making the original file name completely unguessable from disk inspection alone. The mapping from storage name to original name exists only in the database.

### Server-Side Enforcement

Every latch check — expiry, single-use consumption, password verification — occurs in the **API route handler before the file stream is opened**. Bypassing these checks from the client side is not possible.

### Authentication Boundary

All file management endpoints require a valid, non-expired session. The only public surface is the download endpoint, which enforces latch conditions independently of session state.

---

## Local P2P Mode

The local network sharing feature (`/local`) replicates the Snapdrop experience:

```
Device A (Sender)             Signaling Server (:8080)         Device B (Receiver)
      │                               │                                │
      │  WebSocket: register + name   │                                │
      │──────────────────────────────►│◄──────────────────────────────│
      │                               │  WebSocket: register + name   │
      │                               │                                │
      │◄──────────────────────────────│◄──────────────────────────────│
      │         peers list            │         peers list             │
      │                               │                                │
      │──── WebRTC offer ────────────►│──────────────────────────────►│
      │◄─── WebRTC answer ───────────│◄──────────────────────────────│
      │──── ICE candidates ──────────►│──────────────────────────────►│
      │                               │                                │
      │◄══════════════ Direct WebRTC Data Channel ══════════════════►│
      │              (no server relay — pure P2P)                      │
```

Once the WebRTC data channel is established, **the signaling server is no longer involved**. File chunks travel directly between browsers at local network speeds. The signaling server only facilitates the initial handshake.

The standalone signaling server (`signaling-server.js`) runs on port **8080** by default and is started separately with `npm run signal`.

---

## Internationalisation

All user-facing surfaces support **6 languages** with automatic detection from `navigator.languages`:

| Language | Code | Coverage |
|---|---|---|
| English | `en` | Login, Dashboard, Admin, Download page, Local share |
| Turkish | `tr` | Login, Dashboard, Admin, Download page, Local share |
| Spanish | `es` | Login, Dashboard, Admin, Download page, Local share |
| French | `fr` | Login, Dashboard, Admin, Download page, Local share |
| Hindi | `hi` | Login, Dashboard, Admin, Download page, Local share |
| Simplified Chinese | `zh-CN` | Login, Dashboard, Admin, Download page, Local share |

The detected language is persisted to `localStorage` and applied consistently across all pages. Users can override it at any time from the language selector in the dashboard header.

---

## Project Structure

```
latchsend/
│
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── d/[token]/            # File download route handler
│   │   │   └── route.ts          #   → latch enforcement + streaming
│   │   ├── files/
│   │   │   ├── route.ts          # GET  — list authenticated user's files
│   │   │   ├── upload/
│   │   │   │   └── route.ts      # POST — upload + latch configuration
│   │   │   └── [id]/
│   │   │       └── route.ts      # DELETE — revoke file
│   │   ├── admin/
│   │   │   ├── settings/route.ts # GET/PATCH system settings (admin only)
│   │   │   └── users/route.ts    # GET/POST user management (admin only)
│   │   ├── login/route.ts        # POST — create session
│   │   ├── logout/route.ts       # POST — destroy session
│   │   ├── setup/route.ts        # POST — first-run setup
│   │   └── ws/route.ts           # WebSocket upgrade (local P2P signaling)
│   │
│   ├── d/[token]/                # Public download page
│   │   ├── page.tsx              #   Server component — fetches file metadata
│   │   └── DownloadClient.tsx    #   Client component — password form + download button
│   │
│   ├── dashboard/                # Authenticated file management
│   │   ├── page.tsx              #   Server component — session validation
│   │   └── DashboardClient.tsx   #   Client component — upload + latch controls + file list
│   │
│   ├── admin/                    # Administration panel
│   │   ├── page.tsx
│   │   └── AdminClient.tsx
│   │
│   ├── local/                    # Local P2P sharing
│   │   ├── page.tsx
│   │   └── LocalShareClient.tsx  #   WebRTC + WebSocket peer discovery
│   │
│   ├── login/                    # Login page
│   ├── setup/                    # First-run setup
│   └── layout.tsx
│
├── lib/
│   ├── auth.ts                   # requireSession / requireAdmin helpers
│   └── prisma.ts                 # Prisma client singleton (better-sqlite3 adapter)
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Applied migration history
│
├── scripts/
│   └── postinstall.js            # Auto-applied Next.js compatibility patch
│
├── signaling-server.js           # Standalone WebSocket signaling server (port 8080)
├── middleware.ts                 # Route-level auth guard (redirects to /login)
├── uploads/                      # Uploaded files — git-ignored, not committed
└── dev.db                        # SQLite database — git-ignored, not committed
```

---

## Database Schema

### `FileRecord` — one row per upload

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | String (cuid) | auto | Primary key |
| `ownerUserId` | String | — | Foreign key → `User.id` |
| `originalName` | String | — | File name as uploaded by the sender |
| `storedName` | String | — | Randomised on-disk name (`<40-hex>.<ext>`) |
| `extension` | String | — | Lowercase file extension |
| `mimeType` | String | — | MIME type from the upload request |
| `sizeBytes` | BigInt | — | File size; used for quota tracking |
| `downloadToken` | String (unique) | — | 56-char hex token embedded in the share URL |
| `expiresAt` | DateTime | — | Absolute expiry timestamp |
| `singleUse` | Boolean | `false` | Delete after first successful download |
| `downloadCount` | Int | `0` | Incremented on each successful download |
| `passwordHash` | String? | `null` | bcrypt hash; `null` = no password required |
| `autoDelete` | Boolean | `true` | Inherited from system settings at upload time |
| `deletedAt` | DateTime? | `null` | Soft-delete timestamp; non-null = revoked |
| `createdAt` | DateTime | now | Upload timestamp |

### `User`

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `username` | String (unique) | Login identifier |
| `email` | String? | Optional, unique |
| `passwordHash` | String | bcrypt hash |
| `role` | Enum | `ADMIN` or `USER` |
| `status` | Enum | `PENDING`, `ACTIVE`, or `DISABLED` |
| `maxUploadBytes` | BigInt | Per-user upload cap |
| `preferredLanguage` | String | ISO 639-1 code |

### `Session`

| Column | Type | Description |
|---|---|---|
| `token` | String (unique) | 64-char hex session token stored in the cookie |
| `userId` | String | Foreign key → `User.id` |
| `expiresAt` | DateTime | 7 days from creation |

### `SystemSettings` (singleton, `id = 1`)

Single-row configuration table. All fields are managed through the Admin Panel and take effect immediately without a server restart.

---

## Known Issues & Patches

### Next.js 16 startup crash (`argument fn must be a function`)

**Affected versions:** Next.js 16.1.6 with Node.js 20.20.x

**Root cause:** Next.js 16.1.6 bundles a version of `http-errors` that tries to register a deprecated alias for the HTTP 418 "I'm a Teapot" constructor using the `depd` library. In `statuses` v2+, HTTP 418 was removed from the standard codes list, so `http-errors` attempts to call `depd.function(undefined, ...)` — passing `undefined` where a function is expected — which throws `TypeError: argument fn must be a function` and prevents the server from starting.

**Fix:** A one-line guard wraps the problematic call in a `typeof === "function"` check before invocation. The patch is applied automatically by `scripts/postinstall.js` which runs as part of the `npm install` lifecycle via the `postinstall` hook. No manual steps are needed; re-running `npm install` will always restore the patched state.

```
scripts/postinstall.js  →  patches node_modules/next/dist/compiled/raw-body/index.js
package.json            →  "postinstall": "node scripts/postinstall.js"
```

---

## Roadmap

The following features are planned but not yet implemented:

- [ ] **Streaming upload pipeline** — current implementation buffers the entire file in memory before writing to disk; large files (> ~2 GB) require a streaming approach
- [ ] **Approval-based access** — sender must explicitly approve each download request before the file is served ("I'm online, let them in")
- [ ] **Download notifications** — notify the sender via email or webhook when their file is downloaded
- [ ] **Email verification** — confirm user email addresses on account creation
- [ ] **Password reset** — self-service password recovery flow
- [ ] **Two-factor authentication** — TOTP-based second factor for admin accounts
- [ ] **Chunked / resumable uploads** — TUS protocol support for unreliable connections
- [ ] **S3-compatible storage backend** — plug-in alternative to local disk storage
- [ ] **Audit log** — per-file download history with IP and timestamp
- [ ] **proxy.ts migration** — Next.js 16 deprecates `middleware.ts` in favour of `proxy.ts`

---

## License

MIT — see `LICENSE` for details.
