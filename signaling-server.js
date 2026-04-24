// signaling-server.js
const { WebSocketServer } = require("ws");

const PORT = process.env.SIGNAL_PORT ? Number(process.env.SIGNAL_PORT) : 8080;
const wss = new WebSocketServer({ port: PORT });

/**
 * clients: id -> { id, name, ws, lastSeen }
 */
const clients = new Map();

function safeSend(ws, obj) {
  if (!ws || ws.readyState !== 1) return;
  try {
    ws.send(JSON.stringify(obj));
  } catch {}
}

function buildPeers() {
  return Array.from(clients.values()).map((c) => ({
    id: c.id,
    name: c.name,
    lastSeen: c.lastSeen,
  }));
}

function broadcastPeers() {
  const peers = buildPeers();
  for (const [, c] of clients) safeSend(c.ws, { type: "peers", peers });
}

function sendPeersTo(ws) {
  safeSend(ws, { type: "peers", peers: buildPeers() });
}

function sendToClient(targetId, obj) {
  const target = clients.get(targetId);
  if (!target) return false;
  safeSend(target.ws, obj);
  return true;
}

// 30sn ping gelmeyeni temizle
setInterval(() => {
  const now = Date.now();
  let changed = false;

  for (const [id, c] of clients) {
    if (!c.ws || c.ws.readyState !== 1) {
      clients.delete(id);
      changed = true;
      continue;
    }
    if (now - c.lastSeen > 30_000) {
      try { c.ws.close(); } catch {}
      clients.delete(id);
      changed = true;
    }
  }

  if (changed) broadcastPeers();
}, 5000);

wss.on("connection", (ws) => {
  let currentId = null;

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      // -------- register
      if (msg.type === "register") {
        if (!msg.id) return;

        currentId = String(msg.id);
        const name = msg.name ? String(msg.name) : "Unknown Device";

        clients.set(currentId, {
          id: currentId,
          name,
          ws,
          lastSeen: Date.now(),
        });

        // yeni gelen hem listeyi görsün hem broadcast gitsin
        sendPeersTo(ws);
        broadcastPeers();
        return;
      }

      // register olmadan devam etme
      if (!currentId || !clients.has(currentId)) return;

      const current = clients.get(currentId);
      current.lastSeen = Date.now();

      // -------- ping
      if (msg.type === "ping") {
        current.lastSeen = Date.now();
        return;
      }

      // -------- rename
      if (msg.type === "rename") {
        const next = msg.name ? String(msg.name) : current.name;
        current.name = next;
        broadcastPeers();
        return;
      }

      // -------- get-peers (client anında liste isterse)
      if (msg.type === "get-peers") {
        sendPeersTo(ws);
        return;
      }

      // -------- send-intent (eski bildirim)
      if (msg.type === "send-intent") {
        const targetId = msg.targetId ? String(msg.targetId) : "";
        if (!targetId) return;

        sendToClient(targetId, {
          type: "incoming-intent",
          fromId: current.id,
          fromName: current.name,
        });
        return;
      }

      // -------- WebRTC RELAY (ASIL ÖNEMLİ KISIM)
      // rtc-offer: sender -> server -> target
      if (msg.type === "rtc-offer") {
        const targetId = msg.targetId ? String(msg.targetId) : "";
        if (!targetId || !msg.payload) return;

        sendToClient(targetId, {
          type: "rtc-offer",
          fromId: current.id,
          fromName: current.name,
          payload: msg.payload,
          fileName: msg.fileName || "",
          fileSize: msg.fileSize || 0,
          fileMime: msg.fileMime || "application/octet-stream",
        });
        return;
      }

      // rtc-answer: receiver -> server -> original sender
      if (msg.type === "rtc-answer") {
        const targetId = msg.targetId ? String(msg.targetId) : "";
        if (!targetId || !msg.payload) return;

        sendToClient(targetId, {
          type: "rtc-answer",
          fromId: current.id,
          fromName: current.name,
          payload: msg.payload,
        });
        return;
      }

      // rtc-ice: either side -> server -> other side
      if (msg.type === "rtc-ice") {
        const targetId = msg.targetId ? String(msg.targetId) : "";
        if (!targetId || !msg.payload) return;

        sendToClient(targetId, {
          type: "rtc-ice",
          fromId: current.id,
          fromName: current.name,
          payload: msg.payload,
        });
        return;
      }
    } catch (err) {
      console.error("WS message error:", err);
    }
  });

  ws.on("close", () => {
    if (currentId && clients.has(currentId)) {
      clients.delete(currentId);
      broadcastPeers();
    }
  });

  ws.on("error", () => {
    if (currentId && clients.has(currentId)) {
      clients.delete(currentId);
      broadcastPeers();
    }
  });
});

console.log(`Signaling server running on ws://0.0.0.0:${PORT}`);
