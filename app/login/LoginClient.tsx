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

const translations: Record<Lang, {
  signIn: string; welcomeBack: string; enterCreds: string;
  username: string; password: string; forgot: string;
  login: string; loggingIn: string;
  guestMode: string; guestSub: string; guestOpen: string;
  firstTime: string; runSetup: string;
  language: string; theme: string;
  missing: string; invalid: string; failed: string;
}> = {
  en: {
    signIn: "Sign in", welcomeBack: "Welcome back", enterCreds: "Enter your credentials to access the control panel.",
    username: "Username", password: "Password", forgot: "Forgot?",
    login: "Sign in", loggingIn: "Verifying…",
    guestMode: "Guest mode", guestSub: "Send a file P2P over your network", guestOpen: "Open",
    firstTime: "First time here?", runSetup: "Run first-time setup →",
    language: "Language", theme: "Theme",
    missing: "Please enter username and password.", invalid: "Invalid credentials.", failed: "Login failed. Try again.",
  },
  tr: {
    signIn: "Giriş Yap", welcomeBack: "Tekrar hoş geldin", enterCreds: "Kontrol paneline erişmek için kimlik bilgilerini gir.",
    username: "Kullanıcı Adı", password: "Şifre", forgot: "Unuttum",
    login: "Giriş Yap", loggingIn: "Doğrulanıyor…",
    guestMode: "Misafir modu", guestSub: "Ağında P2P dosya gönder", guestOpen: "Aç",
    firstTime: "İlk kez mi?", runSetup: "İlk kurulumu çalıştır →",
    language: "Dil", theme: "Tema",
    missing: "Kullanıcı adı ve şifre gir.", invalid: "Kimlik bilgileri geçersiz.", failed: "Giriş başarısız. Tekrar dene.",
  },
  es: {
    signIn: "Iniciar sesión", welcomeBack: "Bienvenido de nuevo", enterCreds: "Introduce tus credenciales para acceder al panel.",
    username: "Usuario", password: "Contraseña", forgot: "¿Olvidaste?",
    login: "Entrar", loggingIn: "Verificando…",
    guestMode: "Modo invitado", guestSub: "Envía un archivo P2P en tu red", guestOpen: "Abrir",
    firstTime: "¿Primera vez?", runSetup: "Ejecutar configuración inicial →",
    language: "Idioma", theme: "Tema",
    missing: "Introduce usuario y contraseña.", invalid: "Credenciales incorrectas.", failed: "Error al iniciar sesión.",
  },
  fr: {
    signIn: "Se connecter", welcomeBack: "Bon retour", enterCreds: "Entrez vos identifiants pour accéder au panneau.",
    username: "Identifiant", password: "Mot de passe", forgot: "Oublié?",
    login: "Connexion", loggingIn: "Vérification…",
    guestMode: "Mode invité", guestSub: "Envoyez un fichier P2P sur votre réseau", guestOpen: "Ouvrir",
    firstTime: "Première fois?", runSetup: "Configuration initiale →",
    language: "Langue", theme: "Thème",
    missing: "Saisir identifiant et mot de passe.", invalid: "Identifiants incorrects.", failed: "Échec de connexion.",
  },
  hi: {
    signIn: "साइन इन", welcomeBack: "फिर से स्वागत है", enterCreds: "कंट्रोल पैनल एक्सेस करने के लिए क्रेडेंशियल दर्ज करें।",
    username: "यूज़रनेम", password: "पासवर्ड", forgot: "भूल गए?",
    login: "साइन इन", loggingIn: "सत्यापित हो रहा है…",
    guestMode: "गेस्ट मोड", guestSub: "नेटवर्क पर P2P फ़ाइल भेजें", guestOpen: "खोलें",
    firstTime: "पहली बार?", runSetup: "पहली बार सेटअप चलाएं →",
    language: "भाषा", theme: "थीम",
    missing: "यूज़रनेम और पासवर्ड दर्ज करें।", invalid: "क्रेडेंशियल अमान्य हैं।", failed: "लॉगिन विफल। पुनः प्रयास करें।",
  },
  "zh-CN": {
    signIn: "登录", welcomeBack: "欢迎回来", enterCreds: "输入凭据以访问控制面板。",
    username: "用户名", password: "密码", forgot: "忘记?",
    login: "登录", loggingIn: "验证中…",
    guestMode: "访客模式", guestSub: "在网络上P2P传输文件", guestOpen: "打开",
    firstTime: "第一次?", runSetup: "运行初始设置 →",
    language: "语言", theme: "主题",
    missing: "请输入用户名和密码。", invalid: "凭据无效。", failed: "登录失败，请重试。",
  },
};

function detectInitialLanguage(): Lang {
  const supported: Lang[] = ["en", "tr", "es", "fr", "hi", "zh-CN"];
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem("latchsend_lang") as Lang | null;
  if (saved && supported.includes(saved)) return saved;
  for (const raw of (navigator.languages?.length ? navigator.languages : [navigator.language])) {
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

function hasSystemThemeSupport() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function";
}

function getSystemIsDark() {
  if (!hasSystemThemeSupport()) return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// Inline SVG icons
const LockIcon = ({ s = 20 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
    <rect x="3" y="9" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M6 9V6.5a4 4 0 018 0V9" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="10" cy="14" r="1.4" fill="currentColor"/>
  </svg>
);

const ShieldIcon = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
    <path d="M8 2l5 2v4c0 3-2.2 5.2-5 6-2.8-.8-5-3-5-6V4l5-2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  </svg>
);

const NetworkIcon = ({ s = 12 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="3" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="13" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M8 4.5v3m0 0L4 11m4-3.5L12 11" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
);

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setLang(detectInitialLanguage());
    const supported = hasSystemThemeSupport();
    setSystemSupported(supported);
    setSystemIsDark(getSystemIsDark());
    const savedTheme = window.localStorage.getItem("latchsend_theme") as ThemePref | null;
    if (savedTheme === "dark" || savedTheme === "light") setThemePref(savedTheme);
    else if (savedTheme === "system" && supported) setThemePref("system");
    else setThemePref(supported ? "system" : "dark");
    if (!supported) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }
  }, []);

  useEffect(() => { window.localStorage.setItem("latchsend_lang", lang); }, [lang]);

  useEffect(() => {
    if (themePref === "system" && !systemSupported) {
      window.localStorage.setItem("latchsend_theme", "dark");
      return;
    }
    window.localStorage.setItem("latchsend_theme", themePref);
  }, [themePref, systemSupported]);

  const effectiveDark = themePref === "dark" ? true : themePref === "light" ? false : systemIsDark;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", effectiveDark ? "dark" : "light");
  }, [effectiveDark]);

  const t = useMemo(() => translations[lang], [lang]);

  const THEME_OPTIONS = [
    { value: "system" as ThemePref, label: systemSupported ? (lang === "tr" ? "Cihaza göre" : "System") : (lang === "tr" ? "Cihaza göre (desteklenmiyor)" : "System (unsupported)"), disabled: !systemSupported },
    { value: "dark" as ThemePref, label: lang === "tr" ? "Hep siyah" : "Dark" },
    { value: "light" as ThemePref, label: lang === "tr" ? "Hep beyaz" : "Light" },
  ];

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    if (!username.trim() || !password) { setErrorMessage(t.missing); return; }
    setIsLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      let result: Record<string, unknown> = {};
      try { result = await response.json(); } catch {}
      if (!response.ok) {
        setErrorMessage(response.status === 401 ? t.invalid : ((result.error as string) || t.failed));
        setIsLoading(false);
        return;
      }
      window.location.replace("/dashboard");
    } catch {
      setErrorMessage(t.failed);
      setIsLoading(false);
    }
  }

  const chainSteps = [
    "Token resolved", "Time lock checked",
    "Single-use checked", "Password verified", "Stream begins",
  ];

  return (
    <main style={{
      minHeight: "100vh", display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1.1fr) minmax(0,1fr)",
      background: "var(--bg-0)", color: "var(--fg-0)",
    }}>
      {/* ── LEFT — brand panel ─────────────────────────────────── */}
      <div style={{
        position: "relative", padding: "48px 56px",
        display: isMobile ? "none" : "flex", flexDirection: "column", justifyContent: "space-between",
        background: "var(--bg-1)", borderRight: "1px solid var(--line)", overflow: "hidden",
      }}>
        {/* Grid backdrop */}
        <div className="grid-bg" style={{
          position: "absolute", inset: 0, opacity: 0.4,
          maskImage: "radial-gradient(circle at 20% 30%, black 0%, transparent 60%)",
          WebkitMaskImage: "radial-gradient(circle at 20% 30%, black 0%, transparent 60%)",
        }} />

        {/* Logo */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "var(--accent)" }}><LockIcon s={22} /></span>
          <span style={{ fontWeight: 600, fontSize: 16 }}>{siteName}</span>
        </div>

        {/* Hero copy + verification chain */}
        <div style={{ position: "relative" }}>
          <div className="label" style={{ color: "var(--accent)", marginBottom: 14 }}>
            Self-hosted · zero-knowledge
          </div>
          <h1 style={{ margin: 0, fontSize: 38, fontWeight: 600, letterSpacing: -1, lineHeight: 1.05, maxWidth: 440 }}>
            The link alone is never enough.
          </h1>
          <p style={{ marginTop: 16, color: "var(--fg-2)", fontSize: 14, maxWidth: 420, lineHeight: 1.55 }}>
            Wrap every file in a server-enforced latch — time, single-use, password.
            Revoke instantly. Auto-delete on consumption.
          </p>

          {/* Verification chain */}
          <div style={{
            marginTop: 36, padding: 18,
            background: "var(--bg-2)", borderRadius: 12, border: "1px solid var(--line)",
            maxWidth: 440, display: "flex", flexDirection: "column", gap: 10,
          }}>
            <div className="label" style={{ marginBottom: 4 }}>Verification chain</div>
            {chainSteps.map((label, i) => {
              const isLast = i === chainSteps.length - 1;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                    background: isLast ? "var(--accent)" : "var(--ok)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, color: "var(--bg-0)", fontFamily: "var(--mono)",
                  }}>
                    {isLast ? String(i + 1) : "✓"}
                  </div>
                  <span style={{ fontSize: 12.5, color: "var(--fg-1)" }}>{label}</span>
                  <div style={{ flex: 1, height: 1, background: "var(--line)", marginLeft: 8 }} />
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--fg-3)" }}>
                    {(8 + i * 3)}ms
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "relative", fontSize: 11.5, color: "var(--fg-3)", display: "flex", gap: 16 }}>
          <span>MIT licensed</span>
          <span>·</span>
          <span>github.com/MrtSrt31/LatchsendApp</span>
        </div>
      </div>

      {/* ── RIGHT — login form ─────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "32px 24px" : 48 }}>
        <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Mobile-only logo */}
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ color: "var(--accent)" }}><LockIcon s={22} /></span>
              <span style={{ fontWeight: 600, fontSize: 16 }}>{siteName}</span>
            </div>
          )}
          {/* Heading */}
          <div>
            <div className="label" style={{ marginBottom: 6 }}>{t.signIn}</div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: -0.4 }}>{t.welcomeBack}</h2>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--fg-2)" }}>{t.enterCreds}</p>
          </div>

          {/* Language + Theme */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div className="label" style={{ marginBottom: 5 }}>{t.language}</div>
              <select
                className="select"
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                style={{ height: 34 }}
              >
                {LANG_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.flag} {o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="label" style={{ marginBottom: 5 }}>{t.theme}</div>
              <select
                className="select"
                value={themePref}
                onChange={(e) => setThemePref(e.target.value as ThemePref)}
                style={{ height: 34 }}
              >
                {THEME_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div className="label" style={{ marginBottom: 6 }}>{t.username}</div>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoFocus
                style={{ height: 42 }}
              />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span className="label">{t.password}</span>
              </div>
              <input
                className="input mono"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ height: 42 }}
              />
            </div>
          </div>

          {/* Error */}
          {errorMessage && (
            <div style={{
              padding: "8px 12px", borderRadius: 8,
              background: "var(--err-soft)", color: "var(--err)", fontSize: 12.5,
            }}>
              {errorMessage}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-accent"
            disabled={isLoading}
            style={{ height: 44, fontSize: 13.5 }}
          >
            <ShieldIcon s={14} />
            {isLoading ? t.loggingIn : t.login}
          </button>

          {/* Guest mode */}
          {allowGuestLocalShare && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 14px", background: "var(--bg-1)",
              border: "1px solid var(--line)", borderRadius: 10,
            }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{t.guestMode}</div>
                <div style={{ fontSize: 11, color: "var(--fg-2)" }}>{t.guestSub}</div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => window.location.assign("/local")}
              >
                <NetworkIcon s={12} /> {t.guestOpen}
              </button>
            </div>
          )}

          {/* First-time setup link */}
          <div style={{ fontSize: 11.5, color: "var(--fg-3)", textAlign: "center" }}>
            {t.firstTime}{" "}
            <a
              href="/setup"
              style={{ color: "var(--accent)", textDecoration: "none" }}
            >
              {t.runSetup}
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
