'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getSocket, requestInit } from '@/lib/socket';

interface Message {
  id: number; author: string; subject: string;
  body: string; date: string; time: string; symbol: string;
}
interface StockData { price: number; high: number; low: number; volume: number; bid: number; ask: number; }

export default function MessageBoardsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stockData, setStockData] = useState<StockData>({ price: 0.375, high: 0.395, low: 0.250, volume: 1033100, bid: 0.375, ask: 0.380 });
  const [symbol, setSymbol] = useState('ATML');
  const [searchSymbol, setSearchSymbol] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const [dateStr] = useState('Tuesday, October 12, 1999');
  const [page, setPage] = useState(1);

  const messagesPerPage = 25;
  const totalPages = Math.ceil(messages.length / messagesPerPage);
  const pagedMessages = messages.slice((page - 1) * messagesPerPage, page * messagesPerPage);

  useEffect(() => {
    const sock = getSocket();

    sock.on('init', (data: any) => {
      if (data.messages) setMessages(data.messages);
      if (data.stocks?.ATML) {
        const s = data.stocks.ATML;
        setStockData({ price: s.price, high: s.high, low: s.low, volume: s.volume, bid: s.bid, ask: s.ask });
      }
    });

    sock.on('tick', (data: any) => {
      if (data.stocks?.ATML) {
        const s = data.stocks.ATML;
        setStockData({ price: s.price, high: s.high, low: s.low, volume: s.volume, bid: s.bid, ask: s.ask });
      }
    });

    sock.on('new_message', (msg: Message) => {
      setMessages(prev => [msg, ...prev]);
      setNewIds(prev => new Set([...prev, msg.id]));
      setTimeout(() => {
        setNewIds(prev => { const n = new Set(prev); n.delete(msg.id); return n; });
      }, 2000);
    });

    requestInit(sock);

    return () => {
      sock.off('init');
      sock.off('tick');
      sock.off('new_message');
    };
  }, []);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newBody.trim()) return;
    const sock = getSocket();
    sock.emit('post_message', { subject: newSubject, body: newBody, symbol });
    setNewSubject('');
    setNewBody('');
    setShowPostForm(false);
  };

  const net = stockData.price - 0.250;
  const pctChg = (net / 0.250) * 100;

  return (
    <div className="finance-body">
      {/* ── IE6 Browser chrome ── */}
      <div style={{ background: '#c0c0c0', borderBottom: '2px solid #808080', fontSize: 11, fontFamily: 'MS Sans Serif, Arial, sans-serif' }}>
        {/* IE Title bar */}
        <div style={{ background: 'linear-gradient(to right, #000080, #1084d0)', color: 'white', padding: '2px 6px', fontSize: 11, fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Yahoo! Finance - Message Boards - ATML - Microsoft Internet Explorer</span>
          <div style={{ display: 'flex', gap: 2 }}>
            {['_', '□', '✕'].map(b => (
              <span key={b} style={{ background: '#c0c0c0', color: b === '✕' ? '#cc0000' : '#000', border: '1px outset #c0c0c0', padding: '0 5px', cursor: 'default', fontWeight: 'bold' }}>{b}</span>
            ))}
          </div>
        </div>
        {/* IE Menu bar */}
        <div style={{ display: 'flex', gap: 12, padding: '1px 6px', fontSize: 11, borderBottom: '1px solid #808080' }}>
          {['File', 'Edit', 'View', 'Go', 'Favorites', 'Help'].map(m => (
            <span key={m} style={{ cursor: 'default' }}>{m}</span>
          ))}
        </div>
        {/* IE Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 4px', borderBottom: '1px solid #808080' }}>
          {[{ icon: '◀', label: 'Back' }, { icon: '▶', label: 'Forward' }, { icon: '🏠', label: 'Home' }, { icon: '🔍', label: 'Search' }, { icon: '⭐', label: 'Favorites' }, { icon: '✉️', label: 'Mail' }, { icon: '🖨️', label: 'Print' }].map(btn => (
            <div key={btn.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 9, minWidth: 36, cursor: 'default' }}>
              <span style={{ fontSize: 16 }}>{btn.icon}</span>
              <span>{btn.label}</span>
            </div>
          ))}
        </div>
        {/* Address bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 4px', borderBottom: '1px solid #808080' }}>
          <span style={{ fontSize: 11 }}>Address</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, border: '2px inset #808080', background: 'white', padding: '1px 4px' }}>
            <span style={{ fontSize: 12 }}>🌐</span>
            <input
              readOnly
              value={`http://finance.yahoo.com/mb/boards.html?s=${symbol}`}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 11, fontFamily: 'Arial' }}
            />
          </div>
          <button style={{ background: '#c0c0c0', border: '2px outset #c0c0c0', padding: '1px 8px', fontSize: 11, cursor: 'pointer' }}>Go</button>
        </div>
      </div>

      {/* ── Yahoo Finance header ── */}
      <div className="finance-header">
        <div className="finance-logo-yahoo">YAHOO!</div>
        <div className="finance-logo-finance">FINANCE</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 12, textAlign: 'right' }}>
          <span style={{ color: '#0000ee', cursor: 'pointer' }}>Yahoo! </span>-
          <span style={{ color: '#0000ee', cursor: 'pointer' }}> My Yahoo!</span> -
          <span style={{ color: '#0000ee', cursor: 'pointer' }}> Help</span>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 12, color: '#666', padding: '2px', borderBottom: '1px solid #ccc' }}>{dateStr}</div>

      {/* ── Nav bar ── */}
      <nav className="finance-nav">
        {['Home', 'Quotes', 'News', 'Portfolio', 'Message Boards', 'Markets', 'Mutual Funds', 'Stocks', 'Funds', 'Options', 'More...'].map(item => (
          <a key={item} href="#" className={item === 'Message Boards' ? 'active' : ''}>{item}</a>
        ))}
      </nav>

      {/* ── 3-column layout ── */}
      <div className="finance-layout">

        {/* ── Left sidebar ── */}
        <div className="finance-sidebar">
          <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>Search for Quotes:</div>
          <div className="search-quotes-form">
            <input
              className="search-quotes-input"
              value={searchSymbol}
              onChange={e => setSearchSymbol(e.target.value.toUpperCase())}
              placeholder=""
            />
            <button className="search-quotes-btn" onClick={() => { if (searchSymbol) setSymbol(searchSymbol); }}>Go</button>
          </div>

          <div className="finance-sidebar-nav">
            <a href="#" className="active" style={{ fontWeight: 'bold', color: '#003399', paddingLeft: 0 }}>Finance Home</a>
            {['Quotes', 'News', 'Portfolio', 'Message Boards', 'Markets', 'Mutual Funds', 'Stocks', 'Funds', 'Options', 'Historical Data', 'Tools & Resources'].map(item => (
              <a key={item} href="#" className={item === 'Message Boards' ? 'active' : ''}>
                {`> ${item}`}
              </a>
            ))}
          </div>

          {/* Yahoo free email ad */}
          <div className="sidebar-email-ad">
            <div className="y-logo">YAHOO!</div>
            <div style={{ fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>Get free<br />email at<br />Yahoo!</div>
            <button className="signup-btn">
              <span>✉️</span> Sign Up Now!
            </button>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="finance-main">
          <div className="board-header">Message Boards</div>

          {/* Breadcrumb */}
          <div className="breadcrumb">
            <a href="#">Home</a> &gt; <a href="#">Message Boards</a> &gt; <a href="#">Penny Stocks</a> &gt; <strong>{symbol}</strong>
          </div>

          {/* Stock summary row */}
          <div style={{ marginBottom: 6 }}>
            <strong style={{ fontSize: 14 }}>{symbol} - AtomiLife Inc.</strong>
            <div className="stock-summary-row" style={{ marginTop: 3 }}>
              <span>Last Trade: <strong>{stockData.price.toFixed(3)}</strong></span>
              <span style={{ color: '#00aa00', fontWeight: 'bold' }}>
                +{net.toFixed(3)} ({pctChg.toFixed(2)}%)
              </span>
              <span style={{ color: '#666' }}>Volume: {stockData.volume.toLocaleString()}</span>
              <span style={{ color: '#666', fontSize: 11 }}>(as of Oct 12, 4:00pm ET)</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="board-tabs">
            {['Message Board', 'Company Info', 'Chart', 'Quote'].map(tab => (
              <div key={tab} className={`board-tab ${tab === 'Message Board' ? 'active' : ''}`}>{tab}</div>
            ))}
          </div>

          {/* Message count + pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span className="board-count">Messages {(page - 1) * messagesPerPage + 1} - {Math.min(page * messagesPerPage, messages.length)} of {messages.length}</span>
            <div className="pagination">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <React.Fragment key={p}>
                  <a href="#" onClick={e => { e.preventDefault(); setPage(p); }} style={{ fontWeight: page === p ? 'bold' : 'normal' }}>{p}</a>
                  {p < Math.min(totalPages, 5) && ' | '}
                </React.Fragment>
              ))}
              {totalPages > 5 && <><span> | </span><a href="#" onClick={e => { e.preventDefault(); setPage(p => Math.min(p + 1, totalPages)); }}>Next &gt;</a></>}
            </div>
          </div>

          {/* Messages table */}
          <table className="msg-table">
            <thead>
              <tr>
                <th className="msg-num">#</th>
                <th className="msg-author">Author</th>
                <th>Subject</th>
                <th className="msg-date" style={{ textAlign: 'right' }}>Date/Time</th>
              </tr>
            </thead>
            <tbody>
              {pagedMessages.map((msg, idx) => (
                <tr
                  key={msg.id}
                  onClick={() => setSelectedMsg(selectedMsg?.id === msg.id ? null : msg)}
                  className={newIds.has(msg.id) ? 'new-msg-flash' : ''}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="msg-num">{(page - 1) * messagesPerPage + idx + 1}</td>
                  <td className="msg-author">{msg.author}</td>
                  <td className="msg-subject">
                    <a href="#" onClick={e => { e.preventDefault(); setSelectedMsg(selectedMsg?.id === msg.id ? null : msg); }}>
                      {msg.subject}
                    </a>
                    {newIds.has(msg.id) && <span style={{ fontSize: 9, color: 'red', fontWeight: 'bold', marginLeft: 4 }}>NEW</span>}
                  </td>
                  <td className="msg-date">{msg.date} &nbsp; {msg.time}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Expanded message body */}
          {selectedMsg && (
            <div style={{ border: '1px solid #c0c0c0', padding: 12, marginTop: 8, background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: 4, marginBottom: 8 }}>
                <strong style={{ fontSize: 13 }}>{selectedMsg.subject}</strong>
                <span style={{ fontSize: 11, color: '#666' }}>{selectedMsg.date} {selectedMsg.time}</span>
              </div>
              <div style={{ fontSize: 12, color: '#003399', fontWeight: 'bold', marginBottom: 4 }}>By: {selectedMsg.author}</div>
              <div style={{ fontSize: 12, lineHeight: 1.5 }}>{selectedMsg.body}</div>
              <div style={{ marginTop: 8 }}>
                <button onClick={() => { setNewSubject(`Re: ${selectedMsg.subject}`); setShowPostForm(true); }}
                  style={{ background: '#c0c0c0', border: '2px outset #c0c0c0', padding: '2px 10px', fontSize: 11, cursor: 'pointer', marginRight: 6 }}>
                  Reply
                </button>
                <button onClick={() => setSelectedMsg(null)}
                  style={{ background: '#c0c0c0', border: '2px outset #c0c0c0', padding: '2px 10px', fontSize: 11, cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Post message button */}
          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => setShowPostForm(f => !f)}
              style={{ background: '#003399', color: 'white', border: '2px outset #003399', padding: '4px 16px', fontSize: 12, cursor: 'pointer', fontWeight: 'bold' }}>
              📝 Post Message
            </button>
          </div>

          {/* New post form */}
          {showPostForm && (
            <form className="new-msg-form" onSubmit={handlePost}>
              <h4>Post a New Message — {symbol}</h4>
              <div style={{ fontSize: 11, marginBottom: 4 }}>Subject:</div>
              <input
                className="new-msg-input"
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                placeholder="Enter message subject..."
                maxLength={100}
              />
              <div style={{ fontSize: 11, marginBottom: 4 }}>Message:</div>
              <textarea
                className="new-msg-textarea"
                value={newBody}
                onChange={e => setNewBody(e.target.value)}
                placeholder="Enter your message here..."
                maxLength={500}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="post-btn">Post Message</button>
                <button type="button" onClick={() => setShowPostForm(false)}
                  style={{ background: '#c0c0c0', border: '2px outset #c0c0c0', padding: '3px 12px', fontSize: 12, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="finance-right">
          {/* Quote widget */}
          <div className="quote-widget">
            <div className="quote-widget-symbol">{symbol}</div>
            <div className="quote-widget-company">AtomiLife Inc.</div>
            <a href="#" style={{ color: '#0000ee', fontSize: 11 }}>More Quote Info</a>
            <div className="quote-widget-price">{stockData.price.toFixed(3)}</div>
            <div className="quote-widget-change">+{net.toFixed(3)} ({pctChg.toFixed(2)}%)</div>
            <div style={{ marginTop: 6 }}>
              {[
                { label: 'Volume:', val: stockData.volume.toLocaleString() },
                { label: "Day's High:", val: stockData.high.toFixed(3) },
                { label: "Day's Low:", val: stockData.low.toFixed(3) },
                { label: '52 wk High:', val: '1.250' },
                { label: '52 wk Low:', val: '0.125' },
              ].map(s => (
                <div key={s.label} className="quote-widget-stat">
                  <span>{s.label}</span><span>{s.val}</span>
                </div>
              ))}
            </div>
            <a href="#" style={{ color: '#0000ee', fontSize: 11, display: 'block', marginTop: 4 }}>View Detailed Quote</a>
          </div>

          {/* Related links */}
          <div className="related-links">
            <h4>Related Links</h4>
            {['Company News', 'Key Statistics', 'SEC Filings', 'Historical Prices'].map(l => (
              <a key={l} href="#">{l}</a>
            ))}
          </div>

          {/* E*TRADE ad */}
          <Link href="/trader" style={{ textDecoration: 'none' }}>
            <div className="etrade-banner">
              <h4>Trade Stocks<br />Online</h4>
              <div style={{ margin: '6px auto', width: 50, height: 40, background: '#c0c0c0', border: '2px inset #808080', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                🖥️
              </div>
              <button className="etrade-click-btn">Click Here</button>
              <div className="etrade-logo">E✶TRADE</div>
              <div style={{ fontSize: 9, color: '#666' }}>The Online Brokerage</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
