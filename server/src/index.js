// server/src/index.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Atmiņā
let messages = [];
let nextId = 1;

// GET - iegūst visas ziņas
app.get("/api/messages", (req, res) => {
  res.json(messages);
});

// POST - izveido ziņas
app.post("/api/messages", (req, res) => {
  const { title, body } = req.body;

  //Ja nav title vai body - nesaglabā un met error
  if (!title || !body) {
    return res.status(400).json({ error: "Title and body required" });
  }

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
});

// app.post("/api/messages/:id/vote", (req, res) => {
//   const id = Number(req.params.id);
//   const delta = req.body.delta; // +1 or -1

//   const msg = messages.find(m => m.id === id);
//   if (!msg) return res.status(404).json({ error: "Not found" });

//   if (delta !== 1 && delta !== -1) {
//     return res.status(400).json({ error: "delta must be +1 or -1" });
//   }

//   msg.vote += delta;
//   res.json(msg);
// });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
