-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SystemSettings" (
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
    "allowGuestLocalShare" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SystemSettings" ("adminBypassFileTypeRules", "allowedExtensions", "autoDeleteEnabled", "baseUrl", "createdAt", "defaultLanguage", "defaultLinkTtlHours", "defaultUserMaxUploadBytes", "id", "installed", "siteName", "storageQuotaBytes", "updatedAt", "usedStorageBytes") SELECT "adminBypassFileTypeRules", "allowedExtensions", "autoDeleteEnabled", "baseUrl", "createdAt", "defaultLanguage", "defaultLinkTtlHours", "defaultUserMaxUploadBytes", "id", "installed", "siteName", "storageQuotaBytes", "updatedAt", "usedStorageBytes" FROM "SystemSettings";
DROP TABLE "SystemSettings";
ALTER TABLE "new_SystemSettings" RENAME TO "SystemSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
