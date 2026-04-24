import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import SetupForm from "./SetupForm";

export default async function SetupPage() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 1 },
  });

  if (settings?.installed) {
    redirect("/login");
  }

  return <SetupForm />;
}
