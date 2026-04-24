-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "installed" BOOLEAN NOT NULL DEFAULT false,
    "siteName" TEXT NOT NULL DEFAULT 'Latchsend',
    "baseUrl" TEXT,
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "storageQuotaBytes" BIGINT NOT NULL DEFAULT 21474836480,
    "usedStorageBytes" BIGINT NOT NULL DEFAULT 0,
    "defaultUserMaxUploadBytes" BIGINT NOT NULL DEFAULT 4294967296,
    "defaultLinkTtlHours" INTEGER NOT NULL DEFAULT 24,
    "autoDeleteEnabled" BOOLEAN NOT NULL DEFAULT true,
    "allowedExtensions" TEXT NOT NULL DEFAULT '["jpg","jpeg","png","webp","gif","txt","csv","pdf"]',
    "adminBypassFileTypeRules" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "maxUploadBytes" BIGINT NOT NULL DEFAULT 4294967296,
    "preferredLanguage" TEXT DEFAULT 'en',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FileRecord" (
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
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FileRecord_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FileRecord_downloadToken_key" ON "FileRecord"("downloadToken");

-- CreateIndex
CREATE INDEX "FileRecord_ownerUserId_idx" ON "FileRecord"("ownerUserId");

-- CreateIndex
CREATE INDEX "FileRecord_expiresAt_idx" ON "FileRecord"("expiresAt");
