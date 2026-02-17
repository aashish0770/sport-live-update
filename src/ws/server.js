import { WebSocket, WebSocketServer } from "ws";

function sendJson(socket, payload) {
  if (socket && socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

function boardcast(wss, payload) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) return;

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
    sendJson(ws, {
      type: "welcome",
      message: "Welcome to the WebSocket server!",
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
