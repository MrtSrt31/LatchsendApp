import { redirect } from "next/navigation";
import { prisma } from "../lib/prisma";

export default async function HomePage() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 1 },
  });

  if (!settings || !settings.installed) {
    redirect("/setup");
  }

  redirect("/login");
}
