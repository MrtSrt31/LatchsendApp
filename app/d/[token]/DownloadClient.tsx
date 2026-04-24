"use client";

import { useState } from "react";

type Lang = "en" | "tr" | "es" | "fr" | "hi" | "zh-CN";

function detectLang(): Lang {
  if (typeof window === "undefined") return "en";
  const supported: Lang[] = ["en", "tr", "es", "fr", "hi", "zh-CN"];
  const saved = localStorage.getItem("latchsend_lang") as Lang | null;
  if (saved && supported.includes(saved)) return saved;
  for (const raw of navigator.languages || [navigator.language]) {
    const l = raw.toLowerCase();
    if (l.startsWith("tr")) return "tr";
    if (l.startsWith("es")) return "es";
    if (l.startsWith("fr")) return "fr";
    if (l.startsWith("hi")) return "hi";
    if (l.startsWith("zh")) return "zh-CN";
    if (l.startsWith("en")) return "en";
  }
  return "en";
}

const T: Record<Lang, {
  title: string; file: string; size: string; expires: string;
  singleUse: string; protected: string; passwordLabel: string;
  download: string; downloading: string; wrongPw: string; expired: string;
  expiresIn: string; expiresInFmt: (v: string) => string;
}> = {
  en: {
    title: "LatchSend — Download",
    file: "File",
    size: "Size",
    expires: "Expires",
    singleUse: "One-time download",
    protected: "Password protected",
    passwordLabel: "Enter password",
    download: "Download",
    downloading: "Opening…",
    wrongPw: "Wrong password. Try again.",
    expired: "This link has expired or been used.",
    expiresIn: "in",
    expiresInFmt: (v) => `in ${v}`,
  },
  tr: {
    title: "LatchSend — İndir",
    file: "Dosya",
    size: "Boyut",
    expires: "Süre",
    singleUse: "Tek seferlik",
    protected: "Şifreli",
    passwordLabel: "Şifreyi girin",
    download: "İndir",
    downloading: "Açılıyor…",
    wrongPw: "Yanlış şifre. Tekrar deneyin.",
    expired: "Bu link süresi dolmuş veya kullanılmış.",
    expiresIn: "sonra",
    expiresInFmt: (v) => `${v} sonra`,
  },
  es: {
    title: "LatchSend — Descarga",
    file: "Archivo",
    size: "Tamaño",
    expires: "Vence",
    singleUse: "Descarga única",
    protected: "Protegido con contraseña",
    passwordLabel: "Introduce la contraseña",
    download: "Descargar",
    downloading: "Abriendo…",
    wrongPw: "Contraseña incorrecta. Inténtalo de nuevo.",
    expired: "Este enlace ha caducado o ya fue utilizado.",
    expiresIn: "en",
    expiresInFmt: (v) => `en ${v}`,
  },
  fr: {
    title: "LatchSend — Téléchargement",
    file: "Fichier",
    size: "Taille",
    expires: "Expire",
    singleUse: "Téléchargement unique",
    protected: "Protégé par mot de passe",
    passwordLabel: "Entrer le mot de passe",
    download: "Télécharger",
    downloading: "Ouverture…",
    wrongPw: "Mot de passe incorrect. Réessayez.",
    expired: "Ce lien a expiré ou a déjà été utilisé.",
    expiresIn: "dans",
    expiresInFmt: (v) => `dans ${v}`,
  },
  hi: {
    title: "LatchSend — डाउनलोड",
    file: "फ़ाइल",
    size: "आकार",
    expires: "समाप्त",
    singleUse: "एक बार डाउनलोड",
    protected: "पासवर्ड सुरक्षित",
    passwordLabel: "पासवर्ड दर्ज करें",
    download: "डाउनलोड",
    downloading: "खुल रहा है…",
    wrongPw: "गलत पासवर्ड। पुनः प्रयास करें।",
    expired: "यह लिंक समाप्त हो गया है या उपयोग किया जा चुका है।",
    expiresIn: "में",
    expiresInFmt: (v) => `${v} में`,
  },
  "zh-CN": {
    title: "LatchSend — 下载",
    file: "文件",
    size: "大小",
    expires: "过期",
    singleUse: "单次下载",
    protected: "密码保护",
    passwordLabel: "输入密码",
    download: "下载",
    downloading: "正在打开…",
    wrongPw: "密码错误，请重试。",
    expired: "此链接已过期或已被使用。",
    expiresIn: "后",
    expiresInFmt: (v) => `${v}后`,
  },
};

function formatBytes(n: number) {
  if (n <= 0) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  let v = n, i = 0;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${Math.round(v * 10) / 10} ${u[i]}`;
}

function formatExpiry(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "—";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function DownloadClient({
  token,
  fileName,
  fileSize,
  expiresAt,
  singleUse,
  hasPassword,
}: {
  token: string;
  fileName: string;
  fileSize: string;
  expiresAt: string;
  singleUse: boolean;
  hasPassword: boolean;
}) {
  const lang = detectLang();
  const t = T[lang];

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isDark = typeof window !== "undefined"
    ? window.matchMedia?.("(prefers-color-scheme: dark)").matches
    : true;

  const bg = isDark ? "bg-black text-white" : "bg-zinc-100 text-zinc-950";
  const card = isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-white";
  const muted = isDark ? "text-zinc-400" : "text-zinc-600";
  const input = isDark
    ? "border-white/10 bg-black/40 text-white placeholder:text-zinc-500 focus:border-white/30"
    : "border-black/10 bg-white text-zinc-950 placeholder:text-zinc-400 focus:border-black/30";
  const btn = isDark ? "bg-white text-black hover:opacity-90" : "bg-zinc-950 text-white hover:opacity-90";
  const badgeSingleUse = isDark ? "bg-amber-500/15 text-amber-300" : "bg-amber-50 text-amber-700";
  const badgePw = isDark ? "bg-blue-500/15 text-blue-300" : "bg-blue-50 text-blue-700";

  async function handleDownload() {
    if (hasPassword && !password.trim()) return;
    setLoading(true);
    setError("");

    const url = hasPassword
      ? `/api/d/${token}?pw=${encodeURIComponent(password)}`
      : `/api/d/${token}`;

    if (hasPassword) {
      // Verify password first, then trigger download
      const res = await fetch(url, { method: "HEAD" }).catch(() => null);
      // HEAD not supported for file route, use GET with a range or just redirect
      // Better: trigger download and catch error via fetch
      try {
        const check = await fetch(url);
        if (!check.ok) {
          const data = await check.json().catch(() => ({}));
          setError(data.error === "Wrong password" ? t.wrongPw : (data.error || t.wrongPw));
          setLoading(false);
          return;
        }
        // Stream response to download
        const blob = await check.blob();
        const objUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(objUrl), 30000);
      } catch {
        setError(t.wrongPw);
      }
      setLoading(false);
    } else {
      // Direct navigation for non-password files
      window.location.href = url;
      setTimeout(() => setLoading(false), 2000);
    }
  }

  const expiryLabel = formatExpiry(expiresAt);

  return (
    <main className={`min-h-screen flex items-center justify-center px-6 py-12 ${bg}`}>
      <div className="w-full max-w-md">
        <p className={`mb-6 text-center text-xs font-medium uppercase tracking-[0.28em] ${muted}`}>
          LatchSend
        </p>

        <div className={`rounded-3xl border p-8 shadow-2xl ${card}`}>
          <h1 className="text-2xl font-bold tracking-tight">{t.file}</h1>

          <div className="mt-6 space-y-3">
            <div className={`flex items-start justify-between gap-4 rounded-2xl border p-4 ${card}`}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{fileName}</p>
                <p className={`mt-1 text-xs ${muted}`}>
                  {formatBytes(Number(fileSize))}
                  {" · "}
                  {t.expires}: {expiryLabel}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {singleUse && (
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badgeSingleUse}`}>
                    {t.singleUse}
                  </span>
                )}
                {hasPassword && (
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badgePw}`}>
                    {t.protected}
                  </span>
                )}
              </div>
            </div>

            {hasPassword && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDownload()}
                placeholder={t.passwordLabel}
                autoFocus
                className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none transition ${input}`}
              />
            )}

            {error && (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={loading || (hasPassword && !password.trim())}
              onClick={handleDownload}
              className={`h-12 w-full rounded-2xl px-4 text-sm font-semibold transition ${btn} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? t.downloading : t.download}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
