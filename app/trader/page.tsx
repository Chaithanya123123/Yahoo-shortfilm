'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Win98Window from '@/components/Win98Window';
import { getSocket, requestInit } from '@/lib/socket';

const CandlestickChart = dynamic(() => import('@/components/CandlestickChart'), { ssr: false });

interface StockData {
  price: number; open: number; high: number; low: number;
  prevClose: number; volume: number; bid: number; ask: number;
}
interface LevelIIEntry { mmId: string; bid?: number; ask?: number; size: number; }
interface TimeSale { time: string; price: number; size: number; up: boolean; }
interface Candle { time: number; open: number; high: number; low: number; close: number; volume: number; }
interface NewsItem { time: string; headline: string; }

const mockNews: NewsItem[] = [
  { time: '10:15', headline: 'Atomlife Announces New Joint Venture' },
  { time: '09:45', headline: 'Atomlife Reports Record Sales For Q3' },
  { time: '09:30', headline: 'Atomlife To Present At Upcoming Conference' },
  { time: '09:15', headline: 'Industry Update: Biotech Sector Strong' },
  { time: '08:55', headline: 'ATML Receives FDA Fast-Track Designation' },
  { time: '08:30', headline: 'Market Opens Higher; Tech Leads Gains' },
];

export default function TraderPage() {
  const [stocks, setStocks] = useState<Record<string, StockData>>({});
  const [indices, setIndices] = useState({ dow: 11378.92, nasdaq: 3617.96, sp500: 1371.22 });
  const [levelII, setLevelII] = useState<{ bids: LevelIIEntry[]; asks: LevelIIEntry[] }>({ bids: [], asks: [] });
  const [timeSales, setTimeSales] = useState<TimeSale[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [newCandle, setNewCandle] = useState<Candle | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSubject, setChatSubject] = useState('');
  const [chatBody, setChatBody] = useState('');
  const [symbol, setSymbol] = useState('ATML');
  const [clock, setClock] = useState('');
  const [orderSymbol, setOrderSymbol] = useState('ATML');
  const [orderQty, setOrderQty] = useState('10000');
  const [orderType, setOrderType] = useState('LIMIT');
  const [orderAction, setOrderAction] = useState('BUY');
  const [limitPrice, setLimitPrice] = useState('0.380');
  const [portfolio] = useState([
    { symbol: 'ATML', shares: 10000, last: 0.375, net: +0.125, pctChg: 50.00, value: 3750.00 },
    { symbol: 'DEMO', shares: 5000, last: 12.250, net: -0.250, pctChg: -2.00, value: 61250.00 },
    { symbol: 'XYZ', shares: 2000, last: 3.500, net: +0.050, pctChg: +1.45, value: 7000.00 },
  ]);

  interface Message {
    id: number; author: string; subject: string;
    body: string; date: string; time: string; symbol: string;
  }

  const prevPriceRef = useRef<number>(0);

  // Clock update
  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      setClock(`${h}:${m}:${s} ET`);
    };
    fmt();
    const t = setInterval(fmt, 1000);
    return () => clearInterval(t);
  }, []);

  // Socket connection
  useEffect(() => {
    const sock = getSocket();

    sock.on('init', (data: any) => {
      setStocks(data.stocks || {});
      setIndices(data.indices || { dow: 11378.92, nasdaq: 3617.96, sp500: 1371.22 });
      setLevelII(data.levelII || { bids: [], asks: [] });
      setCandles(data.candleHistory || []);
      if (data.messages) setMessages(data.messages);
      if (data.stocks?.ATML) {
        prevPriceRef.current = data.stocks.ATML.price;
        setLimitPrice(data.stocks.ATML.ask?.toFixed(3) || '0.380');
      }
    });

    sock.on('tick', (data: any) => {
      setStocks(data.stocks || {});
      setIndices(data.indices || {});
      setLevelII(data.levelII || { bids: [], asks: [] });
      if (data.timeSale) {
        setTimeSales(prev => [data.timeSale, ...prev].slice(0, 50));
      }
    });

    sock.on('new_candle', (candle: Candle) => {
      setNewCandle(candle);
    });

    sock.on('new_message', (msg: Message) => {
      setMessages(prev => [msg, ...prev]);
    });

    requestInit(sock);

    return () => {
      sock.off('init');
      sock.off('tick');
      sock.off('new_candle');
      sock.off('new_message');
    };
  }, []);

  const handleChatPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatSubject.trim() || !chatBody.trim()) return;
    const sock = getSocket();
    sock.emit('post_message', { subject: chatSubject, body: chatBody, symbol });
    setChatSubject('');
    setChatBody('');
  };

  const atml = stocks[symbol] || { price: 0.375, open: 0.250, high: 0.395, low: 0.250, prevClose: 0.250, volume: 1033100, bid: 0.375, ask: 0.380 };
  const net = atml.price - atml.prevClose;
  const pctChg = atml.prevClose > 0 ? (net / atml.prevClose) * 100 : 0;

  return (
    <div className="trader-desktop">
      {/* ── Main application window ── */}
      <div className="trader-main-window">
        {/* Window title bar */}
        <div className="titlebar" style={{ cursor: 'default' }}>
          <span className="titlebar-icon">📊</span>
          <span className="titlebar-title">eSpeed Trader - [Quote Page]</span>
          <div className="titlebar-btns">
            <button className="titlebar-btn">_</button>
            <button className="titlebar-btn">□</button>
            <button className="titlebar-btn" style={{ color: '#ff4444' }}>✕</button>
          </div>
        </div>

        {/* Menu bar */}
        <div className="menubar">
          {['File', 'View', 'Quotes', 'Trade', 'Orders', 'Account', 'Tools', 'Window', 'Help'].map(m => (
            <span key={m} className="menubar-item">{m}</span>
          ))}
        </div>

        {/* Toolbar */}
        <div className="toolbar-row">
          {[
            { icon: '📊', label: 'Quote' }, { icon: '💹', label: 'Trade' }, { icon: '📋', label: 'Order' },
            { icon: '👤', label: 'Account' }, { icon: '📈', label: 'Chart' }, { icon: '📰', label: 'News' },
            { icon: '🤖', label: 'Agent' }, { icon: '⚙️', label: 'Options' }, { icon: '❓', label: 'Help' },
          ].map((btn, i) => (
            <React.Fragment key={btn.label}>
              {i === 4 && <div className="toolbar-sep" />}
              <div className="toolbar-btn">
                <span style={{ fontSize: 18 }}>{btn.icon}</span>
                <span>{btn.label}</span>
              </div>
            </React.Fragment>
          ))}
          {/* Market indices ticker */}
          <div className="market-ticker-bar" style={{ flex: 1, marginLeft: 8 }}>
            <div className="index-item">
              <span className="index-name">Dow</span>
              <span className="index-val">{indices.dow.toFixed(2)}</span>
              <span className="index-chg" style={{ color: '#00ff00' }}>+{(indices.dow - 11265.36).toFixed(2)}</span>
            </div>
            <div className="index-item">
              <span className="index-name">Nasdaq</span>
              <span className="index-val">{indices.nasdaq.toFixed(2)}</span>
              <span className="index-chg" style={{ color: '#00ff00' }}>+{(indices.nasdaq - 3562.54).toFixed(2)}</span>
            </div>
            <div className="index-item">
              <span className="index-name">S&P 500</span>
              <span className="index-val">{indices.sp500.toFixed(2)}</span>
              <span className="index-chg" style={{ color: '#00ff00' }}>+{(indices.sp500 - 1355.50).toFixed(2)}</span>
            </div>
            <span className="market-time">{clock} &nbsp; Market Open</span>
          </div>
        </div>

        {/* ── Sub-window area ── */}
        <div className="subwindow-area">

          {/* Quote Page */}
          <Win98Window id="quote" title="Quote Page" icon="📊" defaultX={8} defaultY={4} defaultWidth={310} defaultHeight={230} zIndex={10} scrollable={false}>
            <div style={{ padding: '6px 8px', background: '#c0c0c0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 11 }}>Enter Symbol:</span>
                <input
                  className="input98"
                  value={symbol}
                  onChange={e => setSymbol(e.target.value.toUpperCase())}
                  style={{ width: 60 }}
                />
                <button className="btn98" style={{ minWidth: 40, padding: '1px 6px' }}>Go!</button>
                <span style={{ fontSize: 11, marginLeft: 'auto', fontWeight: 'bold' }}>ATOMLIFE INC</span>
                <span style={{ fontSize: 10, color: '#555' }}>ATML<br />NASD</span>
              </div>
              {/* Quote grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, fontSize: 11 }}>
                <div style={{ borderRight: '1px solid #aaa', paddingRight: 6 }}>
                  {[
                    { label: 'Last', val: atml.price.toFixed(3), green: net >= 0 },
                    { label: 'Net', val: `${net >= 0 ? '+' : ''}${net.toFixed(3)}`, green: net >= 0 },
                    { label: '% Chg', val: `${pctChg >= 0 ? '+' : ''}${pctChg.toFixed(2)}`, green: pctChg >= 0 },
                    { label: 'Bid', val: atml.bid.toFixed(3), green: true },
                    { label: 'Ask', val: atml.ask.toFixed(3), green: false },
                    { label: 'Size', val: '10000 x 10000', green: false, plain: true },
                    { label: 'Vol', val: atml.volume.toLocaleString(), green: false, plain: true },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0', borderBottom: '1px solid #ddd' }}>
                      <span style={{ color: '#333' }}>{row.label}</span>
                      <span style={{ color: row.plain ? '#000' : row.green ? '#00aa00' : '#cc0000', fontWeight: row.plain ? 'normal' : 'bold' }}>
                        {row.val}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ paddingLeft: 6 }}>
                  {[
                    { label: 'Open', val: atml.open.toFixed(3) },
                    { label: 'High', val: atml.high.toFixed(3) },
                    { label: 'Low', val: atml.low.toFixed(3) },
                    { label: 'Prev Close', val: atml.prevClose.toFixed(3) },
                    { label: '52wk High', val: '1.250' },
                    { label: '52wk Low', val: '0.125' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0', borderBottom: '1px solid #ddd' }}>
                      <span style={{ color: '#333' }}>{row.label}</span>
                      <span>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Win98Window>

          {/* Chart Window */}
          <Win98Window id="chart" title={`Chart - ${symbol}`} icon="📈" defaultX={328} defaultY={4} defaultWidth={390} defaultHeight={400} zIndex={10} scrollable={false}>
            <div style={{ background: '#000', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {/* Chart toolbar */}
              <div style={{ background: '#1a1a1a', padding: '2px 4px', display: 'flex', gap: 4 }}>
                {['🔍', '🔎', '↔', '📐', '📏', '📊', '📋', '⚙️'].map((ic, i) => (
                  <span key={i} style={{ color: '#aaa', fontSize: 11, cursor: 'pointer', padding: '1px 2px' }}>{ic}</span>
                ))}
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                {candles.length > 0 && (
                  <CandlestickChart candles={candles} newCandle={newCandle} symbol={symbol} />
                )}
              </div>
            </div>
          </Win98Window>

          {/* Time & Sales */}
          <Win98Window id="ts" title="Time & Sales" icon="⏱️" defaultX={726} defaultY={4} defaultWidth={270} defaultHeight={400} zIndex={10} scrollable={false}>
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <table className="ts-table">
                <thead>
                  <tr>
                    <th>Time</th><th>Price</th><th>Size</th>
                  </tr>
                </thead>
              </table>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <table className="ts-table" style={{ width: '100%' }}>
                  <tbody>
                    {timeSales.map((ts, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'Courier New', fontSize: 10 }}>{ts.time}</td>
                        <td className={ts.up ? 'ts-up' : 'ts-down'}>{ts.price.toFixed(3)}</td>
                        <td style={{ textAlign: 'right' }}>{ts.size.toLocaleString()}</td>
                      </tr>
                    ))}
                    {timeSales.length === 0 && (
                      <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888', padding: 8 }}>Waiting for data...</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Win98Window>

          {/* Level II */}
          <Win98Window id="level2" title="Level II" icon="📋" defaultX={8} defaultY={242} defaultWidth={310} defaultHeight={230} zIndex={10} scrollable={false}>
            <div style={{ padding: '2px 4px', background: '#c0c0c0', fontSize: 10, fontWeight: 'bold', borderBottom: '1px solid #aaa' }}>
              ATML &nbsp;&nbsp; ATOMLIFE INC
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, overflow: 'hidden' }}>
              {/* Bids */}
              <div style={{ overflow: 'hidden', borderRight: '1px solid #aaa' }}>
                <table className="level2-table">
                  <thead><tr><th>MM ID</th><th>Bid</th><th>Size</th></tr></thead>
                  <tbody>
                    {levelII.bids.map((b, i) => (
                      <tr key={i}>
                        <td>{b.mmId}</td>
                        <td className="l2-bid">{b.bid?.toFixed(3)}</td>
                        <td>{b.size?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Asks */}
              <div style={{ overflow: 'hidden' }}>
                <table className="level2-table">
                  <thead><tr><th>MM ID</th><th>Ask</th><th>Size</th></tr></thead>
                  <tbody>
                    {levelII.asks.map((a, i) => (
                      <tr key={i}>
                        <td>{a.mmId}</td>
                        <td className="l2-ask">{a.ask?.toFixed(3)}</td>
                        <td>{a.size?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Win98Window>

          {/* News */}
          <Win98Window id="news" title="News" icon="📰" defaultX={8} defaultY={480} defaultWidth={310} defaultHeight={180} zIndex={10} scrollable={true}>
            <div style={{ padding: '2px 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', padding: '2px 6px', fontWeight: 'bold', fontSize: 11, borderBottom: '1px solid #aaa' }}>
                <span>Time</span><span>Headline</span>
              </div>
              {mockNews.map((n, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '50px 1fr', padding: '2px 6px', fontSize: 11, borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                  <span style={{ color: '#555' }}>{n.time}</span>
                  <span style={{ color: '#0000cc', textDecoration: 'underline' }}>{n.headline}</span>
                </div>
              ))}
            </div>
          </Win98Window>

          {/* Order Entry */}
          <Win98Window id="order" title="Order Entry" icon="📝" defaultX={328} defaultY={412} defaultWidth={310} defaultHeight={260} zIndex={10} scrollable={false}>
            <div style={{ padding: 8, flex: 1 }}>
              {[
                { label: 'Account:', content: <select className="order-select" style={{ flex: 1 }}><option>1234567</option></select> },
                { label: 'Symbol:', content: <><input className="input98" value={orderSymbol} onChange={e => setOrderSymbol(e.target.value.toUpperCase())} style={{ width: 60 }} /><span style={{ fontSize: 11, marginLeft: 6 }}>ATOMLIFE INC</span></> },
                { label: 'Action:', content: <select className="order-select" value={orderAction} onChange={e => setOrderAction(e.target.value)}><option>BUY</option><option>SELL</option></select> },
                { label: 'Quantity:', content: <input className="input98" value={orderQty} onChange={e => setOrderQty(e.target.value)} style={{ width: 80 }} /> },
                { label: 'Order Type:', content: <select className="order-select" value={orderType} onChange={e => setOrderType(e.target.value)}><option>LIMIT</option><option>MARKET</option><option>STOP</option></select> },
                { label: 'Limit Price:', content: <input className="input98" value={limitPrice} onChange={e => setLimitPrice(e.target.value)} style={{ width: 70 }} /> },
                { label: 'TIF:', content: <select className="order-select"><option>DAY</option><option>GTC</option><option>IOC</option></select> },
              ].map((row, i) => (
                <div key={i} className="order-row">
                  <span className="order-label" style={{ fontSize: 11 }}>{row.label}</span>
                  {row.content}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center' }}>
                <button className="btn-buy">BUY</button>
                <button className="btn-sell">SELL</button>
                <button className="btn-clear">Clear</button>
              </div>
            </div>
          </Win98Window>

          {/* Portfolio */}
          <Win98Window id="portfolio" title="Portfolio - Margin" icon="💼" defaultX={646} defaultY={412} defaultWidth={350} defaultHeight={260} zIndex={10} scrollable={false}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <table className="port-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Symbol</th>
                    <th>Shares</th><th>Last</th><th>Net</th><th>% Chg</th><th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((p, i) => {
                    const livePrice = i === 0 ? (stocks[p.symbol]?.price || p.last) : p.last;
                    const liveNet = i === 0 ? (stocks[p.symbol]?.price || p.last) - 0.250 : p.net;
                    const liveVal = livePrice * p.shares;
                    return (
                      <tr key={p.symbol}>
                        <td style={{ color: '#0000cc', fontWeight: 'bold' }}>{p.symbol}</td>
                        <td>{p.shares.toLocaleString()}</td>
                        <td style={{ color: liveNet >= 0 ? '#00aa00' : '#cc0000', fontWeight: 'bold' }}>{livePrice.toFixed(3)}</td>
                        <td style={{ color: liveNet >= 0 ? '#00aa00' : '#cc0000' }}>{liveNet >= 0 ? '+' : ''}{liveNet.toFixed(3)}</td>
                        <td style={{ color: liveNet >= 0 ? '#00aa00' : '#cc0000' }}>{liveNet >= 0 ? '+' : ''}{((liveNet / 0.250) * 100).toFixed(2)}</td>
                        <td style={{ fontWeight: 'bold' }}>{liveVal.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="port-footer">
                {[
                  { label: 'Cash Buying Power', val: '50,000.00' },
                  { label: 'Margin Buying Power', val: '150,000.00' },
                  { label: 'Account Value', val: (50000 + portfolio.reduce((s, p, i) => s + (i === 0 ? (stocks[p.symbol]?.price || p.last) * p.shares : p.value), 0)).toLocaleString('en', { minimumFractionDigits: 2 }) },
                ].map(r => (
                  <div key={r.label} className="port-footer-row">
                    <span>{r.label}</span>
                    <span style={{ fontWeight: 'bold' }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </Win98Window>

          {/* Yahoo! Finance Chat */}
          <Win98Window id="chat-win" title="Yahoo! Finance Chat" icon="💬" defaultX={328} defaultY={242} defaultWidth={390} defaultHeight={166} zIndex={12} scrollable={false}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#c0c0c0' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '2px 4px', background: 'white', borderBottom: '1px solid #808080', fontSize: 10 }}>
                {messages.slice(0, 10).map((msg) => (
                  <div key={msg.id} style={{ borderBottom: '1px solid #eee', padding: '2px 0' }}>
                    <span style={{ color: '#000080', fontWeight: 'bold' }}>{msg.author}</span>: 
                    <span style={{ fontWeight: 'bold', marginLeft: 4 }}>{msg.subject}</span> - 
                    <span style={{ color: '#555', marginLeft: 4 }}>{msg.body}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleChatPost} style={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 2, background: '#c0c0c0' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  <input
                    className="input98"
                    value={chatSubject}
                    onChange={e => setChatSubject(e.target.value)}
                    placeholder="Subject..."
                    style={{ flex: 1, height: 18 }}
                  />
                  <button type="submit" className="btn98" style={{ minWidth: 50, padding: '0 4px', height: 18 }}>Post</button>
                </div>
                <input
                  className="input98"
                  value={chatBody}
                  onChange={e => setChatBody(e.target.value)}
                  placeholder="Type message here..."
                  style={{ width: '100%', height: 18 }}
                />
              </form>
            </div>
          </Win98Window>

        </div>
      </div>

      {/* ── Windows 98 Taskbar ── */}
      <div className="taskbar">
        <button className="start-btn">
          <span style={{ fontSize: 14 }}>🪟</span>
          <span style={{ fontWeight: 'bold' }}>Start</span>
        </button>
        <div style={{ width: 1, height: 20, background: '#808080', borderLeft: '1px solid #fff', margin: '0 2px' }} />
        <div className="taskbar-task">📥 Inbox - Outlook Express</div>
        <div className="taskbar-task">🌐 Microsoft Internet Explorer</div>
        <div className="taskbar-task" style={{ borderTop: '2px solid #808080', borderLeft: '2px solid #808080', borderRight: '2px solid #fff', borderBottom: '2px solid #fff', background: '#b0b0b0' }}>
          📊 eSpeed Trader - [Quote...
        </div>
        <div className="taskbar-clock">{clock}</div>
      </div>
    </div>
  );
}
