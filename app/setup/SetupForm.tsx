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

const translations: Record<Lang, {
  badge: string; title: string; description: string;
  siteName: string; defaultLanguage: string;
  adminUsername: string; adminPassword: string;
  appPort: string; baseUrl: string; storageQuota: string;
  warning: string; completeSetup: string; continueDefault: string; saving: string;
  theme: string; themeSystem: string; themeDark: string; themeLight: string;
  themeSystemUnsupported: string;
  stepInstance: string; stepAdmin: string; stepLimits: string; stepReview: string;
  instanceSub: string; adminSub: string; limitsSub: string; reviewSub: string;
  back: string; continueBtn: string; finishSetup: string;
  systemQuota: string; perUserCap: string; perUserCapLabel: string;
  reviewReady: string; adminWarning: string;
}> = {
  en: {
    badge: "First Time Setup", title: "Latchsend Setup",
    description: "Complete initial configuration to continue to the login screen.",
    siteName: "Site Name", defaultLanguage: "Default Language",
    adminUsername: "Admin Username", adminPassword: "Admin Password",
    appPort: "Application Port", baseUrl: "Base URL", storageQuota: "Storage Quota (GB)",
    warning: "If admin credentials are left empty they should not be used in production. Fill them before continuing.",
    completeSetup: "Complete Setup", continueDefault: "Continue with Defaults", saving: "Saving...",
    theme: "Theme", themeSystem: "Use device setting", themeDark: "Always dark", themeLight: "Always light",
    themeSystemUnsupported: "Use device setting (not supported)",
    stepInstance: "Instance", stepAdmin: "Administrator", stepLimits: "Limits", stepReview: "Review",
    instanceSub: "Site name & base URL", adminSub: "Create the first account",
    limitsSub: "Quota & upload caps", reviewSub: "Confirm & finish",
    back: "← Back", continueBtn: "Continue →", finishSetup: "Finish setup",
    systemQuota: "System-wide quota", perUserCap: "Per-user upload cap",
    perUserCapLabel: "Per-user cap",
    reviewReady: "Setup will be locked after this step. Make sure your admin password is recorded.",
    adminWarning: "Fill admin credentials before going to production.",
  },
  tr: {
    badge: "İlk Kurulum", title: "Latchsend Kurulumu",
    description: "Giriş ekranına geçmek için ilk yapılandırmayı tamamlayın.",
    siteName: "Site Adı", defaultLanguage: "Varsayılan Dil",
    adminUsername: "Admin Kullanıcı Adı", adminPassword: "Admin Şifresi",
    appPort: "Uygulama Portu", baseUrl: "Base URL", storageQuota: "Depolama Kotası (GB)",
    warning: "Admin bilgileri boş bırakılmamalıdır. Devam etmeden önce doldurun.",
    completeSetup: "Kurulumu Tamamla", continueDefault: "Varsayılanlarla Devam Et", saving: "Kaydediliyor...",
    theme: "Tema", themeSystem: "Cihaza göre", themeDark: "Hep siyah", themeLight: "Hep beyaz",
    themeSystemUnsupported: "Cihaza göre (desteklenmiyor)",
    stepInstance: "Örnek", stepAdmin: "Yönetici", stepLimits: "Limitler", stepReview: "İnceleme",
    instanceSub: "Site adı & temel URL", adminSub: "İlk hesabı oluştur",
    limitsSub: "Kota & yükleme sınırları", reviewSub: "Onayla & bitir",
    back: "← Geri", continueBtn: "Devam →", finishSetup: "Kurulumu Bitir",
    systemQuota: "Sistem geneli kota", perUserCap: "Kullanıcı başına yükleme sınırı",
    perUserCapLabel: "Kullanıcı sınırı",
    reviewReady: "Bu adımdan sonra kurulum kilitlenecek. Admin şifreni kaydet.",
    adminWarning: "Üretime geçmeden önce admin bilgilerini doldur.",
  },
  es: {
    badge: "Configuración Inicial", title: "Configuración de Latchsend",
    description: "Completa la configuración inicial para continuar a la pantalla de inicio de sesión.",
    siteName: "Nombre del Sitio", defaultLanguage: "Idioma Predeterminado",
    adminUsername: "Usuario Administrador", adminPassword: "Contraseña de Administrador",
    appPort: "Puerto de la Aplicación", baseUrl: "URL Base", storageQuota: "Cuota de Almacenamiento (GB)",
    warning: "No dejes vacías las credenciales de administrador antes de continuar.",
    completeSetup: "Completar Configuración", continueDefault: "Continuar con Valores Predeterminados", saving: "Guardando...",
    theme: "Tema", themeSystem: "Usar ajuste del dispositivo", themeDark: "Siempre oscuro", themeLight: "Siempre claro",
    themeSystemUnsupported: "Usar ajuste del dispositivo (no compatible)",
    stepInstance: "Instancia", stepAdmin: "Administrador", stepLimits: "Límites", stepReview: "Revisión",
    instanceSub: "Nombre del sitio y URL", adminSub: "Crear la primera cuenta",
    limitsSub: "Cuota y límites de subida", reviewSub: "Confirmar y terminar",
    back: "← Atrás", continueBtn: "Continuar →", finishSetup: "Finalizar configuración",
    systemQuota: "Cuota del sistema", perUserCap: "Límite de subida por usuario",
    perUserCapLabel: "Límite por usuario",
    reviewReady: "La configuración se bloqueará después de este paso. Guarda la contraseña de administrador.",
    adminWarning: "Completa las credenciales antes de pasar a producción.",
  },
  fr: {
    badge: "Configuration Initiale", title: "Configuration de Latchsend",
    description: "Terminez la configuration initiale pour continuer vers l'écran de connexion.",
    siteName: "Nom du Site", defaultLanguage: "Langue par Défaut",
    adminUsername: "Nom d'Utilisateur Admin", adminPassword: "Mot de Passe Admin",
    appPort: "Port de l'Application", baseUrl: "URL de Base", storageQuota: "Quota de Stockage (GB)",
    warning: "Ne laissez pas les identifiants administrateur vides avant de continuer.",
    completeSetup: "Terminer la Configuration", continueDefault: "Continuer avec les Valeurs par Défaut", saving: "Enregistrement...",
    theme: "Thème", themeSystem: "Utiliser le réglage de l'appareil", themeDark: "Toujours sombre", themeLight: "Toujours clair",
    themeSystemUnsupported: "Utiliser le réglage de l'appareil (non pris en charge)",
    stepInstance: "Instance", stepAdmin: "Administrateur", stepLimits: "Limites", stepReview: "Révision",
    instanceSub: "Nom du site et URL", adminSub: "Créer le premier compte",
    limitsSub: "Quota et limites d'upload", reviewSub: "Confirmer et terminer",
    back: "← Retour", continueBtn: "Continuer →", finishSetup: "Terminer la configuration",
    systemQuota: "Quota système", perUserCap: "Limite d'upload par utilisateur",
    perUserCapLabel: "Limite par utilisateur",
    reviewReady: "La configuration sera verrouillée après cette étape. Notez votre mot de passe administrateur.",
    adminWarning: "Remplissez les identifiants avant de passer en production.",
  },
  hi: {
    badge: "प्रारंभिक सेटअप", title: "Latchsend सेटअप",
    description: "लॉगिन स्क्रीन पर जाने के लिए शुरुआती सेटअप पूरा करें।",
    siteName: "साइट नाम", defaultLanguage: "डिफ़ॉल्ट भाषा",
    adminUsername: "एडमिन उपयोगकर्ता नाम", adminPassword: "एडमिन पासवर्ड",
    appPort: "एप्लिकेशन पोर्ट", baseUrl: "बेस URL", storageQuota: "स्टोरेज कोटा (GB)",
    warning: "आगे बढ़ने से पहले एडमिन जानकारी भरें।",
    completeSetup: "सेटअप पूरा करें", continueDefault: "डिफ़ॉल्ट के साथ जारी रखें", saving: "सेव हो रहा है...",
    theme: "थीम", themeSystem: "डिवाइस के अनुसार", themeDark: "हमेशा डार्क", themeLight: "हमेशा लाइट",
    themeSystemUnsupported: "डिवाइस के अनुसार (समर्थन नहीं)",
    stepInstance: "इंस्टेंस", stepAdmin: "एडमिन", stepLimits: "सीमाएं", stepReview: "समीक्षा",
    instanceSub: "साइट नाम और URL", adminSub: "पहला खाता बनाएं",
    limitsSub: "कोटा और अपलोड सीमाएं", reviewSub: "पुष्टि करें और समाप्त करें",
    back: "← वापस", continueBtn: "जारी →", finishSetup: "सेटअप समाप्त करें",
    systemQuota: "सिस्टम कोटा", perUserCap: "प्रति उपयोगकर्ता अपलोड सीमा",
    perUserCapLabel: "प्रति उपयोगकर्ता",
    reviewReady: "इस चरण के बाद सेटअप लॉक हो जाएगा। एडमिन पासवर्ड नोट करें।",
    adminWarning: "प्रोडक्शन में जाने से पहले एडमिन क्रेडेंशियल भरें।",
  },
  "zh-CN": {
    badge: "首次设置", title: "Latchsend 设置",
    description: "完成初始配置后即可继续进入登录界面。",
    siteName: "站点名称", defaultLanguage: "默认语言",
    adminUsername: "管理员用户名", adminPassword: "管理员密码",
    appPort: "应用端口", baseUrl: "基础 URL", storageQuota: "存储配额 (GB)",
    warning: "继续之前请填写管理员信息。",
    completeSetup: "完成设置", continueDefault: "使用默认值继续", saving: "保存中...",
    theme: "主题", themeSystem: "跟随设备", themeDark: "始终深色", themeLight: "始终浅色",
    themeSystemUnsupported: "跟随设备（设备不支持）",
    stepInstance: "实例", stepAdmin: "管理员", stepLimits: "限制", stepReview: "审查",
    instanceSub: "站点名称和URL", adminSub: "创建第一个账户",
    limitsSub: "配额和上传限制", reviewSub: "确认并完成",
    back: "← 返回", continueBtn: "继续 →", finishSetup: "完成设置",
    systemQuota: "系统配额", perUserCap: "每用户上传上限",
    perUserCapLabel: "每用户上限",
    reviewReady: "此步骤后设置将被锁定。请记录管理员密码。",
    adminWarning: "进入生产环境前请填写管理员凭据。",
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

function PasswordStrength({ pw }: { pw: string }) {
  const score = Math.min(4, [
    pw.length >= 8, pw.length >= 12,
    /[A-Z]/.test(pw) && /[a-z]/.test(pw),
    /\d/.test(pw), /[^A-Za-z0-9]/.test(pw),
  ].filter(Boolean).length);
  const labels = ["—", "Weak", "Fair", "Good", "Strong"];
  const colors = ["var(--fg-3)", "var(--err)", "var(--warn)", "var(--info)", "var(--ok)"];
  return (
    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", gap: 3, flex: 1 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: score >= i ? colors[score] : "var(--bg-3)",
          }} />
        ))}
      </div>
      <span className="mono" style={{ fontSize: 11, color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

export default function SetupPage() {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("en");
  const [themePref, setThemePref] = useState<ThemePref>("dark");
  const [systemSupported, setSystemSupported] = useState(false);
  const [systemIsDark, setSystemIsDark] = useState(true);

  const [step, setStep] = useState(1);
  const [siteName, setSiteName] = useState("Latchsend");
  const [baseUrl, setBaseUrl] = useState("");
  const [adminUsername, setAdminUsername] = useState("admin");
  const [adminPassword, setAdminPassword] = useState("admin");
  const [appPort, setAppPort] = useState("3000");
  const [storageQuotaGB, setStorageQuotaGB] = useState("20");
  const [perUserGB, setPerUserGB] = useState("4");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      window.localStorage.setItem("latchsend_theme", "dark"); return;
    }
    window.localStorage.setItem("latchsend_theme", themePref);
  }, [themePref, systemSupported]);

  const effectiveDark = themePref === "dark" ? true : themePref === "light" ? false : systemIsDark;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", effectiveDark ? "dark" : "light");
  }, [effectiveDark]);

  const t = useMemo(() => translations[lang], [lang]);

  const THEME_OPTIONS = [
    { value: "system" as ThemePref, label: systemSupported ? t.themeSystem : t.themeSystemUnsupported, disabled: !systemSupported },
    { value: "dark" as ThemePref, label: t.themeDark },
    { value: "light" as ThemePref, label: t.themeLight },
  ];

  const steps = [
    { n: 1, t: t.stepInstance, d: t.instanceSub },
    { n: 2, t: t.stepAdmin, d: t.adminSub },
    { n: 3, t: t.stepLimits, d: t.limitsSub },
    { n: 4, t: t.stepReview, d: t.reviewSub },
  ];

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
        setErrorMessage("Zorunlu alanları doldur."); setIsSaving(false); return;
      }

      const response = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName: finalSiteName, baseUrl: finalBaseUrl,
          defaultLanguage: lang,
          adminUsername: finalAdminUsername, adminPassword: finalAdminPassword,
          appPort: finalAppPort, storageQuotaGB: finalStorageQuotaGB,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setErrorMessage(result.error || "Kurulum başarısız oldu.");
        setIsSaving(false); return;
      }
      router.push("/login");
    } catch {
      setErrorMessage("Kurulum sırasında bir hata oluştu.");
      setIsSaving(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-0)", padding: 40, position: "relative",
    }}>
      {/* Grid backdrop */}
      <div className="grid-bg" style={{
        position: "absolute", inset: 0,
        maskImage: "radial-gradient(circle at center, black 20%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(circle at center, black 20%, transparent 70%)",
      }} />

      <div style={{ width: "100%", maxWidth: 800, position: "relative" }}>
        {/* Logo + lang/theme */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "var(--accent)" }}><LockIcon s={20} /></span>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Latchsend</span>
            <span className="label" style={{ marginLeft: 8 }}>· {t.badge}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <select className="select" value={lang} onChange={(e) => setLang(e.target.value as Lang)} style={{ width: 130, height: 30, fontSize: 12 }}>
              {LANG_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.flag} {o.label}</option>
              ))}
            </select>
            <select className="select" value={themePref} onChange={(e) => setThemePref(e.target.value as ThemePref)} style={{ width: 100, height: 30, fontSize: 12 }}>
              {THEME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          {/* Step rail */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1, background: "var(--line)", borderBottom: "1px solid var(--line)",
          }}>
            {steps.map((s) => {
              const done = s.n < step;
              const active = s.n === step;
              return (
                <div key={s.n} style={{ background: active ? "var(--bg-2)" : "var(--bg-1)", padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                      background: done ? "var(--ok)" : active ? "var(--accent)" : "var(--bg-3)",
                      color: done || active ? "var(--bg-0)" : "var(--fg-2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10.5, fontWeight: 700, fontFamily: "var(--mono)",
                    }}>
                      {done ? "✓" : s.n}
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: active ? "var(--fg-0)" : "var(--fg-1)" }}>{s.t}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 2, marginLeft: 28 }}>{s.d}</div>
                </div>
              );
            })}
          </div>

          {/* Step content */}
          <div style={{ padding: 28 }}>
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Name your instance</h2>
                <p style={{ margin: 0, fontSize: 13, color: "var(--fg-2)" }}>Shown to recipients on every download page.</p>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>{t.siteName}</div>
                  <input className="input" value={siteName} onChange={(e) => setSiteName(e.target.value)} style={{ height: 42 }} />
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>{t.baseUrl}</div>
                  <input className="input mono" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://files.example.com" style={{ height: 42 }} />
                  <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 6 }}>Used to construct absolute share links.</div>
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>{t.appPort}</div>
                  <input className="input mono" value={appPort} onChange={(e) => setAppPort(e.target.value)} placeholder="3000" style={{ height: 42 }} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Create the administrator</h2>
                <p style={{ margin: 0, fontSize: 13, color: "var(--fg-2)" }}>This account can manage users, settings, and bypass file-type rules.</p>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>{t.adminUsername}</div>
                  <input className="input" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} placeholder="admin" style={{ height: 42 }} />
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>{t.adminPassword}</div>
                  <input className="input mono" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="At least 12 characters" style={{ height: 42 }} />
                  <PasswordStrength pw={adminPassword} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Storage limits</h2>
                <p style={{ margin: 0, fontSize: 13, color: "var(--fg-2)" }}>Enforced at upload time. Adjustable later in settings.</p>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>{t.systemQuota} — {storageQuotaGB} GB</div>
                  <input type="range" min={1} max={200} value={storageQuotaGB} onChange={(e) => setStorageQuotaGB(e.target.value)}
                    style={{ width: "100%", accentColor: "oklch(0.78 0.16 70)" }} />
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>{t.perUserCap} — {perUserGB} GB</div>
                  <input type="range" min={0.1} max={10} step={0.1} value={perUserGB} onChange={(e) => setPerUserGB(e.target.value)}
                    style={{ width: "100%", accentColor: "oklch(0.78 0.16 70)" }} />
                </div>
              </div>
            )}

            {step === 4 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Review</h2>
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1,
                  background: "var(--line)", border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden",
                }}>
                  {[
                    [t.siteName, siteName],
                    [t.baseUrl, baseUrl || "—"],
                    [t.adminUsername, adminUsername || "—"],
                    [t.systemQuota, `${storageQuotaGB} GB`],
                    [t.perUserCapLabel, `${perUserGB} GB`],
                    [t.appPort, appPort],
                  ].map(([k, v], i) => (
                    <div key={i} style={{ background: "var(--bg-1)", padding: "12px 16px" }}>
                      <div className="label">{k}</div>
                      <div className="mono" style={{ fontSize: 13, color: "var(--fg-0)", marginTop: 3 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{
                  padding: "10px 12px", borderRadius: 8,
                  background: "var(--accent-soft)", color: "var(--accent)",
                  fontSize: 12, display: "flex", gap: 8, alignItems: "flex-start",
                }}>
                  <ShieldIcon s={14} />
                  <span>{t.reviewReady}</span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div style={{
                marginTop: 16, padding: "10px 14px", borderRadius: 8,
                background: "var(--err-soft)", color: "var(--err)", fontSize: 13,
              }}>
                {errorMessage}
              </div>
            )}
          </div>

          {/* Navigation footer */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            padding: "14px 28px", borderTop: "1px solid var(--line)",
            background: "var(--bg-0)", gap: 12,
          }}>
            <button className="btn btn-quiet btn-sm" disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              style={{ opacity: step === 1 ? 0.4 : 1 }}>
              {t.back}
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              {step < 4 ? (
                <button className="btn btn-accent btn-sm" onClick={() => setStep((s) => s + 1)}>
                  {t.continueBtn}
                </button>
              ) : (
                <>
                  <button className="btn btn-quiet btn-sm" onClick={() => handleSetup(true)} disabled={isSaving}>
                    {isSaving ? t.saving : t.continueDefault}
                  </button>
                  <button className="btn btn-accent btn-sm" onClick={() => handleSetup(false)} disabled={isSaving}>
                    {isSaving ? t.saving : t.finishSetup}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
