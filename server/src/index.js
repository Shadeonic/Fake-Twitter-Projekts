// server/src/index.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 4000;
const path = "data/messages.json";
const lastPostTime = {}; // key = ip, value = timestamp

app.use(cors());
app.use(express.json());

// Atmiņā
let messages = [];

//Pārbauda, vai ir fails, ir ceļs uz failu
if (fs.existsSync(path)) {
  const raw = fs.readFileSync(path, "utf-8");
  messages = raw ? JSON.parse(raw) : [];
} else {
  messages = [];
}

let nextId = messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1;

// GET - iegūst visas ziņas
app.get("/api/messages", (req, res) => {
  res.json(messages);
});

// POST - izveido ziņas
app.post("/api/messages", (req, res) => {
  const { title, body } = req.body;
  const ip = req.ip || "";

  //Ja nav title vai body - nesaglabā un met error
  if (!title || !body) {
    return res.status(400).json({ error: "Title and body required" });
  }

// Rate limiting: 10 seconds per IP
  const now = Date.now();
  const last = lastPostTime[ip] || 0;
  const diff = (now - last) / 1000; // seconds

if (diff < 10) {
    return res.status(429).json({ error: `Please wait ${Math.ceil(10 - diff)}s before posting again.` });
  }

  lastPostTime[ip] = now;

  //saglabā ziņu kā mainīgo
  const msg = {
    id: nextId++,
    title,
    body,
    ip: req.ip || "",               // user IP
    vote: 0,
    timestamp: new Date().toISOString()
  };

  // jaunākais - pirmais
  messages.unshift(msg);

  res.status(201).json(msg);

  fs.writeFileSync("data/messages.json", JSON.stringify(messages, null, 2));

});

//Iespējami labi uztaisīta voting sistēma
app.post("/api/messages/:id/vote", (req, res) => {
  const id = Number(req.params.id);
  const delta = req.body.delta; // +1 or -1

  const msg = messages.find(m => m.id === id);
  if (!msg) return res.status(404).json({ error: "Not found" });

  if (delta !== 1 && delta !== -1) {
    return res.status(400).json({ error: "delta must be +1 or -1" });
  }

  msg.vote += delta;
  res.json(msg);

  fs.writeFileSync("data/messages.json", JSON.stringify(messages, null, 2));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
