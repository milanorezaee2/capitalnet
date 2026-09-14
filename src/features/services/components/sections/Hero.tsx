// ─── Hero Section — Editorial Dark Design + Animated Canvas BG ──────────────
import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Shield, Home, Activity, BarChart2, TrendingUp, TrendingDown, Zap, Lock } from 'lucide-react';
import type { HeroContent } from '../../types/enterprise';

export interface HeroProps {
  content: HeroContent;
  onNavigate?: (page: string) => void;
}

// ─── Animated Financial Canvas ────────────────────────────────────────────────
const FinancialCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let tick = 0;

    // ── resize ────────────────────────────────────────────────────────────────
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── Candlestick data (auto-scrolling live feed) ───────────────────────────
    const CANDLE_W = 18;
    const CANDLE_GAP = 10;
    const CANDLE_STEP = CANDLE_W + CANDLE_GAP;
    const CHART_TOP = 0.12;      // % of height
    const CHART_BOT = 0.52;      // % of height
    const MAX_CANDLES = 60;

    type Candle = { open: number; close: number; high: number; low: number; vol: number };
    const candles: Candle[] = [];
    let lastPrice = 0.45;

    const newCandle = (): Candle => {
      const move = (Math.random() - 0.48) * 0.06;
      const open = lastPrice;
      const close = Math.max(0.05, Math.min(0.95, lastPrice + move));
      const high = Math.max(open, close) + Math.random() * 0.025;
      const low = Math.min(open, close) - Math.random() * 0.025;
      lastPrice = close;
      return { open, close, high: Math.min(high, 0.98), low: Math.max(low, 0.02), vol: 0.2 + Math.random() * 0.8 };
    };

    for (let i = 0; i < MAX_CANDLES; i++) candles.push(newCandle());

    // candle scroll offset (px, fractional)
    let scrollX = 0;
    const SCROLL_SPEED = 0.35; // px per frame

    // ── Floating particles ────────────────────────────────────────────────────
    type Particle = { x: number; y: number; r: number; vy: number; vx: number; alpha: number; color: string };
    const COLORS = ['rgba(6,182,212,', 'rgba(139,92,246,', 'rgba(16,185,129,'];
    const particles: Particle[] = Array.from({ length: 55 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 0.00015,
      vy: -0.00008 - Math.random() * 0.00012,
      alpha: 0.15 + Math.random() * 0.35,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    // ── Moving price line (smooth bezier) ────────────────────────────────────
    // We'll build a rolling 120-point price history
    const PRICE_HISTORY_LEN = 120;
    const priceHistory: number[] = Array.from({ length: PRICE_HISTORY_LEN }, () => 0.4 + Math.random() * 0.25);
    let priceHistoryTick = 0;
    let currentPrice = priceHistory[priceHistory.length - 1];

    // ── Grid lines ────────────────────────────────────────────────────────────
    const H_LINES = 7;
    const V_LINES = 10;

    // ── Tickers ───────────────────────────────────────────────────────────────
    const tickers = [
      { sym: 'BTC', val: 67240, delta: +2.41, color: '#06b6d4' },
      { sym: 'ETH', val: 3510, delta: -0.87, color: '#8b5cf6' },
      { sym: 'S&P', val: 5847, delta: +1.23, color: '#10b981' },
      { sym: 'GOLD', val: 2340, delta: +0.44, color: '#f59e0b' },
      { sym: 'NASDAQ', val: 18920, delta: -0.33, color: '#f43f5e' },
    ];
    // Animate ticker values slightly
    const tickerVals = tickers.map(t => t.val);

    // ── Cached gradient/grid offscreen canvas ────────────────────────────────
    let bgCanvas: HTMLCanvasElement | null = null;
    let bgW = 0, bgH = 0;

    const rebuildBgCache = (W: number, H: number) => {
      bgCanvas = document.createElement('canvas');
      bgCanvas.width = W; bgCanvas.height = H;
      const bc = bgCanvas.getContext('2d')!;

      // bg gradient
      const bg = bc.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#050d1a');
      bg.addColorStop(0.5, '#081525');
      bg.addColorStop(1, '#060e1c');
      bc.fillStyle = bg;
      bc.fillRect(0, 0, W, H);

      // dot grid (static, cyan dots)
      bc.fillStyle = 'rgba(6,182,212,0.1)';
      const dotSpacing = 36;
      for (let x = 0; x < W; x += dotSpacing) {
        for (let y = 0; y < H; y += dotSpacing) {
          bc.beginPath(); bc.arc(x, y, 0.9, 0, Math.PI * 2); bc.fill();
        }
      }

      // grid lines
      bc.strokeStyle = 'rgba(255,255,255,0.04)';
      bc.lineWidth = 1;
      for (let i = 0; i <= H_LINES; i++) {
        const y = (i / H_LINES) * H;
        bc.beginPath(); bc.moveTo(0, y); bc.lineTo(W, y); bc.stroke();
      }
      for (let i = 0; i <= V_LINES; i++) {
        const x = (i / V_LINES) * W;
        bc.beginPath(); bc.moveTo(x, 0); bc.lineTo(x, H); bc.stroke();
      }
      bgW = W; bgH = H;
    };

    // ── Draw ──────────────────────────────────────────────────────────────────
    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      if (!W || !H) { raf = requestAnimationFrame(draw); return; }

      ctx.clearRect(0, 0, W, H);

      // 1+3+4. Background + grid + dots (from cache)
      if (bgW !== W || bgH !== H) rebuildBgCache(W, H);
      ctx.drawImage(bgCanvas!, 0, 0);

      // 2. Radial glows (pulsing — must be per-frame, but only 3 calls)
      const pulse = 0.5 + 0.5 * Math.sin(tick * 0.012);
      const glowData: [number, number, number, string, number][] = [
        [0.78, 0.18, 0.45, 'rgba(6,182,212,', 0.16 + pulse * 0.06],
        [0.18, 0.82, 0.38, 'rgba(139,92,246,', 0.12 + pulse * 0.04],
        [0.50, 0.50, 0.28, 'rgba(16,185,129,', 0.05],
      ];
      for (const [cx, cy, r, col, alpha] of glowData) {
        const g = ctx.createRadialGradient(cx*W, cy*H, 0, cx*W, cy*H, r*Math.max(W,H));
        g.addColorStop(0, `${col}${alpha})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }

      // 5. Price history line (smooth, bottom half of screen)
      ctx.save();
      const lineTop = H * 0.58;
      const lineBot = H * 0.92;
      const lineH = lineBot - lineTop;

      // Update price history
      priceHistoryTick++;
      if (priceHistoryTick % 4 === 0) {
        const change = (Math.random() - 0.48) * 0.018;
        currentPrice = Math.max(0.08, Math.min(0.92, currentPrice + change));
        priceHistory.shift();
        priceHistory.push(currentPrice);
      }

      // Draw gradient fill
      const points = priceHistory.map((p, i) => ({
        x: (i / (PRICE_HISTORY_LEN - 1)) * W,
        y: lineTop + (1 - p) * lineH,
      }));

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 2; i++) {
        const mx = (points[i].x + points[i + 1].x) / 2;
        const my = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

      // fill gradient
      const fillGrad = ctx.createLinearGradient(0, lineTop, 0, lineBot);
      fillGrad.addColorStop(0, 'rgba(6,182,212,0.18)');
      fillGrad.addColorStop(1, 'rgba(6,182,212,0)');
      ctx.lineTo(W, lineBot);
      ctx.lineTo(0, lineBot);
      ctx.closePath();
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // stroke line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 2; i++) {
        const mx = (points[i].x + points[i + 1].x) / 2;
        const my = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.strokeStyle = 'rgba(6,182,212,0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // glowing dot at latest price
      const last = points[points.length - 1];
      const dotAlpha = 0.6 + 0.4 * Math.sin(tick * 0.1);
      const glowR = ctx.createRadialGradient(last.x, last.y, 0, last.x, last.y, 18);
      glowR.addColorStop(0, `rgba(6,182,212,${dotAlpha})`);
      glowR.addColorStop(1, 'rgba(6,182,212,0)');
      ctx.fillStyle = glowR;
      ctx.beginPath(); ctx.arc(last.x, last.y, 18, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4'; ctx.fill();
      ctx.restore();

      // 6. Candlestick chart (upper right area, scrolling)
      ctx.save();
      scrollX += SCROLL_SPEED;
      if (scrollX >= CANDLE_STEP) {
        scrollX -= CANDLE_STEP;
        candles.shift();
        candles.push(newCandle());
      }

      const chartAreaX = W * 0.52;
      const chartAreaW = W * 0.46;
      const chartT = H * CHART_TOP;
      const chartB = H * CHART_BOT;
      const chartH = chartB - chartT;

      // clip to chart area
      ctx.beginPath();
      ctx.rect(chartAreaX, chartT - 10, chartAreaW + 20, chartH + 20);
      ctx.clip();

      const totalCandles = Math.ceil(chartAreaW / CANDLE_STEP) + 2;
      const startIdx = Math.max(0, candles.length - totalCandles - 1);

      candles.slice(startIdx).forEach((c, rawI) => {
        const i = rawI;
        const x = chartAreaX + i * CANDLE_STEP - scrollX + CANDLE_STEP;
        const yHigh = chartT + (1 - c.high) * chartH;
        const yLow = chartT + (1 - c.low) * chartH;
        const yOpen = chartT + (1 - c.open) * chartH;
        const yClose = chartT + (1 - c.close) * chartH;
        const isUp = c.close >= c.open;
        const color = isUp ? '#10b981' : '#f43f5e';
        const bodyTop = Math.min(yOpen, yClose);
        const bodyH = Math.max(2, Math.abs(yClose - yOpen));

        // wick
        ctx.beginPath();
        ctx.moveTo(x + CANDLE_W / 2, yHigh);
        ctx.lineTo(x + CANDLE_W / 2, yLow);
        ctx.strokeStyle = color + 'aa';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // body
        ctx.beginPath();
        const r2 = Math.min(2, bodyH / 2);
        ctx.moveTo(x + r2, bodyTop);
        ctx.lineTo(x + CANDLE_W - r2, bodyTop);
        ctx.arcTo(x + CANDLE_W, bodyTop, x + CANDLE_W, bodyTop + r2, r2);
        ctx.lineTo(x + CANDLE_W, bodyTop + bodyH - r2);
        ctx.arcTo(x + CANDLE_W, bodyTop + bodyH, x + CANDLE_W - r2, bodyTop + bodyH, r2);
        ctx.lineTo(x + r2, bodyTop + bodyH);
        ctx.arcTo(x, bodyTop + bodyH, x, bodyTop + bodyH - r2, r2);
        ctx.lineTo(x, bodyTop + r2);
        ctx.arcTo(x, bodyTop, x + r2, bodyTop, r2);
        ctx.closePath();
        ctx.fillStyle = color + (isUp ? 'cc' : 'bb');
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      ctx.restore();

      // 7. Volume bars (under candlesticks) — use pre-baked vol from candle
      ctx.save();
      const volTop = H * 0.52;
      const volBot = H * 0.60;
      const volH = volBot - volTop;
      ctx.beginPath();
      ctx.rect(W * 0.52, volTop, W * 0.46 + 20, volH + 5);
      ctx.clip();

      const volStartIdx = Math.max(0, candles.length - Math.ceil(W * 0.46 / CANDLE_STEP) - 2);
      candles.slice(volStartIdx).forEach((c, rawI) => {
        const x = W * 0.52 + rawI * CANDLE_STEP - scrollX + CANDLE_STEP;
        const isUp = c.close >= c.open;
        ctx.fillStyle = (isUp ? 'rgba(16,185,129,' : 'rgba(244,63,94,') + (0.15 + c.vol * 0.22) + ')';
        ctx.fillRect(x + 2, volBot - c.vol * volH, CANDLE_W - 4, c.vol * volH);
      });
      ctx.restore();

      // 8. Ticker strip (top area, right side)
      ctx.save();
      tickers.forEach((t, i) => {
        // Slowly drift values
        if (tick % 80 === i * 16) {
          tickerVals[i] = t.val * (1 + (Math.random() - 0.5) * 0.003);
        }
        const x = W * 0.52 + i * (W * 0.09 + 2);
        const y = H * 0.63 + 24;
        const up = t.delta > 0;

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillText(t.sym, x, y);

        ctx.font = '11px monospace';
        ctx.fillStyle = t.color + 'cc';
        ctx.fillText(tickerVals[i].toFixed(t.val > 1000 ? 0 : 2), x, y + 15);

        ctx.font = '10px monospace';
        ctx.fillStyle = up ? 'rgba(16,185,129,0.7)' : 'rgba(244,63,94,0.7)';
        ctx.fillText((up ? '▲ +' : '▼ ') + Math.abs(t.delta).toFixed(2) + '%', x, y + 28);
      });
      ctx.restore();

      // 9. Particles
      ctx.save();
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -0.01) { p.y = 1.01; p.x = Math.random(); }
        if (p.x < 0 || p.x > 1) { p.vx *= -1; }

        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();
      });
      ctx.restore();

      // 10. Edge vignette / fade overlay
      ctx.save();
      // left fade (so text area stays dark and readable)
      const leftFade = ctx.createLinearGradient(0, 0, W * 0.52, 0);
      leftFade.addColorStop(0, 'rgba(5,13,26,0.92)');
      leftFade.addColorStop(0.7, 'rgba(5,13,26,0.55)');
      leftFade.addColorStop(1, 'rgba(5,13,26,0)');
      ctx.fillStyle = leftFade;
      ctx.fillRect(0, 0, W, H);

      // top fade
      const topFade = ctx.createLinearGradient(0, 0, 0, H * 0.18);
      topFade.addColorStop(0, 'rgba(5,13,26,0.6)');
      topFade.addColorStop(1, 'rgba(5,13,26,0)');
      ctx.fillStyle = topFade;
      ctx.fillRect(0, 0, W, H);

      // bottom fade
      const botFade = ctx.createLinearGradient(0, H * 0.82, 0, H);
      botFade.addColorStop(0, 'rgba(5,13,26,0)');
      botFade.addColorStop(1, 'rgba(5,13,26,0.85)');
      ctx.fillStyle = botFade;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      tick++;
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
};

// ─── Live Dashboard Panel ─────────────────────────────────────────────────────
const TICKERS = [
  { sym: 'BTC/USD', base: 67240, color: '#06b6d4', up: true },
  { sym: 'ETH/USD', base: 3510,  color: '#8b5cf6', up: false },
  { sym: 'S&P 500',  base: 5847,  color: '#10b981', up: true },
  { sym: 'GOLD',     base: 2340,  color: '#f59e0b', up: true },
];

const METRICS = [
  { label: 'کاربر فعال',     value: '50K+',  icon: Activity,  color: '#06b6d4', sub: '+12% این ماه' },
  { label: 'حجم معاملات',   value: '$2B+',   icon: BarChart2,  color: '#8b5cf6', sub: 'در ۳۰ روز گذشته' },
  { label: 'دقت تحلیل AI',  value: '94.7%', icon: Zap,        color: '#10b981', sub: 'بر اساس بک‌تست' },
  { label: 'امنیت داده',    value: 'ISO 27001', icon: Lock,   color: '#f59e0b', sub: 'گواهی بین‌المللی' },
];

// tiny sparkline — static SVG, no JS animation (perf-friendly)
const Sparkline = ({ color, up }: { color: string; up: boolean }) => {
  const pts = useRef<number[]>(
    Array.from({ length: 12 }, (_, i) => 0.35 + i * 0.04 * (up ? 1 : -0.5) + (Math.random() - 0.5) * 0.15)
  );
  const W = 72, H = 28;
  const points = pts.current;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 0.01;
  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * W,
    y: H - ((p - min) / range) * (H - 4) - 2,
  }));
  const d = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const fill = `${d} L${W},${H} L0,${H} Z`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0">
      <path d={fill} fill={color} fillOpacity={0.12} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r={2.5} fill={color} />
    </svg>
  );
};

const LiveDashboardPanel = () => {
  const [prices, setPrices] = useState(TICKERS.map(t => t.base));
  const [flash, setFlash] = useState<boolean[]>(TICKERS.map(() => false));

  // drift prices every ~1.2s
  useEffect(() => {
    const id = setInterval(() => {
      setPrices(prev => prev.map((p, i) => {
        const drift = (Math.random() - (TICKERS[i].up ? 0.44 : 0.56)) * TICKERS[i].base * 0.0012;
        return parseFloat((p + drift).toFixed(TICKERS[i].base > 1000 ? 1 : 2));
      }));
      const idx = Math.floor(Math.random() * TICKERS.length);
      setFlash(prev => prev.map((_, i) => i === idx));
      setTimeout(() => setFlash(TICKERS.map(() => false)), 400);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative hidden lg:block"
    >
      {/* outer glow */}
      <div
        className="absolute -inset-6 rounded-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle at 60% 40%, rgba(6,182,212,0.18) 0%, rgba(139,92,246,0.1) 50%, transparent 75%)' }}
      />

      {/* main panel */}
      <div
        className="relative rounded-2xl border border-cyan-500/20 overflow-hidden"
        style={{ background: 'rgba(5,13,26,0.82)', backdropFilter: 'blur(20px)' }}
      >
        {/* header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/6"
          style={{ background: 'rgba(6,182,212,0.06)' }}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-xs font-bold text-white/60 tracking-widest uppercase">Live Market</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400/70">Capital Network</span>
        </div>

        {/* ticker rows */}
        <div className="px-4 pt-3 pb-2 space-y-1">
          {TICKERS.map((t, i) => {
            const pct = ((prices[i] - t.base) / t.base * 100);
            const isUp = prices[i] >= t.base;
            return (
              <motion.div
                key={t.sym}
                animate={flash[i] ? { backgroundColor: ['rgba(6,182,212,0.08)', 'rgba(0,0,0,0)'] } : {}}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
              >
                <Sparkline color={t.color} up={t.up} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white/80 leading-none">{t.sym}</p>
                  <p className="mt-0.5 font-mono text-sm font-black text-white">
                    {prices[i].toLocaleString('en', { minimumFractionDigits: t.base > 1000 ? 1 : 2, maximumFractionDigits: t.base > 1000 ? 1 : 2 })}
                  </p>
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {isUp ? '+' : ''}{pct.toFixed(2)}%
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* divider */}
        <div className="mx-4 h-px bg-white/6" />

        {/* metric grid */}
        <div className="grid grid-cols-2 gap-2 p-4">
          {METRICS.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className="rounded-xl border border-white/6 p-3"
                style={{ background: `${m.color}0d` }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md"
                    style={{ background: `${m.color}20` }}>
                    <Icon size={12} style={{ color: m.color }} />
                  </div>
                  <span className="text-[10px] font-bold text-white/50 leading-none">{m.label}</span>
                </div>
                <p className="text-base font-black text-white leading-none">{m.value}</p>
                <p className="mt-1 text-[10px]" style={{ color: `${m.color}99` }}>{m.sub}</p>
              </motion.div>
            );
          })}
        </div>

        {/* bottom security bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-t border-white/6"
          style={{ background: 'rgba(139,92,246,0.05)' }}>
          <Shield size={11} className="text-violet-400 shrink-0" />
          <p className="text-[10px] text-white/40 leading-none">
            رمزنگاری end-to-end · پشتیبان‌گیری لحظه‌ای · ۹۹.۹۹٪ uptime
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
export const Hero = ({ content, onNavigate }: HeroProps) => {
  const handleGoHome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.href = '/';
    }
  };

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('contact');
    } else {
      // smooth scroll to #contact section on same page
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative min-h-screen bg-[#050d1a] overflow-hidden flex flex-col pt-20">
      {/* ── animated canvas background ── */}
      <FinancialCanvas />

      {/* ── top nav bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/8"
      >
        {/* back to home */}
        <button
          type="button"
          onClick={handleGoHome}
          className="group inline-flex items-center gap-2.5 rounded-xl border border-white/12 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-white/10 hover:border-white/20 hover:text-white"
        >
          <Home size={15} className="text-cyan-400 transition-transform group-hover:-translate-x-0.5" />
          بازگشت به صفحه اصلی
        </button>
        <button
          type="button"
          onClick={handleContact}
          className="group inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition-all hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-white"
        >
          تماس با ما
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
        </button>
      </motion.div>

      {/* ── badge bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 px-8 pt-5 pb-1"
      >
        <span className="rounded-full border border-cyan-500/40 bg-cyan-500/12 px-4 py-1.5 text-xs font-semibold tracking-widest text-cyan-300 uppercase">
          {content.badge}
        </span>
      </motion.div>

      {/* ── main hero body ── */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-8 md:px-16 lg:px-24 py-16">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-[1fr_420px] gap-16 items-center">

          {/* left: text */}
          <div>
            {/* eyebrow */}
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 text-xs font-bold uppercase tracking-[0.35em] text-cyan-400"
            >
              {content.eyebrow}
            </motion.p>

            {/* headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] text-white mb-6"
            >
              {content.title.split(' ').slice(0, 3).join(' ')}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                {content.title.split(' ').slice(3).join(' ')}
              </span>
            </motion.h1>

            {/* subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-lg font-semibold text-white mb-4 max-w-xl leading-relaxed"
            >
              {content.subtitle}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-base text-white/75 mb-10 max-w-xl leading-relaxed"
            >
              {content.description}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <a
                href="/evaluation"
                className="group relative inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-400 hover:-translate-y-0.5"
              >
                {content.ctaPrimary}
                <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10 hover:-translate-y-0.5"
              >
                تماس با ما
              </a>
            </motion.div>

            {/* trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-2"
            >
              {content.trustBadges.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs font-medium text-slate-400"
                >
                  <Shield size={10} className="text-cyan-500" />
                  {b}
                </span>
              ))}
            </motion.div>
          </div>

          {/* right: live dashboard panel */}
          <LiveDashboardPanel />

        </div>
      </div>
    </header>
  );
};
