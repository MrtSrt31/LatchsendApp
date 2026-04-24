import { NextResponse } from "next/server";
import { createReadStream, existsSync } from "fs";
import { unlink } from "fs/promises";
import { join } from "path";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";

const UPLOADS_DIR = join(process.cwd(), "uploads");

async function softDeleteFile(id: string, sizeBytes: bigint, storedName: string) {
  await prisma.fileRecord.update({ where: { id }, data: { deletedAt: new Date() } });
  await prisma.systemSettings.update({
    where: { id: 1 },
    data: { usedStorageBytes: { decrement: sizeBytes } },
  });
  try {
    await unlink(join(UPLOADS_DIR, storedName));
  } catch {}
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const url = new URL(request.url);
  const pw = url.searchParams.get("pw");

  const file = await prisma.fileRecord.findUnique({
    where: { downloadToken: token },
  });

  if (!file || file.deletedAt) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  if (new Date(file.expiresAt) < new Date()) {
    await softDeleteFile(file.id, file.sizeBytes, file.storedName);
    return NextResponse.json({ error: "Link has expired" }, { status: 410 });
  }

  if (file.singleUse && file.downloadCount >= 1) {
    await softDeleteFile(file.id, file.sizeBytes, file.storedName);
    return NextResponse.json({ error: "This link has already been used" }, { status: 410 });
  }

  if (file.passwordHash) {
    if (!pw) {
      return NextResponse.json({ error: "Password required", passwordRequired: true }, { status: 401 });
    }
    const ok = await bcrypt.compare(pw, file.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }
  }

  const filePath = join(UPLOADS_DIR, file.storedName);
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "File not found on server" }, { status: 404 });
  }

  // Increment download count
  await prisma.fileRecord.update({
    where: { id: file.id },
    data: { downloadCount: { increment: 1 } },
  });

  // If single-use, soft delete after this download
  if (file.singleUse) {
    // Schedule deletion after response is sent — we mark it deleted now; disk cleanup is best-effort
    setImmediate(() => softDeleteFile(file.id, file.sizeBytes, file.storedName));
  }

  const stream = createReadStream(filePath);
  const readable = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => controller.enqueue(chunk));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
    cancel() {
      stream.destroy();
    },
  });

  const safeName = encodeURIComponent(file.originalName).replace(/'/g, "%27");

  return new Response(readable, {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename*=UTF-8''${safeName}`,
      "Content-Length": file.sizeBytes.toString(),
      "Cache-Control": "no-store",
    },
  });
}
