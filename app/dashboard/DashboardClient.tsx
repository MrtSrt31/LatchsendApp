"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Lang = "en" | "tr" | "es" | "fr" | "hi" | "zh-CN";
type ThemePref = "system" | "dark" | "light";

type FileItem = {
  id: string;
  originalName: string;
  extension: string;
  mimeType: string;
  sizeBytes: string;
  downloadToken: string;
  expiresAt: string;
  singleUse: boolean;
  downloadCount: number;
  hasPassword: boolean;
  autoDelete: boolean;
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

const translations: Record<
  Lang,
  {
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
    uploadTitle: string;
    dropHint: string;
    selectFile: string;
    selected: string;
    expiry: string;
    singleUse: string;
    singleUseHint: string;
    password: string;
    passwordPlaceholder: string;
    upload: string;
    uploading: string;
    linkReady: string;
    copyLink: string;
    copied: string;
    myFiles: string;
    noFiles: string;
    colName: string;
    colSize: string;
    colExpires: string;
    colDl: string;
    colStatus: string;
    statusActive: string;
    statusExpired: string;
    statusUsed: string;
    revoke: string;
    confirmDelete: string;
    errType: string;
    errSize: string;
    errUpload: string;
    latchOptions: string;
    expiryHours: (h: number) => string;
  }
> = {
  en: {
    badge: "Dashboard",
    title: "File Sharing",
    subtitle: "Upload a file, set your latch rules, and share the link.",
    language: "Language",
    theme: "Theme",
    themeSystem: "Use device setting",
    themeDark: "Always dark",
    themeLight: "Always light",
    themeSystemUnsupported: "Use device setting (not supported)",
    logout: "Log out",
    uploadTitle: "Upload & Lock",
    dropHint: "Drop a file here",
    selectFile: "Select file",
    selected: "Selected",
    expiry: "Link expires in",
    singleUse: "One-time download",
    singleUseHint: "Link is deleted after first download",
    password: "Password",
    passwordPlaceholder: "Leave empty for no password",
    upload: "Upload & create link",
    uploading: "Uploading…",
    linkReady: "Link created",
    copyLink: "Copy link",
    copied: "Copied!",
    myFiles: "My Files",
    noFiles: "No files uploaded yet.",
    colName: "File",
    colSize: "Size",
    colExpires: "Expires",
    colDl: "Downloads",
    colStatus: "Status",
    statusActive: "Active",
    statusExpired: "Expired",
    statusUsed: "Used",
    revoke: "Delete",
    confirmDelete: "Delete this file and revoke the link?",
    errType: "File type not allowed",
    errSize: "File exceeds upload limit",
    errUpload: "Upload failed",
    latchOptions: "Latch Options",
    expiryHours: (h) =>
      h < 24 ? `${h} hour${h !== 1 ? "s" : ""}` : `${Math.round(h / 24)} day${h / 24 !== 1 ? "s" : ""}`,
  },
  tr: {
    badge: "Dashboard",
    title: "Dosya Paylaşımı",
    subtitle: "Dosyayı yükle, kilit kurallarını belirle, linki paylaş.",
    language: "Dil",
    theme: "Tema",
    themeSystem: "Cihaza göre",
    themeDark: "Hep siyah",
    themeLight: "Hep beyaz",
    themeSystemUnsupported: "Cihaza göre (desteklenmiyor)",
    logout: "Çıkış Yap",
    uploadTitle: "Yükle & Kilitle",
    dropHint: "Dosyayı buraya bırak",
    selectFile: "Dosya seç",
    selected: "Seçildi",
    expiry: "Link süresi",
    singleUse: "Tek seferlik",
    singleUseHint: "İlk indirmeden sonra link silinir",
    password: "Şifre",
    passwordPlaceholder: "Şifresiz bırakmak için boş bırak",
    upload: "Yükle & link oluştur",
    uploading: "Yükleniyor…",
    linkReady: "Link oluşturuldu",
    copyLink: "Linki kopyala",
    copied: "Kopyalandı!",
    myFiles: "Dosyalarım",
    noFiles: "Henüz dosya yüklemediniz.",
    colName: "Dosya",
    colSize: "Boyut",
    colExpires: "Bitiş",
    colDl: "İndirme",
    colStatus: "Durum",
    statusActive: "Aktif",
    statusExpired: "Süresi doldu",
    statusUsed: "Kullanıldı",
    revoke: "Sil",
    confirmDelete: "Dosya silinsin ve link iptal edilsin mi?",
    errType: "Dosya türü izinli değil",
    errSize: "Dosya yükleme limitini aşıyor",
    errUpload: "Yükleme başarısız",
    latchOptions: "Kilit Seçenekleri",
    expiryHours: (h) =>
      h < 24 ? `${h} saat` : `${Math.round(h / 24)} gün`,
  },
  es: {
    badge: "Panel",
    title: "Compartir Archivos",
    subtitle: "Sube un archivo, define tus reglas y comparte el enlace.",
    language: "Idioma",
    theme: "Tema",
    themeSystem: "Usar ajuste del dispositivo",
    themeDark: "Siempre oscuro",
    themeLight: "Siempre claro",
    themeSystemUnsupported: "Usar ajuste del dispositivo (no compatible)",
    logout: "Cerrar sesión",
    uploadTitle: "Subir y Bloquear",
    dropHint: "Suelta un archivo aquí",
    selectFile: "Seleccionar archivo",
    selected: "Seleccionado",
    expiry: "El enlace expira en",
    singleUse: "Descarga única",
    singleUseHint: "El enlace se elimina tras la primera descarga",
    password: "Contraseña",
    passwordPlaceholder: "Dejar vacío para sin contraseña",
    upload: "Subir y crear enlace",
    uploading: "Subiendo…",
    linkReady: "Enlace creado",
    copyLink: "Copiar enlace",
    copied: "¡Copiado!",
    myFiles: "Mis Archivos",
    noFiles: "Aún no has subido archivos.",
    colName: "Archivo",
    colSize: "Tamaño",
    colExpires: "Vence",
    colDl: "Descargas",
    colStatus: "Estado",
    statusActive: "Activo",
    statusExpired: "Vencido",
    statusUsed: "Usado",
    revoke: "Eliminar",
    confirmDelete: "¿Eliminar este archivo y revocar el enlace?",
    errType: "Tipo de archivo no permitido",
    errSize: "El archivo supera el límite",
    errUpload: "Error al subir",
    latchOptions: "Opciones de bloqueo",
    expiryHours: (h) =>
      h < 24 ? `${h} hora${h !== 1 ? "s" : ""}` : `${Math.round(h / 24)} día${h / 24 !== 1 ? "s" : ""}`,
  },
  fr: {
    badge: "Tableau de bord",
    title: "Partage de Fichiers",
    subtitle: "Téléverse un fichier, configure tes règles et partage le lien.",
    language: "Langue",
    theme: "Thème",
    themeSystem: "Utiliser le réglage de l'appareil",
    themeDark: "Toujours sombre",
    themeLight: "Toujours clair",
    themeSystemUnsupported: "Utiliser le réglage de l'appareil (non pris en charge)",
    logout: "Déconnexion",
    uploadTitle: "Téléverser & Verrouiller",
    dropHint: "Déposez un fichier ici",
    selectFile: "Choisir un fichier",
    selected: "Sélectionné",
    expiry: "Le lien expire dans",
    singleUse: "Téléchargement unique",
    singleUseHint: "Le lien est supprimé après le premier téléchargement",
    password: "Mot de passe",
    passwordPlaceholder: "Laisser vide pour aucun mot de passe",
    upload: "Téléverser et créer le lien",
    uploading: "Téléversement…",
    linkReady: "Lien créé",
    copyLink: "Copier le lien",
    copied: "Copié !",
    myFiles: "Mes Fichiers",
    noFiles: "Aucun fichier téléversé pour le moment.",
    colName: "Fichier",
    colSize: "Taille",
    colExpires: "Expire",
    colDl: "Téléchargements",
    colStatus: "Statut",
    statusActive: "Actif",
    statusExpired: "Expiré",
    statusUsed: "Utilisé",
    revoke: "Supprimer",
    confirmDelete: "Supprimer ce fichier et révoquer le lien ?",
    errType: "Type de fichier non autorisé",
    errSize: "Fichier trop grand",
    errUpload: "Échec du téléversement",
    latchOptions: "Options de verrouillage",
    expiryHours: (h) =>
      h < 24 ? `${h} heure${h !== 1 ? "s" : ""}` : `${Math.round(h / 24)} jour${h / 24 !== 1 ? "s" : ""}`,
  },
  hi: {
    badge: "डैशबोर्ड",
    title: "फ़ाइल शेयरिंग",
    subtitle: "फ़ाइल अपलोड करें, लैच नियम सेट करें, लिंक शेयर करें।",
    language: "भाषा",
    theme: "थीम",
    themeSystem: "डिवाइस के अनुसार",
    themeDark: "हमेशा डार्क",
    themeLight: "हमेशा लाइट",
    themeSystemUnsupported: "डिवाइस के अनुसार (समर्थन नहीं)",
    logout: "लॉग आउट",
    uploadTitle: "अपलोड & लॉक",
    dropHint: "यहाँ फ़ाइल छोड़ें",
    selectFile: "फ़ाइल चुनें",
    selected: "चुनी गई",
    expiry: "लिंक समाप्त होगा",
    singleUse: "एक बार डाउनलोड",
    singleUseHint: "पहले डाउनलोड के बाद लिंक हट जाएगा",
    password: "पासवर्ड",
    passwordPlaceholder: "कोई पासवर्ड नहीं चाहिए तो खाली छोड़ें",
    upload: "अपलोड करें & लिंक बनाएं",
    uploading: "अपलोड हो रहा है…",
    linkReady: "लिंक बन गया",
    copyLink: "लिंक कॉपी करें",
    copied: "कॉपी किया!",
    myFiles: "मेरी फ़ाइलें",
    noFiles: "अभी तक कोई फ़ाइल अपलोड नहीं की।",
    colName: "फ़ाइल",
    colSize: "आकार",
    colExpires: "समाप्ति",
    colDl: "डाउनलोड",
    colStatus: "स्थिति",
    statusActive: "सक्रिय",
    statusExpired: "समाप्त",
    statusUsed: "उपयोग किया",
    revoke: "हटाएँ",
    confirmDelete: "यह फ़ाइल हटाएँ और लिंक रद्द करें?",
    errType: "फ़ाइल प्रकार की अनुमति नहीं",
    errSize: "फ़ाइल अपलोड सीमा से बड़ी है",
    errUpload: "अपलोड विफल",
    latchOptions: "लैच विकल्प",
    expiryHours: (h) => h < 24 ? `${h} घंटे में` : `${Math.round(h / 24)} दिन में`,
  },
  "zh-CN": {
    badge: "控制台",
    title: "文件分享",
    subtitle: "上传文件，设置访问规则，分享链接。",
    language: "语言",
    theme: "主题",
    themeSystem: "跟随设备",
    themeDark: "始终深色",
    themeLight: "始终浅色",
    themeSystemUnsupported: "跟随设备（设备不支持）",
    logout: "退出登录",
    uploadTitle: "上传 & 锁定",
    dropHint: "将文件拖到这里",
    selectFile: "选择文件",
    selected: "已选择",
    expiry: "链接有效期",
    singleUse: "单次下载",
    singleUseHint: "首次下载后链接失效",
    password: "密码",
    passwordPlaceholder: "留空表示无密码",
    upload: "上传并创建链接",
    uploading: "上传中…",
    linkReady: "链接已创建",
    copyLink: "复制链接",
    copied: "已复制！",
    myFiles: "我的文件",
    noFiles: "暂无上传的文件。",
    colName: "文件",
    colSize: "大小",
    colExpires: "过期",
    colDl: "下载次数",
    colStatus: "状态",
    statusActive: "有效",
    statusExpired: "已过期",
    statusUsed: "已使用",
    revoke: "删除",
    confirmDelete: "删除此文件并吊销链接？",
    errType: "不允许此文件类型",
    errSize: "文件超过上传限制",
    errUpload: "上传失败",
    latchOptions: "访问控制",
    expiryHours: (h) => h < 24 ? `${h} 小时` : `${Math.round(h / 24)} 天`,
  },
};

const EXPIRY_PRESETS = [1, 6, 12, 24, 48, 168, 720];

function detectInitialLanguage(): Lang {
  const supported: Lang[] = ["en", "tr", "es", "fr", "hi", "zh-CN"];
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem("latchsend_lang") as Lang | null;
  if (saved && supported.includes(saved)) return saved;
  for (const raw of navigator.languages?.length ? navigator.languages : [navigator.language]) {
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

function formatBytes(n: number) {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let v = n, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${Math.round(v * 10) / 10} ${units[i]}`;
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

function getStatus(file: FileItem): "active" | "expired" | "used" {
  if (new Date(file.expiresAt) < new Date()) return "expired";
  if (file.singleUse && file.downloadCount >= 1) return "used";
  return "active";
}

export default function DashboardClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Lang / theme ─────────────────────────────────────────────────────────
  const [lang, setLang] = useState<Lang>("en");
  const [themePref, setThemePref] = useState<ThemePref>("dark");
  const [systemSupported, setSystemSupported] = useState(false);
  const [systemIsDark, setSystemIsDark] = useState(true);

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

  const t = useMemo(() => translations[lang], [lang]);

  const effectiveDark =
    themePref === "dark" ? true : themePref === "light" ? false : systemIsDark;

  const pageBg = effectiveDark ? "bg-black text-white" : "bg-zinc-100 text-zinc-950";
  const muted = effectiveDark ? "text-zinc-400" : "text-zinc-600";
  const card = effectiveDark ? "border-white/10 bg-white/5" : "border-black/10 bg-white";
  const input = effectiveDark
    ? "border-white/10 bg-black/40 text-white placeholder:text-zinc-500 focus:border-white/25"
    : "border-black/10 bg-white text-zinc-950 placeholder:text-zinc-400 focus:border-black/25";
  const primaryBtn = effectiveDark ? "bg-white text-black hover:opacity-90" : "bg-zinc-950 text-white hover:opacity-90";
  const secondaryBtn = effectiveDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-black/10 bg-zinc-50 text-zinc-950 hover:bg-zinc-100";
  const logoutBtn = effectiveDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-black/10 bg-zinc-50 text-zinc-950 hover:bg-zinc-100";
  const dropZone = effectiveDark ? "border-white/15 bg-black/30 hover:border-white/30" : "border-black/15 bg-zinc-50 hover:border-black/30";
  const dropZoneActive = effectiveDark ? "border-white/50 bg-white/5" : "border-black/40 bg-zinc-100";

  // ── Upload state ──────────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ttlHours, setTtlHours] = useState(24);
  const [singleUse, setSingleUse] = useState(false);
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastToken, setLastToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);

  // ── File list ─────────────────────────────────────────────────────────────
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch("/api/files", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch {}
    setLoadingFiles(false);
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  // ── Upload ────────────────────────────────────────────────────────────────
  function handleUpload() {
    if (!selectedFile || uploading) return;
    setUploading(true);
    setUploadProgress(0);
    setUploadError("");
    setLastToken(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("ttlHours", String(ttlHours));
    formData.append("singleUse", String(singleUse));
    if (password.trim()) formData.append("password", password.trim());

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/files/upload");
    xhr.withCredentials = true;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          setLastToken(data.downloadToken);
          setSelectedFile(null);
          setPassword("");
          setSingleUse(false);
          setTtlHours(24);
          fetchFiles();
        } catch {
          setUploadError(t.errUpload);
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          setUploadError(
            data.error?.includes("type") ? t.errType :
            data.error?.includes("limit") || data.error?.includes("large") || data.error?.includes("quota") ? t.errSize :
            data.error || t.errUpload
          );
        } catch {
          setUploadError(t.errUpload);
        }
      }
    };

    xhr.onerror = () => { setUploading(false); setUploadError(t.errUpload); };
    xhr.send(formData);
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/d/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleDelete(file: FileItem) {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await fetch(`/api/files/${file.id}`, { method: "DELETE", credentials: "include" });
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      if (lastToken === file.downloadToken) setLastToken(null);
    } catch {}
  }

  async function handleLogout() {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
    } catch {}
    window.location.replace("/login");
  }

  // ── Drag & drop ───────────────────────────────────────────────────────────
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }
  function onDragLeave() { setDragging(false); }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setSelectedFile(f);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className={`min-h-screen px-6 py-12 transition-colors ${pageBg}`}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />

      <div className="mx-auto w-full max-w-5xl">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className={`mb-2 text-xs font-medium uppercase tracking-[0.28em] ${muted}`}>
              {t.badge}
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t.title}</h1>
            <p className={`mt-3 max-w-2xl text-sm leading-6 md:text-base ${muted}`}>{t.subtitle}</p>
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
                  {LANG_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.flag} {o.label}</option>
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

        {/* ── Upload row ──────────────────────────────────────────────────────── */}
        <div className="grid gap-6 md:grid-cols-3">
          <section className={`md:col-span-2 rounded-3xl border p-8 shadow-2xl backdrop-blur-sm transition-colors ${card}`}>
            <h2 className="text-xl font-semibold">{t.uploadTitle}</h2>

            {/* Drop zone */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
              className={`mt-6 cursor-pointer rounded-3xl border border-dashed p-8 text-center transition-colors ${dragging ? dropZoneActive : dropZone}`}
            >
              {selectedFile ? (
                <div>
                  <p className="font-semibold">{t.selected}: {selectedFile.name}</p>
                  <p className={`mt-1 text-sm ${muted}`}>{formatBytes(selectedFile.size)}</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setUploadError(""); setLastToken(null); }}
                    className={`mt-3 text-xs underline ${muted}`}
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <div>
                  <p className={`text-sm ${muted}`}>{t.dropHint}</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className={`mt-4 inline-flex h-11 items-center justify-center rounded-2xl px-6 text-sm font-semibold transition ${primaryBtn}`}
                  >
                    {t.selectFile}
                  </button>
                </div>
              )}
            </div>

            {/* Error */}
            {uploadError && (
              <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {uploadError}
              </p>
            )}

            {/* Progress */}
            {uploading && (
              <div className="mt-4">
                <p className={`mb-2 text-sm ${muted}`}>{t.uploading} {uploadProgress}%</p>
                <div className={`h-2 rounded-full border ${effectiveDark ? "border-white/10" : "border-black/10"}`}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.max(2, uploadProgress)}%`,
                      background: effectiveDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Success banner */}
            {lastToken && !uploading && (
              <div className={`mt-4 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${card}`}>
                <div>
                  <p className="text-sm font-semibold">{t.linkReady}</p>
                  <p className={`mt-1 max-w-xs truncate text-xs ${muted}`}>
                    {typeof window !== "undefined" ? `${window.location.origin}/d/${lastToken}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyLink(lastToken)}
                  className={`inline-flex h-10 shrink-0 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition ${primaryBtn}`}
                >
                  {copied ? t.copied : t.copyLink}
                </button>
              </div>
            )}

            {/* Upload button */}
            {selectedFile && !uploading && !lastToken && (
              <button
                type="button"
                onClick={handleUpload}
                className={`mt-4 h-12 w-full rounded-2xl px-4 text-sm font-semibold transition ${primaryBtn}`}
              >
                {t.upload}
              </button>
            )}
          </section>

          {/* ── Latch options ─────────────────────────────────────────────────── */}
          <aside className={`rounded-3xl border p-8 shadow-2xl backdrop-blur-sm transition-colors ${card}`}>
            <h2 className="text-xl font-semibold">{t.latchOptions}</h2>

            <div className="mt-6 space-y-5">
              {/* Expiry */}
              <div>
                <label className={`mb-2 block text-xs font-medium uppercase tracking-[0.2em] ${muted}`}>
                  {t.expiry}
                </label>
                <select
                  value={ttlHours}
                  onChange={(e) => setTtlHours(Number(e.target.value))}
                  className={`h-11 w-full appearance-none rounded-2xl border px-4 text-sm font-medium outline-none ${input}`}
                >
                  {EXPIRY_PRESETS.map((h) => (
                    <option key={h} value={h}>{t.expiryHours(h)}</option>
                  ))}
                </select>
              </div>

              {/* Single use */}
              <div>
                <label className="flex cursor-pointer items-start gap-3">
                  <div className="relative mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={singleUse}
                      onChange={(e) => setSingleUse(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`h-5 w-9 rounded-full transition-colors ${singleUse ? "bg-white" : effectiveDark ? "bg-white/20" : "bg-black/20"}`} />
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full shadow transition-all ${singleUse ? "left-[1.25rem] bg-black" : "left-0.5 bg-white"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.singleUse}</p>
                    <p className={`mt-0.5 text-xs ${muted}`}>{t.singleUseHint}</p>
                  </div>
                </label>
              </div>

              {/* Password */}
              <div>
                <label className={`mb-2 block text-xs font-medium uppercase tracking-[0.2em] ${muted}`}>
                  {t.password}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className={`h-11 w-full rounded-2xl border px-4 text-sm outline-none transition ${input}`}
                />
              </div>
            </div>
          </aside>
        </div>

        {/* ── File list ────────────────────────────────────────────────────────── */}
        <section className={`mt-8 rounded-3xl border p-8 shadow-2xl backdrop-blur-sm transition-colors ${card}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t.myFiles}</h2>
            {loadingFiles && (
              <span className={`text-xs ${muted}`}>…</span>
            )}
          </div>

          {files.length === 0 && !loadingFiles ? (
            <p className={`mt-6 text-sm ${muted}`}>{t.noFiles}</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className={`text-left text-xs font-medium uppercase tracking-[0.2em] ${muted}`}>
                    <th className="pb-4 pr-4">{t.colName}</th>
                    <th className="pb-4 pr-4">{t.colSize}</th>
                    <th className="pb-4 pr-4">{t.colExpires}</th>
                    <th className="pb-4 pr-4">{t.colDl}</th>
                    <th className="pb-4 pr-4">{t.colStatus}</th>
                    <th className="pb-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {files.map((file) => {
                    const status = getStatus(file);
                    const statusLabel = status === "active" ? t.statusActive : status === "expired" ? t.statusExpired : t.statusUsed;
                    const statusClass =
                      status === "active"
                        ? effectiveDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700"
                        : status === "expired"
                        ? effectiveDark ? "bg-red-500/15 text-red-300" : "bg-red-50 text-red-700"
                        : effectiveDark ? "bg-zinc-500/15 text-zinc-400" : "bg-zinc-100 text-zinc-500";

                    return (
                      <tr key={file.id}>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="shrink-0 font-mono text-xs opacity-40">.{file.extension}</span>
                            <span className="truncate max-w-[200px] font-medium" title={file.originalName}>
                              {file.originalName}
                            </span>
                            {file.hasPassword && (
                              <span className={`shrink-0 text-xs ${muted}`} title="Password protected">🔒</span>
                            )}
                            {file.singleUse && (
                              <span className={`shrink-0 text-xs ${muted}`} title="Single use">1×</span>
                            )}
                          </div>
                        </td>
                        <td className={`py-3 pr-4 ${muted}`}>{formatBytes(Number(file.sizeBytes))}</td>
                        <td className={`py-3 pr-4 font-mono text-xs ${muted}`}>{formatExpiry(file.expiresAt)}</td>
                        <td className={`py-3 pr-4 ${muted}`}>{file.downloadCount}</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2 justify-end">
                            {status === "active" && (
                              <button
                                type="button"
                                onClick={() => copyLink(file.downloadToken)}
                                className={`inline-flex h-8 items-center rounded-xl border px-3 text-xs font-semibold transition ${secondaryBtn}`}
                              >
                                {t.copyLink}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(file)}
                              className={`inline-flex h-8 items-center rounded-xl border px-3 text-xs font-semibold transition ${secondaryBtn} opacity-60 hover:opacity-100`}
                            >
                              {t.revoke}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
