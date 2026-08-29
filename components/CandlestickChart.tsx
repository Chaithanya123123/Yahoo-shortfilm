'use client';
import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Props {
  candles: Candle[];
  newCandle?: Candle | null;
  symbol?: string;
}

export default function CandlestickChart({ candles, newCandle, symbol = 'ATML' }: Props) {
  const priceRef = useRef<HTMLDivElement>(null);
  const volRef = useRef<HTMLDivElement>(null);
  const candleSeries = useRef<any>(null);
  const volumeSeries = useRef<any>(null);
  const chartsRef = useRef<{ price: any; vol: any } | null>(null);

  useEffect(() => {
    if (!priceRef.current || !volRef.current || candles.length === 0) return;

    // Destroy previous charts
    if (chartsRef.current) {
      try { chartsRef.current.price.remove(); } catch {}
      try { chartsRef.current.vol.remove(); } catch {}
    }

    const priceChart = createChart(priceRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: '#00ff00',
      },
      grid: {
        vertLines: { color: '#1a1a1a' },
        horzLines: { color: '#1a1a1a' },
      },
      crosshair: {
        vertLine: { color: '#00ff00', width: 1 as any, style: 2 },
        horzLine: { color: '#00ff00', width: 1 as any, style: 2 },
      },
      rightPriceScale: { borderColor: '#333333', textColor: '#00ff00' },
      timeScale: { borderColor: '#333333', timeVisible: false },
      width: priceRef.current.clientWidth,
      height: priceRef.current.clientHeight || 220,
      handleScale: true,
      handleScroll: true,
    });

    const cSeries = priceChart.addCandlestickSeries({
      upColor: '#00ff00',
      downColor: '#ff3333',
      borderUpColor: '#00ff00',
      borderDownColor: '#ff3333',
      wickUpColor: '#00aa00',
      wickDownColor: '#cc0000',
    });

    cSeries.setData(candles.map(c => ({
      time: c.time as any,
      open: c.open, high: c.high, low: c.low, close: c.close,
    })));

    const volChart = createChart(volRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: '#00ff00',
      },
      grid: {
        vertLines: { color: '#1a1a1a' },
        horzLines: { color: '#1a1a1a' },
      },
      rightPriceScale: { textColor: '#888888', borderColor: '#333' },
      timeScale: { borderColor: '#333', timeVisible: false },
      width: volRef.current.clientWidth,
      height: volRef.current.clientHeight || 80,
    });

    const vSeries = volChart.addHistogramSeries({
      color: '#00aa00',
      priceFormat: { type: 'volume' as const },
    });

    vSeries.setData(candles.map(c => ({
      time: c.time as any,
      value: c.volume,
      color: c.close >= c.open ? '#00aa00' : '#880000',
    })));

    priceChart.timeScale().fitContent();

    // Sync scroll
    priceChart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (range) volChart.timeScale().setVisibleLogicalRange(range);
    });

    chartsRef.current = { price: priceChart, vol: volChart };
    candleSeries.current = cSeries;
    volumeSeries.current = vSeries;

    const handleResize = () => {
      if (priceRef.current) priceChart.applyOptions({ width: priceRef.current.clientWidth });
      if (volRef.current) volChart.applyOptions({ width: volRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      try { priceChart.remove(); } catch {}
      try { volChart.remove(); } catch {}
    };
  }, [candles]);

  // Live candle updates
  useEffect(() => {
    if (!newCandle || !candleSeries.current || !volumeSeries.current) return;
    try {
      candleSeries.current.update({
        time: newCandle.time as any,
        open: newCandle.open, high: newCandle.high,
        low: newCandle.low, close: newCandle.close,
      });
      volumeSeries.current.update({
        time: newCandle.time as any,
        value: newCandle.volume,
        color: newCandle.close >= newCandle.open ? '#00aa00' : '#880000',
      });
    } catch {}
  }, [newCandle]);

  return (
    <div style={{ background: '#000', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ color: '#00ff00', fontSize: 10, padding: '2px 6px', fontFamily: 'Courier New', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
        <span><b>{symbol}</b> &nbsp; ATOMLIFE INC</span>
        <span style={{ color: '#88ff88' }}>Daily</span>
      </div>
      {/* Price chart */}
      <div ref={priceRef} style={{ flex: 1, minHeight: 0 }} />
      {/* Volume label */}
      <div style={{ color: '#00ff00', fontSize: 9, padding: '1px 6px', fontFamily: 'Courier New', flexShrink: 0 }}>Volume</div>
      {/* Volume chart */}
      <div ref={volRef} style={{ height: '28%', flexShrink: 0 }} />
    </div>
  );
}
