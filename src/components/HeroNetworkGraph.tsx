import { useEffect, useRef } from 'react';
import { useTransform, useScroll, motion } from 'framer-motion';

// VC firm names shown on Tier-1 nodes
const VC_NAMES = ['Sequoia', 'a16z', 'Accel', 'Insight', 'GV', 'Index', 'NEA', 'Tiger', 'Founders', 'Lightspeed'];

interface Node {
  angle: number;
  radius: number;
  tier: 1 | 2 | 3;
  name: string;
  hue: number;       // 185 = teal  |  42 = amber
  phase: number;
  phaseSpeed: number;
  orbitSpeed: number;
  pulse: number;
  pulseSpeed: number;
  active: boolean;
  activeTimer: number;
  packetProgress: number;
  x: number;
  y: number;
}

export default function HeroNetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = 0, H = 0;

    const setSize = () => {
      const parent = canvas.parentElement;
      W = canvas.width  = parent ? parent.clientWidth  : window.innerWidth / 2;
      H = canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // ── Build nodes ──────────────────────────────────────────────
    const nodes: Node[] = [];
    const TIERS: Array<{ count: number; tier: 1 | 2 | 3; radFactor: number }> = [
      { count: 4, tier: 1, radFactor: 0.28 },
      { count: 4, tier: 2, radFactor: 0.42 },
      { count: 2, tier: 3, radFactor: 0.54 },
    ];
    let nameIdx = 0;
    TIERS.forEach(({ count, tier, radFactor }) => {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (tier === 2 ? Math.PI / count : 0);
        nodes.push({
          angle,
          radius: radFactor,          // fraction of min(W,H)/2
          tier,
          name: VC_NAMES[nameIdx++ % VC_NAMES.length],
          hue: Math.random() > 0.45 ? 185 : 42,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: (Math.random() * 0.006 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
          orbitSpeed: (Math.random() * 0.004 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.05 + 0.025,
          active: false,
          activeTimer: 0,
          packetProgress: 0,
          x: 0,
          y: 0,
        });
      }
    });

    let frame = 0;

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);

      const cx = W * 0.5;
      const cy = H * 0.52;
      const R  = Math.min(W, H) * 0.42;

      // ── Randomly activate nodes ──────────────────────────────
      if (frame % 90 === 0) {
        const pick = nodes[Math.floor(Math.random() * nodes.length)];
        if (!pick.active) {
          pick.active = true;
          pick.activeTimer = 100;
          pick.packetProgress = 0;
        }
      }

      // ── Orbit dashed circles ─────────────────────────────────
      [0.28, 0.42, 0.54].forEach((f, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R * f, 0, Math.PI * 2);
        ctx.setLineDash([3, 9]);
        ctx.strokeStyle = `rgba(0,188,212,${0.06 - i * 0.015})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
        ctx.restore();
      });

      // ── Nodes + connections ───────────────────────────────────
      nodes.forEach(n => {
        // orbit
        n.angle += n.orbitSpeed;
        n.phase += n.phaseSpeed;
        n.pulse += n.pulseSpeed;

        const wobble = Math.sin(n.phase) * R * 0.018;
        n.x = cx + Math.cos(n.angle) * (R * n.radius + wobble);
        n.y = cy + Math.sin(n.angle) * (R * n.radius + wobble) * 0.85;

        if (n.activeTimer > 0) {
          n.activeTimer--;
          n.packetProgress = 1 - n.activeTimer / 100;
        } else {
          n.active = false;
        }

        const active = n.active || n.activeTimer > 0;
        const lineAlpha = active ? 0.55 : 0.09;
        const hue = n.hue;

        // ── Connection line ──────────────────────────────────
        const grad = ctx.createLinearGradient(cx, cy, n.x, n.y);
        grad.addColorStop(0,   `hsla(${hue},85%,60%,${lineAlpha})`);
        grad.addColorStop(0.5, `hsla(${hue},80%,55%,${lineAlpha * 0.5})`);
        grad.addColorStop(1,   `hsla(${hue},80%,55%,0)`);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = active ? 1.2 : 0.6;
        ctx.stroke();

        // ── Animated packet along edge ────────────────────────
        if (active) {
          const t = n.packetProgress;
          const px = cx + (n.x - cx) * t;
          const py = cy + (n.y - cy) * t;
          const pg = ctx.createRadialGradient(px, py, 0, px, py, 6);
          pg.addColorStop(0, `hsla(${hue},100%,85%,1)`);
          pg.addColorStop(1, `hsla(${hue},100%,60%,0)`);
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fillStyle = pg;
          ctx.fill();
        }

        // ── Node glow ─────────────────────────────────────────
        const baseR = n.tier === 1 ? 6 : n.tier === 2 ? 4.5 : 3.5;
        const pr    = baseR + Math.sin(n.pulse) * 1.4;
        const glowR = pr * (active ? 7 : 5);

        const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        ng.addColorStop(0,   `hsla(${hue},85%,68%,${active ? 0.75 : 0.38})`);
        ng.addColorStop(0.4, `hsla(${hue},80%,55%,${active ? 0.30 : 0.12})`);
        ng.addColorStop(1,   `hsla(${hue},75%,50%,0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = ng;
        ctx.fill();

        // ── Node core ─────────────────────────────────────────
        ctx.beginPath();
        ctx.arc(n.x, n.y, pr, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue},90%,72%,${active ? 1 : 0.75})`;
        ctx.fill();

        // ── Label (Tier-1 always, others when active) ─────────
        if (n.tier === 1 || active) {
          const alpha = active ? 0.95 : 0.55;
          ctx.font = `${active ? 'bold ' : ''}10px system-ui,sans-serif`;
          ctx.fillStyle = `rgba(180,240,255,${alpha})`;
          ctx.textAlign = 'center';
          ctx.fillText(n.name, n.x, n.y - pr - 5);
        }
      });

      // ── Central "hub" node ────────────────────────────────────
      const pulse = Math.sin(frame * 0.04) * 0.5 + 0.5;

      // outer glow ring — breathes
      const outerR = 34 + pulse * 8;
      const og = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR);
      og.addColorStop(0,   `rgba(0,212,220,${0.18 + pulse * 0.08})`);
      og.addColorStop(0.6, `rgba(0,188,212,0.05)`);
      og.addColorStop(1,   'rgba(0,188,212,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.fillStyle = og;
      ctx.fill();

      // mid ring
      const mg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20);
      mg.addColorStop(0,   `rgba(0,230,240,${0.85 + pulse * 0.15})`);
      mg.addColorStop(0.55,`rgba(0,188,212,${0.45 + pulse * 0.1})`);
      mg.addColorStop(1,   'rgba(0,160,200,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = mg;
      ctx.fill();

      // solid core
      ctx.beginPath();
      ctx.arc(cx, cy, 11, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,255,255,${0.9 + pulse * 0.1})`;
      ctx.fill();

      // center label
      ctx.font = 'bold 8px system-ui,sans-serif';
      ctx.fillStyle = '#071020';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CN', cx, cy);
      ctx.textBaseline = 'alphabetic';

      // ── Subtle radial vignette to blend into page ─────────────
      const vg = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, R * 1.05);
      vg.addColorStop(0, 'rgba(6,14,28,0)');
      vg.addColorStop(1, 'rgba(6,14,28,0.72)');
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.fillStyle = vg;
      ctx.fill();

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 left-0 right-1/2 pointer-events-none hidden md:block"
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </motion.div>
  );
}
