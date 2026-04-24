import { prisma } from "../lib/prisma";

async function main() {
  const existing = await prisma.systemSettings.findUnique({
    where: { id: 1 },
  });

  if (existing) {
    console.log("SystemSettings zaten var, tekrar oluşturulmadı.");
    return;
  }

  await prisma.systemSettings.create({
    data: {
      id: 1,
      installed: false,
      siteName: "Latchsend",
      baseUrl: null,
      defaultLanguage: "en",

      storageQuotaBytes: BigInt(21474836480), // 20 GB
      usedStorageBytes: BigInt(0),

      defaultUserMaxUploadBytes: BigInt(4294967296), // 4 GB
      defaultLinkTtlHours: 24,
      autoDeleteEnabled: true,

      allowedExtensions: JSON.stringify([
        "jpg",
        "jpeg",
        "png",
        "webp",
        "gif",
        "txt",
        "csv",
        "pdf",
      ]),

      adminBypassFileTypeRules: true,
      allowGuestLocalShare: false,
    },
  });

  console.log("SystemSettings oluşturuldu.");
}

main()
  .catch((e) => {
    console.error("Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
