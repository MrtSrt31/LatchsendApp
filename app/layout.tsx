import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { prisma } from "../lib/prisma";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 1 },
  });

  const siteName = settings?.siteName || "Latchsend";

  let metadataBase: URL | undefined = undefined;
  if (settings?.baseUrl) {
    try {
      metadataBase = new URL(settings.baseUrl);
    } catch {
      metadataBase = undefined;
    }
  }

  return {
    title: siteName,
    description: `${siteName} secure file sharing`,
    metadataBase,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
