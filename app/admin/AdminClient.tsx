"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Lang = "en" | "tr" | "es" | "fr" | "hi" | "zh-CN";
type ThemePref = "system" | "dark" | "light";
type UserRole = "ADMIN" | "USER";
type UserStatus = "PENDING" | "ACTIVE" | "DISABLED";

type UserRow = {
  id: string;
  username: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  maxUploadBytes: string;
  preferredLanguage: string | null;
  createdAt: string;
};

const LANG_OPTIONS: Array<{ value: Lang; label: string; flag: string }> = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "tr", label: "Türkçe", flag: "🇹🇷" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { value: "zh-CN", label: "简体中文", flag: "🇨🇳" },
];

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

function bytesToGBString(bytesString: string) {
  const bytes = Number(bytesString);
  if (!Number.isFinite(bytes)) return "0";
  return String(Math.round((bytes / 1024 / 1024 / 1024) * 100) / 100);
}

const translations: Record<
  Lang,
  {
    toggleOn: string;
    toggleOff: string;
    currentState: string;

    badge: string;
    title: string;
    subtitle: string;
    language: string;
    theme: string;
    themeSystem: string;
    themeDark: string;
    themeLight: string;
    themeSystemUnsupported: string;
    logout: string;

    generalTitle: string;
    rulesTitle: string;
    usersTitle: string;

    siteName: string;
    baseUrl: string;
    defaultLanguage: string;
    guestLocalShare: string;
    guestLocalShareDesc: string;

    storageQuota: string;
    defaultUserMaxUpload: string;
    linkTtl: string;
    autoDelete: string;
    adminBypass: string;
    allowedExtensions: string;
    allowedExtensionsHint: string;

    saveSettings: string;
    saving: string;
    settingsSaved: string;
    settingsFailed: string;

    addUser: string;
    loadingUsers: string;
    createUser: string;
    userCreated: string;
    userCreateFailed: string;
    refreshUsers: string;

    username: string;
    email: string;
    password: string;
    role: string;
    status: string;
    userMaxUpload: string;
    createButton: string;

    usersList: string;
    noUsers: string;
    back: string;
  }
> = {
  en: {
    toggleOn: "Enabled",
    toggleOff: "Disabled",
    currentState: "Current state",

    badge: "Admin",
    title: "System Settings",
    subtitle: "Manage system rules, upload policy, and users.",
    language: "Language",
    theme: "Theme",
    themeSystem: "Use device setting",
    themeDark: "Always dark",
    themeLight: "Always light",
    themeSystemUnsupported: "Use device setting (device not supported)",
    logout: "Log out",

    generalTitle: "General Settings",
    rulesTitle: "Upload Rules",
    usersTitle: "User Management",

    siteName: "Site Name",
    baseUrl: "Base URL",
    defaultLanguage: "Default Language",
    guestLocalShare: "Guest Local Share",
    guestLocalShareDesc:
      "Allow local-share access without login. Cloud remains login-only.",

    storageQuota: "Storage Quota (GB)",
    defaultUserMaxUpload: "Default User Max Upload (GB)",
    linkTtl: "Default Link TTL (Hours)",
    autoDelete: "Auto Delete",
    adminBypass: "Admin Bypass File Rules",
    allowedExtensions: "Allowed Extensions",
    allowedExtensionsHint: "Comma separated. Example: jpg,png,pdf,txt",

    saveSettings: "Save Settings",
    saving: "Saving...",
    settingsSaved: "Settings saved.",
    settingsFailed: "Could not save settings.",

    addUser: "Add User",
    loadingUsers: "Loading users...",
    createUser: "Create User",
    userCreated: "User created.",
    userCreateFailed: "Could not create user.",
    refreshUsers: "Refresh Users",

    username: "Username",
    email: "Email",
    password: "Password",
    role: "Role",
    status: "Status",
    userMaxUpload: "Max Upload (GB)",
    createButton: "Create",

    usersList: "Users List",
    noUsers: "No users found.",
    back: "Back to Dashboard",
  },

  tr: {
    toggleOn: "Açık",
    toggleOff: "Kapalı",
    currentState: "Şu an",

    badge: "Admin",
    title: "Sistem Ayarları",
    subtitle: "Sistem kurallarını, yükleme politikasını ve kullanıcıları yönet.",
    language: "Dil",
    theme: "Tema",
    themeSystem: "Cihaza göre",
    themeDark: "Hep siyah",
    themeLight: "Hep beyaz",
    themeSystemUnsupported: "Cihaza göre (cihaz desteklemiyor)",
    logout: "Çıkış Yap",

    generalTitle: "Genel Ayarlar",
    rulesTitle: "Yükleme Kuralları",
    usersTitle: "Kullanıcı Yönetimi",

    siteName: "Site Adı",
    baseUrl: "Base URL",
    defaultLanguage: "Varsayılan Dil",
    guestLocalShare: "Girişsiz Yerel Paylaşım",
    guestLocalShareDesc:
      "Yerel paylaşımı girişsiz açar. Bulut tarafı yine giriş ister.",

    storageQuota: "Depolama Kotası (GB)",
    defaultUserMaxUpload: "Varsayılan Kullanıcı Max Yükleme (GB)",
    linkTtl: "Varsayılan Link Süresi (Saat)",
    autoDelete: "Otomatik Silme",
    adminBypass: "Admin Dosya Kurallarını Aşsın",
    allowedExtensions: "İzinli Uzantılar",
    allowedExtensionsHint: "Virgülle ayır. Örnek: jpg,png,pdf,txt",

    saveSettings: "Ayarları Kaydet",
    saving: "Kaydediliyor...",
    settingsSaved: "Ayarlar kaydedildi.",
    settingsFailed: "Ayarlar kaydedilemedi.",

    addUser: "Kullanıcı Ekle",
    loadingUsers: "Kullanıcılar yükleniyor...",
    createUser: "Kullanıcı Oluştur",
    userCreated: "Kullanıcı oluşturuldu.",
    userCreateFailed: "Kullanıcı oluşturulamadı.",
    refreshUsers: "Kullanıcıları Yenile",

    username: "Kullanıcı Adı",
    email: "E-posta",
    password: "Şifre",
    role: "Rol",
    status: "Durum",
    userMaxUpload: "Max Yükleme (GB)",
    createButton: "Oluştur",

    usersList: "Kullanıcı Listesi",
    noUsers: "Kullanıcı bulunamadı.",
    back: "Dashboard'a Dön",
  },

  es: {
    toggleOn: "Activado",
    toggleOff: "Desactivado",
    currentState: "Estado actual",

    badge: "Admin",
    title: "Configuración del Sistema",
    subtitle: "Gestiona reglas, política de subida y usuarios.",
    language: "Idioma",
    theme: "Tema",
    themeSystem: "Usar ajuste del dispositivo",
    themeDark: "Siempre oscuro",
    themeLight: "Siempre claro",
    themeSystemUnsupported: "Usar ajuste del dispositivo (no compatible)",
    logout: "Cerrar sesión",

    generalTitle: "Configuración General",
    rulesTitle: "Reglas de Subida",
    usersTitle: "Gestión de Usuarios",

    siteName: "Nombre del Sitio",
    baseUrl: "URL Base",
    defaultLanguage: "Idioma Predeterminado",
    guestLocalShare: "Compartir Local sin Inicio",
    guestLocalShareDesc:
      "Permite compartir local sin login. La nube sigue siendo solo con login.",

    storageQuota: "Cuota de Almacenamiento (GB)",
    defaultUserMaxUpload: "Subida Máxima por Usuario (GB)",
    linkTtl: "TTL por Defecto (Horas)",
    autoDelete: "Borrado Automático",
    adminBypass: "Admin Omite Reglas",
    allowedExtensions: "Extensiones Permitidas",
    allowedExtensionsHint: "Separadas por comas. Ej: jpg,png,pdf,txt",

    saveSettings: "Guardar Configuración",
    saving: "Guardando...",
    settingsSaved: "Configuración guardada.",
    settingsFailed: "No se pudo guardar.",

    addUser: "Añadir Usuario",
    loadingUsers: "Cargando usuarios...",
    createUser: "Crear Usuario",
    userCreated: "Usuario creado.",
    userCreateFailed: "No se pudo crear el usuario.",
    refreshUsers: "Actualizar Usuarios",

    username: "Usuario",
    email: "Correo",
    password: "Contraseña",
    role: "Rol",
    status: "Estado",
    userMaxUpload: "Máx. Subida (GB)",
    createButton: "Crear",

    usersList: "Lista de Usuarios",
    noUsers: "No hay usuarios.",
    back: "Volver al Panel",
  },

  fr: {
    toggleOn: "Activé",
    toggleOff: "Désactivé",
    currentState: "État actuel",

    badge: "Admin",
    title: "Paramètres Système",
    subtitle: "Gérez les règles, les uploads et les utilisateurs.",
    language: "Langue",
    theme: "Thème",
    themeSystem: "Utiliser le réglage de l’appareil",
    themeDark: "Toujours sombre",
    themeLight: "Toujours clair",
    themeSystemUnsupported:
      "Utiliser le réglage de l’appareil (non pris en charge)",
    logout: "Déconnexion",

    generalTitle: "Paramètres Généraux",
    rulesTitle: "Règles d’Upload",
    usersTitle: "Gestion des Utilisateurs",

    siteName: "Nom du Site",
    baseUrl: "URL de Base",
    defaultLanguage: "Langue par Défaut",
    guestLocalShare: "Partage Local Invité",
    guestLocalShareDesc:
      "Autorise le partage local sans connexion. Le cloud reste réservé aux comptes connectés.",

    storageQuota: "Quota de Stockage (GB)",
    defaultUserMaxUpload: "Upload Max Utilisateur (GB)",
    linkTtl: "TTL du Lien (Heures)",
    autoDelete: "Suppression Automatique",
    adminBypass: "Admin Ignore les Règles",
    allowedExtensions: "Extensions Autorisées",
    allowedExtensionsHint: "Séparées par des virgules. Ex: jpg,png,pdf,txt",

    saveSettings: "Enregistrer",
    saving: "Enregistrement...",
    settingsSaved: "Paramètres enregistrés.",
    settingsFailed: "Impossible d’enregistrer.",

    addUser: "Ajouter un Utilisateur",
    loadingUsers: "Chargement des utilisateurs...",
    createUser: "Créer un Utilisateur",
    userCreated: "Utilisateur créé.",
    userCreateFailed: "Impossible de créer l’utilisateur.",
    refreshUsers: "Rafraîchir",

    username: "Nom d’utilisateur",
    email: "Email",
    password: "Mot de passe",
    role: "Rôle",
    status: "Statut",
    userMaxUpload: "Upload Max (GB)",
    createButton: "Créer",

    usersList: "Liste des Utilisateurs",
    noUsers: "Aucun utilisateur.",
    back: "Retour au tableau de bord",
  },

  hi: {
    toggleOn: "चालू",
    toggleOff: "बंद",
    currentState: "वर्तमान स्थिति",

    badge: "एडमिन",
    title: "सिस्टम सेटिंग्स",
    subtitle: "नियम, अपलोड नीति और यूज़र प्रबंधन करें।",
    language: "भाषा",
    theme: "थीम",
    themeSystem: "डिवाइस के अनुसार",
    themeDark: "हमेशा डार्क",
    themeLight: "हमेशा लाइट",
    themeSystemUnsupported: "डिवाइस के अनुसार (समर्थन नहीं)",
    logout: "लॉग आउट",

    generalTitle: "सामान्य सेटिंग्स",
    rulesTitle: "अपलोड नियम",
    usersTitle: "यूज़र प्रबंधन",

    siteName: "साइट नाम",
    baseUrl: "बेस URL",
    defaultLanguage: "डिफ़ॉल्ट भाषा",
    guestLocalShare: "गेस्ट लोकल शेयर",
    guestLocalShareDesc:
      "लोकल शेयर को बिना लॉगिन उपलब्ध करें। क्लाउड फीचर फिर भी लॉगिन-आधारित रहेंगे।",

    storageQuota: "स्टोरेज कोटा (GB)",
    defaultUserMaxUpload: "डिफ़ॉल्ट यूज़र मैक्स अपलोड (GB)",
    linkTtl: "डिफ़ॉल्ट लिंक समय (घंटे)",
    autoDelete: "ऑटो डिलीट",
    adminBypass: "एडमिन नियमों को बायपास करे",
    allowedExtensions: "अनुमत एक्सटेंशन",
    allowedExtensionsHint: "कॉमा से अलग करें। उदाहरण: jpg,png,pdf,txt",

    saveSettings: "सेटिंग्स सेव करें",
    saving: "सेव हो रहा है...",
    settingsSaved: "सेटिंग्स सेव हो गईं।",
    settingsFailed: "सेटिंग्स सेव नहीं हो सकीं।",

    addUser: "यूज़र जोड़ें",
    loadingUsers: "यूज़र लोड हो रहे हैं...",
    createUser: "यूज़र बनाएं",
    userCreated: "यूज़र बन गया।",
    userCreateFailed: "यूज़र नहीं बन सका।",
    refreshUsers: "यूज़र रिफ्रेश करें",

    username: "यूज़रनेम",
    email: "ईमेल",
    password: "पासवर्ड",
    role: "रोल",
    status: "स्थिति",
    userMaxUpload: "मैक्स अपलोड (GB)",
    createButton: "बनाएं",

    usersList: "यूज़र सूची",
    noUsers: "कोई यूज़र नहीं मिला।",
    back: "डैशबोर्ड पर लौटें",
  },

  "zh-CN": {
    toggleOn: "已启用",
    toggleOff: "已禁用",
    currentState: "当前状态",

    badge: "管理",
    title: "系统设置",
    subtitle: "管理规则、上传策略和用户。",
    language: "语言",
    theme: "主题",
    themeSystem: "跟随设备",
    themeDark: "始终深色",
    themeLight: "始终浅色",
    themeSystemUnsupported: "跟随设备（设备不支持）",
    logout: "退出登录",

    generalTitle: "常规设置",
    rulesTitle: "上传规则",
    usersTitle: "用户管理",

    siteName: "站点名称",
    baseUrl: "基础 URL",
    defaultLanguage: "默认语言",
    guestLocalShare: "免登录本地分享",
    guestLocalShareDesc:
      "允许不登录使用本地分享。云功能仍然需要登录。",

    storageQuota: "存储配额 (GB)",
    defaultUserMaxUpload: "默认用户最大上传 (GB)",
    linkTtl: "默认链接时长 (小时)",
    autoDelete: "自动删除",
    adminBypass: "管理员绕过规则",
    allowedExtensions: "允许的扩展名",
    allowedExtensionsHint: "用逗号分隔，例如：jpg,png,pdf,txt",

    saveSettings: "保存设置",
    saving: "保存中...",
    settingsSaved: "设置已保存。",
    settingsFailed: "设置保存失败。",

    addUser: "添加用户",
    loadingUsers: "正在加载用户...",
    createUser: "创建用户",
    userCreated: "用户已创建。",
    userCreateFailed: "无法创建用户。",
    refreshUsers: "刷新用户",

    username: "用户名",
    email: "邮箱",
    password: "密码",
    role: "角色",
    status: "状态",
    userMaxUpload: "最大上传 (GB)",
    createButton: "创建",

    usersList: "用户列表",
    noUsers: "没有用户。",
    back: "返回控制台",
  },
};

export default function AdminClient({
  initialAllowGuestLocalShare,
}: {
  initialAllowGuestLocalShare: boolean;
}) {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("en");
  const [themePref, setThemePref] = useState<ThemePref>("dark");
  const [systemSupported, setSystemSupported] = useState(false);
  const [systemIsDark, setSystemIsDark] = useState(true);

  const [siteName, setSiteName] = useState("Latchsend");
  const [baseUrl, setBaseUrl] = useState("");
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [publicPort, setPublicPort] = useState("443");
  const [wsPath, setWsPath] = useState("/ws");
  const [allowGuestLocalShare, setAllowGuestLocalShare] = useState(
    initialAllowGuestLocalShare
  );

  const [storageQuotaGB, setStorageQuotaGB] = useState("20");
  const [defaultUserMaxUploadGB, setDefaultUserMaxUploadGB] = useState("4");
  const [defaultLinkTtlHours, setDefaultLinkTtlHours] = useState("24");
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(true);
  const [adminBypassFileTypeRules, setAdminBypassFileTypeRules] =
    useState(true);
  const [allowedExtensions, setAllowedExtensions] = useState(
    "jpg,jpeg,png,webp,gif,txt,csv,pdf"
  );

  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("USER");
  const [newStatus, setNewStatus] = useState<UserStatus>("ACTIVE");
  const [newPreferredLanguage, setNewPreferredLanguage] = useState("en");
  const [newMaxUploadGB, setNewMaxUploadGB] = useState("4");

  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);

  useEffect(() => {
    setLang(detectInitialLanguage());

    const supported = hasSystemThemeSupport();
    setSystemSupported(supported);
    setSystemIsDark(getSystemIsDark());

    const savedTheme = window.localStorage.getItem(
      "latchsend_theme"
    ) as ThemePref | null;

    if (savedTheme === "dark" || savedTheme === "light") {
      setThemePref(savedTheme);
    } else if (savedTheme === "system" && supported) {
      setThemePref("system");
    } else {
      setThemePref(supported ? "system" : "dark");
    }

    if (!supported) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event: MediaQueryListEvent) =>
      setSystemIsDark(event.matches);

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

  const pageBg = effectiveDark
    ? "bg-black text-white"
    : "bg-zinc-100 text-zinc-950";
  const muted = effectiveDark ? "text-zinc-400" : "text-zinc-600";
  const card = effectiveDark
    ? "border-white/10 bg-white/5"
    : "border-black/10 bg-white";
  const input = effectiveDark
    ? "border-white/10 bg-black/40 text-white placeholder:text-zinc-500 focus:border-white/25"
    : "border-black/10 bg-white text-zinc-950 placeholder:text-zinc-400 focus:border-black/25";
  const buttonPrimary = effectiveDark
    ? "bg-white text-black hover:opacity-90"
    : "bg-zinc-950 text-white hover:opacity-90";
  const buttonSecondary = effectiveDark
    ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
    : "border-black/10 bg-zinc-50 text-zinc-950 hover:bg-zinc-100";
  const tableRow = effectiveDark ? "border-white/10" : "border-black/10";

  const statusBoxOk = effectiveDark
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
    : "border-emerald-600/20 bg-emerald-100 text-emerald-800";

  const statusBoxErr = effectiveDark
    ? "border-red-500/20 bg-red-500/10 text-red-200"
    : "border-red-600/20 bg-red-100 text-red-800";

  useEffect(() => {
    loadSettings();
    loadUsers();
  }, []);

  async function loadSettings() {
    try {
      const response = await fetch("/api/admin/settings", {
        credentials: "include",
      });

      if (!response.ok) return;

      const data = await response.json();

      setSiteName(data.siteName ?? "Latchsend");
      setBaseUrl(data.baseUrl ?? "");
      setDefaultLanguage(data.defaultLanguage ?? "en");
      setPublicPort(String(data.publicPort ?? 443));
      setWsPath(String(data.wsPath ?? "/ws"));
      setAllowGuestLocalShare(!!data.allowGuestLocalShare);
      setStorageQuotaGB(bytesToGBString(data.storageQuotaBytes));
      setDefaultUserMaxUploadGB(
        bytesToGBString(data.defaultUserMaxUploadBytes)
      );
      setDefaultLinkTtlHours(String(data.defaultLinkTtlHours ?? 24));
      setAutoDeleteEnabled(!!data.autoDeleteEnabled);
      setAdminBypassFileTypeRules(!!data.adminBypassFileTypeRules);

      const ext =
        typeof data.allowedExtensions === "string"
          ? data.allowedExtensions
          : "";

      try {
        const parsed = JSON.parse(ext);
        if (Array.isArray(parsed)) {
          setAllowedExtensions(parsed.join(","));
        } else {
          setAllowedExtensions(ext);
        }
      } catch {
        setAllowedExtensions(ext);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadUsers() {
    setUsersLoading(true);

    try {
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      });

      if (!response.ok) {
        setUsers([]);
        setUsersLoading(false);
        return;
      }

      const data = await response.json();
      setUsers(data.users ?? []);
      setUsersLoading(false);
    } catch (e) {
      console.error(e);
      setUsers([]);
      setUsersLoading(false);
    }
  }

  async function handleSaveSettings() {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName,
          baseUrl,
          defaultLanguage,
          publicPort: Number(publicPort),
wsPath,
          storageQuotaGB: Number(storageQuotaGB),
          defaultUserMaxUploadGB: Number(defaultUserMaxUploadGB),
          defaultLinkTtlHours: Number(defaultLinkTtlHours),
          autoDeleteEnabled,
          allowedExtensions: JSON.stringify(
            allowedExtensions
              .split(",")
              .map((s) => s.trim().toLowerCase())
              .filter(Boolean)
          ),
          adminBypassFileTypeRules,
          allowGuestLocalShare,
        }),
      });

      if (!response.ok) {
        setStatusMessage({ kind: "err", text: t.settingsFailed });
        setIsSaving(false);
        return;
      }

      setStatusMessage({ kind: "ok", text: t.settingsSaved });
      setIsSaving(false);
      await loadSettings();
    } catch (e) {
      console.error(e);
      setStatusMessage({ kind: "err", text: t.settingsFailed });
      setIsSaving(false);
    }
  }

  async function handleCreateUser() {
    setIsCreatingUser(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
          password: newPassword,
          role: newRole,
          status: newStatus,
          preferredLanguage: newPreferredLanguage,
          maxUploadGB: Number(newMaxUploadGB),
        }),
      });

      if (!response.ok) {
        setStatusMessage({ kind: "err", text: t.userCreateFailed });
        setIsCreatingUser(false);
        return;
      }

      setNewUsername("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("USER");
      setNewStatus("ACTIVE");
      setNewPreferredLanguage("en");
      setNewMaxUploadGB("4");

      setStatusMessage({ kind: "ok", text: t.userCreated });
      setIsCreatingUser(false);
      await loadUsers();
    } catch (e) {
      console.error(e);
      setStatusMessage({ kind: "err", text: t.userCreateFailed });
      setIsCreatingUser(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error(e);
    } finally {
      window.location.replace("/login");
    }
  }

  return (
    <main className={`min-h-screen px-6 py-12 transition-colors ${pageBg}`}>
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p
              className={`mb-2 text-xs font-medium uppercase tracking-[0.28em] ${muted}`}
            >
              {t.badge}
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {t.title}
            </h1>
            <p
              className={`mt-3 max-w-2xl text-sm leading-6 md:text-base ${muted}`}
            >
              {t.subtitle}
            </p>
          </div>

          <div className="grid w-full gap-4 md:w-[29rem] md:grid-cols-2">
            <div>
              <label className="mb-2 block text-right text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
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
              <label className="mb-2 block text-right text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
                {t.theme}
              </label>
              <select
                value={themePref}
                onChange={(e) => setThemePref(e.target.value as ThemePref)}
                className={`h-12 w-full appearance-none rounded-2xl border px-4 text-sm font-medium outline-none ${input}`}
              >
                <option value="system" disabled={!systemSupported}>
                  {systemSupported
                    ? t.themeSystem
                    : t.themeSystemUnsupported}
                </option>
                <option value="dark">{t.themeDark}</option>
                <option value="light">{t.themeLight}</option>
              </select>
            </div>

            <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className={`inline-flex h-12 flex-1 items-center justify-center rounded-2xl border px-6 text-sm font-semibold transition ${buttonSecondary}`}
              >
                {t.back}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className={`inline-flex h-12 flex-1 items-center justify-center rounded-2xl border px-6 text-sm font-semibold transition ${buttonSecondary}`}
              >
                {t.logout}
              </button>
            </div>
          </div>
        </div>

        {statusMessage ? (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm ${
              statusMessage.kind === "ok" ? statusBoxOk : statusBoxErr
            }`}
          >
            {statusMessage.text}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <section
            className={`rounded-3xl border p-8 shadow-2xl backdrop-blur-sm transition-colors ${card}`}
          >
            <h2 className="text-xl font-semibold">{t.generalTitle}</h2>

            <div className="mt-6 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.siteName}
                </label>
                <input
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.baseUrl}
                </label>
                <input
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
                />
              </div>
<div>
  <label className="mb-2 block text-sm font-medium">Public Port</label>
  <input
    type="number"
    min="1"
    max="65535"
    value={publicPort}
    onChange={(e) => setPublicPort(e.target.value)}
    className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
  />
  <p className={`mt-2 text-xs ${muted}`}>Genelde 443 (HTTPS).</p>
</div>

<div>
  <label className="mb-2 block text-sm font-medium">WS Path</label>
  <input
    value={wsPath}
    onChange={(e) => setWsPath(e.target.value)}
    placeholder="/ws"
    className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
  />
  <p className={`mt-2 text-xs ${muted}`}>Örn: /ws</p>
</div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.defaultLanguage}
                </label>
                <select
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value)}
                  className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
                >
                  {LANG_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.flag} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className={`rounded-3xl border p-5 transition-colors ${card}`}
              >
                <h3 className="text-base font-semibold">
                  {t.guestLocalShare}
                </h3>
                <p className={`mt-2 text-sm leading-6 ${muted}`}>
                  {t.guestLocalShareDesc}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setAllowGuestLocalShare(true)}
                    className={`inline-flex h-12 items-center justify-center rounded-2xl border px-4 text-sm font-semibold transition ${
                      allowGuestLocalShare
                        ? effectiveDark
                          ? "border-emerald-400/30 bg-emerald-500 text-black"
                          : "border-emerald-500 bg-emerald-500 text-white"
                        : buttonSecondary
                    }`}
                  >
                    {t.toggleOn}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAllowGuestLocalShare(false)}
                    className={`inline-flex h-12 items-center justify-center rounded-2xl border px-4 text-sm font-semibold transition ${
                      !allowGuestLocalShare
                        ? effectiveDark
                          ? "border-red-400/30 bg-red-500 text-white"
                          : "border-red-500 bg-red-500 text-white"
                        : buttonSecondary
                    }`}
                  >
                    {t.toggleOff}
                  </button>
                </div>

                <p className={`mt-3 text-sm font-medium ${muted}`}>
                  {t.currentState}:{" "}
                  {allowGuestLocalShare ? t.toggleOn : t.toggleOff}
                </p>
              </div>
            </div>
          </section>

          <section
            className={`rounded-3xl border p-8 shadow-2xl backdrop-blur-sm transition-colors ${card}`}
          >
            <h2 className="text-xl font-semibold">{t.rulesTitle}</h2>

            <div className="mt-6 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.storageQuota}
                </label>
                <input
                  type="number"
                  min="1"
                  value={storageQuotaGB}
                  onChange={(e) => setStorageQuotaGB(e.target.value)}
                  className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.defaultUserMaxUpload}
                </label>
                <input
                  type="number"
                  min="1"
                  value={defaultUserMaxUploadGB}
                  onChange={(e) => setDefaultUserMaxUploadGB(e.target.value)}
                  className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.linkTtl}
                </label>
                <input
                  type="number"
                  min="1"
                  value={defaultLinkTtlHours}
                  onChange={(e) => setDefaultLinkTtlHours(e.target.value)}
                  className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.allowedExtensions}
                </label>
                <input
                  value={allowedExtensions}
                  onChange={(e) => setAllowedExtensions(e.target.value)}
                  className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
                />
                <p className={`mt-2 text-xs ${muted}`}>
                  {t.allowedExtensionsHint}
                </p>
              </div>

              <label className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm">
                <span>{t.autoDelete}</span>
                <input
                  type="checkbox"
                  checked={autoDeleteEnabled}
                  onChange={(e) => setAutoDeleteEnabled(e.target.checked)}
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm">
                <span>{t.adminBypass}</span>
                <input
                  type="checkbox"
                  checked={adminBypassFileTypeRules}
                  onChange={(e) =>
                    setAdminBypassFileTypeRules(e.target.checked)
                  }
                />
              </label>

              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSaving}
                className={`inline-flex h-12 items-center justify-center rounded-2xl px-6 text-sm font-semibold transition ${buttonPrimary} ${
                  isSaving ? "cursor-not-allowed opacity-60" : ""
                }`}
              >
                {isSaving ? t.saving : t.saveSettings}
              </button>
            </div>
          </section>
        </div>

        <section
          className={`mt-6 rounded-3xl border p-8 shadow-2xl backdrop-blur-sm transition-colors ${card}`}
        >
          <h2 className="text-xl font-semibold">{t.usersTitle}</h2>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">
                {t.username}
              </label>
              <input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {t.email}
              </label>
              <input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {t.password}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">{t.role}</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {t.status}
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as UserStatus)}
                className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
              >
                <option value="PENDING">PENDING</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="DISABLED">DISABLED</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {t.defaultLanguage}
              </label>
              <select
                value={newPreferredLanguage}
                onChange={(e) => setNewPreferredLanguage(e.target.value)}
                className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
              >
                {LANG_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.flag} {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {t.userMaxUpload}
              </label>
              <input
                type="number"
                min="1"
                value={newMaxUploadGB}
                onChange={(e) => setNewMaxUploadGB(e.target.value)}
                className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
              />
            </div>

            <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-end">
              <button
                type="button"
                onClick={handleCreateUser}
                disabled={isCreatingUser}
                className={`inline-flex h-12 items-center justify-center rounded-2xl px-6 text-sm font-semibold transition ${buttonPrimary} ${
                  isCreatingUser ? "cursor-not-allowed opacity-60" : ""
                }`}
              >
                {isCreatingUser ? t.saving : t.createButton}
              </button>

              <button
                type="button"
                onClick={loadUsers}
                className={`inline-flex h-12 items-center justify-center rounded-2xl border px-6 text-sm font-semibold transition ${buttonSecondary}`}
              >
                {t.refreshUsers}
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold">{t.usersList}</h3>

            {usersLoading ? (
              <p className={`mt-4 text-sm ${muted}`}>{t.loadingUsers}</p>
            ) : users.length === 0 ? (
              <p className={`mt-4 text-sm ${muted}`}>{t.noUsers}</p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-2xl border">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className={`border-b ${tableRow}`}>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Max GB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className={`border-b ${tableRow}`}>
                        <td className="px-4 py-3">{user.username}</td>
                        <td className="px-4 py-3">{user.email || "-"}</td>
                        <td className="px-4 py-3">{user.role}</td>
                        <td className="px-4 py-3">{user.status}</td>
                        <td className="px-4 py-3">
                          {bytesToGBString(user.maxUploadBytes)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
