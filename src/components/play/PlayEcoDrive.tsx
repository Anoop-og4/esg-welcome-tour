import { useEffect, useRef, useState, useCallback } from "react";
import {
  Play, Pause, RotateCcw, Trophy, Battery as BatteryIcon,
  ChevronLeft, ChevronRight, Shield as ShieldIcon,
  Magnet as MagnetIcon, Sparkles, Gauge, Flame, LogOut,
} from "lucide-react";
import { loadState, saveState } from "@/lib/esgPlay";
import { toast } from "@/hooks/use-toast";

/**
 * Eco Drive — a polished 3-lane endless runner.
 * Drive an EV, collect green energy, dodge pollution, chain combos,
 * grab power-ups, manage your battery. Points convert to ESG XP (E pillar).
 */

type ItemKind =
  | "leaf" | "charge" | "recycle"
  | "barrel" | "smoke"
  | "shield" | "magnet" | "bonus";

interface RoadItem {
  id: number;
  lane: 0 | 1 | 2;
  y: number;
  kind: ItemKind;
  wobble: number;
  vx: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  gravity: number;
}

interface ScenicObject {
  side: -1 | 1;          // left or right
  y: number;
  kind: "tree" | "lamp" | "bush";
  scale: number;
}

const LANES = 3;
const ROAD_W = 360;
const ROAD_H = 560;
const PLAYER_Y_CENTER = ROAD_H - 100;
const ROAD_EDGE = 46;    // shoulder width
const HIGH_KEY = "esgplay:ecodrive:high";

const KIND_META: Record<ItemKind, { pts: number; bad?: boolean; power?: "shield" | "magnet" | "bonus" }> = {
  leaf:    { pts: 10 },
  recycle: { pts: 15 },
  charge:  { pts: 20 },
  barrel:  { pts: 0, bad: true },
  smoke:   { pts: 0, bad: true },
  shield:  { pts: 25, power: "shield" },
  magnet:  { pts: 25, power: "magnet" },
  bonus:   { pts: 25, power: "bonus" },
};

const STAGES = [
  { speed: 0,   name: "Morning Drive"   },
  { speed: 6,   name: "City Rush"       },
  { speed: 7.5, name: "Highway Run"     },
  { speed: 9,   name: "Overdrive"       },
  { speed: 10.5, name: "Lightspeed"     },
];

function pickKind(speed: number): ItemKind {
  const r = Math.random();
  // Rare power-ups (~3%)
  if (r < 0.03) {
    const powers: ItemKind[] = ["shield", "magnet", "bonus"];
    return powers[Math.floor(Math.random() * powers.length)];
  }
  // Hazards scale with speed
  const badShare = 0.30 + Math.min(0.18, (speed - 4) * 0.03);
  if (r < 0.03 + badShare * 0.55) return "barrel";
  if (r < 0.03 + badShare)        return "smoke";
  // Pickups
  const gr = Math.random();
  if (gr < 0.42) return "leaf";
  if (gr < 0.78) return "recycle";
  return "charge";
}

function laneCenter(lane: number) {
  const usable = ROAD_W - ROAD_EDGE * 2;
  return ROAD_EDGE + usable * ((lane + 0.5) / LANES);
}

/* -------------------- canvas draw helpers -------------------- */

function drawRoad(ctx: CanvasRenderingContext2D, stripeOffset: number, stage: number) {
  // Night tint gets deeper as stage advances
  const darkness = Math.min(0.5, stage * 0.08);
  const asphaltTop = `rgb(${44 - darkness * 22}, ${44 - darkness * 22}, ${48 - darkness * 22})`;
  const asphaltBot = `rgb(${28 - darkness * 16}, ${28 - darkness * 16}, ${32 - darkness * 16})`;

  // Asphalt
  const grad = ctx.createLinearGradient(0, 0, 0, ROAD_H);
  grad.addColorStop(0, asphaltTop);
  grad.addColorStop(1, asphaltBot);
  ctx.fillStyle = grad;
  ctx.fillRect(ROAD_EDGE, 0, ROAD_W - ROAD_EDGE * 2, ROAD_H);

  // Curbs
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(ROAD_EDGE - 3, 0, 3, ROAD_H);
  ctx.fillRect(ROAD_W - ROAD_EDGE, 0, 3, ROAD_H);

  // Painted outer solid lines
  ctx.fillStyle = "#fef08a";
  ctx.fillRect(ROAD_EDGE + 2, 0, 2, ROAD_H);
  ctx.fillRect(ROAD_W - ROAD_EDGE - 4, 0, 2, ROAD_H);

  // Dashed lane dividers
  ctx.fillStyle = "#fde68a";
  for (let i = 1; i < LANES; i++) {
    const x = ROAD_EDGE + ((ROAD_W - ROAD_EDGE * 2) * i) / LANES - 2;
    for (let y = -60 + (stripeOffset % 60); y < ROAD_H; y += 60) {
      ctx.fillRect(x, y, 4, 28);
    }
  }
}

function drawGrass(ctx: CanvasRenderingContext2D, stage: number) {
  const nightDim = Math.min(0.45, stage * 0.08);
  const g = ctx.createLinearGradient(0, 0, 0, ROAD_H);
  const lift = (v: number) => Math.max(0, Math.floor(v * (1 - nightDim)));
  g.addColorStop(0, `rgb(${lift(24)}, ${lift(70)}, ${lift(48)})`);
  g.addColorStop(1, `rgb(${lift(16)}, ${lift(48)}, ${lift(32)})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, ROAD_EDGE, ROAD_H);
  ctx.fillRect(ROAD_W - ROAD_EDGE, 0, ROAD_EDGE, ROAD_H);
}

function drawScenic(ctx: CanvasRenderingContext2D, scenic: ScenicObject[]) {
  for (const o of scenic) {
    const x = o.side < 0 ? ROAD_EDGE / 2 + (Math.sin(o.y * 0.02) * 6) : ROAD_W - ROAD_EDGE / 2 + (Math.sin(o.y * 0.02) * 6);
    ctx.save();
    ctx.translate(x, o.y);
    ctx.scale(o.scale, o.scale);
    if (o.kind === "tree") {
      // trunk
      ctx.fillStyle = "#4b2e18";
      ctx.fillRect(-3, 0, 6, 16);
      // crown
      ctx.fillStyle = "#2f7a3c";
      ctx.beginPath();
      ctx.arc(0, -8, 14, 0, Math.PI * 2);
      ctx.arc(-8, -2, 10, 0, Math.PI * 2);
      ctx.arc(8, -2, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3ea24e";
      ctx.beginPath();
      ctx.arc(-3, -12, 7, 0, Math.PI * 2);
      ctx.arc(5, -10, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (o.kind === "bush") {
      ctx.fillStyle = "#2c6a3a";
      ctx.beginPath();
      ctx.arc(-4, 0, 6, 0, Math.PI * 2);
      ctx.arc(4, 0, 6, 0, Math.PI * 2);
      ctx.arc(0, -4, 7, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // lamp post
      ctx.fillStyle = "#1f1f23";
      ctx.fillRect(-1.5, -18, 3, 34);
      ctx.beginPath();
      ctx.arc(0, -22, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#facc15";
      ctx.fill();
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(0, -22, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
}

function drawItem(ctx: CanvasRenderingContext2D, it: RoadItem) {
  const cx = laneCenter(it.lane) + it.vx;
  const cy = it.y + Math.sin(it.wobble) * 2;
  ctx.save();
  ctx.translate(cx, cy);
  if (it.kind === "leaf") {
    ctx.rotate(Math.sin(it.wobble) * 0.2);
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#166534";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -18); ctx.lineTo(0, 18);
    ctx.moveTo(0, -8); ctx.lineTo(8, -2);
    ctx.moveTo(0, -8); ctx.lineTo(-8, -2);
    ctx.moveTo(0, 4); ctx.lineTo(7, 10);
    ctx.moveTo(0, 4); ctx.lineTo(-7, 10);
    ctx.stroke();
  } else if (it.kind === "recycle") {
    ctx.fillStyle = "#0ea5e9";
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.moveTo(-6, -6); ctx.lineTo(6, -6); ctx.lineTo(3, -2);
      ctx.stroke();
      ctx.restore();
    }
  } else if (it.kind === "charge") {
    // Lightning bolt in gold
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
    g.addColorStop(0, "#fff7b0");
    g.addColorStop(1, "#f59e0b");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-4, -18);
    ctx.lineTo(6, -4);
    ctx.lineTo(1, -2);
    ctx.lineTo(6, 18);
    ctx.lineTo(-4, 2);
    ctx.lineTo(1, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#854d0e";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  } else if (it.kind === "barrel") {
    ctx.fillStyle = "#1f1f23";
    ctx.fillRect(-14, -18, 28, 36);
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(-14, -18, 28, 4);
    ctx.fillRect(-14, 14, 28, 4);
    ctx.strokeStyle = "#d48a00";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-13, -10, 26, 8);
    ctx.strokeRect(-13, 4, 26, 8);
    // danger drip
    ctx.fillStyle = "#b45309";
    ctx.fillRect(-6, -2, 12, 4);
  } else if (it.kind === "smoke") {
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#6b7280";
    ctx.beginPath();
    ctx.arc(-8, 0, 12, 0, Math.PI * 2);
    ctx.arc(8, -2, 14, 0, Math.PI * 2);
    ctx.arc(0, 6, 11, 0, Math.PI * 2);
    ctx.arc(-2, -6, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#9ca3af";
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  } else if (it.kind === "shield") {
    drawPowerupBadge(ctx, "#3b82f6", () => {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(7, -4);
      ctx.lineTo(7, 4);
      ctx.lineTo(0, 10);
      ctx.lineTo(-7, 4);
      ctx.lineTo(-7, -4);
      ctx.closePath();
      ctx.stroke();
    });
  } else if (it.kind === "magnet") {
    drawPowerupBadge(ctx, "#ef4444", () => {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 2, 7, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-7, 2); ctx.lineTo(-7, 6);
      ctx.moveTo(7, 2); ctx.lineTo(7, 6);
      ctx.stroke();
    });
  } else if (it.kind === "bonus") {
    drawPowerupBadge(ctx, "#a855f7", () => {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("2×", 0, 1);
    });
  }
  ctx.restore();
}

function drawPowerupBadge(ctx: CanvasRenderingContext2D, color: string, inner: () => void) {
  // glow
  const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 24);
  glow.addColorStop(0, color + "aa");
  glow.addColorStop(1, color + "00");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.fill();
  // disc
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();
  inner();
}

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, tilt: number, shield: number, t: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt * 0.12);

  // Ground shadow
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(0, 34, 24, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Headlight beams
  const beam = ctx.createLinearGradient(0, -40, 0, -130);
  beam.addColorStop(0, "rgba(255,240,170,0.55)");
  beam.addColorStop(1, "rgba(255,240,170,0)");
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(-13, -28); ctx.lineTo(-22, -130); ctx.lineTo(22, -130); ctx.lineTo(13, -28);
  ctx.closePath();
  ctx.fill();

  // Under-car EV glow
  const glow = ctx.createRadialGradient(0, 20, 4, 0, 20, 30);
  glow.addColorStop(0, "rgba(56,189,248,0.75)");
  glow.addColorStop(1, "rgba(56,189,248,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 22, 26, 0, Math.PI * 2);
  ctx.fill();

  // Body (rear wider)
  const body = ctx.createLinearGradient(-20, 0, 20, 0);
  body.addColorStop(0, "#0f4c8a");
  body.addColorStop(0.5, "#1d9bf0");
  body.addColorStop(1, "#0f4c8a");
  ctx.fillStyle = body;
  roundRect(ctx, -18, -30, 36, 60, 7);
  ctx.fill();

  // Roof / cabin
  ctx.fillStyle = "#0a2540";
  roundRect(ctx, -14, -18, 28, 28, 4);
  ctx.fill();

  // Windshield
  const win = ctx.createLinearGradient(0, -16, 0, 4);
  win.addColorStop(0, "#93c5fd");
  win.addColorStop(1, "#1e3a8a");
  ctx.fillStyle = win;
  roundRect(ctx, -12, -14, 24, 18, 3);
  ctx.fill();
  // rear window
  ctx.fillStyle = "#0b1e44";
  roundRect(ctx, -11, 0, 22, 8, 2);
  ctx.fill();

  // Hood trim
  ctx.fillStyle = "#0b1e44";
  ctx.fillRect(-15, -26, 30, 2);

  // Headlights
  ctx.fillStyle = "#fef9c3";
  ctx.fillRect(-14, -30, 6, 4);
  ctx.fillRect(8, -30, 6, 4);

  // Tail lights (red)
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(-15, 28, 6, 3);
  ctx.fillRect(9, 28, 6, 3);

  // Wheels
  ctx.fillStyle = "#0a0a0a";
  roundRect(ctx, -20, -22, 4, 14, 2);
  ctx.fill();
  roundRect(ctx, 16, -22, 4, 14, 2);
  ctx.fill();
  roundRect(ctx, -20, 10, 4, 14, 2);
  ctx.fill();
  roundRect(ctx, 16, 10, 4, 14, 2);
  ctx.fill();

  // Shield aura
  if (shield > 0) {
    const pulse = 1 + Math.sin(t * 0.012) * 0.08;
    ctx.strokeStyle = `rgba(59,130,246,${0.55 + Math.sin(t * 0.02) * 0.2})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 36 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(125,211,252,0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 42 * pulse, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawParticles(ctx: CanvasRenderingContext2D, ps: Particle[]) {
  for (const p of ps) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* -------------------- main component -------------------- */

export default function PlayEcoDrive() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // HUD state (React-side; updated at low frequency)
  const [hud, setHud] = useState({
    score: 0, coins: 0, speed: 4, battery: 100,
    combo: 0, multiplier: 1,
    shield: 0, magnet: 0, bonus: 0,
    stageName: "Morning Drive",
  });
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);
  const [countdown, setCountdown] = useState(0); // 3,2,1,0
  const [stageBanner, setStageBanner] = useState("");
  const [high, setHigh] = useState<number>(() => Number(localStorage.getItem(HIGH_KEY) || 0));
  const [endStats, setEndStats] = useState<{ score: number; coins: number; distance: number; best: number; xp: number; reason: string } | null>(null);

  // Mutable game state
  const gRef = useRef({
    lane: 1 as 0 | 1 | 2,
    targetLane: 1 as 0 | 1 | 2,
    playerX: laneCenter(1),
    tilt: 0,
    items: [] as RoadItem[],
    particles: [] as Particle[],
    scenic: [] as ScenicObject[],
    score: 0,
    coins: 0,
    speed: 4,
    distance: 0,
    battery: 100,
    combo: 0,
    comboTimer: 0,
    shield: 0,
    magnet: 0,
    bonus: 0,
    invuln: 0,
    shake: 0,
    flashR: 0,
    flashG: 0,
    stripeOffset: 0,
    spawnTimer: 0,
    scenicTimer: 0,
    stageIdx: 0,
    stageBannerT: 0,
    nextId: 1,
    t: 0,
    starting: false,
  });

  /* ---------- reset & start ---------- */
  const reset = useCallback(() => {
    const g = gRef.current;
    g.lane = 1; g.targetLane = 1; g.playerX = laneCenter(1); g.tilt = 0;
    g.items = []; g.particles = []; g.scenic = [];
    g.score = 0; g.coins = 0; g.speed = 4; g.distance = 0; g.battery = 100;
    g.combo = 0; g.comboTimer = 0; g.shield = 0; g.magnet = 0; g.bonus = 0;
    g.invuln = 0; g.shake = 0; g.flashR = 0; g.flashG = 0;
    g.stripeOffset = 0; g.spawnTimer = 0; g.scenicTimer = 0;
    g.stageIdx = 0; g.stageBannerT = 0; g.nextId = 1;
    setEndStats(null);
    setStageBanner("");
  }, []);

  const start = useCallback(() => {
    if (over) reset();
    setOver(false);
    setPaused(false);
    setCountdown(3);
    gRef.current.starting = true;
    setRunning(true);
  }, [over, reset]);

  const endGame = useCallback((reason: string) => {
    const g = gRef.current;
    setRunning(false);
    setPaused(false);
    setOver(true);

    const finalScore = Math.floor(g.score);
    const finalCoins = g.coins;
    const dist = Math.floor(g.distance);

    let nextHigh = high;
    if (finalScore > high) {
      nextHigh = finalScore;
      setHigh(finalScore);
      localStorage.setItem(HIGH_KEY, String(finalScore));
    }

    const xpGain = Math.floor(finalCoins / 2);
    if (xpGain > 0) {
      const s = loadState();
      s.xp += xpGain;
      s.scores.E += xpGain;
      if (!s.badges.includes("eco_driver")) s.badges.push("eco_driver");
      saveState(s);
      toast({ title: "🏁 Run complete", description: `+${xpGain} ESG XP to your Environmental pillar` });
    }
    setEndStats({ score: finalScore, coins: finalCoins, distance: dist, best: nextHigh, xp: xpGain, reason });
  }, [high]);

  /* ---------- countdown ---------- */
  useEffect(() => {
    if (!running || countdown === 0 || paused) return;
    const t = setTimeout(() => {
      if (countdown === 1) {
        setCountdown(0);
        gRef.current.starting = false;
      } else {
        setCountdown((c) => c - 1);
      }
    }, 700);
    return () => clearTimeout(t);
  }, [running, countdown, paused]);

  /* ---------- game loop ---------- */
  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let rafId = 0;
    let last = 0;
    let hudTick = 0;

    const spawnParticles = (x: number, y: number, color: string, n: number, burst = 3) => {
      const g = gRef.current;
      for (let i = 0; i < n; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 0.5 + Math.random() * burst;
        g.particles.push({
          x, y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 0.5,
          life: 600 + Math.random() * 400,
          maxLife: 900,
          color,
          size: 1.5 + Math.random() * 2.5,
          gravity: 0.002,
        });
      }
    };

    const loop = (ts: number) => {
      if (!last) last = ts;
      const raw = ts - last;
      last = ts;
      // Cap dt so tab-switches don't teleport the world
      const dt = Math.min(48, raw);
      const g = gRef.current;
      g.t += dt;

      // Pause / countdown: render but do not simulate
      const simulate = !paused && !g.starting;

      if (simulate) {
        // Stage progression
        let newStage = 0;
        for (let i = 0; i < STAGES.length; i++) if (g.speed >= STAGES[i].speed) newStage = i;
        if (newStage !== g.stageIdx) {
          g.stageIdx = newStage;
          setStageBanner(STAGES[newStage].name);
          g.stageBannerT = 1600;
          setHud((h) => ({ ...h, stageName: STAGES[newStage].name }));
        }
        if (g.stageBannerT > 0) {
          g.stageBannerT -= dt;
          if (g.stageBannerT <= 0) setStageBanner("");
        }

        // Smooth lane X toward target
        const targetX = laneCenter(g.targetLane);
        const dx = targetX - g.playerX;
        g.playerX += dx * Math.min(0.35, dt * 0.012);
        g.tilt = Math.max(-1, Math.min(1, dx / 40));

        // Stripes + distance
        g.stripeOffset = (g.stripeOffset + g.speed * dt * 0.08) % 60;
        g.distance += g.speed * dt * 0.012;
        g.speed = Math.min(11, g.speed + dt * 0.00018);

        // Battery drain (faster at higher speed)
        g.battery -= dt * (0.0045 + g.speed * 0.00025);

        // Power-up timers
        if (g.shield > 0)  g.shield  = Math.max(0, g.shield  - dt);
        if (g.magnet > 0)  g.magnet  = Math.max(0, g.magnet  - dt);
        if (g.bonus > 0)   g.bonus   = Math.max(0, g.bonus   - dt);
        if (g.invuln > 0)  g.invuln  = Math.max(0, g.invuln  - dt);
        if (g.shake > 0)   g.shake   = Math.max(0, g.shake   - dt);
        if (g.flashR > 0)  g.flashR  = Math.max(0, g.flashR  - dt);
        if (g.flashG > 0)  g.flashG  = Math.max(0, g.flashG  - dt);

        // Combo decay
        if (g.combo > 0) {
          g.comboTimer -= dt;
          if (g.comboTimer <= 0) g.combo = 0;
        }

        // Spawn items (denser as speed increases)
        g.spawnTimer += dt;
        const spawnInt = Math.max(320, 880 - g.speed * 48);
        if (g.spawnTimer > spawnInt) {
          g.spawnTimer = 0;
          const lane = Math.floor(Math.random() * LANES) as 0 | 1 | 2;
          g.items.push({
            id: g.nextId++,
            lane, y: -40, kind: pickKind(g.speed),
            wobble: Math.random() * Math.PI * 2, vx: 0,
          });
        }

        // Spawn scenic objects
        g.scenicTimer += dt;
        if (g.scenicTimer > 220) {
          g.scenicTimer = 0;
          const side = (Math.random() < 0.5 ? -1 : 1) as -1 | 1;
          const kind: ScenicObject["kind"] = Math.random() < 0.55 ? "tree" : Math.random() < 0.6 ? "bush" : "lamp";
          g.scenic.push({ side, y: -30, kind, scale: 0.9 + Math.random() * 0.5 });
        }

        // Advance scenic
        for (const s of g.scenic) s.y += g.speed * dt * 0.18;
        g.scenic = g.scenic.filter((s) => s.y < ROAD_H + 40);

        // Move items + magnet pull + collisions
        const playerX = g.playerX;
        const playerY = PLAYER_Y_CENTER;
        const nextItems: RoadItem[] = [];
        for (const it of g.items) {
          it.y += g.speed * dt * 0.2;
          it.wobble += dt * 0.006;
          // magnet pulls good items toward player
          if (g.magnet > 0 && !KIND_META[it.kind].bad) {
            const tx = playerX;
            const cx = laneCenter(it.lane) + it.vx;
            const pull = Math.max(0, 1 - Math.abs(it.y - playerY) / 280);
            it.vx += (tx - cx) * 0.06 * pull;
          }
          if (it.y > ROAD_H + 40) continue;

          const ix = laneCenter(it.lane) + it.vx;
          const dxC = ix - playerX;
          const dyC = it.y - playerY;
          const inHit = Math.abs(dxC) < 22 && Math.abs(dyC) < 32;

          if (inHit) {
            const meta = KIND_META[it.kind];
            if (meta.bad) {
              if (g.shield > 0 || g.invuln > 0) {
                if (g.shield > 0) {
                  g.shield = 0;
                  g.invuln = 1200;
                  g.flashG = 280;
                  spawnParticles(playerX, playerY, "#60a5fa", 24, 5);
                  toast({ title: "🛡️ Shield absorbed!", description: "Nice recovery" });
                }
                // consumed item, no damage
              } else {
                // crash
                g.shake = 600;
                g.flashR = 400;
                spawnParticles(playerX, playerY, "#ef4444", 26, 5);
                spawnParticles(playerX, playerY, "#facc15", 10, 4);
                // schedule endGame after this frame
                setTimeout(() => endGame(it.kind === "barrel" ? "Hit an oil barrel" : "Hit a smoke cloud"), 0);
              }
              continue; // remove item
            } else {
              // good pickup
              g.combo += 1;
              g.comboTimer = 2400;
              const mult = (g.bonus > 0 ? 2 : 1) * (1 + Math.min(4, Math.floor(g.combo / 4)));
              const pts = meta.pts * mult;
              g.score += pts;
              g.coins += 1;

              if (meta.power === "shield") { g.shield = 6000; toast({ title: "🛡️ Shield up!", description: "One hit blocked" }); }
              if (meta.power === "magnet") { g.magnet = 6000; toast({ title: "🧲 Magnet active", description: "Pulling pickups" }); }
              if (meta.power === "bonus")  { g.bonus  = 8000; toast({ title: "✨ 2× score", description: "Stack those points" }); }
              if (it.kind === "charge")    { g.battery = Math.min(100, g.battery + 18); }

              spawnParticles(ix, it.y, meta.power ? "#ffffff" : (it.kind === "charge" ? "#fbbf24" : "#4ade80"), 14, 3);
              continue;
            }
          }
          nextItems.push(it);
        }
        g.items = nextItems;

        // Passive score (distance based)
        g.score += g.speed * dt * 0.004 * (g.bonus > 0 ? 2 : 1);

        // Particles step
        for (const p of g.particles) {
          p.x += p.vx * dt * 0.1;
          p.y += p.vy * dt * 0.1;
          p.vy += p.gravity * dt;
          p.life -= dt;
        }
        g.particles = g.particles.filter((p) => p.life > 0);

        // Battery death
        if (g.battery <= 0) {
          g.battery = 0;
          setTimeout(() => endGame("Battery depleted"), 0);
        }
      } // end simulate

      /* ---------- render ---------- */
      // clear
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, ROAD_W, ROAD_H);

      // screen shake
      ctx.save();
      if (g.shake > 0) {
        const k = g.shake / 600;
        ctx.translate((Math.random() - 0.5) * 10 * k, (Math.random() - 0.5) * 10 * k);
      }

      drawGrass(ctx, g.stageIdx);
      drawRoad(ctx, g.stripeOffset, g.stageIdx);
      drawScenic(ctx, g.scenic);
      for (const it of g.items) drawItem(ctx, it);

      drawParticles(ctx, g.particles);

      // Magnet aura under car
      if (g.magnet > 0) {
        ctx.save();
        ctx.globalAlpha = 0.25 + Math.sin(g.t * 0.01) * 0.08;
        const radGrad = ctx.createRadialGradient(g.playerX, PLAYER_Y_CENTER, 4, g.playerX, PLAYER_Y_CENTER, 130);
        radGrad.addColorStop(0, "rgba(239,68,68,0.6)");
        radGrad.addColorStop(1, "rgba(239,68,68,0)");
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(g.playerX, PLAYER_Y_CENTER, 130, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      drawPlayer(ctx, g.playerX, PLAYER_Y_CENTER, g.tilt, g.shield, g.t);

      // flash overlays
      if (g.flashR > 0) {
        ctx.fillStyle = `rgba(239,68,68,${(g.flashR / 400) * 0.6})`;
        ctx.fillRect(0, 0, ROAD_W, ROAD_H);
      }
      if (g.flashG > 0) {
        ctx.fillStyle = `rgba(59,130,246,${(g.flashG / 280) * 0.5})`;
        ctx.fillRect(0, 0, ROAD_W, ROAD_H);
      }

      // Vignette
      const vg = ctx.createRadialGradient(ROAD_W / 2, ROAD_H / 2, ROAD_H * 0.35, ROAD_W / 2, ROAD_H / 2, ROAD_H * 0.7);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, ROAD_W, ROAD_H);

      ctx.restore();

      // Sync HUD at ~10 Hz
      hudTick += dt;
      if (hudTick > 100) {
        hudTick = 0;
        setHud({
          score: Math.floor(g.score),
          coins: g.coins,
          speed: g.speed,
          battery: g.battery,
          combo: g.combo,
          multiplier: (g.bonus > 0 ? 2 : 1) * (1 + Math.min(4, Math.floor(g.combo / 4))),
          shield: g.shield,
          magnet: g.magnet,
          bonus: g.bonus,
          stageName: STAGES[g.stageIdx].name,
        });
      }

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [running, paused, endGame]);

  /* ---------- input ---------- */
  const moveLane = useCallback((dir: -1 | 1) => {
    if (!running || paused || gRef.current.starting) return;
    const next = Math.max(0, Math.min(2, gRef.current.targetLane + dir)) as 0 | 1 | 2;
    gRef.current.targetLane = next;
    gRef.current.lane = next;
  }, [running, paused]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") moveLane(-1);
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") moveLane(1);
      else if (e.key === " " || e.key === "Enter") {
        if (!running && !over) start();
        else if (over) start();
        else setPaused((p) => !p);
      } else if (e.key === "p" || e.key === "P" || e.key === "Escape") {
        if (running && !over) setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moveLane, running, over, start]);

  // Swipe
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) moveLane(dx < 0 ? -1 : 1);
    touchStart.current = null;
  };

  // DPR-aware canvas resize
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = ROAD_W * dpr;
    c.height = ROAD_H * dpr;
    c.style.width = "100%";
    c.style.height = `${ROAD_H}px`;
    const ctx = c.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  const xpPreview = Math.floor(hud.coins / 2);
  const batteryColor = hud.battery > 40 ? "bg-emerald-500" : hud.battery > 15 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="space-y-4 pb-8" ref={wrapRef}>
      {/* Header / HUD */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Arcade · ESG Series</p>
            <h2 className="text-xl font-extrabold tracking-tight">Eco Drive</h2>
            <p className="text-xs text-muted-foreground">Dodge pollution. Collect green energy. Earn ESG XP.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-primary/10 px-3 py-2 text-center min-w-[72px]">
              <p className="text-[9px] uppercase tracking-wider text-primary font-bold">Score</p>
              <p className="text-lg font-extrabold leading-none tabular-nums">{hud.score.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-amber-500/10 px-3 py-2 text-center min-w-[72px]">
              <p className="text-[9px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center gap-1">
                <Trophy size={10} /> Best
              </p>
              <p className="text-lg font-extrabold leading-none tabular-nums">{high.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Battery + Speed */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              <span className="flex items-center gap-1"><BatteryIcon size={11} /> Battery</span>
              <span className="tabular-nums">{Math.round(hud.battery)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div className={`h-full ${batteryColor} transition-[width] duration-200`} style={{ width: `${Math.max(0, Math.min(100, hud.battery))}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              <span className="flex items-center gap-1"><Gauge size={11} /> Speed</span>
              <span className="tabular-nums">{hud.speed.toFixed(1)}×</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-sky-500 transition-[width] duration-200" style={{ width: `${Math.min(100, ((hud.speed - 4) / 7) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Power / combo strip */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px]">
          <span className={`flex items-center gap-1 rounded-full px-2 py-1 ${hud.combo >= 4 ? "bg-orange-500/15 text-orange-600" : "bg-muted text-muted-foreground"}`}>
            <Flame size={12} /> Combo {hud.combo} · {hud.multiplier}×
          </span>
          {hud.shield > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-300 px-2 py-1 font-semibold">
              <ShieldIcon size={12} /> {(hud.shield / 1000).toFixed(1)}s
            </span>
          )}
          {hud.magnet > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300 px-2 py-1 font-semibold">
              <MagnetIcon size={12} /> {(hud.magnet / 1000).toFixed(1)}s
            </span>
          )}
          {hud.bonus > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 px-2 py-1 font-semibold">
              <Sparkles size={12} /> 2× · {(hud.bonus / 1000).toFixed(1)}s
            </span>
          )}
          <span className="ml-auto text-muted-foreground">← → / A·D / swipe</span>
        </div>
      </div>

      {/* Canvas / stage */}
      <div
        className="relative mx-auto overflow-hidden rounded-3xl shadow-2xl select-none bg-black"
        style={{ width: "100%", maxWidth: ROAD_W, height: ROAD_H }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />

        {/* Stage banner */}
        {stageBanner && (
          <div className="pointer-events-none absolute top-10 left-0 right-0 flex justify-center">
            <div className="rounded-full bg-black/60 backdrop-blur px-5 py-2 text-white text-sm font-extrabold tracking-widest uppercase animate-pulse">
              {stageBanner}
            </div>
          </div>
        )}

        {/* Countdown */}
        {running && countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div
              key={countdown}
              className="text-white text-[96px] font-black leading-none animate-ping-slow"
              style={{ textShadow: "0 4px 24px rgba(0,0,0,0.6)", animation: "pulse 0.7s ease-out" }}
            >
              {countdown}
            </div>
          </div>
        )}

        {/* Start overlay */}
        {!running && !over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 backdrop-blur-sm px-6 text-center">
            <div className="rounded-2xl bg-white/5 border border-white/10 px-6 py-5 max-w-[300px]">
              <p className="text-5xl mb-1">🏁</p>
              <p className="text-white text-lg font-extrabold">Ready to drive green?</p>
              <p className="text-white/70 text-xs mt-1">Dodge oil &amp; smoke · collect leaves, ⚡ and power-ups</p>
              <button
                onClick={start}
                className="mt-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 flex items-center gap-2 shadow-lg active:scale-95 transition mx-auto"
              >
                <Play size={18} /> Start
              </button>
              <p className="text-[10px] text-white/50 mt-3">Space / Enter to start · P to pause</p>
            </div>
          </div>
        )}

        {/* Pause overlay */}
        {running && paused && !over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 backdrop-blur-sm">
            <p className="text-white text-xs font-semibold uppercase tracking-widest mb-1">Paused</p>
            <p className="text-white/80 text-sm mb-4">Breathe. You&apos;re doing great.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPaused(false)}
                className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-5 py-2.5 flex items-center gap-2 active:scale-95 transition"
              >
                <Play size={16} /> Resume
              </button>
              <button
                onClick={() => endGame("Ended manually")}
                className="rounded-full bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 flex items-center gap-2 active:scale-95 transition"
              >
                <LogOut size={16} /> End run
              </button>
            </div>
          </div>
        )}

        {/* Game over overlay */}
        {over && endStats && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm px-6">
            <div className="w-full max-w-[300px] rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
              <p className="text-5xl mb-1">{endStats.score > high && endStats.score > 0 ? "🏆" : "💥"}</p>
              <p className="text-white text-lg font-extrabold leading-tight">
                {endStats.score === endStats.best && endStats.score > 0 ? "New personal best!" : "Run over"}
              </p>
              <p className="text-white/60 text-xs">{endStats.reason}</p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-left">
                <Stat label="Score"     value={endStats.score.toLocaleString()} />
                <Stat label="Best"      value={endStats.best.toLocaleString()} />
                <Stat label="Distance"  value={`${endStats.distance} m`} />
                <Stat label="Pickups"   value={`${endStats.coins}`} />
                <Stat label="ESG XP"    value={`+${endStats.xp}`} highlight />
                <Stat label="Pillar"    value="Environmental" />
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={start}
                  className="flex-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-5 py-2.5 flex items-center justify-center gap-2 active:scale-95 transition"
                >
                  <RotateCcw size={16} /> Play again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pause button in-game */}
        {running && !paused && !over && countdown === 0 && (
          <button
            onClick={() => setPaused(true)}
            className="absolute top-3 right-3 rounded-full bg-black/40 backdrop-blur p-2 text-white hover:bg-black/60 active:scale-95 transition"
            aria-label="Pause"
          >
            <Pause size={14} />
          </button>
        )}
      </div>

      {/* Mobile controls */}
      <div className="grid grid-cols-2 gap-3 max-w-[380px] mx-auto">
        <button
          onTouchStart={(e) => { e.preventDefault(); moveLane(-1); }}
          onClick={() => moveLane(-1)}
          disabled={!running || paused || countdown > 0}
          className="rounded-2xl bg-secondary hover:bg-secondary/70 disabled:opacity-40 py-4 font-bold flex items-center justify-center gap-2 active:scale-95 transition"
        >
          <ChevronLeft size={20} /> Left
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); moveLane(1); }}
          onClick={() => moveLane(1)}
          disabled={!running || paused || countdown > 0}
          className="rounded-2xl bg-secondary hover:bg-secondary/70 disabled:opacity-40 py-4 font-bold flex items-center justify-center gap-2 active:scale-95 transition"
        >
          Right <ChevronRight size={20} />
        </button>
      </div>

      {/* Legend */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Pickups &amp; hazards</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <LegendRow color="emerald" label="Leaf"    value="+10" desc="Green XP" />
          <LegendRow color="sky"     label="Recycle" value="+15" desc="Clean loop" />
          <LegendRow color="amber"   label="Charge"  value="+20" desc="Battery boost" />
          <LegendRow color="blue"    label="Shield"  value="Power" desc="Absorb 1 hit" />
          <LegendRow color="rose"    label="Magnet"  value="Power" desc="Pulls pickups" />
          <LegendRow color="purple"  label="2× Score" value="Power" desc="Double points" />
          <LegendRow color="zinc"    label="Oil"     value="Crash" desc="Avoid" hazard />
          <LegendRow color="zinc"    label="Smoke"   value="Crash" desc="Avoid" hazard />
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Every 2 pickups = 1 ESG XP · Environmental 🌍</span>
          <span className="tabular-nums">Next payout: +{xpPreview} XP</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------- UI atoms -------------------- */

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg px-3 py-2 ${highlight ? "bg-emerald-500/20 border border-emerald-400/30" : "bg-white/5 border border-white/10"}`}>
      <p className="text-[9px] uppercase tracking-wider text-white/60 font-semibold">{label}</p>
      <p className={`text-sm font-extrabold ${highlight ? "text-emerald-300" : "text-white"}`}>{value}</p>
    </div>
  );
}

function LegendRow({ color, label, value, desc, hazard }: { color: string; label: string; value: string; desc: string; hazard?: boolean }) {
  const bg: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    zinc: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  };
  return (
    <div className={`flex items-center gap-2 rounded-lg p-2 ${bg[color]}`}>
      <div className={`w-2.5 h-2.5 rounded-full ${hazard ? "bg-rose-500" : "bg-emerald-500"}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold leading-tight">{label}</p>
        <p className="text-[10px] opacity-70 truncate">{desc}</p>
      </div>
      <span className="ml-auto font-extrabold text-xs">{value}</span>
    </div>
  );
}
