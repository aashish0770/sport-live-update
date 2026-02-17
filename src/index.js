import express from "express";
import http from "http";
import { matchRouter } from "./routes/matchs.js";
import { attachWebSocketServer } from "./ws/server.js";

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Routes
app.use("/api/v1/matches", matchRouter);

const { boardcastMatchCreated } = attachWebSocketServer(server);
app.locals.boardcastMatchCreated = boardcastMatchCreated;

server.listen(PORT, HOST, () => {
  const baseUrl = `http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`;
  console.log(`Server is listening on port ${baseUrl}`);
  console.log(
    `WebSocket server is running on ${baseUrl.replace("http", "ws")}/ws`,
  );
});
