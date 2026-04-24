-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FileRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerUserId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "downloadToken" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "autoDelete" BOOLEAN NOT NULL DEFAULT true,
    "singleUse" BOOLEAN NOT NULL DEFAULT false,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "passwordHash" TEXT,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FileRecord_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FileRecord" ("autoDelete", "createdAt", "deletedAt", "downloadToken", "expiresAt", "extension", "id", "mimeType", "originalName", "ownerUserId", "sizeBytes", "storedName", "updatedAt") SELECT "autoDelete", "createdAt", "deletedAt", "downloadToken", "expiresAt", "extension", "id", "mimeType", "originalName", "ownerUserId", "sizeBytes", "storedName", "updatedAt" FROM "FileRecord";
DROP TABLE "FileRecord";
ALTER TABLE "new_FileRecord" RENAME TO "FileRecord";
CREATE UNIQUE INDEX "FileRecord_downloadToken_key" ON "FileRecord"("downloadToken");
CREATE INDEX "FileRecord_ownerUserId_idx" ON "FileRecord"("ownerUserId");
CREATE INDEX "FileRecord_expiresAt_idx" ON "FileRecord"("expiresAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
