# React + Express + TypeScript Template

A minimal full-stack template:
- Client: React 19 + Vite + TypeScript
- Server: Express + TypeScript
- Dev: Hot reload on both, proxy `/api` in dev
- Build: Server compiles to `server/dist`, client builds to `client/dist`
- Production: Server can statically serve the built client

## Prerequisites
- Node.js 18+ and npm 8+ (npm workspaces)
- Recommended: `corepack enable` (optional)

## Getting started

```bash
# 1) Install deps for both workspaces
npm install

# 2) Copy environment defaults (optional)
cp .env.example .env

# 3) Run both client and server in dev mode
npm run dev
# Client: http://localhost:5173  (proxy to server /api)
# Server: http://localhost:4000
--------------------------------------------------------------------------
FOR ME:
START SERVER:
Back-end: 
cd C:\Users\PC\Desktop\PRAKSE\Fake-Twitter-Projekts\server
node src/index.js 

Front-end: 
cd C:\Users\PC\Desktop\PRAKSE\Fake-Twitter-Projekts\client
npm run dev

TESTS:
Test in terminal: 
See all messages: 
curl http://localhost:4000/api/messages 

Write new message: 
curl -X POST http://localhost:4000/api/messages -H "Content-Type: application/json" -d "{\"title\":\"Test\",\"body\":\"Hello from curl\"}"

WHERE TO FIND IN LOCALHOST:
Open: 
Front-end: 
http://localhost:5173/ 

Back-end: 
http://localhost:4000/api/messages
