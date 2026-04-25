"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Lang = "en" | "tr" | "es" | "fr" | "hi" | "zh-CN";
type ThemePref = "system" | "dark" | "light";

type Peer = {
  id: string;
  name: string;
  lastSeen: number;
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
    backToLogin: string;
    deviceTitle: string;
    deviceName: string;
    support: string;
    supported: string;
    unsupported: string;
    peersTitle: string;
    noPeers: string;
    sendToThisDevice: string;
    readyTitle: string;
    readyText: string;
    nextStepTitle: string;
    nextStepText: string;
    hint: string;
    incomingRequest: string;
    outgoingRequest: string;
  }
> = {
  en: {
    badge: "Guest Local Share",
    title: "Local Network Sharing",
    subtitle:
      "Devices connected to the same signaling layer appear here. Next, we will connect direct WebRTC transfer.",
    language: "Language",
    theme: "Theme",
    themeSystem: "Use device setting",
    themeDark: "Always dark",
    themeLight: "Always light",
    themeSystemUnsupported: "Use device setting (device not supported)",
    backToLogin: "Back to Login",
    deviceTitle: "This Device",
    deviceName: "Device Name",
    support: "Browser support",
    supported: "Ready",
    unsupported: "Not supported",
    peersTitle: "Available Devices",
    noPeers: "No other active devices found yet.",
    sendToThisDevice: "Send to this device",
    readyTitle: "Ready State",
    readyText:
      "This device is visible to other connected devices through the signaling server.",
    nextStepTitle: "Next Technical Step",
    nextStepText:
      "The next step is sending real signaling offers/answers and opening a WebRTC data channel for direct file transfer.",
    hint: "Your selected language and theme will be used across the app.",
    incomingRequest: "Incoming share request from",
    outgoingRequest: "Share request sent to",
  },
  tr: {
    badge: "Girişsiz Yerel Paylaşım",
    title: "Yerel Ağ Paylaşımı",
    subtitle:
      "Aynı signaling katmanına bağlı cihazlar burada görünür. Sonraki adımda doğrudan WebRTC aktarımını bağlayacağız.",
    language: "Dil",
    theme: "Tema",
    themeSystem: "Cihaza göre",
    themeDark: "Hep siyah",
    themeLight: "Hep beyaz",
    themeSystemUnsupported: "Cihaza göre (cihaz desteklemiyor)",
    backToLogin: "Girişe Dön",
    deviceTitle: "Bu Cihaz",
    deviceName: "Cihaz Adı",
    support: "Tarayıcı desteği",
    supported: "Hazır",
    unsupported: "Desteklenmiyor",
    peersTitle: "Kullanılabilir Cihazlar",
    noPeers: "Henüz başka aktif cihaz bulunamadı.",
    sendToThisDevice: "Bu cihaza gönder",
    readyTitle: "Hazır Durumu",
    readyText:
      "Bu cihaz signaling sunucusu üzerinden diğer bağlı cihazlara görünür.",
    nextStepTitle: "Sonraki Teknik Adım",
    nextStepText:
      "Sıradaki adım gerçek offer/answer signaling akışını gönderip doğrudan dosya aktarımı için WebRTC data channel açmaktır.",
    hint: "Seçtiğin dil ve tema uygulamanın tamamında kullanılacaktır.",
    incomingRequest: "Gelen paylaşım isteği:",
    outgoingRequest: "Paylaşım isteği gönderildi:",
  },
  es: {
    badge: "Compartir Local sin Inicio",
    title: "Compartir en Red Local",
    subtitle:
      "Los dispositivos conectados a la misma capa de signaling aparecerán aquí. Luego conectaremos transferencia WebRTC directa.",
    language: "Idioma",
    theme: "Tema",
    themeSystem: "Usar ajuste del dispositivo",
    themeDark: "Siempre oscuro",
    themeLight: "Siempre claro",
    themeSystemUnsupported: "Usar ajuste del dispositivo (no compatible)",
    backToLogin: "Volver al Login",
    deviceTitle: "Este Dispositivo",
    deviceName: "Nombre del dispositivo",
    support: "Compatibilidad del navegador",
    supported: "Listo",
    unsupported: "No compatible",
    peersTitle: "Dispositivos Disponibles",
    noPeers: "Aún no se encontró otro dispositivo activo.",
    sendToThisDevice: "Enviar a este dispositivo",
    readyTitle: "Estado",
    readyText:
      "Este dispositivo es visible para otros dispositivos conectados a través del servidor de signaling.",
    nextStepTitle: "Siguiente Paso Técnico",
    nextStepText:
      "El siguiente paso es enviar ofertas/respuestas reales y abrir un canal WebRTC para transferencia directa.",
    hint: "El idioma y tema elegidos se usarán en toda la app.",
    incomingRequest: "Solicitud entrante de:",
    outgoingRequest: "Solicitud enviada a:",
  },
  fr: {
    badge: "Partage Local Invité",
    title: "Partage Réseau Local",
    subtitle:
      "Les appareils connectés à la même couche de signaling apparaissent ici. Ensuite, nous ajouterons le transfert WebRTC direct.",
    language: "Langue",
    theme: "Thème",
    themeSystem: "Utiliser le réglage de l'appareil",
    themeDark: "Toujours sombre",
    themeLight: "Toujours clair",
    themeSystemUnsupported:
      "Utiliser le réglage de l'appareil (non pris en charge)",
    backToLogin: "Retour au login",
    deviceTitle: "Cet Appareil",
    deviceName: "Nom de l'appareil",
    support: "Compatibilité navigateur",
    supported: "Prêt",
    unsupported: "Non pris en charge",
    peersTitle: "Appareils Disponibles",
    noPeers: "Aucun autre appareil actif trouvé pour le moment.",
    sendToThisDevice: "Envoyer vers cet appareil",
    readyTitle: "État",
    readyText:
      "Cet appareil est visible pour les autres appareils connectés via le serveur de signaling.",
    nextStepTitle: "Étape Technique Suivante",
    nextStepText:
      "L'étape suivante consiste à envoyer de vraies offres/réponses et ouvrir un canal WebRTC pour le transfert direct.",
    hint: "La langue et le thème choisis seront utilisés dans toute l'app.",
    incomingRequest: "Demande entrante de :",
    outgoingRequest: "Demande envoyée à :",
  },
  hi: {
    badge: "गेस्ट लोकल शेयर",
    title: "लोकल नेटवर्क शेयरिंग",
    subtitle:
      "एक ही signaling लेयर से जुड़े डिवाइस यहाँ दिखेंगे। अगले चरण में डायरेक्ट WebRTC ट्रांसफर जोड़ा जाएगा।",
    language: "भाषा",
    theme: "थीम",
    themeSystem: "डिवाइस के अनुसार",
    themeDark: "हमेशा डार्क",
    themeLight: "हमेशा लाइट",
    themeSystemUnsupported: "डिवाइस के अनुसार (समर्थन नहीं)",
    backToLogin: "लॉगिन पर लौटें",
    deviceTitle: "यह डिवाइस",
    deviceName: "डिवाइस नाम",
    support: "ब्राउज़र समर्थन",
    supported: "तैयार",
    unsupported: "समर्थित नहीं",
    peersTitle: "उपलब्ध डिवाइस",
    noPeers: "अभी कोई दूसरा सक्रिय डिवाइस नहीं मिला।",
    sendToThisDevice: "इस डिवाइस को भेजें",
    readyTitle: "स्थिति",
    readyText:
      "यह डिवाइस signaling सर्वर के जरिए अन्य जुड़े डिवाइसों को दिखाई देता है।",
    nextStepTitle: "अगला तकनीकी चरण",
    nextStepText:
      "अगला चरण असली offer/answer signaling भेजना और डायरेक्ट ट्रांसफर के लिए WebRTC data channel खोलना है।",
    hint: "चुनी गई भाषा और थीम पूरी ऐप में उपयोग की जाएगी।",
    incomingRequest: "आने वाला शेयर अनुरोध:",
    outgoingRequest: "शेयर अनुरोध भेजा गया:",
  },
  "zh-CN": {
    badge: "免登录本地分享",
    title: "本地网络分享",
    subtitle:
      "连接到同一 signaling 层的设备会显示在这里。下一步会接入直接 WebRTC 传输。",
    language: "语言",
    theme: "主题",
    themeSystem: "跟随设备",
    themeDark: "始终深色",
    themeLight: "始终浅色",
    themeSystemUnsupported: "跟随设备（设备不支持）",
    backToLogin: "返回登录",
    deviceTitle: "当前设备",
    deviceName: "设备名称",
    support: "浏览器支持",
    supported: "已就绪",
    unsupported: "不支持",
    peersTitle: "可用设备",
    noPeers: "暂时没有发现其他在线设备。",
    sendToThisDevice: "发送到此设备",
    readyTitle: "准备状态",
    readyText: "此设备会通过 signaling 服务器对其他已连接设备可见。",
    nextStepTitle: "下一技术步骤",
    nextStepText:
      "下一步是发送真实的 offer/answer signaling，并打开 WebRTC data channel 进行直传。",
    hint: "所选语言和主题将应用到整个系统。",
    incomingRequest: "收到分享请求：",
    outgoingRequest: "已发送请求到：",
  },
};

function hasSystemThemeSupport() {
  if (typeof window === "undefined") return false;
  return typeof window.matchMedia === "function";
}

function getSystemIsDark() {
  if (!hasSystemThemeSupport()) return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function makeClientId() {
  const saved =
    typeof window !== "undefined"
      ? window.localStorage.getItem("latchsend_device_id")
      : null;
  if (saved) return saved;

  const cryptoObj =
    typeof window !== "undefined"
      ? window.crypto || (window as any).msCrypto
      : undefined;

  let id = "";
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    id = cryptoObj.randomUUID();
  } else if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    cryptoObj.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b: number) =>
      b.toString(16).padStart(2, "0")
    ).join("");
    id = [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32),
    ].join("-");
  } else {
    id = `fallback-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  try {
    window.localStorage.setItem("latchsend_device_id", id);
  } catch {}
  return id;
}

function makeDeviceNameStable(clientId: string) {
  const saved =
    typeof window !== "undefined"
      ? window.localStorage.getItem("latchsend_device_name")
      : null;
  if (saved) return saved;

  const ua =
    typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
  let base = "Browser Device";
  if (ua.includes("iphone")) base = "iPhone";
  else if (ua.includes("ipad")) base = "iPad";
  else if (ua.includes("mac")) base = "Mac";
  else if (ua.includes("android")) base = "Android";
  else if (ua.includes("windows")) base = "Windows PC";
  else if (ua.includes("linux")) base = "Linux PC";

  const suffix = clientId.slice(0, 4).toUpperCase();
  const name = `${base} ${suffix}`;

  try {
    window.localStorage.setItem("latchsend_device_name", name);
  } catch {}
  return name;
}

function formatBytes(n: number) {
  if (!Number.isFinite(n) || n <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${Math.round(v * 10) / 10} ${units[i]}`;
}

async function waitForDataChannelOpen(dc: RTCDataChannel, ms = 12000) {
  if (dc.readyState === "open") return;
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(
      () => reject(new Error("dc_open_timeout")),
      ms
    );
    const onOpen = () => {
      window.clearTimeout(timer);
      dc.removeEventListener("open", onOpen);
      resolve();
    };
    dc.addEventListener("open", onOpen);
  });
}

export default function LocalShareClient({
  siteName,
  initialLang,
}: {
  siteName: string;
  initialLang: Lang;
}) {
  const socketRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<number | null>(null);
  const renameTimerRef = useRef<number | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const currentPeerIdRef = useRef<string>("");

  const incomingMetaRef = useRef<{
    name: string;
    size: number;
    mime: string;
  } | null>(null);
  const incomingBuffersRef = useRef<ArrayBuffer[]>([]);
  const incomingBytesRef = useRef<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingSendRef = useRef<{ peerId: string; file: File | null } | null>(
    null
  );

  // ✅ DÜZELTİLDİ: ref → state yapıldı; ref hiç re-render tetiklemiyordu,
  //    bu yüzden buton sürekli disabled kalıyor ve peers görünmüyordu.
  const supportsRelayRef = useRef(false); // async callback'lerde okunmak için hâlâ ref lazım
  const [supportsRelay, setSupportsRelay] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Lang>(initialLang || "en");
  const [themePref, setThemePref] = useState<ThemePref>("dark");
  const [systemSupported, setSystemSupported] = useState(false);
  const [systemIsDark, setSystemIsDark] = useState(true);

  const [clientId, setClientId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [webrtcSupported, setWebrtcSupported] = useState(false);

  const [peers, setPeers] = useState<Peer[]>([]);
  const [socketState, setSocketState] = useState<"idle" | "open" | "error">(
    "idle"
  );

  const [sending, setSending] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusLine, setStatusLine] = useState("");

  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadName, setDownloadName] = useState("");

  const [incomingPanel, setIncomingPanel] = useState<{
    visible: boolean;
    fromId: string;
    fromName: string;
    fileName: string;
    fileSize: number;
    offerPayload: RTCSessionDescriptionInit | null;
    fileMime: string;
  }>({
    visible: false,
    fromId: "",
    fromName: "",
    fileName: "",
    fileSize: 0,
    offerPayload: null,
    fileMime: "application/octet-stream",
  });

  const t = useMemo(() => translations[lang], [lang]);

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Hydration ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);

    try {
      const saved = window.localStorage.getItem(
        "latchsend_lang"
      ) as Lang | null;
      const supported: Lang[] = ["en", "tr", "es", "fr", "hi", "zh-CN"];
      if (saved && supported.includes(saved)) setLang(saved);
      else window.localStorage.setItem("latchsend_lang", initialLang);
    } catch {}

    const supportedTheme = hasSystemThemeSupport();
    setSystemSupported(supportedTheme);
    setSystemIsDark(getSystemIsDark());

    try {
      const savedTheme = window.localStorage.getItem(
        "latchsend_theme"
      ) as ThemePref | null;
      if (savedTheme === "dark" || savedTheme === "light")
        setThemePref(savedTheme);
      else if (savedTheme === "system" && supportedTheme)
        setThemePref("system");
      else setThemePref(supportedTheme ? "system" : "dark");
    } catch {
      setThemePref(supportedTheme ? "system" : "dark");
    }
  }, [initialLang]);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem("latchsend_lang", lang);
    } catch {}
  }, [lang, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      if (themePref === "system" && !systemSupported) {
        window.localStorage.setItem("latchsend_theme", "dark");
        return;
      }
      window.localStorage.setItem("latchsend_theme", themePref);
    } catch {}
  }, [themePref, systemSupported, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const id = makeClientId();
    setClientId(id);
    const name = makeDeviceNameStable(id);
    setDeviceName(name);
    setWebrtcSupported(
      typeof (window as any).RTCPeerConnection !== "undefined"
    );
  }, [mounted]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function resetDownload() {
    if (downloadUrl) {
      try {
        URL.revokeObjectURL(downloadUrl);
      } catch {}
    }
    setDownloadUrl("");
    setDownloadName("");
  }

  function closeWebRTC() {
    try {
      dcRef.current?.close();
    } catch {}
    dcRef.current = null;

    try {
      pcRef.current?.close();
    } catch {}
    pcRef.current = null;

    currentPeerIdRef.current = "";
    pendingSendRef.current = null;
    incomingMetaRef.current = null;
    incomingBuffersRef.current = [];
    incomingBytesRef.current = 0;

    setSending(false);
    setReceiving(false);
    setProgress(0);
  }

  function createPc(targetPeerId: string) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    currentPeerIdRef.current = targetPeerId;

    pc.onicecandidate = (e) => {
      if (!e.candidate) return;
      const socket = socketRef.current;
      const targetId = currentPeerIdRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN || !targetId) return;
      socket.send(
        JSON.stringify({ type: "rtc-ice", targetId, payload: e.candidate })
      );
    };

    pc.ondatachannel = (event) => {
      const dc = event.channel;
      dcRef.current = dc;
      wireDataChannel(dc);
    };

    return pc;
  }

  function wireDataChannel(dc: RTCDataChannel) {
    dc.binaryType = "arraybuffer";

    dc.onopen = () =>
      setStatusLine(lang === "tr" ? "Kanal açık" : "Channel open");
    dc.onclose = () => {
      setStatusLine(lang === "tr" ? "Kanal kapandı" : "Channel closed");
      closeWebRTC();
    };
    dc.onerror = () => {
      setStatusLine(lang === "tr" ? "Kanal hatası" : "Channel error");
      closeWebRTC();
    };

    dc.onmessage = (ev) => {
      if (typeof ev.data === "string") {
        try {
          const msg = JSON.parse(ev.data);

          if (msg.type === "file-meta") {
            const meta = {
              name: String(msg.name || "file"),
              size: Number(msg.size || 0),
              mime: String(msg.mime || "application/octet-stream"),
            };
            incomingMetaRef.current = meta;
            incomingBuffersRef.current = [];
            incomingBytesRef.current = 0;
            resetDownload();
            setReceiving(true);
            setProgress(0);
            setStatusLine(
              `${lang === "tr" ? "Alınıyor" : "Receiving"}: ${meta.name} ${
                meta.size ? `(${formatBytes(meta.size)})` : ""
              }`
            );
            return;
          }

          if (msg.type === "file-done") {
            const meta = incomingMetaRef.current;
            const blob = new Blob(incomingBuffersRef.current, {
              type: meta?.mime || "application/octet-stream",
            });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            setDownloadName(meta?.name || "download");
            setProgress(100);
            setReceiving(false);
            setStatusLine(lang === "tr" ? "Dosya hazır ✅" : "File ready ✅");
            window.setTimeout(() => closeWebRTC(), 800);
            return;
          }
        } catch {}
        return;
      }

      const chunk = ev.data as ArrayBuffer;
      incomingBuffersRef.current.push(chunk);
      incomingBytesRef.current += chunk.byteLength;

      const total = incomingMetaRef.current?.size || 0;
      if (total > 0) {
        setProgress(
          Math.min(
            100,
            Math.round((incomingBytesRef.current / total) * 100)
          )
        );
      }
    };
  }

  async function sendFileOverDataChannel(file: File) {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== "open") {
      setStatusLine(
        lang === "tr" ? "Kanal açık değil" : "Channel not open"
      );
      closeWebRTC();
      return;
    }

    setSending(true);
    setProgress(0);
    setStatusLine(
      `${lang === "tr" ? "Gönderiliyor" : "Sending"}: ${file.name} (${formatBytes(file.size)})`
    );

    dc.send(
      JSON.stringify({
        type: "file-meta",
        name: file.name,
        size: file.size,
        mime: file.type || "application/octet-stream",
      })
    );

    const chunkSize = 16 * 1024;
    let offset = 0;

    while (offset < file.size) {
      const buf = await file.slice(offset, offset + chunkSize).arrayBuffer();
      dc.send(buf);
      offset += chunkSize;
      setProgress(Math.min(100, Math.round((offset / file.size) * 100)));

      if (dc.bufferedAmount > 4 * 1024 * 1024) {
        await new Promise((r) => setTimeout(r, 50));
      }
    }

    dc.send(JSON.stringify({ type: "file-done" }));
    setSending(false);
    setStatusLine(lang === "tr" ? "Gönderildi ✅" : "Sent ✅");
    window.setTimeout(() => closeWebRTC(), 800);
  }

  function requestSendFile(peerId: string) {
    if (!webrtcSupported) {
      alert(
        lang === "tr" ? "WebRTC desteklenmiyor." : "WebRTC not supported."
      );
      return;
    }
    if (!supportsRelayRef.current) {
      alert(
        lang === "tr"
          ? "Signaling sunucusuna bağlanılamadı."
          : "Could not connect to signaling server."
      );
      return;
    }
    pendingSendRef.current = { peerId, file: null };
    fileInputRef.current?.click();
  }

  async function onPickedFile(file: File | null) {
    if (!file) return;
    const pending = pendingSendRef.current;
    if (!pending?.peerId) return;
    await startWebRTCSend(pending.peerId, file);
  }

  async function startWebRTCSend(peerId: string, file: File) {
    resetDownload();
    closeWebRTC();
    setIncomingPanel((p) => ({ ...p, visible: false }));
    setStatusLine(lang === "tr" ? "Offer gönderiliyor…" : "Sending offer…");
    setProgress(0);

    const pc = createPc(peerId);
    pcRef.current = pc;

    const dc = pc.createDataChannel("file");
    dcRef.current = dc;
    wireDataChannel(dc);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setStatusLine(
        lang === "tr" ? "WS bağlı değil" : "WS not connected"
      );
      closeWebRTC();
      return;
    }

    setStatusLine(
      lang === "tr"
        ? "Offer gönderildi. Karşı tarafın kabulü bekleniyor…"
        : "Offer sent. Waiting for receiver…"
    );

    socket.send(
      JSON.stringify({
        type: "rtc-offer",
        targetId: peerId,
        payload: pc.localDescription,
        fileName: file.name,
        fileSize: file.size,
        fileMime: file.type || "application/octet-stream",
      })
    );

    try {
      await waitForDataChannelOpen(dc, 12000);
    } catch {
      setStatusLine(
        lang === "tr"
          ? "Timeout: karşı taraf cevap vermedi."
          : "Timeout: no answer from receiver."
      );
      closeWebRTC();
      return;
    }

    await sendFileOverDataChannel(file);
  }

  async function acceptIncomingOffer() {
    if (!incomingPanel.offerPayload || !incomingPanel.fromId) {
      setIncomingPanel((p) => ({
        ...p,
        visible: false,
        offerPayload: null,
        fromId: "",
      }));
      return;
    }

    resetDownload();
    closeWebRTC();

    const fromId = incomingPanel.fromId;
    const payload = incomingPanel.offerPayload;

    setIncomingPanel((p) => ({ ...p, visible: false }));
    setStatusLine(
      lang === "tr" ? "Kabul edildi, bağlanılıyor…" : "Accepted, connecting…"
    );

    const pc = createPc(fromId);
    pcRef.current = pc;

    await pc.setRemoteDescription(payload);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "rtc-answer",
          targetId: fromId,
          payload: pc.localDescription,
        })
      );
    } else {
      setStatusLine(
        lang === "tr" ? "WS bağlı değil" : "WS not connected"
      );
      closeWebRTC();
    }
  }

  function rejectIncomingOffer() {
    setIncomingPanel((p) => ({
      ...p,
      visible: false,
      offerPayload: null,
      fromId: "",
    }));
  }

  function clickDownload() {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = downloadName || "download";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => resetDownload(), 15_000);
  }

  // ── WebSocket bağlantısı ───────────────────────────────────────────────────
  // ✅ DÜZELTİLDİ: Tek bir URL kullanılıyor, primary/fallback karmaşası kaldırıldı.
  // ✅ DÜZELTİLDİ: Artık doğrudan :8080 signaling server'a bağlanıyor.
  useEffect(() => {
    if (!mounted) return;
    if (!clientId || !deviceName) return;

    let closed = false;

    // Aynı host + port, sadece /ws path'i — ayrı port yok, her cihaz doğru sunucuya bağlanır
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
const wsUrl = `${proto}://${window.location.hostname}:8080`;

    function cleanup() {
      if (pingRef.current) {
        window.clearInterval(pingRef.current);
        pingRef.current = null;
      }
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch {}
        socketRef.current = null;
      }
      supportsRelayRef.current = false;
      setSupportsRelay(false);
    }

    function connect() {
      cleanup();
      setSocketState("idle");

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        if (closed) return;
        setSocketState("open");

        // hello/hello-ack kaldırıldı — kendi sunucun her zaman relay destekler
        supportsRelayRef.current = true;
        setSupportsRelay(true);

        ws.send(JSON.stringify({ type: "register", id: clientId, name: deviceName }));
        ws.send(JSON.stringify({ type: "get-peers" }));

        setStatusLine(lang === "tr" ? "Bağlı ✅ — cihazlar aranıyor…" : "Connected ✅ — finding devices…");

        pingRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 10_000);
      };

      ws.onmessage = async (event) => {
        if (closed) return;
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "hello-ack") return; // artık kullanılmıyor

          if (msg.type === "peers") {
            const incoming = Array.isArray(msg.peers) ? msg.peers : [];
            const cleaned = incoming
              .filter((p: Peer) => p && p.id && p.id !== clientId)
              .map((p: Peer) => ({
                id: String(p.id),
                name: String(p.name || "Unknown Device"),
                lastSeen: Number(p.lastSeen || Date.now()),
              }));
            setPeers(cleaned);
            return;
          }

          if (msg.type === "rtc-offer") {
            setIncomingPanel({
              visible: true,
              fromId: String(msg.fromId || ""),
              fromName: String(msg.fromName || msg.fromId || ""),
              fileName: msg.fileName ? String(msg.fileName) : "",
              fileSize: msg.fileSize ? Number(msg.fileSize) : 0,
              fileMime: msg.fileMime
                ? String(msg.fileMime)
                : "application/octet-stream",
              offerPayload: msg.payload as RTCSessionDescriptionInit,
            });
            return;
          }

          if (msg.type === "rtc-answer") {
            if (!pcRef.current) return;
            await pcRef.current.setRemoteDescription(msg.payload);
            setStatusLine(
              lang === "tr" ? "Answer alındı ✅" : "Answer received ✅"
            );
            return;
          }

          if (msg.type === "rtc-ice") {
            if (!pcRef.current) return;
            try {
              await pcRef.current.addIceCandidate(msg.payload);
            } catch {}
            return;
          }
        } catch (e) {
          console.error("WS parse error:", e);
        }
      };

      ws.onerror = (err) => {
        console.error("WS error:", err);
        if (!closed) setSocketState("error");
      };

      ws.onclose = () => {
        if (closed) return;
        setSocketState("error");
        setPeers([]);
        supportsRelayRef.current = false;
        setSupportsRelay(false);
        setStatusLine(
          lang === "tr"
            ? "Bağlantı kesildi, yeniden bağlanılıyor…"
            : "Disconnected, reconnecting…"
        );
        // ✅ Otomatik yeniden bağlan (5 saniye sonra)
        window.setTimeout(() => {
          if (!closed) connect();
        }, 5000);
      };
    }

    connect();

    return () => {
      closed = true;
      cleanup();
    };
  }, [mounted, clientId, deviceName, lang]);

  // ── Theme ──────────────────────────────────────────────────────────────────
  const effectiveDark =
    themePref === "dark" ? true : themePref === "light" ? false : systemIsDark;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", effectiveDark ? "dark" : "light");
  }, [effectiveDark]);

  function handleRenameDevice(nextName: string) {
    setDeviceName(nextName);
    try {
      window.localStorage.setItem("latchsend_device_name", nextName);
    } catch {}

    if (renameTimerRef.current) window.clearTimeout(renameTimerRef.current);
    renameTimerRef.current = window.setTimeout(() => {
      const socket = socketRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "rename", name: nextName }));
      }
    }, 250);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const wsStatus = socketState === "open" ? "ok" : socketState === "error" ? "err" : "idle";
  const canSend = !sending && !receiving && socketState === "open" && webrtcSupported && supportsRelay;

  const peerColors = ["var(--info)", "var(--ok)", "oklch(0.75 0.14 320)", "var(--warn)"];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-0)", color: "var(--fg-0)", position: "relative" }}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => onPickedFile(e.target.files?.[0] || null)}
      />

      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 199,
        }} />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
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
          {[
            { href: "/dashboard", label: "Files", icon: "file" },
            { href: "/dashboard", label: "New share", icon: "upload" },
            { href: "/local", label: t.title, icon: "network", active: true },
            { href: "/admin", label: "Admin", icon: "users" },
          ].map((item) => (
            <button key={item.href + item.label} onClick={() => { setSidebarOpen(false); if (!item.active) window.location.assign(item.href); }} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", borderRadius: 8,
              background: item.active ? "var(--bg-2)" : "transparent",
              color: item.active ? "var(--fg-0)" : "var(--fg-1)",
              fontSize: 13, fontWeight: item.active ? 500 : 400, textAlign: "left", width: "100%",
            }}>
              <span style={{ color: item.active ? "var(--accent)" : "var(--fg-2)" }}>
                {item.icon === "network" && <svg width={15} height={15} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="3" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="13" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 4.5v3m0 0L4 11m4-3.5L12 11" stroke="currentColor" strokeWidth="1.3"/></svg>}
                {item.icon === "file" && <svg width={15} height={15} viewBox="0 0 16 16" fill="none"><path d="M4 2h5l3 3v9H4V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>}
                {item.icon === "upload" && <svg width={15} height={15} viewBox="0 0 16 16" fill="none"><path d="M8 11V3m0 0L5 6m3-3l3 3M3 13h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                {item.icon === "users" && <svg width={15} height={15} viewBox="0 0 16 16" fill="none"><circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11 4a2 2 0 110 4M14 13c0-2-1-3-2.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          <select className="select" value={lang} onChange={(e) => setLang(e.target.value as Lang)} style={{ height: 30, fontSize: 12 }}>
            {LANG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.flag} {o.label}</option>)}
          </select>
          <select className="select" value={themePref} onChange={(e) => setThemePref(e.target.value as ThemePref)} style={{ height: 30, fontSize: 12 }}>
            <option value="system" disabled={!systemSupported}>{t.themeSystem}</option>
            <option value="dark">{t.themeDark}</option>
            <option value="light">{t.themeLight}</option>
          </select>
          <button className="btn btn-quiet btn-sm" onClick={() => window.location.assign("/login")} style={{ width: "100%", justifyContent: "flex-start", padding: "6px 10px" }}>
            {t.backToLogin}
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────── */}
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
              <span className="label" style={{ color: "var(--fg-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
            </div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 600, letterSpacing: -0.4 }}>{t.title}</h1>
            {!isMobile && <p style={{ margin: "4px 0 0", color: "var(--fg-2)", fontSize: 13 }}>{t.subtitle}</p>}
          </div>
          <span className={`chip ${wsStatus === "ok" ? "chip-ok" : wsStatus === "err" ? "chip-err" : "chip-mute"}`} style={{ flexShrink: 0 }}>
            <span className="chip-dot" />
            {wsStatus === "ok" ? (isMobile ? "WS" : "Signaling :8080") : wsStatus === "err" ? "Disconnected" : "Connecting…"}
          </span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: isMobile ? "16px" : "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Notifications strip */}
          {(statusLine || sending || receiving || downloadUrl || incomingPanel.visible) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {statusLine && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--bg-1)", border: "1px solid var(--line)", fontSize: 13, display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="mono" style={{ color: "var(--accent)", fontSize: 11 }}>STATUS</span>
                  <span style={{ color: "var(--fg-1)" }}>{statusLine}</span>
                  {progress > 0 && <span className="mono" style={{ color: "var(--fg-2)", fontSize: 11, marginLeft: "auto" }}>{progress}%</span>}
                </div>
              )}
              {(sending || receiving) && (
                <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${Math.max(2, Math.min(100, progress))}%`, height: "100%", background: "var(--accent)", transition: "width 0.18s" }} />
                </div>
              )}
              {downloadUrl && (
                <div className="panel" style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{lang === "tr" ? "Dosya hazır ✅" : "File ready ✅"}</div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--fg-2)", marginTop: 2 }}>{downloadName}</div>
                  </div>
                  <button className="btn btn-accent btn-sm" onClick={clickDownload}>
                    {lang === "tr" ? "İndir" : "Download"}
                  </button>
                </div>
              )}
              {incomingPanel.visible && (
                <div className="panel" style={{ padding: "14px 18px" }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{lang === "tr" ? "Gelen dosya" : "Incoming file"}</div>
                  <div style={{ fontSize: 12.5, color: "var(--fg-2)", marginTop: 4 }}>
                    {incomingPanel.fromName}
                    {incomingPanel.fileName ? ` — ${incomingPanel.fileName}` : ""}
                    {incomingPanel.fileSize ? ` (${formatBytes(incomingPanel.fileSize)})` : ""}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button className="btn btn-accent btn-sm" onClick={acceptIncomingOffer}>
                      {lang === "tr" ? "Kabul Et" : "Accept"}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={rejectIncomingOffer}>
                      {lang === "tr" ? "Reddet" : "Reject"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Radar / peer map */}
          <div style={{
            position: "relative", height: 360, background: "var(--bg-1)",
            border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden",
          }}>
            <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.4 }} />
            {[120, 200, 280].map((r) => (
              <div key={r} style={{
                position: "absolute", left: "50%", top: "50%",
                width: r, height: r, marginLeft: -r / 2, marginTop: -r / 2,
                border: "1px dashed var(--line)", borderRadius: "50%",
              }} />
            ))}
            {/* Self (center) */}
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", background: "var(--bg-2)",
                border: `2px solid var(--accent)`, display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--accent)", position: "relative",
              }}>
                <svg width={22} height={22} viewBox="0 0 16 16" fill="none"><path d="M8 11V3m0 0L5 6m3-3l3 3M3 13h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: `1px solid var(--accent)`, opacity: 0.3 }} />
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 500, textAlign: "center" }}>{deviceName || siteName}</div>
              <span className="chip chip-mute">You</span>
            </div>
            {/* Peers */}
            {peers.slice(0, 4).map((peer, i) => {
              const angle = ((i + 1) / (peers.length + 1)) * Math.PI * 2 - Math.PI / 2;
              const radius = 130;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const color = peerColors[i % peerColors.length];
              return (
                <div key={peer.id} style={{
                  position: "absolute", left: "50%", top: "50%",
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  cursor: canSend ? "pointer" : "default",
                }}
                onClick={() => canSend && requestSendFile(peer.id)}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%", background: "var(--bg-2)",
                    border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", color,
                  }}>
                    <svg width={20} height={20} viewBox="0 0 16 16" fill="none"><path d="M8 3v8m0 0L5 8m3 3l3-3M3 13h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, textAlign: "center", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{peer.name}</div>
                  {canSend && <span style={{ fontSize: 10, color: "var(--accent)", fontFamily: "var(--mono)" }}>click to send</span>}
                </div>
              );
            })}
          </div>

          {/* Cards row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* This device */}
            <div className="panel" style={{ padding: 0 }}>
              <div className="panel-header">
                <span style={{ fontSize: 14, fontWeight: 500 }}>{t.deviceTitle}</span>
                <span className={`chip ${webrtcSupported ? "chip-ok" : "chip-err"}`}>
                  <span className="chip-dot" />
                  {webrtcSupported ? t.supported : t.unsupported}
                </span>
              </div>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div className="label" style={{ marginBottom: 5 }}>{t.deviceName}</div>
                  <input
                    className="input"
                    value={deviceName}
                    onChange={(e) => handleRenameDevice(e.target.value)}
                    style={{ height: 34 }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[
                    ["Discovery", "WebSocket :8080", "var(--info)"],
                    ["Transport", "WebRTC data channel", "var(--ok)"],
                    ["Server bytes", "0 (pure P2P)", "var(--accent)"],
                  ].map(([k, v, c]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                      <span style={{ fontSize: 12, color: "var(--fg-2)" }}>{k}</span>
                      <span className="mono" style={{ fontSize: 11.5, color: c }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Peers */}
            <div className="panel" style={{ padding: 0 }}>
              <div className="panel-header">
                <span style={{ fontSize: 14, fontWeight: 500 }}>{t.peersTitle}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)" }}>{peers.length}</span>
              </div>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
                {peers.length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--fg-2)", padding: "8px 0" }}>{t.noPeers}</div>
                ) : (
                  peers.map((peer) => (
                    <div key={peer.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                      padding: "10px 12px", background: "var(--bg-0)", borderRadius: 8, border: "1px solid var(--line)",
                    }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{peer.name}</div>
                        <div className="mono" style={{ fontSize: 10.5, color: "var(--fg-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{peer.id.slice(0, 20)}…</div>
                      </div>
                      <button
                        className="btn btn-accent btn-sm"
                        disabled={!canSend}
                        onClick={() => requestSendFile(peer.id)}
                      >
                        {t.sendToThisDevice}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
