"use client";

import { useEffect, useMemo, useState } from "react";

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
    username: string;
    password: string;
    usernamePh: string;
    passwordPh: string;
    login: string;
    loggingIn: string;
    guestLocalShare: string;
    language: string;
    hint: string;
    theme: string;
    themeSystem: string;
    themeDark: string;
    themeLight: string;
    themeSystemUnsupported: string;
    missing: string;
    invalid: string;
    failed: string;
  }
> = {
  en: {
    badge: "Secure File Sharing",
    title: "Sign in",
    subtitle: "Continue to your dashboard.",
    username: "Username",
    password: "Password",
    usernamePh: "Enter your username",
    passwordPh: "Enter your password",
    login: "Sign in",
    loggingIn: "Signing in...",
    guestLocalShare: "Guest Local Share",
    language: "Language",
    hint: "Your selected language and theme will be used across the app.",
    theme: "Theme",
    themeSystem: "Use device setting",
    themeDark: "Always dark",
    themeLight: "Always light",
    themeSystemUnsupported: "Use device setting (device not supported)",
    missing: "Please enter username and password.",
    invalid: "Invalid username or password.",
    failed: "Login failed. Please try again.",
  },
  tr: {
    badge: "Güvenli Dosya Paylaşımı",
    title: "Giriş yap",
    subtitle: "Dashboard’a devam et.",
    username: "Kullanıcı Adı",
    password: "Şifre",
    usernamePh: "Kullanıcı adını gir",
    passwordPh: "Şifreni gir",
    login: "Giriş Yap",
    loggingIn: "Giriş yapılıyor...",
    guestLocalShare: "Girişsiz Yerel Paylaşım",
    language: "Dil",
    hint: "Seçtiğin dil ve tema uygulamanın tamamında kullanılacaktır.",
    theme: "Tema",
    themeSystem: "Cihaza göre",
    themeDark: "Hep siyah",
    themeLight: "Hep beyaz",
    themeSystemUnsupported: "Cihaza göre (cihaz desteklemiyor)",
    missing: "Kullanıcı adı ve şifre gir.",
    invalid: "Kullanıcı adı veya şifre yanlış.",
    failed: "Giriş başarısız. Tekrar dene.",
  },
  es: {
    badge: "Compartir Archivos Seguro",
    title: "Iniciar sesión",
    subtitle: "Continúa a tu panel.",
    username: "Usuario",
    password: "Contraseña",
    usernamePh: "Introduce tu usuario",
    passwordPh: "Introduce tu contraseña",
    login: "Entrar",
    loggingIn: "Entrando...",
    guestLocalShare: "Compartir Local sin Inicio",
    language: "Idioma",
    hint: "El idioma y tema elegidos se usarán en toda la app.",
    theme: "Tema",
    themeSystem: "Usar ajuste del dispositivo",
    themeDark: "Siempre oscuro",
    themeLight: "Siempre claro",
    themeSystemUnsupported: "Usar ajuste del dispositivo (no compatible)",
    missing: "Introduce usuario y contraseña.",
    invalid: "Usuario o contraseña incorrectos.",
    failed: "Error al iniciar sesión. Inténtalo de nuevo.",
  },
  fr: {
    badge: "Partage de Fichiers Sécurisé",
    title: "Se connecter",
    subtitle: "Continuer vers le tableau de bord.",
    username: "Nom d’utilisateur",
    password: "Mot de passe",
    usernamePh: "Saisis ton nom d’utilisateur",
    passwordPh: "Saisis ton mot de passe",
    login: "Connexion",
    loggingIn: "Connexion...",
    guestLocalShare: "Partage Local Invité",
    language: "Langue",
    hint: "La langue et le thème choisis seront utilisés dans toute l’app.",
    theme: "Thème",
    themeSystem: "Utiliser le réglage de l’appareil",
    themeDark: "Toujours sombre",
    themeLight: "Toujours clair",
    themeSystemUnsupported: "Utiliser le réglage de l’appareil (non pris en charge)",
    missing: "Veuillez saisir identifiant et mot de passe.",
    invalid: "Identifiant ou mot de passe incorrect.",
    failed: "Échec de connexion. Réessayez.",
  },
  hi: {
    badge: "सुरक्षित फ़ाइल साझा करना",
    title: "साइन इन",
    subtitle: "डैशबोर्ड पर जारी रखें।",
    username: "यूज़रनेम",
    password: "पासवर्ड",
    usernamePh: "अपना यूज़रनेम लिखें",
    passwordPh: "अपना पासवर्ड लिखें",
    login: "साइन इन",
    loggingIn: "लॉगिन हो रहा है...",
    guestLocalShare: "गेस्ट लोकल शेयर",
    language: "भाषा",
    hint: "चुनी गई भाषा और थीम पूरी ऐप में उपयोग की जाएगी।",
    theme: "थीम",
    themeSystem: "डिवाइस के अनुसार",
    themeDark: "हमेशा डार्क",
    themeLight: "हमेशा लाइट",
    themeSystemUnsupported: "डिवाइस के अनुसार (समर्थन नहीं)",
    missing: "यूज़रनेम और पासवर्ड दर्ज करें।",
    invalid: "यूज़रनेम या पासवर्ड गलत है।",
    failed: "लॉगिन विफल। फिर से प्रयास करें।",
  },
  "zh-CN": {
    badge: "安全文件共享",
    title: "登录",
    subtitle: "继续进入控制台。",
    username: "用户名",
    password: "密码",
    usernamePh: "请输入用户名",
    passwordPh: "请输入密码",
    login: "登录",
    loggingIn: "登录中...",
    guestLocalShare: "免登录本地分享",
    language: "语言",
    hint: "所选语言和主题将应用到整个系统。",
    theme: "主题",
    themeSystem: "跟随设备",
    themeDark: "始终深色",
    themeLight: "始终浅色",
    themeSystemUnsupported: "跟随设备（设备不支持）",
    missing: "请输入用户名和密码。",
    invalid: "用户名或密码错误。",
    failed: "登录失败，请重试。",
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

export default function LoginClient({
  allowGuestLocalShare,
  siteName,
}: {
  allowGuestLocalShare: boolean;
  siteName: string;
}) {
  const [lang, setLang] = useState<Lang>("en");
  const [themePref, setThemePref] = useState<ThemePref>("dark");
  const [systemSupported, setSystemSupported] = useState(false);
  const [systemIsDark, setSystemIsDark] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLang(detectInitialLanguage());

    const supported = hasSystemThemeSupport();
    setSystemSupported(supported);
    setSystemIsDark(getSystemIsDark());

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
    const handler = (event: MediaQueryListEvent) => setSystemIsDark(event.matches);

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    } else {
      (media as any).addListener(handler);
      return () => (media as any).removeListener(handler);
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
  const primaryBtn = effectiveDark
    ? "bg-white text-black hover:opacity-90"
    : "bg-zinc-950 text-white hover:opacity-90";
  const secondaryBtn = effectiveDark
    ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
    : "border-black/10 bg-zinc-50 text-zinc-950 hover:bg-zinc-100";
  const errorBox = effectiveDark
    ? "border-red-500/20 bg-red-500/10 text-red-200"
    : "border-red-600/20 bg-red-100 text-red-800";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (!username.trim() || !password) {
      setErrorMessage(t.missing);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      let result: any = {};
      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        if (response.status === 401) {
          setErrorMessage(t.invalid);
        } else {
          setErrorMessage(result.error || t.failed);
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      window.location.replace("/dashboard");
      return;
    } catch (error) {
      console.error(error);
      setErrorMessage(t.failed);
      setIsLoading(false);
    }
  }

  return (
    <main className={`flex min-h-screen items-center justify-center px-6 py-12 transition-colors ${pageBg}`}>
      <div className={`w-full max-w-md rounded-3xl border p-8 shadow-2xl backdrop-blur-sm transition-colors ${card}`}>
        <div className="mb-7 flex flex-col gap-5">
          <div>
            <p className={`mb-2 text-xs font-medium uppercase tracking-[0.28em] ${muted}`}>
              {t.badge}
            </p>
            <h1 className="text-4xl font-bold tracking-tight">{t.title}</h1>
            <p className={`mt-2 text-sm ${muted}`}>{t.subtitle}</p>
            <p className={`mt-3 text-xs font-medium uppercase tracking-[0.24em] ${muted}`}>
              {siteName}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={`mb-2 block text-right text-xs font-medium uppercase tracking-[0.24em] ${muted}`}>
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

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="mb-2 block text-sm font-medium">{t.username}</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder={t.usernamePh}
              className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">{t.password}</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder={t.passwordPh}
              className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
            />
          </div>

          {errorMessage ? (
            <div className={`rounded-2xl border p-4 text-sm ${errorBox}`}>
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold transition ${primaryBtn} ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {isLoading ? t.loggingIn : t.login}
          </button>

          {allowGuestLocalShare ? (
            <button
              type="button"
              onClick={() => window.location.assign("/local")}
              className={`inline-flex h-12 w-full items-center justify-center rounded-2xl border text-sm font-semibold transition ${secondaryBtn}`}
            >
              {t.guestLocalShare}
            </button>
          ) : null}
        </form>

        <p className={`mt-6 text-center text-xs ${muted}`}>{t.hint}</p>
      </div>
    </main>
  );
}
