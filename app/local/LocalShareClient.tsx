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
  const primaryBtn = effectiveDark
    ? "bg-white text-black hover:opacity-90"
    : "bg-zinc-950 text-white hover:opacity-90";
  const secondaryBtn = effectiveDark
    ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
    : "border-black/10 bg-zinc-50 text-zinc-950 hover:bg-zinc-100";

  const statusBox = webrtcSupported
    ? effectiveDark
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
      : "border-emerald-600/20 bg-emerald-100 text-emerald-800"
    : effectiveDark
    ? "border-red-500/20 bg-red-500/10 text-red-200"
    : "border-red-600/20 bg-red-100 text-red-800";

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
  return (
    <main
      className={`min-h-screen px-6 py-12 transition-colors ${pageBg}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => onPickedFile(e.target.files?.[0] || null)}
      />

      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p
              className={`mb-2 text-xs font-medium uppercase tracking-[0.28em] ${muted}`}
            >
              {t.badge}
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {siteName} — {t.title}
            </h1>
            <p
              className={`mt-3 max-w-2xl text-sm leading-6 md:text-base ${muted}`}
            >
              {t.subtitle}
            </p>

            <p className={`mt-2 text-xs ${muted}`}>
              WS:{" "}
              {socketState === "open"
                ? "OK"
                : socketState === "error"
                ? "ERROR"
                : "…"}
              {" · "}
              Relay: {supportsRelay ? "OK" : "NO"}
            </p>

            {statusLine ? (
              <p className={`mt-2 text-xs ${muted}`}>
                {statusLine} {progress ? `(${progress}%)` : ""}
              </p>
            ) : null}

            {sending || receiving ? (
              <div
                className={`mt-3 h-2 w-full max-w-md rounded-full border ${
                  effectiveDark ? "border-white/10" : "border-black/10"
                }`}
              >
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${Math.max(2, Math.min(100, progress))}%`,
                    background: effectiveDark
                      ? "rgba(255,255,255,0.85)"
                      : "rgba(0,0,0,0.85)",
                  }}
                />
              </div>
            ) : null}

            {downloadUrl ? (
              <div
                className={`mt-4 rounded-2xl border p-4 text-sm ${card}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {lang === "tr" ? "Dosya hazır ✅" : "File ready ✅"}
                    </p>
                    <p className={`mt-1 text-xs ${muted}`}>{downloadName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={clickDownload}
                    className={`inline-flex h-10 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition ${primaryBtn}`}
                  >
                    {lang === "tr" ? "İndir" : "Download"}
                  </button>
                </div>
              </div>
            ) : null}

            {incomingPanel.visible ? (
              <div
                className={`mt-4 rounded-2xl border p-4 text-sm ${card}`}
              >
                <p className="font-semibold">
                  {lang === "tr" ? "Gelen dosya" : "Incoming file"}
                </p>
                <p className={`mt-2 text-xs ${muted}`}>
                  {incomingPanel.fromName}
                  {incomingPanel.fileName
                    ? ` — ${incomingPanel.fileName}`
                    : ""}
                  {incomingPanel.fileSize
                    ? ` (${formatBytes(incomingPanel.fileSize)})`
                    : ""}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={acceptIncomingOffer}
                    className={`inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition ${primaryBtn}`}
                  >
                    {lang === "tr" ? "Kabul Et" : "Accept"}
                  </button>
                  <button
                    type="button"
                    onClick={rejectIncomingOffer}
                    className={`inline-flex h-11 items-center justify-center rounded-2xl border px-4 text-sm font-semibold transition ${secondaryBtn}`}
                  >
                    {lang === "tr" ? "Reddet" : "Reject"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Controls */}
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

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => window.location.assign("/login")}
                className={`h-12 w-full rounded-2xl border px-4 text-sm font-semibold transition ${secondaryBtn}`}
              >
                {t.backToLogin}
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section
            className={`rounded-3xl border p-8 shadow-2xl backdrop-blur-sm transition-colors ${card}`}
          >
            <h2 className="text-xl font-semibold">{t.deviceTitle}</h2>
            <div className="mt-6 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t.deviceName}
                </label>
                <input
                  value={deviceName}
                  onChange={(e) => handleRenameDevice(e.target.value)}
                  className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none ${input}`}
                />
              </div>

              <div className={`rounded-2xl border p-4 text-sm ${statusBox}`}>
                <strong>{t.support}: </strong>
                {webrtcSupported ? t.supported : t.unsupported}
              </div>

              <div className={`rounded-2xl border p-4 ${card}`}>
                <h3 className="text-base font-semibold">{t.readyTitle}</h3>
                <p className={`mt-2 text-sm leading-6 ${muted}`}>
                  {t.readyText}
                </p>
                <p className={`mt-2 text-xs ${muted}`}>ID: {clientId}</p>
              </div>
            </div>
          </section>

          <section
            className={`rounded-3xl border p-8 shadow-2xl backdrop-blur-sm transition-colors ${card}`}
          >
            <h2 className="text-xl font-semibold">{t.peersTitle}</h2>
            <div className="mt-6 grid gap-4">
              {peers.length === 0 ? (
                <div className={`rounded-2xl border p-4 text-sm ${card}`}>
                  {t.noPeers}
                </div>
              ) : (
                peers.map((peer) => (
                  <div
                    key={peer.id}
                    className={`rounded-2xl border p-4 transition-colors ${card}`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{peer.name}</p>
                        <p className={`mt-1 text-xs ${muted}`}>{peer.id}</p>
                      </div>
                      <button
                        type="button"
                        disabled={
                          sending ||
                          receiving ||
                          socketState !== "open" ||
                          !webrtcSupported ||
                          !supportsRelay
                        }
                        onClick={() => requestSendFile(peer.id)}
                        className={`inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition ${primaryBtn} ${
                          sending ||
                          receiving ||
                          socketState !== "open" ||
                          !webrtcSupported ||
                          !supportsRelay
                            ? "cursor-not-allowed opacity-60"
                            : ""
                        }`}
                      >
                        {t.sendToThisDevice}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section
          className={`mt-6 rounded-3xl border p-8 shadow-2xl backdrop-blur-sm transition-colors ${card}`}
        >
          <h2 className="text-xl font-semibold">{t.nextStepTitle}</h2>
          <p
            className={`mt-3 text-sm leading-6 md:text-base ${muted}`}
          >
            {t.nextStepText}
          </p>
          <p className={`mt-6 text-center text-xs ${muted}`}>{t.hint}</p>
        </section>
      </div>
    </main>
  );
}
