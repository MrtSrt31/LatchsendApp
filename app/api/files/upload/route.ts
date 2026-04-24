import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { requireSession } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

const UPLOADS_DIR = join(process.cwd(), "uploads");

export async function POST(request: Request) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.systemSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ttlHours = Math.max(
    1,
    Math.min(8760, Number(formData.get("ttlHours") || settings.defaultLinkTtlHours))
  );
  const singleUse = formData.get("singleUse") === "true";
  const password = (formData.get("password") as string | null)?.trim() || null;

  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const user = session.user;

  // Extension check (admin can bypass if setting allows)
  const isAdmin = user.role === "ADMIN";
  if (!isAdmin || !settings.adminBypassFileTypeRules) {
    const allowed = JSON.parse(settings.allowedExtensions) as string[];
    if (!allowed.includes(ext)) {
      return NextResponse.json(
        { error: `File type .${ext} is not allowed` },
        { status: 400 }
      );
    }
  }

  // Size check per user
  const userMaxBytes = BigInt(user.maxUploadBytes);
  if (BigInt(file.size) > userMaxBytes) {
    return NextResponse.json({ error: "File exceeds your upload limit" }, { status: 400 });
  }

  // System storage quota check
  const used = BigInt(settings.usedStorageBytes);
  const quota = BigInt(settings.storageQuotaBytes);
  if (used + BigInt(file.size) > quota) {
    return NextResponse.json({ error: "Server storage quota exceeded" }, { status: 507 });
  }

  // Write file to disk
  await mkdir(UPLOADS_DIR, { recursive: true });
  const storedName = `${crypto.randomBytes(20).toString("hex")}.${ext}`;
  const filePath = join(UPLOADS_DIR, storedName);
  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  // Create DB record
  const downloadToken = crypto.randomBytes(28).toString("hex");
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  await prisma.fileRecord.create({
    data: {
      ownerUserId: user.id,
      originalName: file.name,
      storedName,
      extension: ext,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: BigInt(file.size),
      downloadToken,
      expiresAt,
      singleUse,
      passwordHash,
      autoDelete: settings.autoDeleteEnabled,
    },
  });

  // Update used storage
  await prisma.systemSettings.update({
    where: { id: 1 },
    data: { usedStorageBytes: { increment: BigInt(file.size) } },
  });

  return NextResponse.json({ downloadToken });
}
