'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';

interface Props {
  id: string;
  title: string;
  icon?: string;
  defaultX?: number;
  defaultY?: number;
  defaultWidth?: number;
  defaultHeight?: number;
  children: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
  style?: React.CSSProperties;
  onClose?: () => void;
  zIndex?: number;
  onFocus?: () => void;
  disableDragging?: boolean;
  scrollable?: boolean;
}

export default function Win98Window({
  id, title, icon = '🖥️',
  defaultX = 10, defaultY = 10,
  defaultWidth = 300, defaultHeight = 200,
  children, minWidth = 120, minHeight = 80,
  style = {}, onClose, zIndex = 10, onFocus,
  disableDragging = false, scrollable = true,
}: Props) {
  const [pos, setPos] = useState({ x: defaultX, y: defaultY });
  const [size, setSize] = useState({ w: defaultWidth, h: defaultHeight });
  const [minimized, setMinimized] = useState(false);

  return (
    <Rnd
      default={{ x: defaultX, y: defaultY, width: defaultWidth, height: defaultHeight }}
      minWidth={minWidth} minHeight={minHeight}
      style={{ zIndex, position: 'absolute', ...style }}
      dragHandleClassName="titlebar"
      disableDragging={disableDragging}
      onMouseDown={onFocus}
      onDragStop={(e, d) => setPos({ x: d.x, y: d.y })}
      onResizeStop={(e, dir, ref, delta, position) => {
        setSize({ w: parseInt(ref.style.width), h: parseInt(ref.style.height) });
        setPos(position);
      }}
    >
      <div className="win98-window" style={{ width: '100%', height: minimized ? 'auto' : '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Title bar */}
        <div className="titlebar">
          <span className="titlebar-icon">{icon}</span>
          <span className="titlebar-title">{title}</span>
          <div className="titlebar-btns">
            <button className="titlebar-btn" onClick={() => setMinimized(m => !m)} title="Minimize">_</button>
            <button className="titlebar-btn" title="Maximize">□</button>
            <button className="titlebar-btn" style={{ fontWeight: 'bold', color: '#cc0000' }} onClick={onClose} title="Close">✕</button>
          </div>
        </div>
        {/* Content */}
        {!minimized && (
          <div style={{ flex: 1, overflow: scrollable ? 'auto' : 'hidden', display: 'flex', flexDirection: 'column' }}>
            {children}
          </div>
        )}
      </div>
    </Rnd>
  );
}
