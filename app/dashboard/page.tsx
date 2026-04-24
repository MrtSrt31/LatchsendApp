import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("latchsend_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await prisma.session.findUnique({
    where: { token },
  });

  const valid = !!session && session.expiresAt.getTime() > Date.now();

  if (!valid) {
    redirect("/login");
  }

  return <DashboardClient />;
}
