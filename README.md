# LatchSend

**Controlled file sharing — the link alone is not enough.**

LatchSend is a self-hosted, secure file transfer application where the sender defines exactly who can access a file and under what conditions. Unlike traditional sharing tools that grant access to anyone with a link, LatchSend wraps every file in a configurable *latch* — a set of rules that must be satisfied before a download is allowed.

---

## How it works

1. A registered user uploads a file and configures its latch rules:
   - **Expiry** — the link becomes invalid after a chosen duration (1 hour to 30 days)
   - **Single-use** — the file is permanently deleted after the first successful download
   - **Password** — the recipient must know a secret before the file is served
2. LatchSend generates a unique, unguessable download token and returns a share link.
3. The recipient opens the link. Every rule is enforced server-side at download time — no client-side tricks.
4. If all conditions pass, the file streams directly to the recipient. Otherwise, the request is rejected.

---

## Features

### Core — File Sharing with Latch Controls

| Feature | Detail |
|---|---|
| Expiry | 1 h / 6 h / 12 h / 24 h / 48 h / 7 d / 30 d presets |
| Single-use download | File and link auto-deleted after the first download |
| Password protection | bcrypt-verified; password entry form shown to recipients |
| Auto-delete | Files are cleaned from disk and storage quota is reclaimed on expiry |
| Storage quota | Per-system and per-user upload limits enforced on every upload |
| File type policy | Admin-defined allowlist; admins can optionally bypass it |
| Soft delete | Users can revoke any link at any time; disk and quota freed immediately |

### Local Network Sharing (Guest Mode)

Inspired by Snapdrop, LatchSend includes a WebRTC peer-to-peer transfer mode for devices on the same network. No account required. Peers are discovered via a WebSocket signaling server, and files are transferred directly between browsers using data channels.

| Feature | Detail |
|---|---|
| Peer discovery | WebSocket signaling server (standalone, port 8080) |
| File transfer | WebRTC data channels — no server relay |
| Device naming | Auto-detected from user-agent; editable in UI |
| Guest access | Admin-toggleable; accessible without login |

### Administration

- First-run setup wizard — creates the admin account and configures the site
- Admin dashboard: site name, base URL, WebSocket port/path settings
- Upload rules: global storage quota, per-user upload cap, default TTL, auto-delete toggle, allowed extensions, admin bypass flag
- User management: create users, set role (`ADMIN` / `USER`), status (`PENDING` / `ACTIVE` / `DISABLED`), and upload limit

### Internationalisation

All UI surfaces (login, dashboard, admin panel, download page, local share) support **6 languages** with automatic detection from browser preferences:

`English` · `Türkçe` · `Español` · `Français` · `हिन्दी` · `简体中文`

### Theme

System / Dark / Always Light — user preference persisted in `localStorage`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19, TypeScript) |
| Database | SQLite via Prisma 7 + `@prisma/adapter-better-sqlite3` |
| Styling | Tailwind CSS v4 |
| Auth | Session cookies (HTTP-only, 7-day) + bcryptjs |
| WebSocket | `ws` — standalone signaling server for WebRTC peer discovery |
| File I/O | Node.js `fs` streams; files stored on disk under `/uploads/` |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone <your-repo-url>
cd latchsend
npm install
npm rebuild better-sqlite3   # required if Node version changed
```

### Database setup

```bash
npx prisma migrate deploy
npx prisma generate
```

### Environment

Create a `.env` file at the project root:

```env
DATABASE_URL="file:./dev.db"
```

### Development

LatchSend requires **two processes** in development:

```bash
# Terminal 1 — Next.js dev server
npm run dev

# Terminal 2 — WebSocket signaling server (local share feature)
npm run signal
```

Then open `http://localhost:3000`. On first visit you will be redirected to `/setup` to create the admin account.

### Production build

```bash
npm run build
npm run start
```

The signaling server should be run as a separate process in production (e.g. via `pm2` or a systemd unit) alongside the Next.js server.

---

## Project Structure

```
latchsend/
├── app/
│   ├── api/
│   │   ├── d/[token]/        # File download route (streaming, latch enforcement)
│   │   ├── files/            # File list (GET), upload (POST /upload), delete (DELETE /[id])
│   │   ├── admin/            # Settings + user management (admin only)
│   │   ├── login/            # Session creation
│   │   ├── logout/           # Session deletion
│   │   ├── setup/            # First-run admin setup
│   │   └── ws/               # WebSocket upgrade endpoint (local share)
│   ├── d/[token]/            # Public download page + DownloadClient
│   ├── dashboard/            # File upload UI, latch controls, file list
│   ├── admin/                # Admin dashboard
│   ├── local/                # Local P2P sharing (WebRTC)
│   ├── login/                # Login page
│   └── setup/                # First-run setup page
├── lib/
│   ├── auth.ts               # requireSession / requireAdmin helpers
│   └── prisma.ts             # Prisma client singleton
├── prisma/
│   └── schema.prisma         # Database schema
├── signaling-server.js       # Standalone WebSocket signaling server (port 8080)
└── uploads/                  # Uploaded files (git-ignored)
```

---

## Database Schema (key models)

### `FileRecord`

| Column | Type | Description |
|---|---|---|
| `downloadToken` | String (unique) | The secret token embedded in share links |
| `expiresAt` | DateTime | Hard expiry enforced on every download attempt |
| `singleUse` | Boolean | Delete after first successful download |
| `downloadCount` | Int | Incremented on each successful download |
| `passwordHash` | String? | bcrypt hash; `null` means no password required |
| `autoDelete` | Boolean | Inherited from system settings at upload time |
| `deletedAt` | DateTime? | Soft-delete timestamp; `null` means the file is live |
| `sizeBytes` | BigInt | Used to maintain the system `usedStorageBytes` counter |

### `SystemSettings` (singleton, id = 1)

Single-row configuration table updated by the admin panel. Controls storage quota, default TTL, allowed file extensions, WebSocket configuration, and more.

---

## API Reference

### Public

| Method | Path | Description |
|---|---|---|
| `GET` | `/d/[token]` | Download page — shows file info, password form if required |
| `GET` | `/api/d/[token]` | Serve file — accepts `?pw=` for password-protected files |

### Authenticated (session cookie required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/files` | List current user's active files |
| `POST` | `/api/files/upload` | Upload a file (`multipart/form-data`): `file`, `ttlHours`, `singleUse`, `password` |
| `DELETE` | `/api/files/[id]` | Revoke a file — soft-deletes and frees disk + quota |

### Admin only

| Method | Path | Description |
|---|---|---|
| `GET/PATCH` | `/api/admin/settings` | Read or update system settings |
| `GET/POST` | `/api/admin/users` | List users or create a new user |

---

## Security Notes

- Download tokens are 56-character cryptographically random hex strings (`crypto.randomBytes(28)`).
- Session tokens are 64-character hex strings (`crypto.randomBytes(32)`), stored HTTP-only and never exposed to JavaScript.
- Passwords are hashed with bcrypt (cost factor 10) and never returned in API responses.
- All latch rules (expiry, single-use, password) are enforced server-side on the download API route — the download page is purely presentational.
- File names on disk are randomised (`crypto.randomBytes(20).toString("hex") + ext`); original names are only stored in the database.
- Expired and single-use-consumed files are soft-deleted and their disk files removed; the storage quota is decremented accordingly.

---

## License

MIT
