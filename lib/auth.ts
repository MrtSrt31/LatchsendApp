import { prisma } from "./prisma";

function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get("cookie") || "";
  return cookie.match(/(?:^|;\s*)latchsend_session=([^;]+)/)?.[1] ?? null;
}

export async function requireSession(request: Request) {
  const token = getSessionToken(request);
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt.getTime() <= Date.now()) return null;
  if (session.user.status !== "ACTIVE") return null;

  return session;
}

export async function requireAdmin(request: Request) {
  const session = await requireSession(request);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}
