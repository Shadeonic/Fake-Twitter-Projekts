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
    timestamp: new Date().toISOString()
  };

  // jaunākais - pirmais
  messages.unshift(msg);

  res.status(201).json(msg);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
