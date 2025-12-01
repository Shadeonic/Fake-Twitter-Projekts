require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let messagesCollection;

async function connectDB() {
  await client.connect();
  const db = client.db("FakeTwitter"); // choose DB name
  messagesCollection = db.collection("messages");
  console.log("Connected to MongoDB");
}
connectDB().catch(console.error);

// server/src/index.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;
const lastPostTime = {}; // key = ip, value = timestamp

app.use(cors());
app.use(express.json());

// Guard: if DB isn't connected yet, block requests
app.use((req, res, next) => {
  if (!messagesCollection) {
    return res.status(503).json({ error: "Database not ready" });
  }
  next();
});

// GET - iegūst visas ziņas
app.get("/api/messages", async (req, res) => {
  try {
    const msgs = await messagesCollection
      .find({})
      .sort({ timestamp: -1 }) // newest first
      .toArray();
    res.json(msgs);
  } catch (err) {
    console.error("GET /api/messages failed:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.post("/api/messages", async (req, res) => {
  const { title, body } = req.body;
  const ip = req.ip || "";

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

  const msg = {
    title,
    body,
    ip,
    vote: 0,
    timestamp: new Date().toISOString(),
    voters: {}, // { ip: +1 | -1 }
  };

  try {
    const result = await messagesCollection.insertOne(msg);
    res.status(201).json({ ...msg, _id: result.insertedId });
  } catch (err) {
    console.error("POST /api/messages failed:", err);
    res.status(500).json({ error: "Failed to save message" });
  }
});


//Iespējami labi uztaisīta voting sistēma
app.post("/api/messages/:id/vote", async (req, res) => {
  const id = req.params.id;         // MongoDB _id string from frontend
  const delta = req.body.delta;     // +1 or -1
  const ip = req.ip || "";

  if (delta !== 1 && delta !== -1) {
    return res.status(400).json({ error: "delta must be +1 or -1" });
  }

  try {
    const _id = new ObjectId(id);
    const msg = await messagesCollection.findOne({ _id });
    if (!msg) return res.status(404).json({ error: "Not found" });

    msg.voters = msg.voters || {};

    // Already voted same
    if (msg.voters[ip] === delta) {
      return res.status(400).json({ error: "Already voted same" });
    }

    // If changing vote, subtract previous vote
    if (msg.voters[ip]) {
      msg.vote -= msg.voters[ip];
    }

    msg.voters[ip] = delta;
    msg.vote += delta;

    await messagesCollection.updateOne(
      { _id },
      { $set: { voters: msg.voters, vote: msg.vote } }
    );

    res.json(msg);
  } catch (err) {
    console.error("POST /api/messages/:id/vote failed:", err);
    res.status(500).json({ error: "Failed to update vote" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});