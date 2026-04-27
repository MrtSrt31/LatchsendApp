import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// Public endpoint — no auth required
// Returns only what the client UI needs: baseUrl and siteName
export async function GET() {
  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: 1 } });
    return NextResponse.json({
      baseUrl: settings?.baseUrl ?? "",
      siteName: settings?.siteName ?? "Latchsend",
    });
  } catch {
    return NextResponse.json({ baseUrl: "", siteName: "Latchsend" });
  }
}
