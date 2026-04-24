import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";
import { requireSession } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

const UPLOADS_DIR = join(process.cwd(), "uploads");

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const file = await prisma.fileRecord.findUnique({
    where: { id },
  });

  if (!file || file.deletedAt) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Only owner or admin can delete
  if (file.ownerUserId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Soft delete
  await prisma.fileRecord.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  // Free up storage counter
  await prisma.systemSettings.update({
    where: { id: 1 },
    data: { usedStorageBytes: { decrement: file.sizeBytes } },
  });

  // Delete from disk (best effort)
  try {
    await unlink(join(UPLOADS_DIR, file.storedName));
  } catch {}

  return NextResponse.json({ success: true });
}
