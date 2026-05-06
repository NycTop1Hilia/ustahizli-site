import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "ustahizli_token";
const messages = [];

app.get("/", (req, res) => {
  res.send("UstaHizli Instagram DM backend çalışıyor.");
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook", (req, res) => {
  const body = req.body;

  messages.unshift({
    id: Date.now(),
    source: "Instagram DM",
    data: body,
    createdAt: new Date().toISOString(),
  });

  console.log("Instagram webhook geldi:", JSON.stringify(body, null, 2));

  res.sendStatus(200);
});

app.get("/messages", (req, res) => {
  res.json(messages);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend çalışıyor: ${PORT}`);
});