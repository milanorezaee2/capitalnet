// ─── Capital Network — Process Page ──────────────────────────────────────────
// "مسیر VC-Ready شدن" — Dark Editorial style
// محتوا از processContentStore (localStorage) خوانده می‌شود
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useEffect, useState, useMemo } from 'react';
import InlineBannerRenderer from '../../components/InlineBannerRenderer';
import type { InlineBanner } from '../../lib/settingsApi';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowDown, Home, Shield, ChevronRight,
  CheckCircle2, TrendingUp, Target, FileText,
  Users, BarChart3, Zap, Clock, Star, Award,
  DollarSign, Briefcase, Lock, Globe
} from 'lucide-react';
import {

  loadProcessContent, PROCESS_STORE_KEY,
  type ProcessContent,
} from './processContentStore';

import { t as tr, useLanguage, deepTranslate } from '@/i18n';

// ─── Capital Network Background Canvas ────────────────────────────────────────
// شبکه سرمایه‌گذاری: نودهای VC/Startup متصل، جریان سرمایه، candlestick chart
function ProcessCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      buildGraph();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── Node types (VC firms, Startups, Banks, Advisors) ──────────────────────
    type NodeKind = 'vc' | 'startup' | 'bank' | 'advisor' | 'hub';
    interface NetNode {
      x: number; y: number; vx: number; vy: number;
      r: number; kind: NodeKind; color: string;
      pulse: number; pulseSpeed: number; alpha: number;
      label: string;
    }

    const KIND_META: Record<NodeKind, { color: string; r: number }> = {
      hub:     { color: '#00BCD4', r: 22 },
      vc:      { color: '#8b5cf6', r: 14 },
      startup: { color: '#f59e0b', r: 10 },
      bank:    { color: '#10b981', r: 12 },
      advisor: { color: '#e879f9', r: 9  },
    };

    const VC_LABELS     = ['Sequoia', 'a16z', 'YCombinator', 'Tiger', 'SoftBank', '500 Global', 'MENA VC'];
    const STARTUP_LABELS= ['FinTech', 'HealthAI', 'SaaS B2B', 'PropTech', 'EdTech', 'CleanTech', 'DeepTech', 'Web3'];
    const BANK_LABELS   = ['LP Fund', 'Bridge', 'Escrow', 'Family Office'];
    const ADVISOR_LABELS= ['Capital Network', 'CFO', 'Legal', 'Due Diligence'];

    let nodes: NetNode[] = [];

    const buildGraph = () => {
      const W = canvas.width, H = canvas.height;
      nodes = [];

      // Central hub — Capital Network
      nodes.push({ x: W * 0.5, y: H * 0.45, vx: 0, vy: 0, r: 22,
        kind: 'hub', color: '#00BCD4', pulse: 0, pulseSpeed: 0.04, alpha: 1, label: 'CN' });

      // VC ring (outer)
      VC_LABELS.forEach((lbl, i) => {
        const angle = (i / VC_LABELS.length) * Math.PI * 2 - Math.PI / 2;
        const dist = Math.min(W, H) * 0.30;
        nodes.push({
          x: W * 0.5 + Math.cos(angle) * dist,
          y: H * 0.45 + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: 14, kind: 'vc', color: '#8b5cf6',
          pulse: Math.random() * Math.PI * 2, pulseSpeed: 0.025 + Math.random() * 0.02,
          alpha: 0.85, label: lbl,
        });
      });

      // Startup cluster (mid)
      STARTUP_LABELS.forEach((lbl, i) => {
        const angle = (i / STARTUP_LABELS.length) * Math.PI * 2 + 0.4;
        const dist = Math.min(W, H) * 0.17;
        nodes.push({
          x: W * 0.5 + Math.cos(angle) * dist + (Math.random() - 0.5) * 40,
          y: H * 0.45 + Math.sin(angle) * dist + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: 10, kind: 'startup', color: '#f59e0b',
          pulse: Math.random() * Math.PI * 2, pulseSpeed: 0.03 + Math.random() * 0.025,
          alpha: 0.75, label: lbl,
        });
      });

      // Banks (scattered)
      BANK_LABELS.forEach((lbl, i) => {
        nodes.push({
          x: W * (0.12 + i * 0.22) + (Math.random() - 0.5) * 40,
          y: H * (0.18 + (i % 2) * 0.55),
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          r: 12, kind: 'bank', color: '#10b981',
          pulse: Math.random() * Math.PI * 2, pulseSpeed: 0.022,
          alpha: 0.7, label: lbl,
        });
      });

      // Advisors
      ADVISOR_LABELS.forEach((lbl, i) => {
        nodes.push({
          x: W * (0.2 + i * 0.2),
          y: H * (0.72 + (i % 2) * 0.12),
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          r: 9, kind: 'advisor', color: '#e879f9',
          pulse: Math.random() * Math.PI * 2, pulseSpeed: 0.028,
          alpha: 0.65, label: lbl,
        });
      });
    };

    // ── Capital flow packets (animated dots on edges) ─────────────────────────
    interface Packet { from: number; to: number; t: number; speed: number; color: string; }
    const packets: Packet[] = [];
    const spawnPacket = () => {
      if (nodes.length < 2) return;
      const from = Math.floor(Math.random() * nodes.length);
      // Prefer hub connections
      const toHub = Math.random() < 0.45;
      const to = toHub ? 0 : Math.floor(Math.random() * nodes.length);
      if (from === to) return;
      packets.push({ from, to, t: 0, speed: 0.004 + Math.random() * 0.006, color: nodes[from].color });
      if (packets.length > 60) packets.shift();
    };
    const packetTimer = setInterval(spawnPacket, 140);

    // ── Candlestick data (funding rounds chart, bottom-left corner) ───────────
    const CANDLES = 28;
    interface Candle { open: number; close: number; high: number; low: number; }
    const candles: Candle[] = [];
    let price = 100;
    for (let i = 0; i < CANDLES; i++) {
      const change = (Math.random() - 0.38) * 12;
      const open = price;
      const close = Math.max(20, price + change);
      const high = Math.max(open, close) + Math.random() * 6;
      const low = Math.min(open, close) - Math.random() * 6;
      candles.push({ open, close, high, low });
      price = close;
    }

    // ── Grid lines (subtle) ───────────────────────────────────────────────────
    const drawGrid = (W: number, H: number) => {
      ctx.save();
      ctx.strokeStyle = 'rgba(0,188,212,0.04)';
      ctx.lineWidth = 1;
      const step = 80;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.restore();
    };

    // ── Candlestick chart renderer ─────────────────────────────────────────────
    const drawCandlesticks = (W: number, H: number) => {
      const chartW = Math.min(W * 0.28, 240);
      const chartH = 90;
      const chartX = 20;
      const chartY = H - chartH - 28;
      const allPrices = candles.flatMap(c => [c.high, c.low]);
      const maxP = Math.max(...allPrices);
      const minP = Math.min(...allPrices);
      const range = maxP - minP || 1;
      const toY = (p: number) => chartY + chartH - ((p - minP) / range) * chartH;

      // Chart BG
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.strokeStyle = 'rgba(0,188,212,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(chartX - 4, chartY - 4, chartW + 8, chartH + 8);
      ctx.fill(); ctx.stroke();

      // Label
      ctx.fillStyle = 'rgba(0,188,212,0.5)';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('FUNDING FLOW', chartX, chartY - 8);

      const cw = (chartW / CANDLES) * 0.65;
      candles.forEach((c, i) => {
        const cx = chartX + (i / CANDLES) * chartW + cw;
        const bullish = c.close >= c.open;
        const color = bullish ? '#10b981' : '#ef4444';
        const alpha = 0.55 + (i / CANDLES) * 0.35;

        ctx.strokeStyle = color.replace(')', `,${alpha})`).replace('rgb', 'rgba');
        ctx.fillStyle = (bullish ? 'rgba(16,185,129,' : 'rgba(239,68,68,') + alpha + ')';
        ctx.lineWidth = 1;

        // Wick
        ctx.beginPath();
        ctx.moveTo(cx + cw / 2, toY(c.high));
        ctx.lineTo(cx + cw / 2, toY(c.low));
        ctx.stroke();

        // Body
        const bodyTop = toY(Math.max(c.open, c.close));
        const bodyH = Math.max(1, Math.abs(toY(c.open) - toY(c.close)));
        ctx.fillRect(cx, bodyTop, cw, bodyH);
      });

      // Price line (glowing)
      const lastClose = candles[candles.length - 1].close;
      const lineY = toY(lastClose);
      const lineGrad = ctx.createLinearGradient(chartX, lineY, chartX + chartW, lineY);
      lineGrad.addColorStop(0, 'rgba(0,188,212,0)');
      lineGrad.addColorStop(0.7, 'rgba(0,188,212,0.6)');
      lineGrad.addColorStop(1, 'rgba(0,188,212,0)');
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(chartX, lineY); ctx.lineTo(chartX + chartW, lineY);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // ── Edge drawing with gradient + alpha based on distance ──────────────────
    const drawEdges = (W: number, H: number) => {
      const HUB_CONNECT_R = Math.min(W, H) * 0.38;
      const PEER_CONNECT_R = Math.min(W, H) * 0.19;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const isHubEdge = a.kind === 'hub' || b.kind === 'hub';
          const maxD = isHubEdge ? HUB_CONNECT_R : PEER_CONNECT_R;
          if (d > maxD) continue;

          const alpha = (1 - d / maxD) * (isHubEdge ? 0.32 : 0.14);
          const colorA = a.kind === 'hub' ? '#00BCD4' : a.color;
          const colorB = b.kind === 'hub' ? '#00BCD4' : b.color;

          const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          grad.addColorStop(0, colorA + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
          grad.addColorStop(1, colorB + Math.floor(alpha * 0.4 * 255).toString(16).padStart(2, '0'));

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = isHubEdge ? 1.2 : 0.7;
          ctx.stroke();
        }
      }
    };

    // ── Node drawing ──────────────────────────────────────────────────────────
    const drawNodes = () => {
      nodes.forEach(n => {
        n.pulse += n.pulseSpeed;
        const pulseMod = 1 + Math.sin(n.pulse) * 0.18;
        const drawR = n.r * pulseMod;

        // Outer glow ring
        const glowR = drawR * 2.8;
        const glow = ctx.createRadialGradient(n.x, n.y, drawR * 0.5, n.x, n.y, glowR);
        glow.addColorStop(0, n.color + '28');
        glow.addColorStop(1, n.color + '00');
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core fill
        ctx.beginPath();
        ctx.arc(n.x, n.y, drawR, 0, Math.PI * 2);
        ctx.fillStyle = n.color + Math.floor(n.alpha * 0.22 * 255).toString(16).padStart(2, '0');
        ctx.fill();

        // Border ring
        ctx.beginPath();
        ctx.arc(n.x, n.y, drawR, 0, Math.PI * 2);
        ctx.strokeStyle = n.color + Math.floor(n.alpha * 0.75 * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = n.kind === 'hub' ? 2 : 1.2;
        ctx.stroke();

        // Hub extra ring
        if (n.kind === 'hub') {
          ctx.beginPath();
          ctx.arc(n.x, n.y, drawR * 1.6, 0, Math.PI * 2);
          ctx.strokeStyle = '#00BCD4' + Math.floor((0.08 + Math.sin(n.pulse) * 0.08) * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Label (only for larger nodes)
        if (n.r >= 10) {
          ctx.fillStyle = n.color + 'cc';
          ctx.font = `${n.kind === 'hub' ? 'bold 8px' : '7px'} monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(n.label, n.x, n.y + drawR + 10);
        }
      });
      ctx.textAlign = 'start';
    };

    // ── Packet (flowing capital dot) drawing ──────────────────────────────────
    const drawPackets = () => {
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += p.speed;
        if (p.t >= 1) { packets.splice(i, 1); continue; }
        if (p.from >= nodes.length || p.to >= nodes.length) { packets.splice(i, 1); continue; }

        const a = nodes[p.from], b = nodes[p.to];
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const fadeAlpha = Math.sin(p.t * Math.PI) * 0.9;

        // Glowing trail
        const trail = ctx.createRadialGradient(x, y, 0, x, y, 7);
        trail.addColorStop(0, p.color + Math.floor(fadeAlpha * 255).toString(16).padStart(2, '0'));
        trail.addColorStop(1, p.color + '00');
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = trail;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
    };

    // ── Physics: gentle drift, boundary bounce ────────────────────────────────
    const updatePhysics = (W: number, H: number) => {
      nodes.forEach((n, i) => {
        if (n.kind === 'hub') return; // hub stays centered
        n.x += n.vx; n.y += n.vy;
        // Soft boundary
        if (n.x < n.r) { n.vx += 0.04; } else if (n.x > W - n.r) { n.vx -= 0.04; }
        if (n.y < n.r) { n.vy += 0.04; } else if (n.y > H - n.r) { n.vy -= 0.04; }
        // Dampening
        n.vx *= 0.995; n.vy *= 0.995;
        // Gentle pull toward original position (hub gravity)
        const hub = nodes[0];
        const dx = hub.x - n.x, dy = hub.y - n.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        // Keep VC nodes at their ring distance
        if (n.kind === 'vc') {
          const targetD = Math.min(W, H) * 0.30;
          const force = (d - targetD) * 0.0008;
          n.vx += (dx / d) * force;
          n.vy += (dy / d) * force;
        }
        void i;
      });
    };

    resize();

    let t = 0;
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      if (!W || !H) { raf = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, W, H);
      t += 0.008;

      // 1. Subtle grid
      drawGrid(W, H);

      // 2. Edges / connections
      drawEdges(W, H);

      // 3. Flowing capital packets
      drawPackets();

      // 4. Nodes
      drawNodes();

      // 5. Candlestick chart (bottom-left)
      drawCandlesticks(W, H);

      // 6. Physics update
      updatePhysics(W, H);

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(packetTimer);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.85 }} />;
}

// ─── Live Journey Panel ───────────────────────────────────────────────────────
const JOURNEY_STEPS = [
  { label: 'ارزیابی اولیه',      pct: 100, color: '#10b981', done: true },
  { label: 'Pitch Deck',          pct: 100, color: '#00BCD4', done: true },
  { label: 'مدل مالی',            pct: 100, color: '#8b5cf6', done: true },
  { label: 'Due Diligence',       pct: 72,  color: '#f59e0b', done: false },
  { label: 'Term Sheet',          pct: 0,   color: '#ef4444', done: false },
];

const VC_METRICS = [
  { label: 'Valuation',  value: '$4.2M',  up: true },
  { label: 'Runway',     value: '18mo',   up: true },
  { label: 'MRR Growth', value: '+38%',   up: true },
  { label: 'Burn Rate',  value: '$42K',   up: false },
];

function LiveJourneyPanel() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full rounded-2xl overflow-hidden"
      style={{ background: 'rgba(7,17,30,0.85)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-300">{tr("مسیر VC-Ready")}</span>
        </div>
        <span className="text-[10px] font-mono" style={{ color: '#00BCD4' }}>LIVE TRACKER</span>
      </div>

      {/* Journey steps */}
      <div className="px-5 py-4 space-y-3">
        {JOURNEY_STEPS.map((step, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                {step.done
                  ? <CheckCircle2 size={11} className="text-emerald-400" />
                  : <div className="w-2.5 h-2.5 rounded-full border border-slate-600" />}
                {step.label}
              </span>
              <span className="text-[10px] font-mono" style={{ color: step.color }}>{step.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: step.color }}
                initial={{ width: 0 }}
                animate={{ width: `${step.pct}%` }}
                transition={{ duration: 1.2, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }} />
            </div>
          </div>
        ))}
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-px" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.04)' }}>
        {VC_METRICS.map((m, i) => (
          <div key={i} className="px-4 py-3" style={{ background: 'rgba(7,17,30,0.8)' }}>
            <p className="text-[9px] text-slate-600 uppercase tracking-widest mb-0.5">{m.label}</p>
            <p className="text-sm font-black" style={{ color: m.up ? '#10b981' : '#f59e0b' }}>
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="px-5 py-3 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <span className="text-[10px] text-slate-600">{tr("آخرین آپدیت: همین الان")}</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.2)' }}>
          {tr("در حال پیشرفت")}
        </span>
      </div>
    </div>
  );
}

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
const FadeIn = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}>
    {children}
  </motion.div>
);

// ─── Section heading ──────────────────────────────────────────────────────────
const SH = ({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) => (
  <div className="text-center mb-14">
    <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-400 mb-4">{eyebrow}</p>
    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-[1.08]">{title}</h2>
    {sub && <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">{sub}</p>}
  </div>
);

// ─── 1. HERO ─────────────────────────────────────────────────────────────────
function Hero({ onNavigate, c }: { onNavigate: (page: string) => void; c: ProcessContent }) {
  const { scrollY } = useScroll();
  const bgY    = useTransform(scrollY, [0, 600], [0, 120]);
  const fadeOut = useTransform(scrollY, [0, 350], [1, 0]);

  return (
    <header className="relative min-h-screen bg-[#050d1a] overflow-hidden flex flex-col pt-20">
      <ProcessCanvas />

      {/* Nav bar */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between px-8 py-6"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button type="button" onClick={() => onNavigate('home')}
          className="group inline-flex items-center gap-2.5 rounded-xl border border-white/12 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-white/10 hover:border-white/20 hover:text-white">
          <Home size={15} className="text-cyan-400 transition-transform group-hover:-translate-x-0.5" />
          {tr("بازگشت به صفحه اصلی")}
        </button>
        <button type="button" onClick={() => onNavigate('contact')}
          className="group inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition-all hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-white">
          {tr("تماس با ما")}
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
        </button>
      </motion.div>

      {/* Badge */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 px-8 pt-5 pb-1">
        <span className="rounded-full border border-cyan-500/40 bg-cyan-500/12 px-4 py-1.5 text-xs font-semibold tracking-widest text-cyan-300 uppercase">
          {c.hero.badge}
        </span>
      </motion.div>

      {/* Main hero body */}
      <motion.div style={{ y: bgY }}
        className="relative z-10 flex flex-1 flex-col justify-center px-8 md:px-16 lg:px-24 py-16">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-[1fr_420px] gap-16 items-center">

          {/* Left: text */}
          <div>
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 text-xs font-bold uppercase tracking-[0.35em] text-cyan-400">
              {c.hero.eyebrow}
            </motion.p>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] text-white mb-6">
              {c.hero.titleLine1}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                {c.hero.titleLine2}
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-lg font-semibold text-white mb-4 max-w-xl leading-relaxed">
              {c.hero.subtitle}
            </motion.p>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-base text-white/75 mb-10 max-w-xl leading-relaxed">
              {c.hero.description}
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap gap-4 mb-10">
              <a href="/evaluation"
                className="group relative inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-400 hover:-translate-y-0.5">
                {c.hero.ctaPrimary}
                <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
              </a>
              <a href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10 hover:-translate-y-0.5">
                {c.hero.ctaSecondary}
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-2">
              {c.hero.trustBadges.map(b => (
                <span key={b}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs font-medium text-slate-400">
                  <Shield size={10} className="text-cyan-500" /> {b}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: live panel */}
          <LiveJourneyPanel />
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div style={{ opacity: fadeOut }}
        className="absolute bottom-8 start-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600">
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ArrowDown size={18} />
        </motion.div>
      </motion.div>
    </header>
  );
}

// ─── STAT ICONS ──────────────────────────────────────────────────────────────
const STAT_ICONS = [
  <Briefcase size={20} />,
  <DollarSign size={20} />,
  <Clock size={20} />,
  <Award size={20} />,
];

// ─── 2. STATS BAR ────────────────────────────────────────────────────────────
function StatsBar({ c }: { c: ProcessContent }) {
  return (
    <section className="py-10 border-y" style={{ background: 'rgba(0,188,212,0.04)', borderColor: 'rgba(0,188,212,0.12)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {c.stats.map((s, i) => (
            <FadeIn key={s.id} delay={i * 0.08}>
              <div className="text-center">
                <div className="flex justify-center mb-2 text-cyan-400">{STAT_ICONS[i % STAT_ICONS.length]}</div>
                <p className="text-3xl font-black text-white mb-1">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── OVERVIEW ICONS ───────────────────────────────────────────────────────────
const OVERVIEW_ICONS = [
  <Target size={22} />, <FileText size={22} />, <Users size={22} />, <TrendingUp size={22} />,
  <BarChart3 size={22} />, <Zap size={22} />, <Award size={22} />, <Globe size={22} />,
];

// ─── 3. OVERVIEW ─────────────────────────────────────────────────────────────
function Overview({ c }: { c: ProcessContent }) {
  return (
    <section className="py-24 px-6 md:px-16" style={{ background: '#0d1829' }}>
      <div className="max-w-6xl mx-auto">
        <FadeIn><SH eyebrow={c.overviewEyebrow} title={c.overviewTitle} sub={c.overviewSub} /></FadeIn>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {c.overviewItems.map((item, i) => (
            <FadeIn key={item.id} delay={i * 0.08}>
              <div className="p-6 rounded-2xl h-full flex flex-col" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: item.color + '20', color: item.color }}>
                  {OVERVIEW_ICONS[i % OVERVIEW_ICONS.length]}
                </div>
                <h3 className="text-white font-bold text-sm mb-2">{item.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed flex-1">{item.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TIMELINE ICONS ──────────────────────────────────────────────────────────
const TIMELINE_ICONS = [
  <Target size={24} />, <FileText size={24} />, <Users size={24} />,
  <Globe size={24} />, <DollarSign size={24} />, <Zap size={24} />, <Award size={24} />,
];

// ─── 4. MAIN TIMELINE (مراحل اصلی) ──────────────────────────────────────────
function Timeline({ c }: { c: ProcessContent }) {
  const [active, setActive] = useState(0);
  const steps = c.timelineSteps;
  const safeActive = Math.min(active, steps.length - 1);

  return (
    <section className="py-24 px-6 md:px-16" style={{ background: '#111c2d' }}>
      <div className="max-w-6xl mx-auto">
        <FadeIn><SH eyebrow={c.timelineEyebrow} title={c.timelineTitle} sub={c.timelineSub} /></FadeIn>

        <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start">
          {/* Step selector */}
          <div className="space-y-2">
            {steps.map((step, i) => (
              <button key={step.id} onClick={() => setActive(i)}
                className="w-full text-end flex items-center gap-4 px-5 py-4 rounded-2xl transition-all"
                style={{
                  background: active === i ? step.color + '15' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active === i ? step.color + '40' : 'rgba(255,255,255,0.06)'}`,
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-xs"
                  style={{ background: step.color + '20', color: step.color }}>
                  {step.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{step.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock size={9} /> {step.duration}
                  </p>
                </div>
                {active === i && <ChevronRight size={14} style={{ color: step.color }} />}
              </button>
            ))}
          </div>

          {/* Step detail */}
          <AnimatePresence mode="wait">
            <motion.div key={safeActive}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {steps[safeActive] && (() => {
                const step = steps[safeActive];
                return (
                  <>
                    <div className="px-7 py-6" style={{ background: step.color + '0d', borderBottom: `1px solid ${step.color}20` }}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{ background: step.color + '20', color: step.color }}>
                          {TIMELINE_ICONS[safeActive % TIMELINE_ICONS.length]}
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: step.color }}>{tr("مرحله")} {step.number}</p>
                          <h3 className="text-xl font-black text-white">{step.title}</h3>
                        </div>
                        <span className="me-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                          style={{ background: step.color + '18', color: step.color }}>
                          <Clock size={11} /> {step.duration}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-sm">{step.desc}</p>
                    </div>

                    <div className="px-7 py-6 grid md:grid-cols-2 gap-6">
                      {/* Deliverables */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">{tr("خروجی‌های این مرحله")}</p>
                        <ul className="space-y-2">
                          {step.deliverables.map((d, di) => (
                            <li key={di} className="flex items-center gap-2.5 text-sm text-slate-300">
                              <CheckCircle2 size={14} style={{ color: step.color, flexShrink: 0 }} />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tags */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">{tr("حوزه‌های کلیدی")}</p>
                        <div className="flex flex-wrap gap-2">
                          {step.tags.map((tag, ti) => (
                            <span key={ti} className="px-3 py-1 rounded-full text-xs font-semibold"
                              style={{ background: step.color + '15', color: step.color, border: `1px solid ${step.color}25` }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// ─── 5. WHAT WE BUILD (خروجی‌های اصلی) ──────────────────────────────────────
function DeliverablesSection({ c }: { c: ProcessContent }) {
  return (
    <section className="py-24 px-6 md:px-16" style={{ background: '#0d1829' }}>
      <div className="max-w-6xl mx-auto">
        <FadeIn><SH eyebrow={c.deliverablesEyebrow} title={c.deliverablesTitle} sub={c.deliverablesSub} /></FadeIn>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {c.deliverables.map((d, i) => (
            <FadeIn key={d.id} delay={i * 0.06}>
              <div className="p-6 rounded-2xl h-full flex flex-col group transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = d.color + '40')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: d.color + '18' }}>
                    {d.icon}
                  </div>
                  <h3 className="text-white font-bold text-sm">{d.title}</h3>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed flex-1 mb-4">{d.desc}</p>
                <ul className="space-y-1.5">
                  {d.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: d.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function AudienceSection({ c }: { c: ProcessContent }) {
  return (
    <section className="py-24 px-6 md:px-16" style={{ background: '#111c2d' }}>
      <div className="max-w-6xl mx-auto">
        <FadeIn><SH eyebrow={c.audienceEyebrow} title={c.audienceTitle} sub={c.audienceSub} /></FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {c.audience.map((a, i) => (
            <FadeIn key={a.id} delay={i * 0.1}>
              <div className="p-7 rounded-2xl h-full flex flex-col"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${a.color}20` }}>
                <span className="inline-block text-[10px] font-bold px-3 py-1 rounded-full mb-4"
                  style={{ background: a.color + '18', color: a.color, border: `1px solid ${a.color}30` }}>
                  {a.badge}
                </span>
                <h3 className="text-white font-black text-lg mb-3">{a.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-5">{a.desc}</p>
                <ul className="space-y-2">
                  {a.criteria.map((cr, ci) => (
                    <li key={ci} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 size={13} style={{ color: a.color, flexShrink: 0 }} />
                      {cr}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 7. COMPARISON ────────────────────────────────────────────────────────────
function ComparisonSection({ c }: { c: ProcessContent }) {
  return (
    <section className="py-24 px-6 md:px-16" style={{ background: '#0d1829' }}>
      <div className="max-w-4xl mx-auto">
        <FadeIn><SH eyebrow={c.compareEyebrow} title={c.compareTitle} /></FadeIn>
        <FadeIn>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="grid grid-cols-3 py-3" style={{ background: 'rgba(0,188,212,0.08)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{tr("حوزه")}</p>
              <p className="px-6 text-xs font-bold text-red-400 uppercase tracking-widest text-center">{tr("بدون ما ❌")}</p>
              <p className="px-6 text-xs font-bold text-emerald-400 uppercase tracking-widest text-center">{tr("با ما ✓")}</p>
            </div>
            {c.compareRows.map((row, i) => (
              <div key={row.id} className="grid grid-cols-3 py-4 transition-colors"
                style={{ borderBottom: i < c.compareRows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                <p className="px-6 text-sm font-semibold text-slate-300">{row.label}</p>
                <p className="px-6 text-sm text-red-400/80 text-center">{row.before}</p>
                <p className="px-6 text-sm text-emerald-400 font-medium text-center">{row.after}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── 8. TESTIMONIALS ─────────────────────────────────────────────────────────
function TestimonialsSection({ c }: { c: ProcessContent }) {
  return (
    <section className="py-24 px-6 md:px-16" style={{ background: '#111c2d' }}>
      <div className="max-w-5xl mx-auto">
        <FadeIn><SH eyebrow={c.testimonialsEyebrow} title={c.testimonialsTitle} /></FadeIn>
        <div className="grid md:grid-cols-3 gap-5">
          {c.testimonials.map((t, i) => (
            <FadeIn key={t.id} delay={i * 0.08}>
              <div className="p-6 rounded-2xl flex flex-col" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${t.color}20` }}>
                <div className="flex mb-3">
                  {[0,1,2,3,4].map(s => <Star key={s} size={12} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                    style={{ background: t.color + '20', color: t.color }}>
                    {t.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-xs font-bold">{t.name}</p>
                    <p className="text-slate-500 text-[10px]">{t.role} · {t.company}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: t.color + '15', color: t.color }}>{t.amount}</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 9. FAQ ───────────────────────────────────────────────────────────────────
function FaqSection({ c }: { c: ProcessContent }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-24 px-6 md:px-16" style={{ background: '#0d1829' }}>
      <div className="max-w-3xl mx-auto">
        <FadeIn><SH eyebrow={c.faqEyebrow} title={c.faqTitle} /></FadeIn>
        <div className="space-y-3">
          {c.faqs.map((faq, i) => (
            <FadeIn key={faq.id} delay={i * 0.04}>
              <div className="rounded-2xl overflow-hidden transition-all"
                style={{ border: `1px solid ${open === i ? 'rgba(0,188,212,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-end transition-all"
                  style={{ background: open === i ? 'rgba(0,188,212,0.06)' : 'rgba(255,255,255,0.03)' }}>
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  <ChevronRight size={16} className="text-cyan-400 shrink-0 transition-transform"
                    style={{ transform: open === i ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden">
                      <p className="px-6 py-4 text-slate-400 text-sm leading-relaxed"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)' }}>
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 10. CTA ─────────────────────────────────────────────────────────────────
function CTASection({ c }: { c: ProcessContent }) {
  return (
    <section className="py-24 px-6 md:px-16 relative overflow-hidden" style={{ background: '#111c2d' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 start-1/2 -translate-x-1/2 w-[600px] h-64 rounded-full opacity-15 blur-[80px]"
          style={{ background: 'radial-gradient(ellipse, #00BCD4, #8b5cf6)' }} />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold text-cyan-300 mb-6 uppercase tracking-widest">
            <Zap size={12} /> {c.cta.badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-[1.08]">
            {c.cta.title}<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">{c.cta.titleHighlight}</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">{c.cta.description}</p>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <a href="/evaluation"
              className="group inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-8 py-4 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-400 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/30">
              {c.cta.btnPrimary}
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            </a>
            <a href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/10 hover:-translate-y-1">
              {c.cta.btnSecondary}
            </a>
          </div>
          <div className="flex flex-wrap gap-3 justify-center text-xs text-slate-600">
            {c.cta.features.map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <Lock size={9} className="text-cyan-600" /> {item}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function CapitalProcessPage({ onNavigate, banners = [] }: { onNavigate: (page: string) => void; banners?: InlineBanner[] }) {
  const [rawContent, setC] = useState<ProcessContent>(() => loadProcessContent());
  const { lang } = useLanguage();

  // محتوای این صفحه از localStorage/دیتابیس به فارسی می‌آید؛ برای نسخهٔ انگلیسی
  // در همین نقطه ترجمهٔ عمیق اعمال می‌شود.
  const c = useMemo(() => deepTranslate(rawContent), [rawContent, lang]);

  // live reload وقتی ادمین ذخیره می‌کند
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === PROCESS_STORE_KEY || e.key === null) setC(loadProcessContent());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1829] text-white">
      <Hero onNavigate={onNavigate} c={c} />
      <InlineBannerRenderer banners={banners} page="process" section="after-hero" />
      <StatsBar c={c} />
      <Overview c={c} />
      <Timeline c={c} />
      <InlineBannerRenderer banners={banners} page="process" section="after-steps" />
      <DeliverablesSection c={c} />
      <AudienceSection c={c} />
      <ComparisonSection c={c} />
      <TestimonialsSection c={c} />
      <FaqSection c={c} />
      <CTASection c={c} />
    </div>
  );
}
