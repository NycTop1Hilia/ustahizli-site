import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "ustahizli_token";

const messages = [];
const requests = [];

app.get("/", (req, res) => {
  res.send("UstaHizli backend çalışıyor.");
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

  const messageText =
    messaging?.message?.text ||
    messaging?.text ||
    messaging?.message?.attachments?.[0]?.payload?.url ||
    "";

  const cleanMessage = {
    id: Date.now(),
    source: "Instagram DM",
    senderId: messaging?.sender?.id || messaging?.from || null,
    recipientId: messaging?.recipient?.id || messaging?.to || null,
    text: messageText,
    messageId: messaging?.message?.mid || messaging?.mid || null,
    timestamp: messaging?.timestamp || null,
    raw: body,
    createdAt: new Date().toISOString(),
  };

  messages.unshift(cleanMessage);

  if (cleanMessage.text) {
    const requestFromInstagram = {
      id: Date.now(),
      name: "Instagram Müşterisi",
      phone: "",
      district: "Belirtilmedi",
      serviceType: "Instagram DM",
      description: cleanMessage.text,
      photoUrl: "",
      source: "Instagram DM",
      status: "Yeni",
      createdAt: new Date().toISOString(),
    };

    requests.unshift(requestFromInstagram);
  }

  console.log(
    "Instagram webhook geldi:",
    JSON.stringify(cleanMessage, null, 2)
  );

  res.sendStatus(200);
});

app.get("/messages", (req, res) => {
  res.json(messages);
});

app.post("/requests", (req, res) => {
  const request = {
    id: Date.now(),
    name: req.body.name || "Müşteri",
    phone: req.body.phone || "",
    district: req.body.district || "Belirtilmedi",
    serviceType: req.body.serviceType || "Belirtilmedi",
    description: req.body.description || "",
    photoUrl: req.body.photoUrl || "",
    source: req.body.source || "Site Formu",
    status: "Yeni",
    createdAt: new Date().toISOString(),
  };

  requests.unshift(request);

  res.status(201).json({
    success: true,
    message: "Talep başarıyla alındı.",
    request,
  });
});

app.get("/requests", (req, res) => {
  res.json(requests);
});

app.delete("/requests", (req, res) => {
  requests.length = 0;

  res.json({
    success: true,
    message: "Tüm talepler temizlendi.",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend çalışıyor: ${PORT}`);
});