import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Trophy, Zap } from "lucide-react";
import { loadState, saveState } from "@/lib/esgPlay";
import { toast } from "@/hooks/use-toast";

type Phase = "idle" | "playing" | "over";
const ROUND_SECONDS = 30;
const HIGH_KEY = "esgplay:boxing:high";

interface Hit { id: number; x: number; y: number; dmg: number; crit: boolean; }

export default function PlayBoxing() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [time, setTime] = useState(ROUND_SECONDS);
  const [bagShake, setBagShake] = useState(0);
  const [hits, setHits] = useState<Hit[]>([]);
  const [high, setHigh] = useState<number>(() => Number(localStorage.getItem(HIGH_KEY) || 0));
  const comboTimer = useRef<number | null>(null);
  const hitId = useRef(0);
  const tickRef = useRef<number | null>(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (phase !== "playing") return;
    tickRef.current = window.setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          window.clearInterval(tickRef.current!);
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (tickRef.current) window.clearInterval(tickRef.current); };
  }, [phase]);

  function start() {
    setScore(0); setCombo(0); setTime(ROUND_SECONDS); setHits([]); setPhase("playing");
  }

  function endGame() {
    setPhase("over");
    const finalScore = scoreRef.current;
    const xpGain = Math.max(1, Math.round(finalScore / 8));
    const s = loadState();
    s.xp += xpGain;
    s.scores.S += xpGain * 0.6;
    s.scores.G += xpGain * 0.4;
    if (!s.badges.includes("boxing_first")) s.badges.push("boxing_first");
    saveState(s);
    if (finalScore > high) {
      localStorage.setItem(HIGH_KEY, String(finalScore));
      setHigh(finalScore);
    }
    toast({ title: `🥊 Round over!`, description: `+${xpGain} ESG XP earned (Social & Governance)` });
  }

  function punch(e: React.MouseEvent | React.TouchEvent) {
    if (phase !== "playing") return;
    const target = e.currentTarget as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    let cx: number, cy: number;
    if ("touches" in e && e.touches.length) {
      cx = e.touches[0].clientX - rect.left;
      cy = e.touches[0].clientY - rect.top;
    } else if ("clientX" in e) {
      cx = (e as React.MouseEvent).clientX - rect.left;
      cy = (e as React.MouseEvent).clientY - rect.top;
    } else {
      cx = rect.width / 2; cy = rect.height / 2;
    }

    const newCombo = combo + 1;
    setCombo(newCombo);
    const crit = newCombo > 0 && newCombo % 5 === 0;
    const dmg = (crit ? 25 : 10) + Math.min(15, Math.floor(newCombo / 3));
    setScore((s) => s + dmg);
    setBagShake((n) => n + 1);

    const id = ++hitId.current;
    setHits((h) => [...h, { id, x: cx, y: cy, dmg, crit }]);
    window.setTimeout(() => setHits((h) => h.filter((x) => x.id !== id)), 700);

    if (comboTimer.current) window.clearTimeout(comboTimer.current);
    comboTimer.current = window.setTimeout(() => setCombo(0), 1200);
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">🥊 Power Punch</h2>
          <p className="text-xs text-muted-foreground">Tap the bag fast. Build combos. Earn ESG XP.</p>
        </div>
        <div className="rounded-xl bg-card border border-border px-3 py-1.5 text-right">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">High</p>
          <p className="text-sm font-bold text-primary flex items-center gap-1"><Trophy size={12} /> {high}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Score" value={score} color="text-primary" />
        <Stat label="Combo" value={`x${combo}`} color={combo >= 5 ? "text-amber-500" : "text-foreground"} />
        <Stat label="Time" value={`${time}s`} color={time <= 5 ? "text-rose-500" : "text-foreground"} />
      </div>

      <div
        onMouseDown={punch}
        onTouchStart={punch}
        className="relative h-[420px] rounded-3xl overflow-hidden select-none cursor-crosshair touch-none bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 border border-border shadow-2xl"
        style={{ userSelect: "none" }}
      >
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-rose-900/40 to-transparent" />
        <div className="absolute inset-x-6 bottom-6 h-2 rounded-full bg-rose-700/50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-20 bg-zinc-600" />

        <motion.div
          key={bagShake}
          initial={{ x: 0, rotate: 0 }}
          animate={phase === "playing"
            ? { x: [0, -12, 10, -6, 0], rotate: [0, -3, 2, -1, 0] }
            : { x: 0, rotate: [-2, 2, -2] }
          }
          transition={phase === "playing"
            ? { duration: 0.35, ease: "easeOut" }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
          className="absolute left-1/2 top-20 -translate-x-1/2 w-40 h-64 rounded-[3rem] bg-gradient-to-b from-rose-600 via-rose-700 to-rose-900 shadow-[0_20px_60px_-10px_rgba(244,63,94,0.6),inset_0_-20px_40px_rgba(0,0,0,0.4)] border-4 border-rose-950 flex flex-col"
        >
          <div className="h-3 mx-6 mt-2 rounded-full bg-rose-950/60" />
          <div className="flex-1 flex items-center justify-center">
            <span className="text-5xl drop-shadow-lg">🥊</span>
          </div>
          <div className="h-3 mx-6 mb-4 rounded-full bg-rose-950/60" />
        </motion.div>

        <AnimatePresence>
          {hits.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, y: 0, scale: h.crit ? 1.4 : 1 }}
              animate={{ opacity: 0, y: -60, scale: h.crit ? 1.8 : 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className={`absolute pointer-events-none font-extrabold ${h.crit ? "text-amber-300 text-3xl" : "text-white text-xl"}`}
              style={{ left: h.x - 20, top: h.y - 20, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
            >
              {h.crit ? `CRIT +${h.dmg}!` : `+${h.dmg}`}
            </motion.div>
          ))}
        </AnimatePresence>

        {phase !== "playing" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-center space-y-3 px-6">
              {phase === "idle" ? (
                <>
                  <div className="text-6xl">🥊</div>
                  <h3 className="text-2xl font-bold text-white">Power Punch</h3>
                  <p className="text-sm text-white/70 max-w-xs">Tap the bag as fast as you can for {ROUND_SECONDS}s. Every 5-hit combo = CRIT.</p>
                  <button onClick={start} className="inline-flex items-center gap-2 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-bold px-6 py-3 shadow-lg active:scale-95 transition">
                    <Play size={18} /> Start round
                  </button>
                </>
              ) : (
                <>
                  <div className="text-6xl">🏆</div>
                  <h3 className="text-2xl font-bold text-white">Round complete!</h3>
                  <p className="text-white/80">Score: <span className="font-bold text-amber-300">{score}</span></p>
                  <p className="text-xs text-white/60 flex items-center justify-center gap-1"><Zap size={12} /> +{Math.max(1, Math.round(score / 8))} ESG XP added</p>
                  <button onClick={start} className="inline-flex items-center gap-2 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-bold px-6 py-3 shadow-lg active:scale-95 transition">
                    <RotateCcw size={18} /> Play again
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] text-center text-muted-foreground">
        Pillar impact: 60% Social · 40% Governance — discipline & resilience training.
      </p>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-lg font-extrabold ${color}`}>{value}</p>
    </div>
  );
}
