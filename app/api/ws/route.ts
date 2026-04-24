export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { WebSocketServer } from "ws";

// Global WSS instance (dev’de hot-reload olunca tekrar kurmasın)
declare global {
  // eslint-disable-next-line no-var
  var __latchsendWSS: WebSocketServer | undefined;
  // eslint-disable-next-line no-var
  var __latchsendClients: Map<string, { id: string; name: string; ws: any; lastSeen: number }> | undefined;
}

function safeSend(ws: any, obj: any) {
  if (!ws || ws.readyState !== 1) return;
  try {
    ws.send(JSON.stringify(obj));
  } catch {}
}

function buildPeers(clients: Map<string, any>) {
  return Array.from(clients.values()).map((c) => ({
    id: c.id,
    name: c.name,
    lastSeen: c.lastSeen,
  }));
}

function broadcastPeers(clients: Map<string, any>) {
  const now = Date.now();
  for (const [id, c] of clients) {
    if (now - c.lastSeen > 30_000) {
      try { c.ws.close(); } catch {}
      clients.delete(id);
    }
  }
  const peers = buildPeers(clients);
  for (const [, c] of clients) safeSend(c.ws, { type: "peers", peers });
}

export async function GET(req: NextRequest) {
  // Next.js websocket upgrade için bu route kullanılır (dev/prod fark eder)
  // @ts-expect-error - Node request socket access
  const { socket } = req;

  // @ts-expect-error
  if (!socket?.server) {
    return new Response("No server socket", { status: 500 });
  }

  // @ts-expect-error
  const server = socket.server;

  if (!global.__latchsendClients) global.__latchsendClients = new Map();
  const clients = global.__latchsendClients;

  if (!global.__latchsendWSS) {
    global.__latchsendWSS = new WebSocketServer({ noServer: true });

    global.__latchsendWSS.on("connection", (ws) => {
      let currentId: string | null = null;

      ws.on("message", (raw: any) => {
        try {
          const msg = JSON.parse(raw.toString());

          if (msg.type === "register") {
            if (!msg.id) return;
            currentId = String(msg.id);
            clients.set(currentId, {
              id: currentId,
              name: msg.name ? String(msg.name) : "Unknown Device",
              ws,
              lastSeen: Date.now(),
            });
            broadcastPeers(clients);
            return;
          }

          if (!currentId || !clients.has(currentId)) return;
          const current = clients.get(currentId);
          current.lastSeen = Date.now();

          if (msg.type === "get-peers") {
            safeSend(ws, { type: "peers", peers: buildPeers(clients) });
            return;
          }

          if (msg.type === "rename") {
            current.name = msg.name ? String(msg.name) : current.name;
            broadcastPeers(clients);
            return;
          }

          if (msg.type === "ping") {
            current.lastSeen = Date.now();
            return;
          }

          if (msg.type === "send-intent") {
            const targetId = msg.targetId ? String(msg.targetId) : "";
            if (!targetId) return;
            const target = clients.get(targetId);
            if (target) safeSend(target.ws, { type: "incoming-intent", fromId: current.id, fromName: current.name });
            return;
          }
        } catch (err) {
          console.error("WS message error:", err);
        }
      });

      ws.on("close", () => {
        if (currentId && clients.has(currentId)) {
          clients.delete(currentId);
          broadcastPeers(clients);
        }
      });

      ws.on("error", () => {
        if (currentId && clients.has(currentId)) {
          clients.delete(currentId);
          broadcastPeers(clients);
        }
      });
    });

    // server upgrade hook
    server.on("upgrade", (request: any, sock: any, head: any) => {
      const url = request.url || "";
      if (!url.startsWith("/api/ws")) return;

      global.__latchsendWSS!.handleUpgrade(request, sock, head, (ws) => {
        global.__latchsendWSS!.emit("connection", ws, request);
      });
    });
  }

  return new Response("OK");
}
