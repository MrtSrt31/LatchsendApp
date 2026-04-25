"use client";

import { useEffect, useState } from "react";

type Lang = "en" | "tr" | "es" | "fr" | "hi" | "zh-CN";

function detectLang(): Lang {
  if (typeof window === "undefined") return "en";
  const supported: Lang[] = ["en", "tr", "es", "fr", "hi", "zh-CN"];
  const saved = localStorage.getItem("latchsend_lang") as Lang | null;
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

const T: Record<Lang, {
  file: string; size: string; expires: string;
  singleUse: string; protected: string; passwordLabel: string;
  download: string; verifying: string; releasing: string; streaming: string;
  wrongPw: string; expired: string; latchConditions: string;
  timeLock: string; single: string; password: string;
  armed: string; consumed: string; downloadStarted: string; consumedNote: string;
  chainTitle: string; selfHostedBy: string; reportLink: string;
  sharedBy: string; untilExpiry: string; burnsAfter: string; bcrypt: string;
  locked: string; verified: string;
}> = {
  en: {
    file: "File", size: "Size", expires: "Expires",
    singleUse: "Single use", protected: "Password protected",
    passwordLabel: "Enter password",
    download: "Unlock & download", verifying: "Verifying…", releasing: "Releasing latch…", streaming: "Streaming…",
    wrongPw: "Wrong password. The latch held.", expired: "This link has expired or been used.",
    latchConditions: "Latch conditions",
    timeLock: "Time lock", single: "Single use", password: "Password",
    armed: "● ARMED", consumed: "● CONSUMED",
    downloadStarted: "Download started", consumedNote: "The latch has been consumed. This link will no longer respond.",
    chainTitle: "Verification chain", selfHostedBy: "Self-hosted by", reportLink: "Report this link",
    sharedBy: "Sent by", untilExpiry: "until expiry", burnsAfter: "burns after this download", bcrypt: "256-bit bcrypt",
    locked: "Locked", verified: "Verified",
  },
  tr: {
    file: "Dosya", size: "Boyut", expires: "Süre",
    singleUse: "Tek kullanım", protected: "Şifreli",
    passwordLabel: "Şifreyi girin",
    download: "Kilidi aç & indir", verifying: "Doğrulanıyor…", releasing: "Kilit açılıyor…", streaming: "Aktarılıyor…",
    wrongPw: "Yanlış şifre. Kilit tuttu.", expired: "Bu link süresi dolmuş veya kullanılmış.",
    latchConditions: "Kilit koşulları",
    timeLock: "Zaman kilidi", single: "Tek kullanım", password: "Şifre",
    armed: "● SİLAHLI", consumed: "● TÜKETİLDİ",
    downloadStarted: "İndirme başladı", consumedNote: "Kilit tüketildi. Bu link artık yanıt vermeyecek.",
    chainTitle: "Doğrulama zinciri", selfHostedBy: "Barındıran", reportLink: "Bu linki bildir",
    sharedBy: "Gönderen", untilExpiry: "sona erişe kadar", burnsAfter: "bu indirmeden sonra yanar", bcrypt: "256-bit bcrypt",
    locked: "Kilitli", verified: "Doğrulandı",
  },
  es: {
    file: "Archivo", size: "Tamaño", expires: "Vence",
    singleUse: "Uso único", protected: "Protegido con contraseña",
    passwordLabel: "Introduce la contraseña",
    download: "Desbloquear y descargar", verifying: "Verificando…", releasing: "Liberando latch…", streaming: "Transmitiendo…",
    wrongPw: "Contraseña incorrecta. El latch aguantó.", expired: "Este enlace ha caducado o ya fue utilizado.",
    latchConditions: "Condiciones del latch",
    timeLock: "Bloqueo de tiempo", single: "Uso único", password: "Contraseña",
    armed: "● ARMADO", consumed: "● CONSUMIDO",
    downloadStarted: "Descarga iniciada", consumedNote: "El latch ha sido consumido. Este enlace ya no responderá.",
    chainTitle: "Cadena de verificación", selfHostedBy: "Autoalojado por", reportLink: "Reportar este enlace",
    sharedBy: "Enviado por", untilExpiry: "hasta expiración", burnsAfter: "se quema tras esta descarga", bcrypt: "256-bit bcrypt",
    locked: "Bloqueado", verified: "Verificado",
  },
  fr: {
    file: "Fichier", size: "Taille", expires: "Expire",
    singleUse: "Utilisation unique", protected: "Protégé par mot de passe",
    passwordLabel: "Entrer le mot de passe",
    download: "Déverrouiller et télécharger", verifying: "Vérification…", releasing: "Libération du latch…", streaming: "Transmission…",
    wrongPw: "Mot de passe incorrect. Le latch a tenu.", expired: "Ce lien a expiré ou a déjà été utilisé.",
    latchConditions: "Conditions du latch",
    timeLock: "Verrouillage temporel", single: "Utilisation unique", password: "Mot de passe",
    armed: "● ARMÉ", consumed: "● CONSOMMÉ",
    downloadStarted: "Téléchargement démarré", consumedNote: "Le latch a été consommé. Ce lien ne répondra plus.",
    chainTitle: "Chaîne de vérification", selfHostedBy: "Auto-hébergé par", reportLink: "Signaler ce lien",
    sharedBy: "Envoyé par", untilExpiry: "jusqu'à expiration", burnsAfter: "brûle après ce téléchargement", bcrypt: "256-bit bcrypt",
    locked: "Verrouillé", verified: "Vérifié",
  },
  hi: {
    file: "फ़ाइल", size: "आकार", expires: "समाप्त",
    singleUse: "एक बार", protected: "पासवर्ड सुरक्षित",
    passwordLabel: "पासवर्ड दर्ज करें",
    download: "अनलॉक करें & डाउनलोड", verifying: "सत्यापित हो रहा है…", releasing: "लैच खुल रहा है…", streaming: "स्ट्रीम हो रहा है…",
    wrongPw: "गलत पासवर्ड। लैच बना रहा।", expired: "यह लिंक समाप्त हो गया है या उपयोग किया जा चुका है।",
    latchConditions: "लैच शर्तें",
    timeLock: "समय ताला", single: "एक बार", password: "पासवर्ड",
    armed: "● तैयार", consumed: "● उपयोग किया",
    downloadStarted: "डाउनलोड शुरू", consumedNote: "लैच उपयोग हो गया। यह लिंक अब काम नहीं करेगा।",
    chainTitle: "सत्यापन श्रृंखला", selfHostedBy: "होस्ट:", reportLink: "इस लिंक की रिपोर्ट करें",
    sharedBy: "भेजने वाला", untilExpiry: "समाप्ति तक", burnsAfter: "इस डाउनलोड के बाद जलता है", bcrypt: "256-bit bcrypt",
    locked: "बंद", verified: "सत्यापित",
  },
  "zh-CN": {
    file: "文件", size: "大小", expires: "过期",
    singleUse: "单次下载", protected: "密码保护",
    passwordLabel: "输入密码",
    download: "解锁并下载", verifying: "验证中…", releasing: "释放锁定…", streaming: "传输中…",
    wrongPw: "密码错误，锁未开启。", expired: "此链接已过期或已被使用。",
    latchConditions: "锁定条件",
    timeLock: "时间锁", single: "单次下载", password: "密码",
    armed: "● 已上锁", consumed: "● 已消耗",
    downloadStarted: "下载已开始", consumedNote: "锁已消耗。此链接将不再响应。",
    chainTitle: "验证链", selfHostedBy: "自托管:", reportLink: "举报此链接",
    sharedBy: "发送者", untilExpiry: "到期前", burnsAfter: "本次下载后销毁", bcrypt: "256位bcrypt",
    locked: "已锁定", verified: "已验证",
  },
};

function formatBytes(n: number) {
  if (n <= 0) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  let v = n, i = 0;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${Math.round(v * 10) / 10} ${u[i]}`;
}

function formatExpiry(expiresAt: string): { label: string; state: "ok" | "soon" | "expired" } {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { label: "expired", state: "expired" };
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return { label: `${mins}m`, state: mins < 30 ? "soon" : "ok" };
  const hours = Math.floor(mins / 60);
  if (hours < 24) return { label: `${hours}h ${mins % 60}m`, state: hours < 2 ? "soon" : "ok" };
  return { label: `${Math.floor(hours / 24)}d ${hours % 24}h`, state: "ok" };
}

function relativeTime(ts: number): string {
  const d = (Date.now() - ts) / 1000;
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

// Icons
const LockIcon = (s = 13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3"/></svg>;
const ClockIcon = (s = 13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const OneIcon = (s = 13) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M6 4h2v8M5 12h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const DownloadIcon = (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 3v8m0 0L5 8m3 3l3-3M3 13h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ShieldIcon = (s = 11) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 2l5 2v4c0 3-2.2 5.2-5 6-2.8-.8-5-3-5-6V4l5-2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>;
const CheckIcon = (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const FileIcon = (s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 2h5l3 3v9H4V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>;
const LogoIcon = (s = 18) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="8" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M6 8V5.5a4 4 0 018 0V8" stroke="currentColor" strokeWidth="1.6"/><circle cx="10" cy="13" r="1.4" fill="currentColor"/></svg>;

function ChainStep({ n, label, done, active, fail, last, hidden }: {
  n: string; label: string; done?: boolean; active?: boolean; fail?: boolean; last?: boolean; hidden?: boolean;
}) {
  if (hidden) return null;
  const color = fail ? "var(--err)" : done ? "var(--ok)" : active ? "var(--accent)" : "var(--fg-3)";
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: last ? 0 : 8 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <div style={{
          width: 18, height: 18, borderRadius: "50%",
          background: done || active || fail ? color : "transparent",
          border: `1px solid ${color}`, color: done || active || fail ? "var(--bg-0)" : color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9.5, fontWeight: 700, fontFamily: "var(--mono)",
        }}>
          {fail ? "✕" : done ? "✓" : n}
        </div>
        {!last && <div style={{ width: 1, height: 14, background: "var(--line)" }} />}
      </div>
      <div style={{ fontSize: 12, color: done || active || fail ? "var(--fg-1)" : "var(--fg-3)", paddingTop: 1 }}>
        {label}
      </div>
    </div>
  );
}

export default function DownloadClient({
  token,
  fileName,
  fileSize,
  expiresAt,
  singleUse,
  hasPassword,
}: {
  token: string;
  fileName: string;
  fileSize: string;
  expiresAt: string;
  singleUse: boolean;
  hasPassword: boolean;
}) {
  const lang = typeof window !== "undefined" ? detectLang() : "en";
  const t = T[lang];

  const [pw, setPw] = useState("");
  const [stage, setStage] = useState<"locked" | "verifying" | "unlocking" | "streaming" | "done" | "error">("locked");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  const ttl = formatExpiry(expiresAt);
  const sentAt = new Date(expiresAt).getTime() - (24 * 60 * 60 * 1000);

  async function handleDownload() {
    if (hasPassword && !pw.trim()) return;
    if (stage === "verifying" || stage === "unlocking" || stage === "streaming") return;

    setStage("verifying");
    const url = hasPassword ? `/api/d/${token}?pw=${encodeURIComponent(pw)}` : `/api/d/${token}`;

    if (hasPassword) {
      try {
        const check = await fetch(url);
        if (!check.ok) {
          const data = await check.json().catch(() => ({}));
          const isWrongPw = (data as { error?: string }).error === "Wrong password";
          setStage(isWrongPw ? "error" : "error");
          return;
        }
        setStage("unlocking");
        await new Promise((r) => setTimeout(r, 400));
        setStage("streaming");
        const blob = await check.blob();
        let pct = 0;
        const ticker = setInterval(() => {
          pct = Math.min(100, pct + Math.random() * 15 + 5);
          setProgress(pct);
          if (pct >= 100) { clearInterval(ticker); setTimeout(() => setStage("done"), 300); }
        }, 180);
        const objUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objUrl; a.download = fileName;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(objUrl), 30000);
      } catch { setStage("error"); }
    } else {
      setStage("unlocking");
      await new Promise((r) => setTimeout(r, 300));
      setStage("done");
      window.location.href = url;
    }
  }

  const conditions = [
    {
      icon: ClockIcon(13), label: t.timeLock,
      value: ttl.label, sub: t.untilExpiry,
      state: ttl.state === "soon" ? "warn" : "ok" as "warn" | "ok" | "info",
    },
    {
      icon: OneIcon(13), label: t.single,
      value: "Armed", sub: t.burnsAfter,
      state: "warn" as "warn" | "ok" | "info",
      hidden: !singleUse,
    },
    {
      icon: LockIcon(13), label: t.password,
      value: (stage === "locked" || stage === "error") ? t.locked : t.verified,
      sub: t.bcrypt,
      state: (stage === "locked" || stage === "error") ? "info" : "ok" as "warn" | "ok" | "info",
      hidden: !hasPassword,
    },
  ].filter((c) => !c.hidden);

  const stateColor = (s: "ok" | "warn" | "info") =>
    s === "warn" ? "var(--warn)" : s === "info" ? "var(--info)" : "var(--ok)";
  const stateBg = (s: "ok" | "warn" | "info") =>
    s === "warn" ? "var(--warn-soft)" : s === "info" ? "var(--info-soft)" : "var(--ok-soft)";

  return (
    <main style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 24px", position: "relative", overflow: "hidden",
      background: "var(--bg-0)", color: "var(--fg-0)",
    }}>
      {/* Grid backdrop */}
      <div className="grid-bg" style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        maskImage: "radial-gradient(circle at center, black 30%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(circle at center, black 30%, transparent 75%)",
      }} />

      <div style={{ width: "100%", maxWidth: 920, position: "relative", zIndex: 1 }}>
        {/* Brand strip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--accent)" }}>{LogoIcon(18)}</span>
            <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: -0.2 }}>Latchsend</span>
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--fg-3)" }}>
            {token.slice(0, 16)}…
          </div>
        </div>

        <div className="panel" style={{
          padding: 0, overflow: "hidden",
          boxShadow: "0 30px 60px -20px oklch(0 0 0 / 0.5)",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr" }}>
            {/* LEFT — file + action */}
            <div style={{ padding: 32, borderRight: "1px solid var(--line)" }}>
              {stage === "done" ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: "var(--ok-soft)", color: "var(--ok)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{CheckIcon(28)}</div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.4 }}>{t.downloadStarted}</div>
                    <div style={{ color: "var(--fg-2)", fontSize: 13, marginTop: 4 }}>{t.consumedNote}</div>
                  </div>
                  <div style={{
                    background: "var(--bg-0)", padding: "10px 12px", borderRadius: 8,
                    border: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10, width: "100%",
                  }}>
                    <span style={{ color: "var(--fg-2)" }}>{FileIcon(14)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--fg-3)" }}>{formatBytes(Number(fileSize))}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="label" style={{ marginBottom: 12 }}>Latched file</div>

                  {/* File info */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 12, background: "var(--bg-2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "1px solid var(--line)",
                    }}>
                      <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-1)", textTransform: "uppercase" }}>
                        {fileName.split(".").pop()?.slice(0, 4) || "file"}
                      </span>
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.2, wordBreak: "break-all" }}>
                        {fileName}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <span className="mono" style={{ fontSize: 12, color: "var(--fg-2)" }}>{formatBytes(Number(fileSize))}</span>
                        <span style={{ color: "var(--fg-3)" }}>·</span>
                        <span style={{ fontSize: 12, color: "var(--fg-2)" }}>shared {relativeTime(sentAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Password input */}
                  {hasPassword && (
                    <>
                      <div className="label" style={{ marginBottom: 8 }}>Unlock</div>
                      <div style={{ marginBottom: 12 }}>
                        <input
                          className="input mono"
                          type="password"
                          value={pw}
                          onChange={(e) => { setPw(e.target.value); if (stage === "error") setStage("locked"); }}
                          onKeyDown={(e) => e.key === "Enter" && handleDownload()}
                          placeholder={t.passwordLabel}
                          autoFocus
                          style={{ height: 42, fontSize: 14 }}
                          disabled={stage === "verifying" || stage === "unlocking" || stage === "streaming"}
                        />
                      </div>
                    </>
                  )}

                  {/* Error */}
                  {stage === "error" && (
                    <div style={{
                      padding: "8px 12px", borderRadius: 8,
                      background: "var(--err-soft)", color: "var(--err)",
                      fontSize: 12.5, marginBottom: 12,
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--err)", flexShrink: 0 }} />
                      {t.wrongPw}
                    </div>
                  )}

                  {/* Streaming progress */}
                  {stage === "streaming" && (
                    <div style={{
                      padding: 12, borderRadius: 8,
                      background: "var(--bg-0)", border: "1px solid var(--line)", marginBottom: 12,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 6 }}>
                        <span className="mono" style={{ color: "var(--fg-2)" }}>STREAMING</span>
                        <span className="mono" style={{ color: "var(--fg-1)" }}>
                          {Math.round(progress)}% · {formatBytes(Number(fileSize) * progress / 100)}
                        </span>
                      </div>
                      <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ width: `${progress}%`, height: "100%", background: "var(--accent)", transition: "width 0.18s" }} />
                      </div>
                    </div>
                  )}

                  {/* Download button */}
                  <button
                    className="btn btn-accent"
                    onClick={handleDownload}
                    disabled={hasPassword && !pw.trim() || stage === "verifying" || stage === "unlocking" || stage === "streaming"}
                    style={{ width: "100%", height: 44, fontSize: 13.5 }}
                  >
                    {stage === "verifying" && <>{LockIcon(14)} {t.verifying}</>}
                    {stage === "unlocking" && <>{ShieldIcon(14)} {t.releasing}</>}
                    {stage === "streaming" && <>{DownloadIcon(14)} {t.streaming}</>}
                    {(stage === "locked" || stage === "error") && <>{DownloadIcon(14)} {t.download}</>}
                  </button>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: 11.5, color: "var(--fg-3)" }}>
                    {ShieldIcon(11)}
                    <span>All conditions enforced server-side. The link is checked on every request.</span>
                  </div>
                </>
              )}
            </div>

            {/* RIGHT — latch conditions */}
            <div style={{ padding: 32, background: "var(--bg-0)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div className="label">{t.latchConditions}</div>
                <span style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 99,
                  background: stage === "done" ? "var(--ok-soft)" : "var(--accent-soft)",
                  color: stage === "done" ? "var(--ok)" : "var(--accent)",
                  fontWeight: 600, fontFamily: "var(--mono)", letterSpacing: 0.06,
                }}>
                  {stage === "done" ? t.consumed : t.armed}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {conditions.map((c, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "14px 0",
                    borderBottom: i < conditions.length - 1 ? "1px solid var(--line)" : "none",
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7,
                      background: stateBg(c.state), color: stateColor(c.state),
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>{c.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: 12.5, fontWeight: 500 }}>{c.label}</span>
                        <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-1)" }}>{c.value}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 2 }}>{c.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Verification chain */}
              <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px dashed var(--line)" }}>
                <div className="label" style={{ marginBottom: 10 }}>{t.chainTitle}</div>
                <ChainStep n="1" label="Token exists & not deleted" done />
                <ChainStep n="2" label="Time lock not expired" done={ttl.state !== "expired"} fail={ttl.state === "expired"} />
                <ChainStep n="3" label="Single-use not consumed" done />
                <ChainStep n="4" label="Password verified"
                  done={stage !== "locked" && stage !== "error" && hasPassword}
                  active={stage === "verifying"}
                  fail={stage === "error"}
                  hidden={!hasPassword}
                />
                <ChainStep n={hasPassword ? "5" : "4"} label="Stream begins"
                  done={stage === "streaming" || stage === "done"}
                  active={stage === "unlocking"} last />
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 11.5, color: "var(--fg-3)" }}>
          {t.selfHostedBy}{" · "}
          <a href="#" style={{ color: "var(--fg-2)", textDecoration: "none" }}>{t.reportLink}</a>
        </div>
      </div>
    </main>
  );
}
