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

  const entry = body.entry?.[0];

  const messaging =
    entry?.messaging?.[0] ||
    entry?.changes?.[0]?.value ||
    {};

  const cleanMessage = {
    id: Date.now(),
    source: "Instagram DM",

    senderId:
      messaging?.sender?.id ||
      messaging?.from ||
      null,

    recipientId:
      messaging?.recipient?.id ||
      messaging?.to ||
      null,

    text:
      messaging?.message?.text ||
      messaging?.text ||
      null,

    messageId:
      messaging?.message?.mid ||
      messaging?.mid ||
      null,

    timestamp:
      messaging?.timestamp ||
      null,

    raw: body,
    createdAt: new Date().toISOString(),
  };

  messages.unshift(cleanMessage);

  console.log(
    "Instagram webhook geldi:",
    JSON.stringify(cleanMessage, null, 2)
  );

  res.sendStatus(200);
});

app.get("/messages", (req, res) => {
  res.json(messages);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend çalışıyor: ${PORT}`);
});