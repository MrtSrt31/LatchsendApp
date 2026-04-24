const { WebSocketServer } = require("ws");

const PORT = 3001;
const wss = new WebSocketServer({ port: PORT });

const clients = new Map();

function broadcastPeers() {
  const peers = Array.from(clients.values()).map((c) => ({
    id: c.id,
    name: c.name,
    lastSeen: c.lastSeen,
  }));

  const payload = JSON.stringify({
    type: "peers",
    peers,
  });

  for (const [, client] of clients) {
    if (client.ws.readyState === 1) {
      client.ws.send(payload);
    }
  }
}

function sendToClient(id, message) {
  const target = clients.get(id);
  if (!target) return;
  if (target.ws.readyState !== 1) return;
  target.ws.send(JSON.stringify(message));
}

wss.on("connection", (ws) => {
  let currentId = null;

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === "register") {
        currentId = msg.id;
        clients.set(msg.id, {
          id: msg.id,
          name: msg.name || "Unknown Device",
          ws,
          lastSeen: Date.now(),
        });

        broadcastPeers();
        return;
      }

      if (!currentId || !clients.has(currentId)) return;

      const current = clients.get(currentId);
      current.lastSeen = Date.now();

      if (msg.type === "rename") {
        current.name = msg.name || current.name;
        broadcastPeers();
        return;
      }

      if (msg.type === "ping") {
        current.lastSeen = Date.now();
        return;
      }

      if (msg.type === "send-intent") {
        sendToClient(msg.targetId, {
          type: "incoming-intent",
          fromId: current.id,
          fromName: current.name,
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
});

console.log(`Signaling server running on ws://localhost:${PORT}`);
