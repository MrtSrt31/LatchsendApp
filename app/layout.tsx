import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { prisma } from "../lib/prisma";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jb-mono",
  subsets: ["latin"],
  display: "swap",
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
      <head>
        <style>{`
          :root {
            --font-sans: var(--font-inter, "Inter", system-ui, sans-serif);
            --font-mono: var(--font-jb-mono, "JetBrains Mono", ui-monospace, monospace);
            --sans: var(--font-sans);
            --mono: var(--font-mono);
          }
        `}</style>
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
