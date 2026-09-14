// ─── Shared Financial Theme Background ─────────────────────────────────────
// Dark financial theme: dot grid, subtle grid lines, pulsing radial glows,
// floating particles. No animated charts or tickers.
// Position: fixed, full-screen, pointer-events-none, z-0.

import { useEffect, useRef } from 'react';

export function FinancialBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let tick = 0;

    // ── resize ───────────────────────────────────────────────────────────────
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── Grid config ──────────────────────────────────────────────────────────
    const H_LINES = 7;
    const V_LINES = 10;

    // ── Floating particles ───────────────────────────────────────────────────
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

    // ── Cached static bg canvas (dot grid + grid lines) ──────────────────────
    let bgCanvas: HTMLCanvasElement | null = null;
    let bgW = 0, bgH = 0;

    const rebuildBgCache = (W: number, H: number) => {
      bgCanvas = document.createElement('canvas');
      bgCanvas.width = W; bgCanvas.height = H;
      const bc = bgCanvas.getContext('2d')!;

      // dark gradient base
      const bg = bc.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0,   '#050d1a');
      bg.addColorStop(0.5, '#081525');
      bg.addColorStop(1,   '#060e1c');
      bc.fillStyle = bg;
      bc.fillRect(0, 0, W, H);

      // dot grid
      bc.fillStyle = 'rgba(6,182,212,0.1)';
      const dotSpacing = 36;
      for (let x = 0; x < W; x += dotSpacing) {
        for (let y = 0; y < H; y += dotSpacing) {
          bc.beginPath(); bc.arc(x, y, 0.9, 0, Math.PI * 2); bc.fill();
        }
      }

      // subtle grid lines
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

    // ── Draw loop ────────────────────────────────────────────────────────────
    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      if (!W || !H) { raf = requestAnimationFrame(draw); return; }

      ctx.clearRect(0, 0, W, H);

      // 1. Static bg (dot grid + grid lines)
      if (bgW !== W || bgH !== H) rebuildBgCache(W, H);
      ctx.drawImage(bgCanvas!, 0, 0);

      // 2. Pulsing radial glows
      const pulse = 0.5 + 0.5 * Math.sin(tick * 0.012);
      const glowData: [number, number, number, string, number][] = [
        [0.78, 0.18, 0.45, 'rgba(6,182,212,',  0.16 + pulse * 0.06],
        [0.18, 0.82, 0.38, 'rgba(139,92,246,', 0.12 + pulse * 0.04],
        [0.50, 0.50, 0.28, 'rgba(16,185,129,', 0.05],
      ];
      for (const [cx, cy, r, col, alpha] of glowData) {
        const g = ctx.createRadialGradient(cx * W, cy * H, 0, cx * W, cy * H, r * Math.max(W, H));
        g.addColorStop(0, `${col}${alpha})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }

      // 3. Floating particles
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
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
