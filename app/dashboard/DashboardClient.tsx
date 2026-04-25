"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Lang = "en" | "tr" | "es" | "fr" | "hi" | "zh-CN";
type ThemePref = "system" | "dark" | "light";
type NavSection = "files" | "share";

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

const translations: Record<Lang, {
  files: string; newShare: string; localNetwork: string; users: string; settings: string;
  storage: string; logout: string; language: string; theme: string;
  uploadTitle: string; dropHint: string; selectFile: string; selected: string;
  expiry: string; singleUse: string; singleUseHint: string; password: string;
  passwordPlaceholder: string; upload: string; uploading: string;
  linkReady: string; copyLink: string; copied: string;
  myFiles: string; noFiles: string; colName: string; colSize: string;
  colExpires: string; colDl: string; colStatus: string; colLatch: string;
  statusActive: string; statusExpired: string; statusUsed: string;
  revoke: string; confirmDelete: string;
  errType: string; errSize: string; errUpload: string;
  latchOptions: string; expiryHours: (h: number) => string;
  downloadCap: string; downloadCapHint: string; armLink: string; armingLink: string;
  latchArmed: string; newShareBtn: string;
  activeLatches: string; totalDl: string; storageUsed: string; of: string;
  themeSystem: string; themeDark: string; themeLight: string; themeSystemUnsupported: string;
  admin: string;
}> = {
  en: {
    files: "Files", newShare: "New share", localNetwork: "Local network",
    users: "Users", settings: "Settings", storage: "Storage", logout: "Log out",
    language: "Language", theme: "Theme",
    uploadTitle: "New share", dropHint: "Drop a file or browse",
    selectFile: "Browse", selected: "Selected",
    expiry: "Link expires in", singleUse: "Single use", singleUseHint: "Delete after first download",
    password: "Password", passwordPlaceholder: "Leave empty for no password",
    upload: "Arm & create link", uploading: "Uploading…",
    linkReady: "Latch armed", copyLink: "Copy link", copied: "Copied!",
    myFiles: "Files", noFiles: "No files uploaded yet.",
    colName: "File", colSize: "Size", colExpires: "Expires", colDl: "DL",
    colStatus: "Status", colLatch: "Latch",
    statusActive: "Active", statusExpired: "Expired", statusUsed: "Consumed",
    revoke: "Revoke", confirmDelete: "Delete this file and revoke the link?",
    errType: "File type not allowed", errSize: "File exceeds upload limit", errUpload: "Upload failed",
    latchOptions: "Latch conditions",
    expiryHours: (h) => h < 24 ? `${h} hour${h !== 1 ? "s" : ""}` : `${Math.round(h / 24)} day${h / 24 !== 1 ? "s" : ""}`,
    downloadCap: "Download cap", downloadCapHint: "Max times the link can serve",
    armLink: "Arm & create link", armingLink: "Arming latch…",
    latchArmed: "Latch armed", newShareBtn: "New share",
    activeLatches: "Active latches", totalDl: "Downloads", storageUsed: "Storage used", of: "of",
    themeSystem: "System", themeDark: "Dark", themeLight: "Light",
    themeSystemUnsupported: "System (unsupported)", admin: "Admin",
  },
  tr: {
    files: "Dosyalar", newShare: "Yeni paylaşım", localNetwork: "Yerel ağ",
    users: "Kullanıcılar", settings: "Ayarlar", storage: "Depolama", logout: "Çıkış Yap",
    language: "Dil", theme: "Tema",
    uploadTitle: "Yeni paylaşım", dropHint: "Dosyayı bırak veya gözat",
    selectFile: "Gözat", selected: "Seçildi",
    expiry: "Link süresi", singleUse: "Tek kullanım", singleUseHint: "İlk indirmeden sonra sil",
    password: "Şifre", passwordPlaceholder: "Şifresiz bırakmak için boş bırak",
    upload: "Kilitle & link oluştur", uploading: "Yükleniyor…",
    linkReady: "Kilit kuruldu", copyLink: "Linki kopyala", copied: "Kopyalandı!",
    myFiles: "Dosyalar", noFiles: "Henüz dosya yüklenmedi.",
    colName: "Dosya", colSize: "Boyut", colExpires: "Bitiş", colDl: "İnd",
    colStatus: "Durum", colLatch: "Kilit",
    statusActive: "Aktif", statusExpired: "Süresi Doldu", statusUsed: "Tüketildi",
    revoke: "İptal", confirmDelete: "Dosyayı sil ve linki iptal et?",
    errType: "Dosya türü izinli değil", errSize: "Dosya boyutu aşıldı", errUpload: "Yükleme başarısız",
    latchOptions: "Kilit koşulları",
    expiryHours: (h) => h < 24 ? `${h} saat` : `${Math.round(h / 24)} gün`,
    downloadCap: "İndirme sınırı", downloadCapHint: "Linkin sunabileceği max indirme",
    armLink: "Kilitle & link oluştur", armingLink: "Kilit kuruluyor…",
    latchArmed: "Kilit kuruldu", newShareBtn: "Yeni paylaşım",
    activeLatches: "Aktif kilitler", totalDl: "İndirmeler", storageUsed: "Kullanılan alan", of: "/",
    themeSystem: "Cihaza göre", themeDark: "Siyah", themeLight: "Beyaz",
    themeSystemUnsupported: "Cihaza göre (desteklenmiyor)", admin: "Yönetim",
  },
  es: {
    files: "Archivos", newShare: "Nuevo envío", localNetwork: "Red local",
    users: "Usuarios", settings: "Ajustes", storage: "Almacenamiento", logout: "Cerrar sesión",
    language: "Idioma", theme: "Tema",
    uploadTitle: "Nuevo envío", dropHint: "Suelta un archivo o navega",
    selectFile: "Navegar", selected: "Seleccionado",
    expiry: "El enlace expira en", singleUse: "Uso único", singleUseHint: "Eliminar tras la primera descarga",
    password: "Contraseña", passwordPlaceholder: "Dejar vacío para sin contraseña",
    upload: "Armar y crear enlace", uploading: "Subiendo…",
    linkReady: "Latch armado", copyLink: "Copiar enlace", copied: "¡Copiado!",
    myFiles: "Archivos", noFiles: "Aún no hay archivos subidos.",
    colName: "Archivo", colSize: "Tamaño", colExpires: "Vence", colDl: "DL",
    colStatus: "Estado", colLatch: "Latch",
    statusActive: "Activo", statusExpired: "Vencido", statusUsed: "Consumido",
    revoke: "Revocar", confirmDelete: "¿Eliminar este archivo y revocar el enlace?",
    errType: "Tipo de archivo no permitido", errSize: "Archivo demasiado grande", errUpload: "Error al subir",
    latchOptions: "Condiciones del latch",
    expiryHours: (h) => h < 24 ? `${h} hora${h !== 1 ? "s" : ""}` : `${Math.round(h / 24)} día${h / 24 !== 1 ? "s" : ""}`,
    downloadCap: "Límite de descargas", downloadCapHint: "Máx. veces que el enlace puede servir",
    armLink: "Armar y crear enlace", armingLink: "Armando latch…",
    latchArmed: "Latch armado", newShareBtn: "Nuevo envío",
    activeLatches: "Latches activos", totalDl: "Descargas", storageUsed: "Almacenamiento usado", of: "de",
    themeSystem: "Sistema", themeDark: "Oscuro", themeLight: "Claro",
    themeSystemUnsupported: "Sistema (no compatible)", admin: "Admin",
  },
  fr: {
    files: "Fichiers", newShare: "Nouveau partage", localNetwork: "Réseau local",
    users: "Utilisateurs", settings: "Paramètres", storage: "Stockage", logout: "Déconnexion",
    language: "Langue", theme: "Thème",
    uploadTitle: "Nouveau partage", dropHint: "Déposez un fichier ou parcourez",
    selectFile: "Parcourir", selected: "Sélectionné",
    expiry: "Le lien expire dans", singleUse: "Utilisation unique", singleUseHint: "Supprimer après le premier téléchargement",
    password: "Mot de passe", passwordPlaceholder: "Laisser vide pour aucun mot de passe",
    upload: "Armer et créer le lien", uploading: "Téléversement…",
    linkReady: "Latch armé", copyLink: "Copier le lien", copied: "Copié!",
    myFiles: "Fichiers", noFiles: "Aucun fichier téléversé pour le moment.",
    colName: "Fichier", colSize: "Taille", colExpires: "Expire", colDl: "TL",
    colStatus: "Statut", colLatch: "Latch",
    statusActive: "Actif", statusExpired: "Expiré", statusUsed: "Consommé",
    revoke: "Révoquer", confirmDelete: "Supprimer ce fichier et révoquer le lien?",
    errType: "Type de fichier non autorisé", errSize: "Fichier trop grand", errUpload: "Échec du téléversement",
    latchOptions: "Conditions du latch",
    expiryHours: (h) => h < 24 ? `${h} heure${h !== 1 ? "s" : ""}` : `${Math.round(h / 24)} jour${h / 24 !== 1 ? "s" : ""}`,
    downloadCap: "Limite de téléchargements", downloadCapHint: "Nombre max de fois que le lien peut servir",
    armLink: "Armer et créer le lien", armingLink: "Armement du latch…",
    latchArmed: "Latch armé", newShareBtn: "Nouveau partage",
    activeLatches: "Latches actifs", totalDl: "Téléchargements", storageUsed: "Stockage utilisé", of: "sur",
    themeSystem: "Système", themeDark: "Sombre", themeLight: "Clair",
    themeSystemUnsupported: "Système (non pris en charge)", admin: "Admin",
  },
  hi: {
    files: "फ़ाइलें", newShare: "नया शेयर", localNetwork: "लोकल नेटवर्क",
    users: "यूज़र", settings: "सेटिंग्स", storage: "स्टोरेज", logout: "लॉग आउट",
    language: "भाषा", theme: "थीम",
    uploadTitle: "नया शेयर", dropHint: "फ़ाइल छोड़ें या खोजें",
    selectFile: "खोजें", selected: "चुनी गई",
    expiry: "लिंक समाप्त होगा", singleUse: "एक बार", singleUseHint: "पहले डाउनलोड के बाद हटाएं",
    password: "पासवर्ड", passwordPlaceholder: "खाली छोड़ें यदि पासवर्ड नहीं चाहिए",
    upload: "लॉक करें & लिंक बनाएं", uploading: "अपलोड हो रहा है…",
    linkReady: "लैच तैयार", copyLink: "लिंक कॉपी करें", copied: "कॉपी किया!",
    myFiles: "फ़ाइलें", noFiles: "अभी कोई फ़ाइल नहीं।",
    colName: "फ़ाइल", colSize: "आकार", colExpires: "समाप्ति", colDl: "DL",
    colStatus: "स्थिति", colLatch: "लैच",
    statusActive: "सक्रिय", statusExpired: "समाप्त", statusUsed: "उपयोग किया",
    revoke: "रद्द", confirmDelete: "फ़ाइल हटाएं और लिंक रद्द करें?",
    errType: "फ़ाइल प्रकार की अनुमति नहीं", errSize: "फ़ाइल बहुत बड़ी है", errUpload: "अपलोड विफल",
    latchOptions: "लैच शर्तें",
    expiryHours: (h) => h < 24 ? `${h} घंटे में` : `${Math.round(h / 24)} दिन में`,
    downloadCap: "डाउनलोड सीमा", downloadCapHint: "लिंक कितनी बार सर्व कर सकता है",
    armLink: "लॉक करें & लिंक बनाएं", armingLink: "लैच बन रहा है…",
    latchArmed: "लैच तैयार", newShareBtn: "नया शेयर",
    activeLatches: "सक्रिय लैच", totalDl: "डाउनलोड", storageUsed: "उपयोग किया स्टोरेज", of: "में से",
    themeSystem: "डिवाइस के अनुसार", themeDark: "डार्क", themeLight: "लाइट",
    themeSystemUnsupported: "डिवाइस के अनुसार (असमर्थित)", admin: "एडमिन",
  },
  "zh-CN": {
    files: "文件", newShare: "新分享", localNetwork: "本地网络",
    users: "用户", settings: "设置", storage: "存储", logout: "退出",
    language: "语言", theme: "主题",
    uploadTitle: "新分享", dropHint: "拖放文件或浏览",
    selectFile: "浏览", selected: "已选择",
    expiry: "链接有效期", singleUse: "单次下载", singleUseHint: "首次下载后删除",
    password: "密码", passwordPlaceholder: "留空表示无密码",
    upload: "上锁并创建链接", uploading: "上传中…",
    linkReady: "锁已上好", copyLink: "复制链接", copied: "已复制!",
    myFiles: "文件", noFiles: "暂无上传的文件。",
    colName: "文件", colSize: "大小", colExpires: "过期", colDl: "下载",
    colStatus: "状态", colLatch: "锁",
    statusActive: "有效", statusExpired: "已过期", statusUsed: "已消耗",
    revoke: "撤销", confirmDelete: "删除此文件并撤销链接？",
    errType: "不允许此文件类型", errSize: "文件超过限制", errUpload: "上传失败",
    latchOptions: "锁定条件",
    expiryHours: (h) => h < 24 ? `${h} 小时` : `${Math.round(h / 24)} 天`,
    downloadCap: "下载上限", downloadCapHint: "链接最多可服务的次数",
    armLink: "上锁并创建链接", armingLink: "正在上锁…",
    latchArmed: "锁已上好", newShareBtn: "新分享",
    activeLatches: "活跃锁", totalDl: "下载次数", storageUsed: "已用存储", of: "/",
    themeSystem: "系统", themeDark: "深色", themeLight: "浅色",
    themeSystemUnsupported: "系统（不支持）", admin: "管理",
  },
};

const EXPIRY_PRESETS = [1, 6, 12, 24, 48, 168, 720];

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

function formatBytes(n: number) {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let v = n, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${Math.round(v * 10) / 10} ${units[i]}`;
}

function formatExpiry(expiresAt: string): { label: string; state: "ok" | "soon" | "expired" } {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { label: "expired", state: "expired" };
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return { label: `${mins}m`, state: mins < 30 ? "soon" : "ok" };
  const hours = Math.floor(mins / 60);
  if (hours < 24) return { label: `${hours}h ${mins % 60}m`, state: hours < 2 ? "soon" : "ok" };
  const days = Math.floor(hours / 24);
  return { label: `${days}d ${hours % 24}h`, state: "ok" };
}

function getFileStatus(file: FileItem): "active" | "expired" | "consumed" {
  if (new Date(file.expiresAt) < new Date()) return "expired";
  if (file.singleUse && file.downloadCount >= 1) return "consumed";
  return "active";
}

// ── Icons ──────────────────────────────────────────────────────
const Icon = {
  lock: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3"/></svg>,
  clock: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  one: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M6 4h2v8M5 12h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  copy: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M3 11V4a1 1 0 011-1h7" stroke="currentColor" strokeWidth="1.3"/></svg>,
  trash: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 5h10M6 5V3.5A.5.5 0 016.5 3h3a.5.5 0 01.5.5V5M5 5l.5 8a1 1 0 001 1h3a1 1 0 001-1l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  upload: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 11V3m0 0L5 6m3-3l3 3M3 13h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  download: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 3v8m0 0L5 8m3 3l3-3M3 13h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  shield: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 2l5 2v4c0 3-2.2 5.2-5 6-2.8-.8-5-3-5-6V4l5-2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  link: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M7 9.5L9 7.5m-2-1H5.5a2.5 2.5 0 100 5h2m1-7H10a2.5 2.5 0 110 5H8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  file: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 2h5l3 3v9H4V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  users: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11 4a2 2 0 110 4M14 13c0-2-1-3-2.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  settings: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1.5l1 2 2-.3.3 2 2 1-1 1.8 1 1.8-2 1-.3 2-2-.3-1 2-1-2-2 .3-.3-2-2-1 1-1.8-1-1.8 2-1 .3-2 2 .3 1-2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  network: (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="3" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="13" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 4.5v3m0 0L4 11m4-3.5L12 11" stroke="currentColor" strokeWidth="1.3"/></svg>,
  logo: (s = 18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="8" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M6 8V5.5a4 4 0 018 0V8" stroke="currentColor" strokeWidth="1.6"/><circle cx="10" cy="13" r="1.4" fill="currentColor"/></svg>,
};

export default function DashboardClient({ baseUrl }: { baseUrl: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lang, setLang] = useState<Lang>("en");
  const [themePref, setThemePref] = useState<ThemePref>("dark");
  const [systemSupported, setSystemSupported] = useState(false);
  const [systemIsDark, setSystemIsDark] = useState(true);
  const [activeSection, setActiveSection] = useState<NavSection>("files");

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

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const t = useMemo(() => translations[lang], [lang]);

  // ── Upload state ──────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ttlHours, setTtlHours] = useState(24);
  const [singleUse, setSingleUse] = useState(false);
  const [password, setPassword] = useState("");
  const [maxDl, setMaxDl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastToken, setLastToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── File list ─────────────────────────────────────────────────
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [fileFilter, setFileFilter] = useState<"all" | "active" | "consumed" | "expired">("all");

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

  // ── Derived stats ─────────────────────────────────────────────
  const stats = useMemo(() => {
    const active = files.filter((f) => getFileStatus(f) === "active").length;
    const totalDl = files.reduce((s, f) => s + f.downloadCount, 0);
    const totalBytes = files.reduce((s, f) => s + Number(f.sizeBytes), 0);
    return { active, totalDl, totalBytes };
  }, [files]);

  // ── Upload ────────────────────────────────────────────────────
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
          setMaxDl("");
          fetchFiles();
        } catch { setUploadError(t.errUpload); }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          setUploadError(
            data.error?.includes("type") ? t.errType :
            data.error?.includes("limit") || data.error?.includes("large") || data.error?.includes("quota") ? t.errSize :
            data.error || t.errUpload
          );
        } catch { setUploadError(t.errUpload); }
      }
    };
    xhr.onerror = () => { setUploading(false); setUploadError(t.errUpload); };
    xhr.send(formData);
  }

  function buildShareUrl(token: string) {
    const origin = (baseUrl || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");
    return `${origin}/d/${token}`;
  }

  function copyLink(token: string) {
    const url = buildShareUrl(token);
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
    try { await fetch("/api/logout", { method: "POST", credentials: "include" }); } catch {}
    window.location.replace("/login");
  }

  function onDragOver(e: React.DragEvent) { e.preventDefault(); setDragging(true); }
  function onDragLeave() { setDragging(false); }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setSelectedFile(f);
  }

  // ── Filtered files ────────────────────────────────────────────
  const filteredFiles = useMemo(() => {
    if (fileFilter === "all") return files;
    return files.filter((f) => getFileStatus(f) === fileFilter);
  }, [files, fileFilter]);

  const fileCounts = useMemo(() => ({
    all: files.length,
    active: files.filter((f) => getFileStatus(f) === "active").length,
    consumed: files.filter((f) => getFileStatus(f) === "consumed").length,
    expired: files.filter((f) => getFileStatus(f) === "expired").length,
  }), [files]);

  const THEME_LABELS: Record<ThemePref, string> = {
    system: t.themeSystem,
    dark: t.themeDark,
    light: t.themeLight,
  };

  const navItems = [
    { id: "files" as NavSection, label: t.files, icon: Icon.file },
    { id: "share" as NavSection, label: t.newShare, icon: Icon.upload },
  ];

  const sectionTitles: Record<NavSection, string> = {
    files: t.myFiles,
    share: t.newShare,
  };

  const shareStage = uploading ? "uploading" : lastToken ? "done" : "compose";

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-0)", color: "var(--fg-0)", position: "relative" }}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />

      {/* Mobile sidebar backdrop */}
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
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px" }}>
          <span style={{ color: "var(--accent)" }}>{Icon.logo(20)}</span>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: -0.2 }}>Latchsend</span>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item) => {
            const active = item.id === activeSection;
            return (
              <button key={item.id} onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 8,
                background: active ? "var(--bg-2)" : "transparent",
                color: active ? "var(--fg-0)" : "var(--fg-1)",
                fontSize: 13, fontWeight: active ? 500 : 400, textAlign: "left", width: "100%",
              }}>
                <span style={{ color: active ? "var(--accent)" : "var(--fg-2)" }}>{item.icon(15)}</span>
                {item.label}
              </button>
            );
          })}
          {/* External nav items */}
          {[
            { href: "/local", label: t.localNetwork, icon: Icon.network },
            { href: "/admin", label: t.admin, icon: Icon.users },
          ].map((item) => (
            <button key={item.href} onClick={() => { setSidebarOpen(false); window.location.assign(item.href); }} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", borderRadius: 8,
              background: "transparent", color: "var(--fg-1)",
              fontSize: 13, fontWeight: 400, textAlign: "left", width: "100%",
            }}>
              <span style={{ color: "var(--fg-2)" }}>{item.icon(15)}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Storage meter */}
          <div style={{ padding: "10px 10px", borderRadius: 8, background: "var(--bg-1)", border: "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--fg-2)", marginBottom: 6 }}>
              <span className="label" style={{ fontSize: 9.5 }}>{t.storage}</span>
              <span className="mono" style={{ color: "var(--fg-1)" }}>{formatBytes(stats.totalBytes)}</span>
            </div>
            <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: "30%", height: "100%", background: "var(--accent)" }} />
            </div>
          </div>

          {/* Lang + Theme selectors */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <select className="select" value={lang} onChange={(e) => setLang(e.target.value as Lang)} style={{ height: 30, fontSize: 12 }}>
              {LANG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.flag} {o.label}</option>)}
            </select>
            <select className="select" value={themePref} onChange={(e) => setThemePref(e.target.value as ThemePref)} style={{ height: 30, fontSize: 12 }}>
              <option value="system" disabled={!systemSupported}>{THEME_LABELS["system"]}</option>
              <option value="dark">{THEME_LABELS["dark"]}</option>
              <option value="light">{THEME_LABELS["light"]}</option>
            </select>
          </div>

          {/* Logout */}
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
              <span className="label" style={{ color: "var(--fg-1)" }}>{sectionTitles[activeSection]}</span>
            </div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 600, letterSpacing: -0.4 }}>{sectionTitles[activeSection]}</h1>
          </div>
          {activeSection === "files" && (
            <button className="btn btn-accent btn-sm" style={{ flexShrink: 0 }} onClick={() => setActiveSection("share")}>
              {Icon.upload(13)} {t.newShare}
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: isMobile ? "16px" : "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── Files view ──────────────────────────────────────── */}
          {activeSection === "files" && (
            <>
              {/* Stats strip */}
              <div style={{
                display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 1,
                background: "var(--line)", border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden",
              }}>
                {[
                  { label: t.activeLatches, value: stats.active, hint: `${files.length} total` },
                  { label: t.totalDl, value: stats.totalDl, hint: "all time" },
                  { label: t.storageUsed, value: formatBytes(stats.totalBytes), hint: "" },
                  { label: t.myFiles, value: files.length, hint: `${fileCounts.expired} expired` },
                ].map((s, i) => (
                  <div key={i} style={{ background: "var(--bg-1)", padding: "14px 16px" }}>
                    <div className="label">{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, letterSpacing: -0.5 }}>{s.value}</div>
                    {s.hint && <div style={{ fontSize: 11.5, color: "var(--fg-2)", marginTop: 2 }}>{s.hint}</div>}
                  </div>
                ))}
              </div>

              {/* Files table */}
              <div className="panel" style={{ padding: 0 }}>
                <div className="panel-header" style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {(["all", "active", "consumed", "expired"] as const).map((k) => {
                      const labels = { all: "All", active: t.statusActive, consumed: t.statusUsed, expired: t.statusExpired };
                      return (
                        <button key={k} onClick={() => setFileFilter(k)} className="btn btn-sm" style={{
                          background: fileFilter === k ? "var(--bg-3)" : "transparent",
                          color: fileFilter === k ? "var(--fg-0)" : "var(--fg-1)",
                          fontWeight: fileFilter === k ? 500 : 400,
                        }}>
                          {labels[k]} <span className="mono" style={{ color: "var(--fg-3)", marginLeft: 4 }}>{fileCounts[k]}</span>
                        </button>
                      );
                    })}
                  </div>
                  {loadingFiles && <span style={{ fontSize: 11, color: "var(--fg-3)" }}>…</span>}
                </div>

                {filteredFiles.length === 0 && !loadingFiles ? (
                  <div style={{ padding: "32px 24px", textAlign: "center", color: "var(--fg-2)", fontSize: 13 }}>
                    {files.length === 0 ? t.noFiles : "No files match this filter."}
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--line)" }}>
                          {[t.colName, t.colLatch, "Token", t.colExpires, t.colDl, t.colStatus, ""].map((h, i) => (
                            <th key={i} className="label" style={{ textAlign: "left", padding: "10px 14px", fontWeight: 500 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFiles.map((file) => {
                          const status = getFileStatus(file);
                          const ttl = formatExpiry(file.expiresAt);
                          return (
                            <tr key={file.id} style={{ borderBottom: "1px solid var(--line)" }}>
                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                                  <span style={{
                                    display: "inline-flex", width: 28, height: 28, borderRadius: 6,
                                    background: "var(--bg-2)", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                  }}>
                                    <span className="mono" style={{ fontSize: 9.5, color: "var(--fg-1)", fontWeight: 600, textTransform: "uppercase" }}>
                                      {file.extension.slice(0, 3)}
                                    </span>
                                  </span>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 500, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                                      {file.originalName}
                                    </div>
                                    <div className="mono" style={{ fontSize: 11, color: "var(--fg-3)" }}>{formatBytes(Number(file.sizeBytes))}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                  <span className="chip chip-mute">{Icon.clock(11)} {ttl.label}</span>
                                  {file.singleUse && <span className="chip chip-warn">{Icon.one(11)} 1×</span>}
                                  {file.hasPassword && <span className="chip chip-info">{Icon.lock(11)} pw</span>}
                                </div>
                              </td>
                              <td style={{ padding: "12px 14px" }}>
                                <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-2)" }}>
                                  {file.downloadToken.slice(0, 8)}…
                                </span>
                              </td>
                              <td style={{ padding: "12px 14px" }}>
                                {status === "expired" ? (
                                  <span className="chip chip-err"><span className="chip-dot" /> {t.statusExpired}</span>
                                ) : status === "consumed" ? (
                                  <span className="chip chip-mute"><span className="chip-dot" /> {t.statusUsed}</span>
                                ) : (
                                  <span className={`chip ${ttl.state === "soon" ? "chip-warn" : "chip-ok"}`}>
                                    <span className="chip-dot" /> {t.statusActive}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: "12px 14px" }}>
                                <span className="mono" style={{ fontSize: 12, color: "var(--fg-1)" }}>{file.downloadCount}</span>
                              </td>
                              <td style={{ padding: "12px 14px" }}>
                                <span className="mono" style={{ fontSize: 11, color: "var(--fg-2)" }}>{ttl.label}</span>
                              </td>
                              <td style={{ padding: "12px 14px", textAlign: "right" }}>
                                <div style={{ display: "inline-flex", gap: 4 }}>
                                  {status === "active" && (
                                    <button className="btn btn-quiet btn-sm" onClick={() => copyLink(file.downloadToken)} title={t.copyLink}>
                                      {Icon.copy(12)}
                                    </button>
                                  )}
                                  <button className="btn btn-quiet btn-sm" onClick={() => handleDelete(file)} title={t.revoke}
                                    style={{ color: "var(--fg-2)" }}>
                                    {Icon.trash(12)}
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
              </div>
            </>
          )}

          {/* ── New Share view ─────────────────────────────────── */}
          {activeSection === "share" && (
            <div className="panel" style={{ padding: 0, maxWidth: 800 }}>
              <div className="panel-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--accent)" }}>{Icon.shield(15)}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{t.newShare}</span>
                </div>
                <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)" }}>3 conditions</span>
              </div>

              {shareStage === "done" && lastToken ? (
                /* Success state */
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "var(--ok)" }}>{Icon.check(16)}</span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{t.latchArmed}</span>
                  </div>
                  <div>
                    <div className="label" style={{ marginBottom: 6 }}>Share URL</div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 12px", background: "var(--bg-0)",
                      border: "1px solid var(--line)", borderRadius: 8,
                    }}>
                      <span style={{ color: "var(--fg-2)" }}>{Icon.link(13)}</span>
                      <span className="mono" style={{ flex: 1, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {buildShareUrl(lastToken)}
                      </span>
                      <button className="btn btn-accent btn-sm" onClick={() => copyLink(lastToken)}>
                        {copied ? <>{Icon.check(12)} {t.copied}</> : <>{Icon.copy(12)} {t.copyLink}</>}
                      </button>
                    </div>
                  </div>
                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1,
                    background: "var(--line)", border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden",
                  }}>
                    {[
                      { icon: Icon.clock(13), label: "Expires", value: `in ${ttlHours}h` },
                      { icon: Icon.one(13), label: "Single use", value: singleUse ? "Yes" : "No", active: singleUse },
                      { icon: Icon.lock(13), label: "Password", value: password ? "Required" : "None", active: !!password },
                    ].map((c, i) => (
                      <div key={i} style={{ background: "var(--bg-1)", padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: c.active ? "var(--accent)" : "var(--fg-2)" }}>
                          {c.icon}
                          <span className="label" style={{ color: "inherit" }}>{c.label}</span>
                        </div>
                        <div className="mono" style={{ fontSize: 13, marginTop: 4 }}>{c.value}</div>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-quiet btn-sm" onClick={() => { setLastToken(null); setActiveSection("files"); }}>
                    {t.newShareBtn}
                  </button>
                </div>
              ) : (
                /* Compose state */
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.1fr 1fr" }}>
                  {/* File drop */}
                  <div style={{ padding: 18, borderRight: isMobile ? "none" : "1px solid var(--line)", borderBottom: isMobile ? "1px solid var(--line)" : "none" }}>
                    <div
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      onClick={() => !selectedFile && fileInputRef.current?.click()}
                      style={{
                        border: `1px dashed ${dragging ? "var(--accent-line)" : "var(--line-strong)"}`,
                        background: dragging ? "var(--accent-soft)" : "var(--bg-0)",
                        borderRadius: 10, minHeight: 220, padding: 18,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
                        cursor: selectedFile ? "default" : "pointer", textAlign: "center",
                      }}
                    >
                      {selectedFile ? (
                        <>
                          <div style={{
                            width: 44, height: 44, borderRadius: 8, background: "var(--bg-2)",
                            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-1)",
                          }}>{Icon.file(20)}</div>
                          <div style={{ fontWeight: 500, fontSize: 13.5, wordBreak: "break-all", maxWidth: 260 }}>
                            {selectedFile.name}
                          </div>
                          <div className="mono" style={{ fontSize: 11.5, color: "var(--fg-2)" }}>{formatBytes(selectedFile.size)}</div>
                          {uploading ? (
                            <div style={{ width: "100%", maxWidth: 260, marginTop: 6 }}>
                              <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 99, overflow: "hidden" }}>
                                <div style={{ width: `${uploadProgress}%`, height: "100%", background: "var(--accent)", transition: "width 0.18s" }} />
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11 }}>
                                <span className="mono" style={{ color: "var(--fg-2)" }}>{uploadProgress}%</span>
                                <span className="mono" style={{ color: "var(--fg-3)" }}>{t.uploading}</span>
                              </div>
                            </div>
                          ) : (
                            <button className="btn btn-quiet btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setUploadError(""); }}>
                              Remove
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <div style={{
                            width: 44, height: 44, borderRadius: 10, background: "var(--bg-2)",
                            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-1)",
                          }}>{Icon.upload(18)}</div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{t.dropHint}</div>
                          <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                            {t.selectFile}
                          </button>
                        </>
                      )}
                    </div>

                    {uploadError && (
                      <div style={{
                        marginTop: 12, padding: "8px 12px", borderRadius: 8,
                        background: "var(--err-soft)", color: "var(--err)", fontSize: 12.5,
                      }}>
                        {uploadError}
                      </div>
                    )}
                  </div>

                  {/* Latch conditions */}
                  <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Time lock */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-1)", flexShrink: 0 }}>
                        {Icon.clock(14)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>Time lock</div>
                        <div style={{ fontSize: 11.5, color: "var(--fg-2)" }}>Link auto-expires</div>
                      </div>
                      <select className="select" style={{ width: 120, height: 30, fontSize: 12.5 }}
                        value={ttlHours} onChange={(e) => setTtlHours(+e.target.value)}>
                        {EXPIRY_PRESETS.map((h) => <option key={h} value={h}>{t.expiryHours(h)}</option>)}
                      </select>
                    </div>

                    {/* Single use */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-1)", flexShrink: 0 }}>
                        {Icon.one(14)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{t.singleUse}</div>
                        <div style={{ fontSize: 11.5, color: "var(--fg-2)" }}>{t.singleUseHint}</div>
                      </div>
                      <div
                        className={`toggle ${singleUse ? "on" : ""}`}
                        onClick={() => setSingleUse((s) => !s)}
                      />
                    </div>

                    {/* Download cap */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-1)", flexShrink: 0 }}>
                        {Icon.download(14)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{t.downloadCap}</div>
                        <div style={{ fontSize: 11.5, color: "var(--fg-2)" }}>{t.downloadCapHint}</div>
                      </div>
                      <input
                        className="input mono"
                        style={{ width: 72, height: 30, fontSize: 12.5, textAlign: "center" }}
                        placeholder="∞"
                        value={maxDl}
                        onChange={(e) => setMaxDl(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>

                    {/* Password */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-1)", flexShrink: 0 }}>
                        {Icon.lock(14)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{t.password}</div>
                        <div style={{ fontSize: 11.5, color: "var(--fg-2)" }}>Recipient must enter secret</div>
                      </div>
                      <div
                        className={`toggle ${password ? "on" : ""}`}
                        onClick={() => { if (password) setPassword(""); }}
                      />
                    </div>
                    <input
                      className="input mono"
                      type="password"
                      placeholder={t.passwordPlaceholder}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ height: 32, fontSize: 12.5 }}
                    />

                    <div style={{ flex: 1 }} />

                    <button
                      className="btn btn-accent"
                      disabled={!selectedFile || uploading}
                      onClick={handleUpload}
                      style={{ height: 38 }}
                    >
                      {Icon.shield(14)} {uploading ? t.armingLink : t.armLink}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
