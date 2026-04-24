import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      siteName,
      baseUrl,
      defaultLanguage,
      adminUsername,
      adminPassword,
      storageQuotaGB,
    } = body;

    if (!siteName || !adminUsername || !adminPassword || !storageQuotaGB) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const quotaNumber = Number(storageQuotaGB);
    if (!Number.isFinite(quotaNumber) || quotaNumber <= 0) {
      return NextResponse.json(
        { error: "Storage quota must be a valid number." },
        { status: 400 }
      );
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { username: adminUsername },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "This admin username is already taken." },
        { status: 400 }
      );
    }

    const storageQuotaBytes = BigInt(quotaNumber) * BigInt(1024 ** 3);

    await prisma.systemSettings.update({
      where: { id: 1 },
      data: {
        installed: true,
        siteName,
        baseUrl: baseUrl || null,
        defaultLanguage: defaultLanguage || "en",
        storageQuotaBytes,

        // default policy
        defaultUserMaxUploadBytes: BigInt(4294967296), // 4GB
        defaultLinkTtlHours: 24,
        autoDeleteEnabled: true,
        adminBypassFileTypeRules: true,
      },
    });

    await prisma.user.create({
      data: {
        username: adminUsername,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: "ADMIN",
        status: "ACTIVE",
        maxUploadBytes: BigInt(4294967296),
        preferredLanguage: defaultLanguage || "en",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Setup API error:", error);
    return NextResponse.json(
      { error: "Setup failed on server." },
      { status: 500 }
    );
  }
}
