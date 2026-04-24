import { prisma } from "../../lib/prisma";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 1 },
  });

  return (
    <LoginClient
      allowGuestLocalShare={!!settings?.allowGuestLocalShare}
      siteName={settings?.siteName || "Latchsend"}
    />
  );
}
