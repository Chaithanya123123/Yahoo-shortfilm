# Retro Yahoo / eSpeed Trader

A retro 1999-era web app built for short film production featuring:
- Yahoo! Netscape Homepage replica
- eSpeed Trader dashboard with live charts
- Yahoo Finance Message Boards with real-time chat

## Quick Start (Local)

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Routes

| Route | Page |
|---|---|
| `/` | Netscape Yahoo Homepage |
| `/trader` | eSpeed Trader Dashboard |
| `/finance/message-boards` | Yahoo Finance Message Boards |

## Deploy to Railway

1. Push this folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Set environment variable: `NEXT_PUBLIC_SOCKET_URL=https://your-app.up.railway.app`
4. Railway auto-builds and deploys

## Tech Stack
- Next.js 15, React 18
- Socket.io (real-time ticks + chat)
- Lightweight Charts (TradingView)
- react-rnd (draggable windows)
- Custom retro CSS (no framework needed)
