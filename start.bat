@echo off
REM Windows startup script for Latchsend

IF NOT EXIST dev.db (
  ECHO Creating SQLite database...
  type nul > dev.db
)

IF EXIST prisma\migrations (
  ECHO Running migrations...
  npx prisma migrate deploy
)

ECHO Starting signaling server...
start "Signaling Server" cmd /c node signaling-server.js

ECHO Starting Next.js server...
node server.js
