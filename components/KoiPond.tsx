"use client";

import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------ *
 * A hand-built, cinematic koi pond. Everything below is drawn at
 * runtime on a single canvas: water depth, caustics, light shafts,
 * river stones, aquatic planting and the koi themselves.
 * ------------------------------------------------------------------ */

type Vec = { x: number; y: number };

type Palette = {
  body: string;
  patch: string;
  fin: string;
  accent: boolean;
};

const PALETTES: Record<string, Palette> = {
  // Kohaku — white body, red-orange patches. The warm accent.
  kohaku: { body: "#F3F8F9", patch: "#DD5420", fin: "#E9F4F6", accent: true },
  // Platinum ogon — cool, almost silver.
  platinum: { body: "#DCEBF0", patch: "#C2D9E1", fin: "#D4E6EC", accent: false },
  // Sumi — deep indigo, reads as a shadow in the water.
  sumi: { body: "#17405E", patch: "#0C2A42", fin: "#1E4C6D", accent: false },
  // Asagi — blue-scaled with a faint warm belly.
  asagi: { body: "#2C6B8C", patch: "#9FD2D6", fin: "#3A7B9C", accent: false },
};

type KoiSpec = {
  palette: keyof typeof PALETTES;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  tilt: number;
  speed: number;
  phase: number;
  depth: number;
  len: number;
  tailFreq: number;
  patches: { s: number; side: number; rx: number; ry: number }[];
};

const KOI: KoiSpec[] = [
  {
    palette: "sumi",
    cx: 0.3,
    cy: 0.3,
    rx: 0.34,
    ry: 0.2,
    tilt: -0.35,
    speed: 0.052,
    phase: 1.1,
    depth: 0.12,
    len: 0.21,
    tailFreq: 1.5,
    patches: [],
  },
  {
    palette: "asagi",
    cx: 0.72,
    cy: 0.24,
    rx: 0.3,
    ry: 0.17,
    tilt: 0.42,
    speed: -0.046,
    phase: 3.4,
    depth: 0.2,
    len: 0.22,
    tailFreq: 1.35,
    patches: [{ s: 0.46, side: 1, rx: 0.1, ry: 0.5 }],
  },
  {
    palette: "platinum",
    cx: 0.2,
    cy: 0.62,
    rx: 0.27,
    ry: 0.21,
    tilt: 0.22,
    speed: 0.063,
    phase: 5.1,
    depth: 0.42,
    len: 0.24,
    tailFreq: 1.6,
    patches: [{ s: 0.3, side: -1, rx: 0.08, ry: 0.45 }],
  },
  {
    palette: "kohaku",
    cx: 0.78,
    cy: 0.66,
    rx: 0.3,
    ry: 0.23,
    tilt: -0.5,
    speed: -0.058,
    phase: 0.4,
    depth: 0.55,
    len: 0.26,
    tailFreq: 1.45,
    patches: [
      { s: 0.16, side: 0, rx: 0.1, ry: 0.78 },
      { s: 0.52, side: 0.4, rx: 0.13, ry: 0.72 },
    ],
  },
  {
    palette: "sumi",
    cx: 0.52,
    cy: 0.46,
    rx: 0.38,
    ry: 0.26,
    tilt: 0.12,
    speed: 0.041,
    phase: 2.2,
    depth: 0.68,
    len: 0.3,
    tailFreq: 1.25,
    patches: [{ s: 0.4, side: 0.3, rx: 0.09, ry: 0.5 }],
  },
  {
    palette: "kohaku",
    cx: 0.4,
    cy: 0.84,
    rx: 0.36,
    ry: 0.18,
    tilt: -0.18,
    speed: -0.05,
    phase: 4.3,
    depth: 0.88,
    len: 0.34,
    tailFreq: 1.3,
    patches: [
      { s: 0.2, side: 0, rx: 0.11, ry: 0.8 },
      { s: 0.58, side: -0.35, rx: 0.12, ry: 0.66 },
    ],
  },
  {
    palette: "platinum",
    cx: 0.86,
    cy: 0.92,
    rx: 0.3,
    ry: 0.16,
    tilt: 0.3,
    speed: 0.044,
    phase: 6.0,
    depth: 1,
    len: 0.36,
    tailFreq: 1.2,
    patches: [{ s: 0.35, side: 0.5, rx: 0.08, ry: 0.4 }],
  },
];

const STONES = [
  { x: 0.08, y: 0.97, r: 0.17, f: 0.62, a: 0.4 },
  { x: 0.3, y: 1.02, r: 0.2, f: 0.5, a: -0.3 },
  { x: 0.62, y: 1.0, r: 0.15, f: 0.58, a: 0.2 },
  { x: 0.93, y: 0.99, r: 0.19, f: 0.55, a: -0.5 },
  { x: 0.03, y: 0.72, r: 0.1, f: 0.6, a: 0.8 },
  { x: 0.97, y: 0.63, r: 0.09, f: 0.66, a: -0.9 },
  { x: 0.46, y: 0.03, r: 0.12, f: 0.52, a: 0.4 },
  { x: 0.84, y: -0.02, r: 0.14, f: 0.6, a: -0.2 },
];

const PLANTS = [
  { x: -0.02, y: 0.86, s: 0.26, n: 9, spread: 1.5, rot: -0.3, speed: 0.22 },
  { x: 1.03, y: 0.8, s: 0.24, n: 8, spread: 1.4, rot: 3.4, speed: 0.19 },
  { x: 0.14, y: 0.06, s: 0.17, n: 7, spread: 1.3, rot: 1.9, speed: 0.25 },
  { x: 0.68, y: 1.06, s: 0.22, n: 8, spread: 1.6, rot: 4.3, speed: 0.17 },
];

const RAYS = [
  { a: -0.26, w: 0.9, o: 1, s: 0.09, p: 0 },
  { a: -0.1, w: 0.6, o: 0.75, s: 0.07, p: 1.6 },
  { a: 0.06, w: 1.1, o: 0.9, s: 0.06, p: 3.1 },
  { a: 0.22, w: 0.5, o: 0.6, s: 0.1, p: 4.4 },
  { a: 0.38, w: 0.8, o: 0.7, s: 0.08, p: 5.6 },
];

const PARTICLE_COUNT = 46;

function traceSmooth(path: CanvasPath, pts: Vec[]) {
  if (pts.length < 2) return;
  path.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i += 1) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    path.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
  }
  const last = pts[pts.length - 1];
  path.lineTo(last.x, last.y);
}

function koiPosition(k: KoiSpec, t: number): Vec {
  const c = Math.cos(t);
  const s = Math.sin(t);
  const ex = k.rx * c;
  const ey = k.ry * s;
  const ct = Math.cos(k.tilt);
  const st = Math.sin(k.tilt);
  return {
    x: k.cx + ex * ct - ey * st + 0.035 * Math.sin(t * 2.7 + k.phase),
    y: k.cy + ex * st + ey * ct + 0.028 * Math.cos(t * 2.1 + k.phase),
  };
}

/** Half-width of the koi body at normalised position s (0 = nose, 1 = peduncle). */
function bodyWidth(s: number) {
  const profile = Math.sin(Math.PI * Math.pow(s, 0.62));
  return Math.pow(Math.max(profile, 0), 0.85) * 0.96 + 0.05 * (1 - s);
}

export function KoiPond() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;

    const supportsFilter = typeof ctx.filter === "string";

    const caustic = document.createElement("canvas");
    const cctx = caustic.getContext("2d");
    let causticData: ImageData | null = null;

    const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: Math.sin(i * 12.9898) * 0.5 + 0.5,
      y: Math.cos(i * 78.233) * 0.5 + 0.5,
      r: 0.5 + ((i * 37) % 10) / 7,
      sp: 0.004 + ((i * 17) % 9) / 1400,
      ph: (i * 1.37) % 6.283,
    }));

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cw = 200;
      const ch = Math.max(60, Math.round((cw * height) / width));
      caustic.width = cw;
      caustic.height = ch;
      causticData = cctx ? cctx.createImageData(cw, ch) : null;
    }

    function paintCaustics(t: number) {
      if (!cctx || !causticData) return;
      const { width: w, height: h, data } = causticData;
      for (let y = 0; y < h; y += 1) {
        const v = y / h;
        const fade = Math.max(0, 1 - Math.pow(Math.min(v / 0.95, 1), 1.5));
        for (let x = 0; x < w; x += 1) {
          const i = (y * w + x) * 4;
          if (fade <= 0.002) {
            data[i + 3] = 0;
            continue;
          }
          const u = x / w;
          const px = u * 7.2;
          const py = v * 4.6;
          const w1 =
            Math.sin(px * 1.27 + t * 0.21) + Math.sin(py * 1.73 - t * 0.17);
          const w2 =
            Math.cos(py * 1.11 - t * 0.19) + Math.cos(px * 1.49 + t * 0.23);
          const n =
            Math.sin(px + w1 * 1.15 + t * 0.13) *
            Math.cos(py + w2 * 1.15 - t * 0.11);
          let c = 1 - Math.abs(n);
          c *= c;
          c *= c;
          c *= c;
          data[i] = 176;
          data[i + 1] = 234;
          data[i + 2] = 241;
          data[i + 3] = Math.min(255, c * fade * 560);
        }
      }
      cctx.putImageData(causticData, 0, 0);
    }

    function drawWater() {
      const g = ctx!.createLinearGradient(0, 0, width * 0.25, height);
      g.addColorStop(0, "#0a4f73");
      g.addColorStop(0.32, "#073a5c");
      g.addColorStop(0.66, "#04233c");
      g.addColorStop(1, "#011424");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, width, height);

      const sun = ctx!.createRadialGradient(
        width * 0.36,
        -height * 0.08,
        0,
        width * 0.36,
        -height * 0.08,
        Math.max(width, height) * 0.95,
      );
      sun.addColorStop(0, "rgba(150, 222, 232, 0.5)");
      sun.addColorStop(0.35, "rgba(78, 168, 196, 0.18)");
      sun.addColorStop(1, "rgba(2, 20, 34, 0)");
      ctx!.fillStyle = sun;
      ctx!.fillRect(0, 0, width, height);
    }

    function drawRays(t: number, ox: number) {
      ctx!.save();
      ctx!.globalCompositeOperation = "screen";
      const sunX = width * 0.36 + ox * 0.5;
      const sunY = -height * 0.1;
      const len = height * 1.7;
      for (const r of RAYS) {
        const ang = r.a + Math.sin(t * r.s + r.p) * 0.05;
        ctx!.save();
        ctx!.translate(sunX, sunY);
        ctx!.rotate(ang);
        const wTop = r.w * width * 0.018;
        const wBot = r.w * width * 0.14;
        const g = ctx!.createLinearGradient(0, 0, 0, len);
        g.addColorStop(0, `rgba(198, 243, 251, ${0.15 * r.o})`);
        g.addColorStop(0.4, `rgba(142, 214, 232, ${0.06 * r.o})`);
        g.addColorStop(1, "rgba(110, 190, 212, 0)");
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.moveTo(-wTop, 0);
        ctx!.lineTo(wTop, 0);
        ctx!.lineTo(wBot, len);
        ctx!.lineTo(-wBot, len);
        ctx!.closePath();
        ctx!.fill();
        ctx!.restore();
      }
      ctx!.restore();
    }

    function drawStones(ox: number, oy: number) {
      const vmin = Math.min(width, height);
      for (const s of STONES) {
        const x = s.x * width + ox * 0.35;
        const y = s.y * height + oy * 0.35;
        const r = s.r * vmin * 0.5;
        ctx!.save();
        ctx!.translate(x, y);
        ctx!.rotate(s.a);
        const g = ctx!.createLinearGradient(0, -r * s.f, 0, r * s.f);
        g.addColorStop(0, "rgba(28, 74, 100, 0.95)");
        g.addColorStop(0.55, "rgba(9, 40, 62, 0.95)");
        g.addColorStop(1, "rgba(2, 18, 31, 0.95)");
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.ellipse(0, 0, r, r * s.f, 0, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.globalCompositeOperation = "screen";
        ctx!.strokeStyle = "rgba(129, 206, 220, 0.14)";
        ctx!.lineWidth = Math.max(1, vmin * 0.0016);
        ctx!.beginPath();
        ctx!.ellipse(0, -r * 0.06, r * 0.92, r * s.f * 0.86, 0, Math.PI * 1.05, Math.PI * 1.95);
        ctx!.stroke();
        ctx!.restore();
      }
    }

    function drawPlants(t: number, ox: number, oy: number) {
      const vmin = Math.min(width, height);
      for (const p of PLANTS) {
        const bx = p.x * width + ox * 0.6;
        const by = p.y * height + oy * 0.6;
        const L = p.s * vmin;
        for (let i = 0; i < p.n; i += 1) {
          const f = i / (p.n - 1 || 1);
          const ang = p.rot + (f - 0.5) * p.spread;
          const sway = Math.sin(t * p.speed + i * 0.8 + p.rot) * 0.1;
          const len = L * (0.6 + 0.4 * Math.sin(f * Math.PI + 1.1));
          const w = L * 0.045;
          ctx!.save();
          ctx!.translate(bx, by);
          ctx!.rotate(ang + sway);
          const g = ctx!.createLinearGradient(0, 0, len, 0);
          g.addColorStop(0, "rgba(3, 24, 38, 0.92)");
          g.addColorStop(0.6, "rgba(10, 48, 68, 0.78)");
          g.addColorStop(1, "rgba(24, 84, 104, 0.3)");
          ctx!.fillStyle = g;
          ctx!.beginPath();
          ctx!.moveTo(0, -w);
          ctx!.quadraticCurveTo(len * 0.55, -w * 1.5 + sway * len * 0.25, len, sway * len * 0.5);
          ctx!.quadraticCurveTo(len * 0.55, w * 1.5 + sway * len * 0.25, 0, w);
          ctx!.closePath();
          ctx!.fill();
          ctx!.restore();
        }
      }
    }

    function drawKoi(k: KoiSpec, t: number, ox: number, oy: number) {
      const pal = PALETTES[k.palette];
      const vmin = Math.min(width, height);
      const tt = t * k.speed * 2 * Math.PI + k.phase;
      const a = koiPosition(k, tt);
      const b = koiPosition(k, tt + 0.01);
      const depth = k.depth;
      const x = a.x * width + ox * (0.25 + depth * 0.9);
      const y = a.y * height + oy * (0.25 + depth * 0.9);
      const ang = Math.atan2((b.y - a.y) * height, (b.x - a.x) * width);
      const L = k.len * vmin * (0.6 + depth * 0.65);
      const half = L * 0.15;
      const alpha = 0.3 + depth * 0.62;
      const blur = (1 - depth) * 5;

      ctx!.save();
      ctx!.globalAlpha = alpha;
      if (supportsFilter && blur > 0.4) ctx!.filter = `blur(${blur.toFixed(2)}px)`;
      ctx!.translate(x, y);
      ctx!.rotate(ang);

      // Soft shadow cast on the pond floor.
      ctx!.save();
      ctx!.globalAlpha = alpha * 0.28;
      ctx!.fillStyle = "#01111d";
      ctx!.beginPath();
      ctx!.ellipse(-L * 0.06, L * 0.13 + half * 0.6, L * 0.47, half * 1.15, 0, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.restore();

      const steps = 22;
      const spine: Vec[] = [];
      for (let i = 0; i <= steps; i += 1) {
        const s = i / steps;
        const amp = L * 0.06 * Math.pow(s, 1.5);
        spine.push({
          x: L * (0.52 - s * 1.04),
          y: amp * Math.sin(s * 4.1 - t * k.tailFreq * 2 + k.phase),
        });
      }

      const left: Vec[] = [];
      const right: Vec[] = [];
      for (let i = 0; i <= steps; i += 1) {
        const s = i / steps;
        const prev = spine[Math.max(0, i - 1)];
        const next = spine[Math.min(steps, i + 1)];
        const tx = next.x - prev.x;
        const ty = next.y - prev.y;
        const m = Math.hypot(tx, ty) || 1;
        const nx = -ty / m;
        const ny = tx / m;
        const w = bodyWidth(s) * half;
        left.push({ x: spine[i].x + nx * w, y: spine[i].y + ny * w });
        right.push({ x: spine[i].x - nx * w, y: spine[i].y - ny * w });
      }

      const tailBase = spine[steps];
      const tailPrev = spine[steps - 2];
      const tAng = Math.atan2(tailBase.y - tailPrev.y, tailBase.x - tailPrev.x);
      const tailLen = L * 0.4;
      const spread = L * 0.3;
      const flick = Math.sin(-t * k.tailFreq * 2 + k.phase + 1.2) * 0.3;

      // Caudal fin — translucent, trailing the spine.
      ctx!.save();
      ctx!.translate(tailBase.x, tailBase.y);
      ctx!.rotate(tAng + flick * 0.35);
      ctx!.globalAlpha = alpha * 0.55;
      const tg = ctx!.createLinearGradient(0, 0, tailLen, 0);
      tg.addColorStop(0, pal.fin);
      tg.addColorStop(1, "rgba(220, 240, 245, 0.05)");
      ctx!.fillStyle = tg;
      ctx!.beginPath();
      ctx!.moveTo(0, 0);
      ctx!.quadraticCurveTo(tailLen * 0.5, -spread * 0.25, tailLen, -spread * 0.52 + flick * spread);
      ctx!.quadraticCurveTo(tailLen * 0.62, 0, tailLen * 0.52, 0);
      ctx!.quadraticCurveTo(tailLen * 0.62, 0, tailLen, spread * 0.52 + flick * spread);
      ctx!.quadraticCurveTo(tailLen * 0.5, spread * 0.25, 0, 0);
      ctx!.closePath();
      ctx!.fill();
      ctx!.restore();

      // Pectoral fins.
      const finS = 0.26;
      const fi = Math.round(finS * steps);
      const flap = Math.sin(t * k.tailFreq * 2.6 + k.phase) * 0.25;
      for (const side of [-1, 1]) {
        ctx!.save();
        ctx!.globalAlpha = alpha * 0.4;
        ctx!.translate(spine[fi].x, spine[fi].y + side * half * 0.7);
        ctx!.rotate(side * (0.75 + flap));
        ctx!.fillStyle = pal.fin;
        ctx!.beginPath();
        ctx!.ellipse(-L * 0.08, 0, L * 0.11, L * 0.035, 0, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }

      const body = new Path2D();
      traceSmooth(body, [...left, ...right.slice().reverse()]);
      body.closePath();

      ctx!.fillStyle = pal.body;
      ctx!.fill(body);

      ctx!.save();
      ctx!.clip(body);
      for (const p of k.patches) {
        const pi = Math.round(p.s * steps);
        const sp = spine[Math.min(steps, pi)];
        ctx!.globalAlpha = alpha * (pal.accent ? 0.95 : 0.6);
        ctx!.fillStyle = pal.patch;
        ctx!.beginPath();
        ctx!.ellipse(
          sp.x,
          sp.y + p.side * half * 0.4,
          L * p.rx,
          half * p.ry,
          Math.sin(p.s * 6) * 0.3,
          0,
          Math.PI * 2,
        );
        ctx!.fill();
      }
      // Spine highlight — the sun catching the dorsal line.
      ctx!.globalAlpha = alpha * 0.35;
      ctx!.globalCompositeOperation = "screen";
      const hg = ctx!.createLinearGradient(0, -half, 0, half);
      hg.addColorStop(0, "rgba(255,255,255,0)");
      hg.addColorStop(0.5, "rgba(214, 245, 250, 0.9)");
      hg.addColorStop(1, "rgba(255,255,255,0)");
      ctx!.fillStyle = hg;
      ctx!.fillRect(-L, -half, L * 2, half * 2);
      ctx!.restore();

      // Eyes.
      ctx!.globalAlpha = alpha * 0.8;
      ctx!.fillStyle = "rgba(6, 28, 42, 0.85)";
      for (const side of [-1, 1]) {
        ctx!.beginPath();
        ctx!.ellipse(L * 0.4, side * half * 0.42, L * 0.014, L * 0.014, 0, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.filter = "none";
      ctx!.restore();
    }

    function drawParticles(t: number, ox: number, oy: number) {
      ctx!.save();
      ctx!.globalCompositeOperation = "screen";
      for (const p of particles) {
        const y = (p.y - t * p.sp) % 1;
        const yy = (y < 0 ? y + 1 : y) * height + oy * 0.8;
        const xx =
          p.x * width + Math.sin(t * 0.3 + p.ph) * width * 0.012 + ox * 0.8;
        ctx!.globalAlpha = 0.1 + 0.12 * (0.5 + 0.5 * Math.sin(t * 0.6 + p.ph));
        ctx!.fillStyle = "rgba(186, 235, 244, 1)";
        ctx!.beginPath();
        ctx!.arc(xx, yy, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.restore();
    }

    function drawDepth() {
      const g = ctx!.createLinearGradient(0, height * 0.45, 0, height);
      g.addColorStop(0, "rgba(1, 16, 28, 0)");
      g.addColorStop(1, "rgba(1, 13, 23, 0.85)");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, height * 0.45, width, height * 0.55);
    }

    function frame(now: number) {
      if (!running) return;
      const t = reduceMotion ? 8 : now / 1000;

      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;
      const ox = pointer.x * Math.min(width, height) * 0.03;
      const oy = pointer.y * Math.min(width, height) * 0.02;

      drawWater();

      const sorted = KOI;
      for (const k of sorted) {
        if (k.depth > 0.45) continue;
        drawKoi(k, t, ox, oy);
      }

      paintCaustics(t);
      ctx!.save();
      ctx!.globalCompositeOperation = "screen";
      ctx!.globalAlpha = 0.62;
      ctx!.imageSmoothingEnabled = true;
      ctx!.imageSmoothingQuality = "high";
      const pad = Math.min(width, height) * 0.05;
      ctx!.drawImage(
        caustic,
        -pad + ox * 0.6,
        -pad + oy * 0.6,
        width + pad * 2,
        height + pad * 2,
      );
      ctx!.restore();

      drawRays(t, ox);

      for (const k of sorted) {
        if (k.depth <= 0.45) continue;
        drawKoi(k, t, ox, oy);
      }

      drawPlants(t, ox, oy);
      drawStones(ox, oy);
      drawParticles(t, ox, oy);
      drawDepth();

      if (!reduceMotion) raf = requestAnimationFrame(frame);
    }

    const onPointerMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduceMotion) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (reduceMotion) frame(0);
    });

    resize();
    ro.observe(canvas);
    raf = requestAnimationFrame(frame);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="pond" aria-hidden="true" />;
}
