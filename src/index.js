import express from "express";
import { matchRouter } from "./routes/matchs.js";

const app = express();
const PORT = 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Routes
app.use("/api/v1/matches", matchRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
