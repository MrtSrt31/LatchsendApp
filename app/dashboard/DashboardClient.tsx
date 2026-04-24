"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Lang = "en" | "tr" | "es" | "fr" | "hi" | "zh-CN";
type ThemePref = "system" | "dark" | "light";

const LANG_OPTIONS: Array<{ value: Lang; label: string; flag: string }> = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "tr", label: "Türkçe", flag: "🇹🇷" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { value: "zh-CN", label: "简体中文", flag: "🇨🇳" },
];

const translations: Record<
  Lang,
  {
    badge: string;
    title: string;
    subtitle: string;
    uploadTitle: string;
    uploadHint: string;
    rulesTitle: string;
    rules: string[];
    placeholderButton: string;
    language: string;
    theme: string;
    themeSystem: string;
    themeDark: string;
    themeLight: string;
    themeSystemUnsupported: string;
    logout: string;
  }
> = {
  en: {
    badge: "Dashboard",
    title: "File Sharing",
    subtitle: "Upload a file and get a time-limited download link.",
    uploadTitle: "Upload",
    uploadHint:
      "In the next step we’ll implement: allowed types, max 4 GB, link creation, and auto-delete.",
    rulesTitle: "Rules",
    rules: [
      "Users: allowed file types only",
      "Users: max size 4 GB",
      "Links: default 24-hour expiry",
      "Admin: can disable auto-delete",
      "Admin: no practical upload limit (within storage)",
    ],
    placeholderButton: "Select a file (coming soon)",
    language: "Language",
    theme: "Theme",
    themeSystem: "Use device setting",
    themeDark: "Always dark",
    themeLight: "Always light",
    themeSystemUnsupported: "Use device setting (device not supported)",
    logout: "Log out",
  },
  tr: {
    badge: "Dashboard",
    title: "Dosya Paylaşımı",
    subtitle: "Dosya yükle ve süreli indirme bağlantısı al.",
    uploadTitle: "Yükleme",
    uploadHint:
      "Bir sonraki adımda şunları yapacağız: izinli türler, 4 GB limit, link üretimi ve otomatik silme.",
    rulesTitle: "Kurallar",
    rules: [
      "Kullanıcı: sadece izinli dosya türleri",
      "Kullanıcı: maksimum 4 GB",
      "Link: varsayılan 24 saat",
      "Admin: otomatik silmeyi kapatabilir",
      "Admin: pratikte limitsiz (depolama dahilinde)",
    ],
    placeholderButton: "Dosya seç (yakında)",
    language: "Dil",
    theme: "Tema",
    themeSystem: "Cihaza göre",
    themeDark: "Hep siyah",
    themeLight: "Hep beyaz",
    themeSystemUnsupported: "Cihaza göre (cihaz desteklemiyor)",
    logout: "Çıkış Yap",
  },
  es: {
    badge: "Panel",
    title: "Compartir Archivos",
    subtitle: "Sube un archivo y obtén un enlace de descarga temporal.",
    uploadTitle: "Subir",
    uploadHint:
      "En el siguiente paso: tipos permitidos, máximo 4 GB, creación de enlaces y borrado automático.",
    rulesTitle: "Reglas",
    rules: [
      "Usuarios: solo tipos permitidos",
      "Usuarios: tamaño máximo 4 GB",
      "Enlaces: caducidad por defecto 24 h",
      "Admin: puede desactivar el borrado automático",
      "Admin: sin límite práctico (según almacenamiento)",
    ],
    placeholderButton: "Seleccionar archivo (próximamente)",
    language: "Idioma",
    theme: "Tema",
    themeSystem: "Usar ajuste del dispositivo",
    themeDark: "Siempre oscuro",
    themeLight: "Siempre claro",
    themeSystemUnsupported: "Usar ajuste del dispositivo (no compatible)",
    logout: "Cerrar sesión",
  },
  fr: {
    badge: "Tableau de bord",
    title: "Partage de Fichiers",
    subtitle: "Téléverse un fichier et obtiens un lien temporaire.",
    uploadTitle: "Téléverser",
    uploadHint:
      "Étape suivante : types autorisés, 4 Go max, lien, suppression automatique.",
    rulesTitle: "Règles",
    rules: [
      "Utilisateurs : types autorisés uniquement",
      "Utilisateurs : 4 Go max",
      "Liens : expiration par défaut 24 h",
      "Admin : peut désactiver la suppression auto",
      "Admin : pas de limite pratique (selon stockage)",
    ],
    placeholderButton: "Choisir un fichier (bientôt)",
    language: "Langue",
    theme: "Thème",
    themeSystem: "Utiliser le réglage de l’appareil",
    themeDark: "Toujours sombre",
    themeLight: "Toujours clair",
    themeSystemUnsupported: "Utiliser le réglage de l’appareil (non pris en charge)",
    logout: "Déconnexion",
  },
  hi: {
    badge: "डैशबोर्ड",
    title: "फ़ाइल शेयरिंग",
    subtitle: "फ़ाइल अपलोड करें और समय-सीमित डाउनलोड लिंक पाएँ।",
    uploadTitle: "अपलोड",
    uploadHint:
      "अगले चरण में: अनुमति प्रकार, 4 GB सीमा, लिंक बनाना, और ऑटो-डिलीट।",
    rulesTitle: "नियम",
    rules: [
      "यूज़र: केवल अनुमति फ़ाइल प्रकार",
      "यूज़र: अधिकतम 4 GB",
      "लिंक: डिफ़ॉल्ट 24 घंटे",
      "एडमिन: ऑटो-डिलीट बंद कर सकता है",
      "एडमिन: व्यावहारिक सीमा नहीं (स्टोरेज के भीतर)",
    ],
    placeholderButton: "फ़ाइल चुनें (जल्द)",
    language: "भाषा",
    theme: "थीम",
    themeSystem: "डिवाइस के अनुसार",
    themeDark: "हमेशा डार्क",
    themeLight: "हमेशा लाइट",
    themeSystemUnsupported: "डिवाइस के अनुसार (समर्थन नहीं)",
    logout: "लॉग आउट",
  },
  "zh-CN": {
    badge: "控制台",
    title: "文件分享",
    subtitle: "上传文件并获取限时下载链接。",
    uploadTitle: "上传",
    uploadHint:
      "下一步将实现：允许类型、4GB 上限、生成链接、自动删除。",
    rulesTitle: "规则",
    rules: [
      "用户：仅允许的文件类型",
      "用户：最大 4GB",
      "链接：默认 24 小时过期",
      "管理员：可关闭自动删除",
      "管理员：实际不设限（取决于存储）",
    ],
    placeholderButton: "选择文件（即将上线）",
    language: "语言",
    theme: "主题",
    themeSystem: "跟随设备",
    themeDark: "始终深色",
    themeLight: "始终浅色",
    themeSystemUnsupported: "跟随设备（设备不支持）",
    logout: "退出登录",
  },
};

function detectInitialLanguage(): Lang {
  const supported: Lang[] = ["en", "tr", "es", "fr", "hi", "zh-CN"];

  if (typeof window === "undefined") return "en";

  const saved = window.localStorage.getItem("latchsend_lang") as Lang | null;
  if (saved && supported.includes(saved)) return saved;

  const langs = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const raw of langs) {
    const lower = raw.toLowerCase();
    if (lower.startsWith("tr")) return "tr";
    if (lower.startsWith("es")) return "es";
    if (lower.startsWith("fr")) return "fr";
    if (lower.startsWith("hi")) return "hi";
    if (lower.startsWith("zh")) return "zh-CN";
    if (lower.startsWith("en")) return "en";
  }

  return "en";
}

function hasSystemThemeSupport() {
  if (typeof window === "undefined") return false;
  return typeof window.matchMedia === "function";
}

function getSystemIsDark() {
  if (!hasSystemThemeSupport()) return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function DashboardClient() {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("en");
  const [themePref, setThemePref] = useState<ThemePref>("dark");
  const [systemSupported, setSystemSupported] = useState(false);
  const [systemIsDark, setSystemIsDark] = useState(true);

  useEffect(() => {
    setLang(detectInitialLanguage());

    const supported = hasSystemThemeSupport();
    setSystemSupported(supported);

    const currentSystemDark = getSystemIsDark();
    setSystemIsDark(currentSystemDark);

    const savedTheme = window.localStorage.getItem("latchsend_theme") as ThemePref | null;

    if (savedTheme === "dark" || savedTheme === "light") {
      setThemePref(savedTheme);
    } else if (savedTheme === "system" && supported) {
      setThemePref("system");
    } else {
      setThemePref(supported ? "system" : "dark");
    }

    if (!supported) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event: MediaQueryListEvent) => {
      setSystemIsDark(event.matches);
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    } else {
      // @ts-expect-error legacy safari
      media.addListener(handler);
      // @ts-expect-error legacy safari
      return () => media.removeListener(handler);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("latchsend_lang", lang);
  }, [lang]);

  useEffect(() => {
    if (themePref === "system" && !systemSupported) {
      window.localStorage.setItem("latchsend_theme", "dark");
      return;
    }

    window.localStorage.setItem("latchsend_theme", themePref);
  }, [themePref, systemSupported]);

  const t = useMemo(() => translations[lang], [lang]);

  const effectiveDark =
    themePref === "dark" ? true : themePref === "light" ? false : systemIsDark;

  const pageBg = effectiveDark ? "bg-black text-white" : "bg-zinc-100 text-zinc-950";
  const muted = effectiveDark ? "text-zinc-400" : "text-zinc-600";
  const mutedStrong = effectiveDark ? "text-zinc-300" : "text-zinc-700";
  const card = effectiveDark ? "border-white/10 bg-white/5" : "border-black/10 bg-white";
  const input = effectiveDark
    ? "border-white/10 bg-black/40 text-white placeholder:text-zinc-500 focus:border-white/25"
    : "border-black/10 bg-white text-zinc-950 placeholder:text-zinc-400 focus:border-black/25";
  const uploadZone = effectiveDark ? "border-white/15 bg-black/30" : "border-black/15 bg-zinc-50";
  const primaryBtn = effectiveDark ? "bg-white text-black hover:opacity-90" : "bg-zinc-950 text-white hover:opacity-90";
  const bullet = effectiveDark ? "bg-white/60" : "bg-black/50";
  const logoutBtn = effectiveDark
    ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
    : "border-black/10 bg-zinc-50 text-zinc-950 hover:bg-zinc-100";

  async function handleLogout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      window.location.replace("/login");
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <main className={`min-h-screen px-6 py-12 transition-colors ${pageBg}`}>
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className={`mb-2 text-xs font-medium uppercase tracking-[0.28em] ${muted}`}>
              {t.badge}
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {t.title}
            </h1>
            <p className={`mt-3 max-w-2xl text-sm leading-6 md:text-base ${muted}`}>
              {t.subtitle}
            </p>
          </div>

          <div className="grid w-full gap-4 md:w-[29rem] md:grid-cols-2">
            <div>
              <label className={`mb-2 block text-right text-xs font-medium uppercase tracking-[0.24em] text-zinc-500`}>
                {t.language}
              </label>
              <div className="relative">
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as Lang)}
                  className={`h-12 w-full appearance-none rounded-2xl border px-4 pr-12 text-sm font-medium outline-none ${input}`}
                >
                  {LANG_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.flag} {option.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-lg">
                  {LANG_OPTIONS.find((o) => o.value === lang)?.flag}
                </div>
              </div>
            </div>

            <div>
              <label className={`mb-2 block text-right text-xs font-medium uppercase tracking-[0.24em] text-zinc-500`}>
                {t.theme}
              </label>
              <select
                value={themePref}
                onChange={(e) => setThemePref(e.target.value as ThemePref)}
                className={`h-12 w-full appearance-none rounded-2xl border px-4 text-sm font-medium outline-none ${input}`}
              >
                <option value="system" disabled={!systemSupported}>
                  {systemSupported ? t.themeSystem : t.themeSystemUnsupported}
                </option>
                <option value="dark">{t.themeDark}</option>
                <option value="light">{t.themeLight}</option>
              </select>
            </div>

            {/* Logout button spans both columns */}
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleLogout}
                className={`h-12 w-full rounded-2xl border px-4 text-sm font-semibold transition ${logoutBtn}`}
              >
                {t.logout}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <section className={`md:col-span-2 rounded-3xl border p-8 shadow-2xl backdrop-blur-sm transition-colors ${card}`}>
            <h2 className="text-xl font-semibold">{t.uploadTitle}</h2>
            <p className={`mt-2 text-sm leading-6 ${muted}`}>
              {t.uploadHint}
            </p>

            <div className={`mt-6 rounded-3xl border border-dashed p-10 text-center transition-colors ${uploadZone}`}>
              <button
                type="button"
                className={`inline-flex h-12 items-center justify-center rounded-2xl px-6 text-sm font-semibold transition ${primaryBtn}`}
              >
                {t.placeholderButton}
              </button>
            </div>
          </section>

          <aside className={`rounded-3xl border p-8 shadow-2xl backdrop-blur-sm transition-colors ${card}`}>
            <h2 className="text-xl font-semibold">{t.rulesTitle}</h2>
            <ul className={`mt-4 space-y-3 text-sm ${mutedStrong}`}>
              {t.rules.map((r, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className={`mt-[2px] inline-block h-2 w-2 rounded-full ${bullet}`} />
                  <span className={`leading-6 ${muted}`}>{r}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </main>
  );
}
