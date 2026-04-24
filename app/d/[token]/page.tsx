import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import DownloadClient from "./DownloadClient";

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const file = await prisma.fileRecord.findUnique({
    where: { downloadToken: token },
    select: {
      id: true,
      originalName: true,
      sizeBytes: true,
      expiresAt: true,
      singleUse: true,
      downloadCount: true,
      passwordHash: true,
      deletedAt: true,
    },
  });

  if (!file || file.deletedAt) return notFound();
  if (new Date(file.expiresAt) < new Date()) return notFound();
  if (file.singleUse && file.downloadCount >= 1) return notFound();

  return (
    <DownloadClient
      token={token}
      fileName={file.originalName}
      fileSize={file.sizeBytes.toString()}
      expiresAt={file.expiresAt.toISOString()}
      singleUse={file.singleUse}
      hasPassword={!!file.passwordHash}
    />
  );
}
