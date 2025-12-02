require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = process.env.MONGO_URI;
const PORT = process.env.PORT || 4000;

// MongoDB client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let messagesCollection;

// Connect to DB
async function connectDB() {
  try {
    await client.connect();
    const db = client.db('FakeTwitter');
    messagesCollection = db.collection('messages');
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}
connectDB();

// Express app
const app = express();
const lastPostTime = {}; // key = ip, value = timestamp

app.use(cors());
app.use(express.json());

// Guard: block requests until DB is ready
app.use((req, res, next) => {
  if (!messagesCollection) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  next();
});

// Routes
app.get('/api/messages', async (req, res) => {
  try {
    const msgs = await messagesCollection
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    res.json(msgs);
  } catch (err) {
    console.error('GET /api/messages failed:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/messages', async (req, res) => {
  const { title, body } = req.body;
  const ip = req.ip || '';

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body required' });
  }

  // Rate limiting: 10s per IP
  const now = Date.now();
  const last = lastPostTime[ip] || 0;
  const diff = (now - last) / 1000;
  if (diff < 10) {
    return res.status(429).json({
      error: `Please wait ${Math.ceil(10 - diff)}s before posting again.`,
    });
  }
  lastPostTime[ip] = now;

  const msg = {
    title,
    body,
    ip,
    vote: 0,
    timestamp: new Date().toISOString(),
    voters: {},
  };

  try {
    const result = await messagesCollection.insertOne(msg);
    const savedMsg = { ...msg, _id: result.insertedId };
    io.emit('newMessage', savedMsg);
    res.status(201).json(savedMsg);
  } catch (err) {
    console.error('POST /api/messages failed:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

app.post('/api/messages/:id/vote', async (req, res) => {
  const id = req.params.id;
  const delta = req.body.delta;
  const ip = req.ip || '';

  if (delta !== 1 && delta !== -1) {
    return res.status(400).json({ error: 'delta must be +1 or -1' });
  }

  try {
    const _id = new ObjectId(id);
    const msg = await messagesCollection.findOne({ _id });
    if (!msg) return res.status(404).json({ error: 'Not found' });

    msg.voters = msg.voters || {};

    if (msg.voters[ip] === delta) {
      return res.status(400).json({ error: 'Already voted same' });
    }

    if (msg.voters[ip]) {
      msg.vote -= msg.voters[ip];
    }

    msg.voters[ip] = delta;
    msg.vote += delta;

    await messagesCollection.updateOne(
      { _id },
      { $set: { voters: msg.voters, vote: msg.vote } }
    );
    io.emit('voteUpdate', msg);
    res.json(msg);
  } catch (err) {
    console.error('POST /api/messages/:id/vote failed:', err);
    res.status(500).json({ error: 'Failed to update vote' });
  }
});

// Server + Socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
});

// Broadcast all messages every 10s
setInterval(async () => {
  if (!messagesCollection) return;
  try {
    const msgs = await messagesCollection
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    io.emit('messagesUpdate', msgs);
  } catch (err) {
    console.error('Failed to broadcast messages:', err);
  }
}, 10000);

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
