'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const newsHeadlines = [
  'NASDAQ surges as tech stocks rally — Dow Jones up 113 points',
  'Netscape announces Navigator 5.0 — Full Internet Explorer compatibility',
  'Y2K concerns mount: Wall Street braces for year 2000 transition',
  'Amazon.com reports record holiday sales — Stock hits new highs',
  'Microsoft antitrust ruling expected this week — Gates to testify',
  'Federal Reserve holds interest rates steady — Economy booming',
];

export default function HomePage() {
  const [newsIdx, setNewsIdx] = useState(0);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const ni = setInterval(() => setNewsIdx(i => (i + 1) % newsHeadlines.length), 4000);
    const bi = setInterval(() => setBlink(b => !b), 600);
    return () => { clearInterval(ni); clearInterval(bi); };
  }, []);

  return (
    <div style={{ background: '#c0c0c0', minHeight: '100vh', padding: '0', fontFamily: 'MS Sans Serif, Tahoma, Arial, sans-serif', fontSize: 11 }}>
      {/* ── Netscape Navigator chrome ── */}
      <div className="browser-chrome" style={{ maxWidth: 800, margin: '0 auto', minHeight: '100vh', boxShadow: '4px 4px 12px rgba(0,0,0,0.4)' }}>

        {/* Title bar */}
        <div className="browser-titlebar">
          <span>Netscape: Yahoo!</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <span style={{ cursor: 'default', padding: '0 6px', background: '#0000aa', border: '1px outset #c0c0c0' }}>_</span>
            <span style={{ cursor: 'default', padding: '0 6px', background: '#0000aa', border: '1px outset #c0c0c0' }}>□</span>
            <span style={{ cursor: 'default', padding: '0 6px', background: '#0000aa', border: '1px outset #c0c0c0', color: '#ff8888' }}>✕</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="browser-toolbar">
          {[
            { icon: '◀', label: 'Back' }, { icon: '▶', label: 'Forward' },
            { icon: '🏠', label: 'Home' }, { icon: '🔄', label: 'Reload' },
            { icon: '🖼️', label: 'Images' }, { icon: '📂', label: 'Open' },
            { icon: '🖨️', label: 'Print' }, { icon: '🔍', label: 'Find' },
            { icon: '⛔', label: 'Stop' },
          ].map((btn, i) => (
            <React.Fragment key={btn.label}>
              {i === 3 && <div className="browser-toolbar-sep" />}
              <div className="browser-toolbar-btn">
                <span className="browser-toolbar-icon">{btn.icon}</span>
                <span>{btn.label}</span>
              </div>
            </React.Fragment>
          ))}
          {/* Animated N logo */}
          <div style={{ marginLeft: 'auto', width: 36, height: 36, background: '#000080', border: '2px outset #c0c0c0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffd700', fontWeight: 900, fontSize: 22, fontFamily: 'Times New Roman' }}>
            {blink ? 'N' : <span style={{ color: '#aaaaff' }}>N</span>}
          </div>
        </div>

        {/* Location bar */}
        <div className="browser-location-bar">
          <label>Location:</label>
          <input className="browser-location-input" readOnly value="http://www.yahoo.com/" />
        </div>

        {/* Quick links */}
        <div className="browser-quicklinks">
          {["What's New?", "What's Cool?", "Handbook", "Net Search", "Net Directory", "Software"].map(lbl => (
            <button key={lbl} className="browser-quicklink">{lbl}</button>
          ))}
        </div>

        {/* ── Page body ── */}
        <div className="yahoo-body" style={{ background: '#c0c0c0' }}>

          {/* Yahoo logo row */}
          <div className="yahoo-logo-row" style={{ flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
              {/* Decorative icons row */}
              <span style={{ fontSize: 20 }}>🌐</span>
              <span style={{ fontSize: 20 }}>💎</span>
              <div className="yahoo-logo" style={{ fontSize: 48 }}>YAHOO!</div>
              <span style={{ fontSize: 11, color: 'red', border: '2px solid red', padding: '1px 4px', fontFamily: 'Arial', fontWeight: 'bold', alignSelf: 'flex-start', marginTop: 6 }}>EXTRA!</span>
              <span style={{ fontSize: 20 }}>🎫</span>
              <span style={{ fontSize: 20 }}>🎁</span>
            </div>
          </div>

          {/* Reuters / CNet news strip */}
          <div className="yahoo-news-strip">
            <span style={{ fontSize: 11, color: '#003399', fontFamily: 'Arial', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Reuters News Headlines</span>
            <span className="cnet-badge">CNet</span>
            <span style={{ fontSize: 12, color: '#003399', textDecoration: 'underline', cursor: 'pointer', flex: 1 }}>{newsHeadlines[newsIdx]}</span>
            <span style={{ color: '#003399', fontSize: 11, textDecoration: 'underline', cursor: 'pointer', whiteSpace: 'nowrap' }}>Web Launch</span>
          </div>

          {/* Search row */}
          <div className="yahoo-search-row">
            <input className="yahoo-search-input" placeholder="" style={{ width: 220 }} />
            <button className="yahoo-search-btn">Search</button>
            <a href="#" style={{ fontSize: 12, color: '#0000ee', marginLeft: 4 }}>Options</a>
          </div>

          {/* ── Special launch icons row ── */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, padding: '6px 0 8px', borderBottom: '1px solid #808080', marginBottom: 8 }}>
            <Link href="/trader" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 40, height: 40, background: '#000080', border: '3px outset #c0c0c0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📈</div>
              <span style={{ fontSize: 9, color: '#000080', fontWeight: 'bold', fontFamily: 'Arial' }}>eTrader</span>
            </Link>
            <Link href="/finance/message-boards" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 40, height: 40, background: '#003399', border: '3px outset #c0c0c0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💬</div>
              <span style={{ fontSize: 9, color: '#003399', fontWeight: 'bold', fontFamily: 'Arial' }}>Yahoo Chat</span>
            </Link>
            <Link href="/finance/message-boards" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 40, height: 40, background: '#cc0000', border: '3px outset #c0c0c0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💰</div>
              <span style={{ fontSize: 9, color: '#cc0000', fontWeight: 'bold', fontFamily: 'Arial' }}>Finance</span>
            </Link>
          </div>

          {/* ── Directory Grid ── */}
          <div className="yahoo-dir-grid">
            {[
              {
                title: 'Arts', xtra: true,
                sub: [{ label: 'Humanities', href: '#' }, { label: 'Photography', href: '#' }, { label: 'Architecture', href: '#' }],
                right: { title: 'News [Xtra!]', xtra: false, sub: [{ label: 'World [Xtra!]', href: '#' }, { label: 'Daily', href: '#' }, { label: 'Current Events', href: '#' }] }
              },
              {
                title: 'Business and Economy', xtra: true,
                sub: [{ label: 'Directory', href: '/finance/message-boards' }, { label: 'Investments', href: '/finance/message-boards' }, { label: 'Classifieds', href: '#' }],
                right: { title: 'Recreation', xtra: true, sub: [{ label: 'Sports [Xtra!]', href: '#' }, { label: 'Games', href: '#' }, { label: 'Travel', href: '#' }, { label: 'Autos', href: '#' }] }
              },
              {
                title: 'Computers and Internet', xtra: true,
                sub: [{ label: 'Internet', href: '#' }, { label: 'WWW', href: '#' }, { label: 'Software', href: '#' }, { label: 'Multimedia', href: '#' }],
                right: { title: 'Reference', xtra: false, sub: [{ label: 'Libraries', href: '#' }, { label: 'Dictionaries', href: '#' }, { label: 'Phone Numbers', href: '#' }] }
              },
              {
                title: 'Education', xtra: false,
                sub: [{ label: 'Universities', href: '#' }, { label: 'K-12', href: '#' }, { label: 'Courses', href: '#' }],
                right: { title: 'Regional', xtra: false, sub: [{ label: 'Countries', href: '#' }, { label: 'Regions', href: '#' }, { label: 'U.S. States', href: '#' }] }
              },
              {
                title: 'Entertainment', xtra: true,
                sub: [{ label: 'TV', href: '#' }, { label: 'Movies', href: '#' }, { label: 'Music', href: '#' }, { label: 'Magazines', href: '#' }],
                right: { title: 'Science', xtra: false, sub: [{ label: 'CS', href: '#' }, { label: 'Biology', href: '#' }, { label: 'Astronomy', href: '#' }, { label: 'Engineering', href: '#' }] }
              },
              {
                title: 'Government', xtra: false,
                sub: [{ label: 'Politics', href: '#' }, { label: 'Agencies', href: '#' }, { label: 'Law', href: '#' }, { label: 'Military', href: '#' }],
                right: { title: 'Social Science', xtra: false, sub: [{ label: 'Anthropology', href: '#' }, { label: 'Sociology', href: '#' }, { label: 'Economics', href: '#' }] }
              },
              {
                title: 'Health', xtra: false,
                sub: [{ label: 'Medicine', href: '#' }, { label: 'Drugs', href: '#' }, { label: 'Diseases', href: '#' }, { label: 'Fitness', href: '#' }],
                right: { title: 'Society and Culture', xtra: false, sub: [{ label: 'People', href: '#' }, { label: 'Environment', href: '#' }, { label: 'Religion', href: '#' }] }
              },
            ].map((item, idx) => (
              <React.Fragment key={idx}>
                {/* Left column */}
                <div className="yahoo-dir-category">
                  <h3>
                    <span style={{ fontSize: 11 }}>•</span>
                    <a href={item.sub[0]?.href || '#'} style={{ color: '#003399', textDecoration: 'none', fontFamily: 'Times New Roman', fontSize: 14 }}>{item.title}</a>
                    {item.xtra && <span className="xtra-badge">[Xtra!]</span>}
                  </h3>
                  <div className="yahoo-dir-links">
                    {item.sub.map((s, si) => (
                      <React.Fragment key={si}>
                        {si > 0 && ', '}
                        <Link href={s.href}>{s.label}</Link>
                      </React.Fragment>
                    ))}
                    {', ...'}
                  </div>
                </div>
                {/* Right column */}
                <div className="yahoo-dir-category">
                  <h3>
                    <span style={{ fontSize: 11 }}>•</span>
                    <a href="#" style={{ color: '#003399', textDecoration: 'none', fontFamily: 'Times New Roman', fontSize: 14 }}>{item.right.title}</a>
                  </h3>
                  <div className="yahoo-dir-links">
                    {item.right.sub.map((s, si) => (
                      <React.Fragment key={si}>
                        {si > 0 && ', '}
                        <a href={s.href}>{s.label}</a>
                      </React.Fragment>
                    ))}
                    {', ...'}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Bottom links */}
          <div className="yahoo-bottom-links">
            <a href="#" style={{ color: '#0000ee' }}>Text-Only Yahoo</a>
            {' ~ '}
            <a href="#" style={{ color: '#0000ee' }}>Contributors</a>
          </div>
        </div>

        {/* Status bar */}
        <div className="browser-statusbar">
          <span>📄 Document: Done.</span>
          <span>🔒</span>
        </div>
      </div>
    </div>
  );
}
