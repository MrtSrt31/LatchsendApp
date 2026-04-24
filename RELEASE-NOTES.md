# Latchsend v1.0.0 Release Notes

## Platform Support
- **Linux, macOS, Windows**: Standalone builds with all dependencies
- **Docker**: Official Dockerfile and docker-compose.yml for easy deployment

## How to Use
1. Download the archive for your OS from the release assets
2. Copy `.env.example` to `.env` and configure as needed
3. Run the startup script:
   - Linux/macOS: `./start.sh`
   - Windows: `start.bat`
4. The app will initialize the database, run migrations, and start both the Next.js and signaling servers

## Included Files
- `.next/standalone/` (compiled app)
- `public/` (static assets)
- `prisma/` (schema and migrations)
- `signaling-server.js` (WebSocket server)
- `start.sh` / `start.bat` (startup scripts)
- `.env.example` (environment template)
- `package.json`

## Notes
- Requires Node.js 20+
- SQLite database is created automatically
- For Docker, use `docker-compose up --build`
- For custom builds, see the Dockerfile and release workflow

---

For issues or contributions, visit: https://github.com/MrtSrt31/LatchsendApp
