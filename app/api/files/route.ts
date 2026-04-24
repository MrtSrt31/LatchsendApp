import { NextResponse } from "next/server";
import { requireSession } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET(request: Request) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const files = await prisma.fileRecord.findMany({
    where: { ownerUserId: session.user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      originalName: true,
      extension: true,
      mimeType: true,
      sizeBytes: true,
      downloadToken: true,
      expiresAt: true,
      singleUse: true,
      downloadCount: true,
      passwordHash: true,
      autoDelete: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    files: files.map((f) => ({
      id: f.id,
      originalName: f.originalName,
      extension: f.extension,
      mimeType: f.mimeType,
      sizeBytes: f.sizeBytes.toString(),
      downloadToken: f.downloadToken,
      expiresAt: f.expiresAt.toISOString(),
      singleUse: f.singleUse,
      downloadCount: f.downloadCount,
      hasPassword: !!f.passwordHash,
      autoDelete: f.autoDelete,
      createdAt: f.createdAt.toISOString(),
    })),
  });
}
