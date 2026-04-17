import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Trophy, Zap, Leaf, ChevronLeft, ChevronRight } from "lucide-react";
import { loadState, saveState } from "@/lib/esgPlay";
import { toast } from "@/hooks/use-toast";

/**
 * Eco Drive — endless runner. Drive an EV across 3 lanes, dodge oil barrels &
 * smoke clouds, collect leaves / charge / recycle bins. Points convert to ESG XP.
 */

type ItemKind = "leaf" | "charge" | "recycle" | "barrel" | "smoke";
interface RoadItem {
  id: number;
  lane: 0 | 1 | 2;
  y: number;
  kind: ItemKind;
}

const LANES = 3;
const ROAD_H = 520;
const PLAYER_Y = ROAD_H - 90;
const ITEM_SIZE = 44;
const HIGH_KEY = "esgplay:ecodrive:high";

const KIND_META: Record<ItemKind, { emoji: string; pts: number; bad?: boolean }> = {
  leaf: { emoji: "🍃", pts: 10 },
  charge: { emoji: "⚡", pts: 20 },
  recycle: { emoji: "♻️", pts: 15 },
  barrel: { emoji: "🛢️", pts: 0, bad: true },
  smoke: { emoji: "💨", pts: 0, bad: true },
};

function pickKind(): ItemKind {
  const r = Math.random();
  if (r < 0.32) return "leaf";
  if (r < 0.5) return "recycle";
  if (r < 0.62) return "charge";
  if (r < 0.82) return "barrel";
  return "smoke";
}

export default function PlayEcoDrive() {
  const [lane, setLane] = useState<0 | 1 | 2>(1);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [speed, setSpeed] = useState(4);
  const [items, setItems] = useState<RoadItem[]>([]);
  const [high, setHigh] = useState<number>(() => Number(localStorage.getItem(HIGH_KEY) || 0));
  const [stripeOffset, setStripeOffset] = useState(0);

  const idRef = useRef(0);
  const spawnRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTs = useRef<number>(0);
  const stateRef = useRef({ running, over, lane, items, speed, score, coins });
  stateRef.current = { running, over, lane, items, speed, score, coins };

  const reset = useCallback(() => {
    setItems([]);
    setScore(0);
    setCoins(0);
    setSpeed(4);
    setLane(1);
    setOver(false);
    spawnRef.current = 0;
    idRef.current = 0;
  }, []);

  const start = () => {
    if (over) reset();
    setRunning(true);
  };

  const endGame = useCallback((finalScore: number, finalCoins: number) => {
    setRunning(false);
    setOver(true);
    if (finalScore > high) {
      setHigh(finalScore);
      localStorage.setItem(HIGH_KEY, String(finalScore));
    }
    // Convert collected coins → ESG XP (Environmental pillar)
    const xpGain = Math.floor(finalCoins / 2);
    if (xpGain > 0) {
      const s = loadState();
      s.xp += xpGain;
      s.scores.E += xpGain;
      if (!s.badges.includes("eco_driver")) s.badges.push("eco_driver");
      saveState(s);
      toast({ title: `🏁 Run complete!`, description: `+${xpGain} XP added to your ESG score` });
    }
  }, [high]);

  // Game loop
  useEffect(() => {
    if (!running) return;
    const tick = (ts: number) => {
      if (!lastTs.current) lastTs.current = ts;
      const dt = Math.min(40, ts - lastTs.current);
      lastTs.current = ts;

      const cur = stateRef.current;
      if (!cur.running) return;

      const sp = cur.speed;
      setStripeOffset((o) => (o + sp * dt * 0.06) % 60);

      // Move items down
      let nextItems = cur.items
        .map((it) => ({ ...it, y: it.y + sp * dt * 0.18 }))
        .filter((it) => it.y < ROAD_H + 60);

      // Collisions
      let gainedScore = 0;
      let gainedCoins = 0;
      let crashed = false;
      const playerHitboxY = PLAYER_Y;
      nextItems = nextItems.filter((it) => {
        if (it.lane !== cur.lane) return true;
        const dy = Math.abs(it.y - playerHitboxY);
        if (dy < 38) {
          const meta = KIND_META[it.kind];
          if (meta.bad) crashed = true;
          else {
            gainedScore += meta.pts;
            gainedCoins += 1;
          }
          return false;
        }
        return true;
      });

      // Spawn
      spawnRef.current += dt;
      const spawnInterval = Math.max(380, 900 - sp * 30);
      if (spawnRef.current > spawnInterval) {
        spawnRef.current = 0;
        const newLane = Math.floor(Math.random() * LANES) as 0 | 1 | 2;
        nextItems.push({
          id: ++idRef.current,
          lane: newLane,
          y: -40,
          kind: pickKind(),
        });
      }

      // Passive distance score + difficulty ramp
      const distance = (sp * dt * 0.02);
      const newScore = cur.score + gainedScore + distance;
      const newCoins = cur.coins + gainedCoins;
      const newSpeed = Math.min(11, cur.speed + dt * 0.00015);

      setItems(nextItems);
      setScore(newScore);
      setCoins(newCoins);
      setSpeed(newSpeed);

      if (crashed) {
        endGame(Math.floor(newScore), newCoins);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTs.current = 0;
    };
  }, [running, endGame]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!running) return;
      if (e.key === "ArrowLeft" || e.key === "a") setLane((l) => (Math.max(0, l - 1) as 0 | 1 | 2));
      if (e.key === "ArrowRight" || e.key === "d") setLane((l) => (Math.min(2, l + 1) as 0 | 1 | 2));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running]);

  // Swipe
  const touchStart = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 30) {
      if (dx < 0) setLane((l) => (Math.max(0, l - 1) as 0 | 1 | 2));
      else setLane((l) => (Math.min(2, l + 1) as 0 | 1 | 2));
    }
    touchStart.current = null;
  };

  const laneX = (l: number) => `${(l + 0.5) * (100 / LANES)}%`;

  return (
    <div className="space-y-4 pb-8">
      {/* Header / HUD */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Arcade</p>
            <h2 className="text-xl font-extrabold flex items-center gap-2">🚗 Eco Drive</h2>
            <p className="text-xs text-muted-foreground">Dodge pollution. Collect green points. Earn ESG XP.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-primary/10 px-3 py-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-primary font-bold">Score</p>
              <p className="text-lg font-extrabold leading-none">{Math.floor(score)}</p>
            </div>
            <div className="rounded-xl bg-amber-500/10 px-3 py-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1"><Trophy size={10} /> Best</p>
              <p className="text-lg font-extrabold leading-none">{high}</p>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Leaf size={12} className="text-emerald-500" /> {coins} green</span>
          <span className="flex items-center gap-1"><Zap size={12} className="text-amber-500" /> {speed.toFixed(1)}x</span>
          <span className="ml-auto">⬅️➡️ keys / swipe</span>
        </div>
      </div>

      {/* Road canvas */}
      <div
        className="relative mx-auto overflow-hidden rounded-3xl shadow-2xl select-none"
        style={{
          width: "100%",
          maxWidth: 380,
          height: ROAD_H,
          background: "linear-gradient(180deg, #1a3a2e 0%, #2d5a3d 8%, #2a2a2e 12%, #1f1f23 100%)",
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Grass borders */}
        <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-emerald-900/80 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-emerald-900/80 to-transparent" />

        {/* Lane stripes */}
        <div className="absolute inset-0">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-1"
              style={{
                left: `${(i / LANES) * 100}%`,
                backgroundImage: `repeating-linear-gradient(to bottom, #facc15 0 24px, transparent 24px 60px)`,
                backgroundPositionY: `${stripeOffset}px`,
                opacity: 0.85,
              }}
            />
          ))}
        </div>

        {/* Items */}
        {items.map((it) => {
          const meta = KIND_META[it.kind];
          return (
            <div
              key={it.id}
              className="absolute flex items-center justify-center text-3xl"
              style={{
                left: laneX(it.lane),
                top: it.y,
                width: ITEM_SIZE,
                height: ITEM_SIZE,
                transform: "translate(-50%, -50%)",
                filter: meta.bad ? "drop-shadow(0 0 8px rgba(239,68,68,0.6))" : "drop-shadow(0 0 8px rgba(34,197,94,0.5))",
              }}
            >
              {meta.emoji}
            </div>
          );
        })}

        {/* Player car */}
        <motion.div
          className="absolute text-5xl"
          animate={{ left: laneX(lane) }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{
            top: PLAYER_Y,
            transform: "translate(-50%, -50%)",
            filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.5))",
          }}
        >
          🚗
        </motion.div>

        {/* Overlays */}
        {!running && !over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 backdrop-blur-sm">
            <p className="text-5xl mb-2">🏁</p>
            <p className="text-white text-lg font-extrabold">Ready to drive green?</p>
            <p className="text-white/70 text-xs mb-4">Tap below or press space</p>
            <button
              onClick={start}
              className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 flex items-center gap-2 shadow-lg active:scale-95 transition"
            >
              <Play size={18} /> Start
            </button>
          </div>
        )}

        {over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 backdrop-blur-sm">
            <p className="text-5xl mb-2">💥</p>
            <p className="text-white text-lg font-extrabold">Run over!</p>
            <p className="text-white/80 text-sm">Score: <span className="font-bold text-emerald-300">{Math.floor(score)}</span> · +{Math.floor(coins / 2)} XP</p>
            <button
              onClick={start}
              className="mt-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 flex items-center gap-2 shadow-lg active:scale-95 transition"
            >
              <RotateCcw size={18} /> Play again
            </button>
          </div>
        )}

        {running && (
          <button
            onClick={() => setRunning(false)}
            className="absolute top-3 right-3 rounded-full bg-black/40 backdrop-blur p-2 text-white"
            aria-label="Pause"
          >
            <Pause size={14} />
          </button>
        )}
      </div>

      {/* Mobile controls */}
      <div className="grid grid-cols-2 gap-3 max-w-[380px] mx-auto">
        <button
          onClick={() => setLane((l) => (Math.max(0, l - 1) as 0 | 1 | 2))}
          disabled={!running}
          className="rounded-2xl bg-secondary hover:bg-secondary/70 disabled:opacity-50 py-4 font-bold flex items-center justify-center gap-2 active:scale-95 transition"
        >
          <ChevronLeft size={20} /> Left
        </button>
        <button
          onClick={() => setLane((l) => (Math.min(2, l + 1) as 0 | 1 | 2))}
          disabled={!running}
          className="rounded-2xl bg-secondary hover:bg-secondary/70 disabled:opacity-50 py-4 font-bold flex items-center justify-center gap-2 active:scale-95 transition"
        >
          Right <ChevronRight size={20} />
        </button>
      </div>

      {/* Legend */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">How it scores</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-2"><span className="text-xl">🍃</span> Leaf <span className="ml-auto font-bold text-emerald-500">+10</span></div>
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-2"><span className="text-xl">♻️</span> Recycle <span className="ml-auto font-bold text-emerald-500">+15</span></div>
          <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-2"><span className="text-xl">⚡</span> Charge <span className="ml-auto font-bold text-amber-500">+20</span></div>
          <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 p-2"><span className="text-xl">🛢️</span> Oil <span className="ml-auto font-bold text-rose-500">crash</span></div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">Every 2 green pickups = 1 ESG XP toward your Environmental pillar 🌍</p>
      </div>
    </div>
  );
}
