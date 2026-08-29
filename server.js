const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// ─── Mock stock state ─────────────────────────────────────────────
const stocks = {
  ATML: { price: 0.375, open: 0.250, high: 0.395, low: 0.250, prevClose: 0.250, volume: 1033100, bid: 0.375, ask: 0.380 },
  AAPL: { price: 45.25, open: 44.00, high: 46.00, low: 43.50, prevClose: 44.00, volume: 8234000, bid: 45.20, ask: 45.30 },
  MSFT: { price: 92.50, open: 91.00, high: 93.50, low: 90.50, prevClose: 91.00, volume: 5123400, bid: 92.45, ask: 92.55 },
};

const marketIndices = {
  dow: 11378.92,
  nasdaq: 3617.96,
  sp500: 1371.22,
};

// ─── Retro usernames pool ─────────────────────────────────────────
const retroNames = [
  'StrongHands99', 'BullishTrader', 'ATMLFan', 'MoneyMaker', 'jake123',
  'StockKing', 'GreenDay', 'ValueSeeker', 'ShortSqueeze', 'daytrader1',
  'BillG', 'skeptic', 'stockpro', 'LongTerm', 'RocketMan99',
  'DiamondHands', 'PennyKing', 'MoonShot', 'BearBuster', 'MillionDollar',
];

// ─── In-memory message board ──────────────────────────────────────
let messages = [
  { id: 1, author: 'StrongHands99', subject: 'ATML is going to $20 soon!!!', body: 'I have been watching this stock for months. The fundamentals are incredible. Loading up at 0.375!', date: '10/11', time: '11:24 PM', symbol: 'ATML' },
  { id: 2, author: 'BullishTrader', subject: 'Re: ATML is going to $20 soon!!!', body: 'Agreed! The volume today is insane. Something big is coming.', date: '10/11', time: '11:32 PM', symbol: 'ATML' },
  { id: 3, author: 'ATMLFan', subject: 'This is the most undervalued stock in history', body: 'At 0.375 this is an absolute steal. The company has patents worth billions!', date: '10/11', time: '11:45 PM', symbol: 'ATML' },
  { id: 4, author: 'MoneyMaker', subject: 'Re: This is the most undervalued stock in history', body: 'I bought 50,000 shares today. Going to retire on this one!', date: '10/11', time: '11:52 PM', symbol: 'ATML' },
  { id: 5, author: 'jake123', subject: 'Any news on the acquisition???', body: 'I heard rumors about a major tech company acquiring ATML. Anyone know more?', date: '10/11', time: '11:58 PM', symbol: 'ATML' },
  { id: 6, author: 'ATMLFan', subject: 'Re: Any news on the acquisition???', body: 'My source says announcement coming next week. Stay tuned!!!', date: '10/12', time: '12:03 AM', symbol: 'ATML' },
  { id: 7, author: 'StockKing', subject: 'ATML will hit $20 very soon. Buy now!!!', body: 'Technical analysis shows a huge breakout pattern forming. This is it!', date: '10/12', time: '12:15 AM', symbol: 'ATML' },
  { id: 8, author: 'GreenDay', subject: 'Re: ATML will hit $20 very soon. Buy now!!!', body: 'Chart looks AMAZING. RSI, MACD, everything is pointing up!', date: '10/12', time: '12:18 AM', symbol: 'ATML' },
  { id: 9, author: 'ValueSeeker', subject: "I'm in 100k shares. This is a no brainer.", body: 'Averaged down from 0.5 to 0.375. This will be my retirement stock!', date: '10/12', time: '12:35 AM', symbol: 'ATML' },
  { id: 10, author: 'ATMLFan', subject: "Re: I'm in 100k shares. This is a no brainer.", body: 'Same here! Welcome to the ATML millionaires club!', date: '10/12', time: '12:42 AM', symbol: 'ATML' },
  { id: 11, author: 'ShortSqueeze', subject: 'Volume is going crazy this morning!', body: 'Over 1 million shares already! The shorts are going to get destroyed.', date: '10/12', time: '9:47 AM', symbol: 'ATML' },
  { id: 12, author: 'daytrader1', subject: 'Re: Volume is going crazy this morning!', body: 'Just bought 25,000 more. This rocket is launching TODAY!', date: '10/12', time: '9:53 AM', symbol: 'ATML' },
  { id: 13, author: 'BillG', subject: "Just loaded up another 50k shares. Let's go!", body: "All in on ATML. The next Microsoft! Let's go to $20!", date: '10/12', time: '10:12 AM', symbol: 'ATML' },
  { id: 14, author: 'ATMLFan', subject: "Re: Just loaded up another 50k shares. Let's go!", body: 'Incredible! The buy pressure is building. $1 by end of day!', date: '10/12', time: '10:20 AM', symbol: 'ATML' },
  { id: 15, author: 'skeptic', subject: 'This is all hype. Be careful.', body: 'Warning: I have seen this pattern before. Do your own research. Not all that glitters is gold.', date: '10/12', time: '10:35 AM', symbol: 'ATML' },
  { id: 16, author: 'BullishTrader', subject: 'Re: This is all hype. Be careful.', body: 'SKEPTIC IS SHORTING THE STOCK! Do not listen! ATML to the moon!', date: '10/12', time: '10:41 AM', symbol: 'ATML' },
  { id: 17, author: 'ATMLFan', subject: 'To the moon!!!', body: '🚀🚀🚀 ATML ATML ATML 🚀🚀🚀', date: '10/12', time: '11:03 AM', symbol: 'ATML' },
  { id: 18, author: 'jake123', subject: 'Re: To the moon!!!', body: 'LETS GOOOO! Just told my wife about this. She is buying too!', date: '10/12', time: '11:07 AM', symbol: 'ATML' },
  { id: 19, author: 'stockpro', subject: 'Just hit 0.75 already! WOW!', body: 'Doubled in one day! I made $37,500 on my 50k shares. LEGENDARY STOCK!', date: '10/12', time: '11:28 AM', symbol: 'ATML' },
  { id: 20, author: 'LongTerm', subject: 'Holding for $20+', body: 'Not selling until $20 minimum. This is generational wealth folks.', date: '10/12', time: '11:50 AM', symbol: 'ATML' },
  { id: 21, author: 'RocketMan99', subject: 'Bought on margin. All in!', body: 'Mortgaged my house to buy ATML. This is my ticket to freedom!', date: '10/12', time: '12:01 PM', symbol: 'ATML' },
  { id: 22, author: 'DiamondHands', subject: 'Re: Bought on margin. All in!', body: 'HOLD THE LINE! Diamond hands only. Weak hands will regret selling!', date: '10/12', time: '12:08 PM', symbol: 'ATML' },
  { id: 23, author: 'PennyKing', subject: 'This is going to 5 dollars by Friday!!!', body: 'My proprietary algorithm says ATML hits $5 by Friday. Screenshot this post.', date: '10/12', time: '12:20 PM', symbol: 'ATML' },
  { id: 24, author: 'MoonShot', subject: 'ATML - The next Yahoo! stock', body: 'Remember when Yahoo! was a penny stock? ATML is the next Yahoo!', date: '10/12', time: '12:35 PM', symbol: 'ATML' },
  { id: 25, author: 'BearBuster', subject: 'Shorts getting crushed!!!', body: 'Short interest was 40%. They are ALL getting squeezed right now. Beautiful!', date: '10/12', time: '12:45 PM', symbol: 'ATML' },
];
let messageIdCounter = 26;

// ─── Candle history for chart ─────────────────────────────────────
function generateCandleHistory() {
  const candles = [];
  let price = 0.125;
  // Generate ~120 daily candles from June 1 to Oct 1 1999
  const startTime = new Date('1999-06-01').getTime() / 1000;
  for (let i = 0; i < 120; i++) {
    const open = price;
    const change = (Math.random() - 0.48) * 0.02;
    const close = Math.max(0.05, open + change);
    const high = Math.max(open, close) + Math.random() * 0.015;
    const low = Math.min(open, close) - Math.random() * 0.015;
    const volume = Math.floor(50000 + Math.random() * 200000);
    candles.push({
      time: startTime + i * 86400,
      open: parseFloat(open.toFixed(3)),
      high: parseFloat(high.toFixed(3)),
      low: parseFloat(Math.max(0.05, low).toFixed(3)),
      close: parseFloat(close.toFixed(3)),
      volume,
    });
    price = close;
  }
  // Final spike to 0.375
  candles[candles.length - 1].close = 0.375;
  candles[candles.length - 1].high = 0.395;
  return candles;
}

const candleHistory = generateCandleHistory();

// ─── Level II mock state ──────────────────────────────────────────
function generateLevelII() {
  const mmIds = ['ETMM', 'CANT', 'NITE', 'MAXM', 'ARCA', 'GSCO', 'MLCO', 'PIPR'];
  const basePrice = stocks.ATML.price;
  const bids = mmIds.slice(0, 5).map((mm, i) => ({
    mmId: mm, bid: parseFloat((basePrice - i * 0.005).toFixed(3)), size: Math.floor(5000 + Math.random() * 10000),
  }));
  const asks = mmIds.slice(0, 5).map((mm, i) => ({
    mmId: mm, ask: parseFloat((basePrice + 0.005 + i * 0.005).toFixed(3)), size: Math.floor(5000 + Math.random() * 10000),
  }));
  return { bids, asks };
}

// ─── Time & Sales ─────────────────────────────────────────────────
let timeSales = [];
function generateTimeSale() {
  const basePrice = stocks.ATML.price;
  const priceVariance = (Math.random() - 0.5) * 0.01;
  const price = parseFloat((basePrice + priceVariance).toFixed(3));
  const size = [1000, 2000, 5000, 10000][Math.floor(Math.random() * 4)];
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  return { time, price, size, up: priceVariance >= 0 };
}

// ─── Market index drift ───────────────────────────────────────────
function driftIndices() {
  marketIndices.dow += (Math.random() - 0.5) * 2;
  marketIndices.nasdaq += (Math.random() - 0.5) * 1;
  marketIndices.sp500 += (Math.random() - 0.5) * 0.5;
}

// ─── Stock price drift ────────────────────────────────────────────
function driftStock(symbol) {
  const s = stocks[symbol];
  const change = (Math.random() - 0.48) * 0.003;
  s.price = parseFloat(Math.max(0.05, s.price + change).toFixed(3));
  s.bid = parseFloat(Math.max(0.05, s.price - 0.005).toFixed(3));
  s.ask = parseFloat((s.price + 0.005).toFixed(3));
  if (s.price > s.high) s.high = s.price;
  if (s.price < s.low) s.low = s.price;
  s.volume += Math.floor(Math.random() * 500);
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send initial data
    socket.emit('init', {
      stocks,
      candleHistory,
      messages,
      indices: marketIndices,
      levelII: generateLevelII(),
    });

    // Handle chat/message board post
    socket.on('post_message', ({ subject, body, symbol }) => {
      const retroName = retroNames[Math.floor(Math.random() * retroNames.length)];
      const now = new Date();
      const dateStr = `${now.getMonth() + 1}/${now.getDate()}`;
      const hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const h12 = ((hours % 12) || 12);
      const timeStr = `${String(h12).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${ampm}`;
      const msg = {
        id: messageIdCounter++,
        author: retroName,
        subject: subject || 'New message',
        body: body || '',
        date: dateStr,
        time: timeStr,
        symbol: symbol || 'ATML',
      };
      messages.unshift(msg);
      if (messages.length > 200) messages.pop();
      io.emit('new_message', msg);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // ─── Emit ticks every 500ms ─────────────────────────────────────
  setInterval(() => {
    Object.keys(stocks).forEach(sym => driftStock(sym));
    driftIndices();
    const ts = generateTimeSale();
    timeSales.unshift(ts);
    if (timeSales.length > 100) timeSales.pop();

    io.emit('tick', {
      stocks,
      indices: marketIndices,
      timeSale: ts,
      levelII: generateLevelII(),
    });
  }, 600);

  // ─── Emit new candle every 5 seconds ────────────────────────────
  setInterval(() => {
    const s = stocks.ATML;
    const lastCandle = candleHistory[candleHistory.length - 1];
    const newCandle = {
      time: lastCandle.time + 60,
      open: lastCandle.close,
      high: Math.max(lastCandle.close, s.price + Math.random() * 0.01),
      low: Math.min(lastCandle.close, s.price - Math.random() * 0.01),
      close: s.price,
      volume: Math.floor(10000 + Math.random() * 50000),
    };
    candleHistory.push(newCandle);
    io.emit('new_candle', newCandle);
  }, 5000);

  httpServer
    .once('error', (err) => { console.error(err); process.exit(1); })
    .listen(port, () => {
      console.log(`> Ready on http://localhost:${port}`);
    });
});
