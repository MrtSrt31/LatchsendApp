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
    description: string;
    siteName: string;
    defaultLanguage: string;
    adminUsername: string;
    adminPassword: string;
    appPort: string;
    baseUrl: string;
    storageQuota: string;
    warning: string;
    completeSetup: string;
    continueDefault: string;
    saving: string;
    theme: string;
    themeSystem: string;
    themeDark: string;
    themeLight: string;
    themeSystemUnsupported: string;
  }
> = {
  en: {
    badge: "First Time Setup",
    title: "Latchsend Setup",
    description:
      "Complete the initial configuration to continue to the login screen.",
    siteName: "Site Name",
    defaultLanguage: "Default Language",
    adminUsername: "Admin Username",
    adminPassword: "Admin Password",
    appPort: "Application Port",
    baseUrl: "Base URL",
    storageQuota: "Storage Quota (GB)",
    warning:
      "If admin credentials are left empty, they should not be used in production. Fill them before continuing.",
    completeSetup: "Complete Setup",
    continueDefault: "Continue with Defaults",
    saving: "Saving...",
    theme: "Theme",
    themeSystem: "Use device setting",
    themeDark: "Always dark",
    themeLight: "Always light",
    themeSystemUnsupported: "Use device setting (device not supported)",
  },
  tr: {
    badge: "İlk Kurulum",
    title: "Latchsend Kurulumu",
    description:
      "İlk yapılandırmayı tamamlayın, ardından sistem giriş ekranına geçin.",
    siteName: "Site Adı",
    defaultLanguage: "Varsayılan Dil",
    adminUsername: "Admin Kullanıcı Adı",
    adminPassword: "Admin Şifresi",
    appPort: "Uygulama Portu",
    baseUrl: "Base URL",
    storageQuota: "Depolama Kotası (GB)",
    warning:
      "Admin bilgileri boş bırakılmamalıdır. Devam etmeden önce doldurun.",
    completeSetup: "Kurulumu Tamamla",
    continueDefault: "Varsayılanlarla Devam Et",
    saving: "Kaydediliyor...",
    theme: "Tema",
    themeSystem: "Cihaza göre",
    themeDark: "Hep siyah",
    themeLight: "Hep beyaz",
    themeSystemUnsupported: "Cihaza göre (cihaz desteklemiyor)",
  },
  es: {
    badge: "Configuración Inicial",
    title: "Configuración de Latchsend",
    description:
      "Completa la configuración inicial para continuar a la pantalla de inicio de sesión.",
    siteName: "Nombre del Sitio",
    defaultLanguage: "Idioma Predeterminado",
    adminUsername: "Usuario Administrador",
    adminPassword: "Contraseña de Administrador",
    appPort: "Puerto de la Aplicación",
    baseUrl: "URL Base",
    storageQuota: "Cuota de Almacenamiento (GB)",
    warning:
      "No dejes vacías las credenciales de administrador antes de continuar.",
    completeSetup: "Completar Configuración",
    continueDefault: "Continuar con Valores Predeterminados",
    saving: "Guardando...",
    theme: "Tema",
    themeSystem: "Usar ajuste del dispositivo",
    themeDark: "Siempre oscuro",
    themeLight: "Siempre claro",
    themeSystemUnsupported: "Usar ajuste del dispositivo (no compatible)",
  },
  fr: {
    badge: "Configuration Initiale",
    title: "Configuration de Latchsend",
    description:
      "Terminez la configuration initiale pour continuer vers l’écran de connexion.",
    siteName: "Nom du Site",
    defaultLanguage: "Langue par Défaut",
    adminUsername: "Nom d’Utilisateur Admin",
    adminPassword: "Mot de Passe Admin",
    appPort: "Port de l’Application",
    baseUrl: "URL de Base",
    storageQuota: "Quota de Stockage (GB)",
    warning:
      "Ne laissez pas les identifiants administrateur vides avant de continuer.",
    completeSetup: "Terminer la Configuration",
    continueDefault: "Continuer avec les Valeurs par Défaut",
    saving: "Enregistrement...",
    theme: "Thème",
    themeSystem: "Utiliser le réglage de l’appareil",
    themeDark: "Toujours sombre",
    themeLight: "Toujours clair",
    themeSystemUnsupported: "Utiliser le réglage de l’appareil (non pris en charge)",
  },
  hi: {
    badge: "प्रारंभिक सेटअप",
    title: "Latchsend सेटअप",
    description: "लॉगिन स्क्रीन पर जाने के लिए शुरुआती सेटअप पूरा करें।",
    siteName: "साइट नाम",
    defaultLanguage: "डिफ़ॉल्ट भाषा",
    adminUsername: "एडमिन उपयोगकर्ता नाम",
    adminPassword: "एडमिन पासवर्ड",
    appPort: "एप्लिकेशन पोर्ट",
    baseUrl: "बेस URL",
    storageQuota: "स्टोरेज कोटा (GB)",
    warning: "आगे बढ़ने से पहले एडमिन जानकारी भरें।",
    completeSetup: "सेटअप पूरा करें",
    continueDefault: "डिफ़ॉल्ट के साथ जारी रखें",
    saving: "सेव हो रहा है...",
    theme: "थीम",
    themeSystem: "डिवाइस के अनुसार",
    themeDark: "हमेशा डार्क",
    themeLight: "हमेशा लाइट",
    themeSystemUnsupported: "डिवाइस के अनुसार (समर्थन नहीं)",
  },
  "zh-CN": {
    badge: "首次设置",
    title: "Latchsend 设置",
    description: "完成初始配置后即可继续进入登录界面。",
    siteName: "站点名称",
    defaultLanguage: "默认语言",
    adminUsername: "管理员用户名",
    adminPassword: "管理员密码",
    appPort: "应用端口",
    baseUrl: "基础 URL",
    storageQuota: "存储配额 (GB)",
    warning: "继续之前请填写管理员信息。",
    completeSetup: "完成设置",
    continueDefault: "使用默认值继续",
    saving: "保存中...",
    theme: "主题",
    themeSystem: "跟随设备",
    themeDark: "始终深色",
    themeLight: "始终浅色",
    themeSystemUnsupported: "跟随设备（设备不支持）",
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

export default function SetupPage() {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("en");
  const [themePref, setThemePref] = useState<ThemePref>("dark");
  const [systemSupported, setSystemSupported] = useState(false);
  const [systemIsDark, setSystemIsDark] = useState(true);

  const [siteName, setSiteName] = useState("Latchsend");
  const [baseUrl, setBaseUrl] = useState("");
  const [adminUsername, setAdminUsername] = useState("admin");
  const [adminPassword, setAdminPassword] = useState("admin");
  const [appPort, setAppPort] = useState("3000");
  const [storageQuotaGB, setStorageQuotaGB] = useState("20");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      media.addListener(handler);
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
  const card = effectiveDark ? "border-white/10 bg-white/5" : "border-black/10 bg-white";
  const input = effectiveDark
    ? "border-white/10 bg-black/40 text-white placeholder:text-zinc-500 focus:border-white/25"
    : "border-black/10 bg-white text-zinc-950 placeholder:text-zinc-400 focus:border-black/25";
  const warningBox = effectiveDark
    ? "border-amber-500/20 bg-amber-500/10"
    : "border-amber-600/20 bg-amber-100";
  const warningText = effectiveDark ? "text-amber-200" : "text-amber-800";
  const errorBox = effectiveDark
    ? "border-red-500/20 bg-red-500/10 text-red-200"
    : "border-red-600/20 bg-red-100 text-red-800";
  const primaryBtn = effectiveDark
    ? "bg-white text-black hover:opacity-90"
    : "bg-zinc-950 text-white hover:opacity-90";
  const secondaryBtn = effectiveDark
    ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
    : "border-black/10 bg-zinc-50 text-zinc-950 hover:bg-zinc-100";

  async function handleSetup(useDefaults: boolean) {
    setErrorMessage("");
    setIsSaving(true);

    try {
      const finalSiteName = useDefaults ? "Latchsend" : siteName;
      const finalBaseUrl = useDefaults ? "" : baseUrl;
      const finalAdminUsername = useDefaults ? "admin" : adminUsername;
      const finalAdminPassword = useDefaults ? "admin" : adminPassword;
      const finalAppPort = useDefaults ? "3000" : appPort;
      const finalStorageQuotaGB = useDefaults ? "20" : storageQuotaGB;

      if (!finalSiteName || !finalAdminUsername || !finalAdminPassword || !finalStorageQuotaGB) {
        setErrorMessage("Zorunlu alanları doldur.");
        setIsSaving(false);
        return;
      }

      const response = await fetch("/api/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteName: finalSiteName,
          baseUrl: finalBaseUrl,
          defaultLanguage: lang,
          adminUsername: finalAdminUsername,
          adminPassword: finalAdminPassword,
          appPort: finalAppPort,
          storageQuotaGB: finalStorageQuotaGB,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Kurulum başarısız oldu.");
        setIsSaving(false);
        return;
      }

      router.push("/login");
    } catch (error) {
      console.error(error);
      setErrorMessage("Kurulum sırasında bir hata oluştu.");
      setIsSaving(false);
    }
  }

  return (
    <main className={`flex min-h-screen items-center justify-center px-6 py-12 transition-colors ${pageBg}`}>
      <div className={`w-full max-w-4xl rounded-3xl border p-8 shadow-2xl backdrop-blur-sm md:p-10 transition-colors ${card}`}>
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className={`mb-2 text-xs font-medium uppercase tracking-[0.28em] ${muted}`}>
              {t.badge}
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {t.title}
            </h1>
            <p className={`mt-3 max-w-2xl text-sm leading-6 md:text-base ${muted}`}>
              {t.description}
            </p>
          </div>

          <div className="grid w-full gap-4 md:w-[29rem] md:grid-cols-2">
            <div>
              <label className={`mb-2 block text-right text-xs font-medium uppercase tracking-[0.24em] ${muted}`}>
                {t.defaultLanguage}
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
              <label className={`mb-2 block text-right text-xs font-medium uppercase tracking-[0.24em] ${muted}`}>
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
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">{t.siteName}</label>
            <input
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              type="text"
              placeholder="Latchsend"
              className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">{t.appPort}</label>
            <input
              value={appPort}
              onChange={(e) => setAppPort(e.target.value)}
              type="text"
              placeholder="3000"
              className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">{t.adminUsername}</label>
            <input
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              type="text"
              placeholder="admin"
              className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">{t.adminPassword}</label>
            <input
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              type="password"
              placeholder="admin"
              className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">{t.storageQuota}</label>
            <input
              value={storageQuotaGB}
              onChange={(e) => setStorageQuotaGB(e.target.value)}
              type="number"
              min="1"
              placeholder="20"
              className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">{t.baseUrl}</label>
            <input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              type="text"
              placeholder="https://yourdomain.com"
              className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
            />
          </div>
        </div>

        <div className={`mt-6 rounded-2xl border p-4 transition-colors ${warningBox}`}>
          <p className={`text-sm leading-6 ${warningText}`}>{t.warning}</p>
        </div>

        {errorMessage ? (
          <div className={`mt-4 rounded-2xl border p-4 text-sm ${errorBox}`}>
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => handleSetup(false)}
            disabled={isSaving}
            className={`inline-flex h-12 items-center justify-center rounded-2xl px-6 text-sm font-semibold transition ${primaryBtn} ${isSaving ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {isSaving ? t.saving : t.completeSetup}
          </button>

          <button
            onClick={() => handleSetup(true)}
            disabled={isSaving}
            className={`inline-flex h-12 items-center justify-center rounded-2xl border px-6 text-sm font-semibold transition ${secondaryBtn} ${isSaving ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {t.continueDefault}
          </button>
        </div>
      </div>
    </main>
  );
}
