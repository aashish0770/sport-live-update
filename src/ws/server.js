import { WebSocket, WebSocketServer } from "ws";

function sendJson(socket, payload) {
  if (socket && socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

function boardcast(wss, payload) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;

    client.send(JSON.stringify(payload));
  }
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });

  wss.on("connection", (ws) => {
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });
    sendJson(ws, {
      type: "welcome",
      message: "Welcome to the WebSocket server!",
    });
    const interval = setInterval(() => {
      wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    ws.on("close", () => {
      clearInterval(interval);
    });
    ws.on("error", console.error);
  });

  function boardcastMatchCreated(match) {
    boardcast(wss, {
      type: "match_created",
      data: match,
    });
  }
  return { boardcastMatchCreated };
}
