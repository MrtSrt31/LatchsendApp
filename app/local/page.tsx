import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import LocalShareClient from "./LocalShareClient";

export default async function LocalSharePage() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 1 },
  });

  if (!settings?.allowGuestLocalShare) {
    redirect("/login");
  }

  // Server tarafında hangi dili basacağımızı SABİT seçiyoruz (hydration fix)
  const initialLang =
    (settings.defaultLanguage as any) || "en";

  return (
    <LocalShareClient
      siteName={settings.siteName || "Latchsend"}
      initialLang={initialLang}
    />
  );
}
