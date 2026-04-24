import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

function getTokenFromCookieHeader(cookieHeader: string) {
  const match = cookieHeader.match(/(?:^|;\s*)latchsend_session=([^;]+)/);
  return match?.[1];
}

async function requireAdmin(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = getTokenFromCookieHeader(cookieHeader);

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  const valid = !!session && session.expiresAt.getTime() > Date.now();
  if (!valid) return null;
  if (session!.user.role !== "ADMIN") return null;

  return session!.user;
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.systemSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    return NextResponse.json({
      siteName: settings.siteName,
      baseUrl: settings.baseUrl ?? "",
      defaultLanguage: settings.defaultLanguage,

      // ✅ NEW
      publicPort: settings.publicPort ?? 443,
      wsPath: settings.wsPath ?? "/ws",

      storageQuotaBytes: settings.storageQuotaBytes.toString(),
      defaultUserMaxUploadBytes: settings.defaultUserMaxUploadBytes.toString(),
      defaultLinkTtlHours: settings.defaultLinkTtlHours,
      autoDeleteEnabled: settings.autoDeleteEnabled,
      allowedExtensions: settings.allowedExtensions,
      adminBypassFileTypeRules: settings.adminBypassFileTypeRules,
      allowGuestLocalShare: settings.allowGuestLocalShare,
    });
  } catch (error) {
    console.error("Admin settings GET error:", error);
    return NextResponse.json({ error: "Could not load settings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      siteName,
      baseUrl,
      defaultLanguage,

      // ✅ NEW
      publicPort,
      wsPath,

      storageQuotaGB,
      defaultUserMaxUploadGB,
      defaultLinkTtlHours,
      autoDeleteEnabled,
      allowedExtensions,
      adminBypassFileTypeRules,
      allowGuestLocalShare,
    } = body;

    if (
      typeof siteName !== "string" ||
      typeof baseUrl !== "string" ||
      typeof defaultLanguage !== "string" ||

      // ✅ NEW
      typeof publicPort !== "number" ||
      typeof wsPath !== "string" ||

      typeof storageQuotaGB !== "number" ||
      typeof defaultUserMaxUploadGB !== "number" ||
      typeof defaultLinkTtlHours !== "number" ||
      typeof autoDeleteEnabled !== "boolean" ||
      typeof allowedExtensions !== "string" ||
      typeof adminBypassFileTypeRules !== "boolean" ||
      typeof allowGuestLocalShare !== "boolean"
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (storageQuotaGB <= 0 || defaultUserMaxUploadGB <= 0 || defaultLinkTtlHours <= 0) {
      return NextResponse.json(
        { error: "Numeric values must be greater than zero" },
        { status: 400 }
      );
    }

    // publicPort sanity
    const safePublicPort = Number.isFinite(publicPort) ? Math.floor(publicPort) : 443;
    const normalizedPublicPort = safePublicPort > 0 && safePublicPort < 65536 ? safePublicPort : 443;

    // wsPath sanity
    let normalizedWsPath = wsPath.trim() || "/ws";
    if (!normalizedWsPath.startsWith("/")) normalizedWsPath = `/${normalizedWsPath}`;
    // very simple safety: no spaces
    normalizedWsPath = normalizedWsPath.replace(/\s+/g, "");

    await prisma.systemSettings.update({
      where: { id: 1 },
      data: {
        siteName: siteName.trim() || "Latchsend",
        baseUrl: baseUrl.trim() || null,
        defaultLanguage: defaultLanguage.trim() || "en",

        // ✅ NEW
        publicPort: normalizedPublicPort,
        wsPath: normalizedWsPath,

        storageQuotaBytes: BigInt(Math.floor(storageQuotaGB * 1024 * 1024 * 1024)),
        defaultUserMaxUploadBytes: BigInt(
          Math.floor(defaultUserMaxUploadGB * 1024 * 1024 * 1024)
        ),
        defaultLinkTtlHours: Math.floor(defaultLinkTtlHours),
        autoDeleteEnabled,
        allowedExtensions,
        adminBypassFileTypeRules,
        allowGuestLocalShare,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin settings PATCH error:", error);
    return NextResponse.json({ error: "Could not update settings" }, { status: 500 });
  }
}
