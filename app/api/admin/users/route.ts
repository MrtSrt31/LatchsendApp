import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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
  if (session.user.role !== "ADMIN") return null;

  return session.user;
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        maxUploadBytes: true,
        preferredLanguage: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        maxUploadBytes: u.maxUploadBytes.toString(),
      })),
    });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json(
      { error: "Could not load users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      username,
      email,
      password,
      role,
      status,
      preferredLanguage,
      maxUploadGB,
    } = body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      typeof role !== "string" ||
      typeof status !== "string" ||
      typeof preferredLanguage !== "string" ||
      typeof maxUploadGB !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();
    const cleanEmail = typeof email === "string" ? email.trim() : "";

    if (!cleanUsername || !password.trim()) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (!["ADMIN", "USER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    if (!["PENDING", "ACTIVE", "DISABLED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    if (maxUploadGB <= 0) {
      return NextResponse.json(
        { error: "Max upload must be greater than zero" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    if (cleanEmail) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail || null,
        passwordHash,
        role: role as "ADMIN" | "USER",
        status: status as "PENDING" | "ACTIVE" | "DISABLED",
        preferredLanguage,
        maxUploadBytes: BigInt(Math.floor(maxUploadGB * 1024 * 1024 * 1024)),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin users POST error:", error);
    return NextResponse.json(
      { error: "Could not create user" },
      { status: 500 }
    );
  }
}
