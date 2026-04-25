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

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", effectiveDark ? "dark" : "light");
  }, [effectiveDark]);

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  const navItems = [
    { href: "/dashboard", label: "Files" },
    { href: "/dashboard?section=share", label: "New share" },
    { href: "/local", label: "Local network" },
    { href: "/admin", label: "Admin", active: true },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-0)", color: "var(--fg-0)", position: "relative" }}>
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 199,
        }} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside style={{
        width: 220, flexShrink: 0, background: "var(--bg-0)",
        borderRight: "1px solid var(--line)", padding: "18px 14px",
        display: "flex", flexDirection: "column", gap: 24,
        ...(isMobile ? {
          position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 200,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.22s ease",
        } : {}),
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px" }}>
          <span style={{ color: "var(--accent)" }}>
            <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <rect x="3" y="8" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M6 8V5.5a4 4 0 018 0V8" stroke="currentColor" strokeWidth="1.6"/>
              <circle cx="10" cy="13" r="1.4" fill="currentColor"/>
            </svg>
          </span>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: -0.2 }}>Latchsend</span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item) => (
            <button key={item.href} onClick={() => { setSidebarOpen(false); if (!item.active) window.location.assign(item.href); }} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", borderRadius: 8,
              background: item.active ? "var(--bg-2)" : "transparent",
              color: item.active ? "var(--fg-0)" : "var(--fg-1)",
              fontSize: 13, fontWeight: item.active ? 500 : 400, textAlign: "left", width: "100%",
            }}>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          <select className="select" value={lang} onChange={(e) => setLang(e.target.value as Lang)} style={{ height: 30, fontSize: 12 }}>
            {LANG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.flag} {o.label}</option>)}
          </select>
          <select className="select" value={themePref} onChange={(e) => setThemePref(e.target.value as ThemePref)} style={{ height: 30, fontSize: 12 }}>
            <option value="system" disabled={!systemSupported}>{systemSupported ? t.themeSystem : t.themeSystemUnsupported}</option>
            <option value="dark">{t.themeDark}</option>
            <option value="light">{t.themeLight}</option>
          </select>
          <button className="btn btn-quiet btn-sm" onClick={() => router.push("/dashboard")} style={{ width: "100%", justifyContent: "flex-start", padding: "6px 10px" }}>
            {t.back}
          </button>
          <button className="btn btn-quiet btn-sm" onClick={handleLogout} style={{ width: "100%", justifyContent: "flex-start", padding: "6px 10px" }}>
            {t.logout}
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile ? "14px 16px" : "20px 28px 18px", borderBottom: "1px solid var(--line)",
          background: "var(--bg-0)", flexShrink: 0, gap: 12,
        }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)} style={{
              display: "flex", flexDirection: "column", gap: 4, padding: 6,
              background: "none", border: "none", cursor: "pointer", flexShrink: 0,
            }}>
              {[0,1,2].map(i => <span key={i} style={{ display: "block", width: 18, height: 2, background: "var(--fg-0)", borderRadius: 1 }} />)}
            </button>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="label">Dashboard</span>
              <span style={{ color: "var(--fg-3)" }}>/</span>
              <span className="label" style={{ color: "var(--fg-1)" }}>{t.title}</span>
            </div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 600, letterSpacing: -0.4 }}>{t.title}</h1>
            {!isMobile && <p style={{ margin: "4px 0 0", color: "var(--fg-2)", fontSize: 13 }}>{t.subtitle}</p>}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: isMobile ? "16px" : "24px 28px" }}>
      <div style={{ maxWidth: 1100 }}>
        {/* Status message */}
        {statusMessage && (
          <div style={{
            marginBottom: 20, padding: "10px 14px", borderRadius: 8, fontSize: 13,
            background: statusMessage.kind === "ok" ? "var(--ok-soft)" : "var(--err-soft)",
            color: statusMessage.kind === "ok" ? "var(--ok)" : "var(--err)",
            border: `1px solid ${statusMessage.kind === "ok" ? "var(--ok)" : "var(--err)"}`,
          }}>
            {statusMessage.text}
          </div>
        )}

        {/* Settings grid */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* General */}
          <div className="panel" style={{ padding: 0 }}>
            <div className="panel-header">
              <span style={{ fontSize: 14, fontWeight: 500 }}>{t.generalTitle}</span>
              <button className="btn btn-quiet btn-sm" onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? t.saving : t.saveSettings}
              </button>
            </div>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                [t.siteName, siteName, (v: string) => setSiteName(v), "text"],
                [t.baseUrl, baseUrl, (v: string) => setBaseUrl(v), "text"],
                ["Public Port", publicPort, (v: string) => setPublicPort(v), "number"],
                ["WS Path", wsPath, (v: string) => setWsPath(v), "text"],
              ].map(([label, value, setter, type]) => (
                <div key={label as string}>
                  <div className="label" style={{ marginBottom: 5 }}>{label as string}</div>
                  <input
                    className="input"
                    type={type as string}
                    value={value as string}
                    onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                    style={{ height: 34 }}
                  />
                </div>
              ))}
              <div>
                <div className="label" style={{ marginBottom: 5 }}>{t.defaultLanguage}</div>
                <select className="select" value={defaultLanguage} onChange={(e) => setDefaultLanguage(e.target.value)} style={{ height: 34 }}>
                  {LANG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.flag} {o.label}</option>)}
                </select>
              </div>

              {/* Guest local share toggle */}
              <div style={{ padding: "12px 0", borderTop: "1px solid var(--line)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{t.guestLocalShare}</div>
                    <div style={{ fontSize: 11.5, color: "var(--fg-2)", marginTop: 2 }}>{t.guestLocalShareDesc}</div>
                  </div>
                  <div
                    className={`toggle ${allowGuestLocalShare ? "on" : ""}`}
                    onClick={() => setAllowGuestLocalShare((v) => !v)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="panel" style={{ padding: 0 }}>
            <div className="panel-header">
              <span style={{ fontSize: 14, fontWeight: 500 }}>{t.rulesTitle}</span>
            </div>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                [t.storageQuota, storageQuotaGB, (v: string) => setStorageQuotaGB(v)],
                [t.defaultUserMaxUpload, defaultUserMaxUploadGB, (v: string) => setDefaultUserMaxUploadGB(v)],
                [t.linkTtl, defaultLinkTtlHours, (v: string) => setDefaultLinkTtlHours(v)],
              ].map(([label, value, setter]) => (
                <div key={label as string}>
                  <div className="label" style={{ marginBottom: 5 }}>{label as string}</div>
                  <input className="input" type="number" min="1" value={value as string}
                    onChange={(e) => (setter as (v: string) => void)(e.target.value)} style={{ height: 34 }} />
                </div>
              ))}
              <div>
                <div className="label" style={{ marginBottom: 5 }}>{t.allowedExtensions}</div>
                <input className="input" value={allowedExtensions} onChange={(e) => setAllowedExtensions(e.target.value)} style={{ height: 34 }} />
                <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 4 }}>{t.allowedExtensionsHint}</div>
              </div>
              {[
                [t.autoDelete, autoDeleteEnabled, setAutoDeleteEnabled],
                [t.adminBypass, adminBypassFileTypeRules, setAdminBypassFileTypeRules],
              ].map(([label, value, setter]) => (
                <label key={label as string} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 0", borderTop: "1px solid var(--line)", cursor: "pointer",
                }}>
                  <span style={{ fontSize: 13 }}>{label as string}</span>
                  <div
                    className={`toggle ${value ? "on" : ""}`}
                    onClick={() => (setter as (v: boolean) => void)(!value as boolean)}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Users section */}
        <div className="panel" style={{ padding: 0 }}>
          <div className="panel-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{t.usersTitle}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)" }}>{users.length}</span>
            </div>
            <button className="btn btn-quiet btn-sm" onClick={loadUsers}>{t.refreshUsers}</button>
          </div>

          {/* Create user form */}
          <div style={{ padding: 16, borderBottom: "1px solid var(--line)", display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 10 }}>
            {[
              { label: t.username, value: newUsername, setter: setNewUsername, type: "text" },
              { label: t.email, value: newEmail, setter: setNewEmail, type: "text" },
              { label: t.password, value: newPassword, setter: setNewPassword, type: "password" },
              { label: t.userMaxUpload, value: newMaxUploadGB, setter: setNewMaxUploadGB, type: "number" },
            ].map((f) => (
              <div key={f.label}>
                <div className="label" style={{ marginBottom: 5 }}>{f.label}</div>
                <input className="input" type={f.type} value={f.value}
                  onChange={(e) => f.setter(e.target.value)} style={{ height: 32 }} />
              </div>
            ))}
            <div>
              <div className="label" style={{ marginBottom: 5 }}>{t.role}</div>
              <select className="select" value={newRole} onChange={(e) => setNewRole(e.target.value as UserRole)} style={{ height: 32 }}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div>
              <div className="label" style={{ marginBottom: 5 }}>{t.status}</div>
              <select className="select" value={newStatus} onChange={(e) => setNewStatus(e.target.value as UserStatus)} style={{ height: 32 }}>
                <option value="PENDING">PENDING</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="DISABLED">DISABLED</option>
              </select>
            </div>
            <div>
              <div className="label" style={{ marginBottom: 5 }}>{t.defaultLanguage}</div>
              <select className="select" value={newPreferredLanguage} onChange={(e) => setNewPreferredLanguage(e.target.value)} style={{ height: 32 }}>
                {LANG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.flag} {o.label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="btn btn-accent" disabled={isCreatingUser} onClick={handleCreateUser} style={{ height: 32, width: "100%" }}>
                {isCreatingUser ? t.saving : t.createButton}
              </button>
            </div>
          </div>

          {/* Users table */}
          {usersLoading ? (
            <div style={{ padding: "20px 18px", color: "var(--fg-2)", fontSize: 13 }}>{t.loadingUsers}</div>
          ) : users.length === 0 ? (
            <div style={{ padding: "20px 18px", color: "var(--fg-2)", fontSize: 13 }}>{t.noUsers}</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--line)" }}>
                    {[t.username, t.email, t.role, t.status, "Max GB"].map((h) => (
                      <th key={h} className="label" style={{ textAlign: "left", padding: "10px 16px", fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <tr key={user.id} style={{ borderBottom: i < users.length - 1 ? "1px solid var(--line)" : "none" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: 6, background: "var(--bg-3)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 600,
                          }}>
                            {user.username[0].toUpperCase()}
                          </div>
                          <span className="mono" style={{ fontSize: 12.5 }}>{user.username}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--fg-2)" }}>{user.email || "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className={`chip ${user.role === "ADMIN" ? "chip-info" : "chip-mute"}`}>{user.role}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className={`chip ${user.status === "ACTIVE" ? "chip-ok" : user.status === "PENDING" ? "chip-warn" : "chip-mute"}`}>
                          <span className="chip-dot" /> {user.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className="mono" style={{ fontSize: 12 }}>{bytesToGBString(user.maxUploadBytes)} GB</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
