import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("latchsend_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: true,
    },
  });

  const valid = !!session && session.expiresAt.getTime() > Date.now();

  if (!valid) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const settings = await prisma.systemSettings.findUnique({
    where: { id: 1 },
  });

  if (!settings) {
    redirect("/setup");
  }

  return (
    <AdminClient
      initialAllowGuestLocalShare={settings.allowGuestLocalShare}
    />
  );
}
