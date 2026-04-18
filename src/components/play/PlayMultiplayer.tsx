import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trophy, Users, X, Zap, Swords } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  GameKey, GAME_META, getOrCreateGuest, saveGuest, upsertProfile,
  quickMatch, updateMyScore, finishMatch, cancelMatch,
} from "@/lib/multiplayer";
import { toast } from "@/hooks/use-toast";
import { loadState, saveState } from "@/lib/esgPlay";

type Phase = "lobby" | "queue" | "countdown" | "playing" | "result";

const AVATARS = ["🌱","🦊","🐺","🦁","🐯","🦋","🐝","🐢","🦉","🌸","🐋","🦜","⚡","🔥","🌍"];

export default function PlayMultiplayer() {
  const [guest, setGuest] = useState(getOrCreateGuest());
  const [game, setGame] = useState<GameKey>("boxing");
  const [phase, setPhase] = useState<Phase>("lobby");
  const [match, setMatch] = useState<any>(null);
  const [role, setRole] = useState<"player1" | "player2">("player1");
  const [countdown, setCountdown] = useState(4);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const channelRef = useRef<any>(null);
  const tickRef = useRef<number | null>(null);
  const cdRef = useRef<number | null>(null);
  const scoreSyncRef = useRef<number>(0);
  const matchRef = useRef<any>(null);
  const phaseRef = useRef<Phase>("lobby");

  useEffect(() => { matchRef.current = match; }, [match]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Ensure profile exists in DB on mount
  useEffect(() => { upsertProfile(guest).catch(() => {}); }, [guest.guest_id]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    if (cdRef.current) clearInterval(cdRef.current);
  }, []);

  function subscribeToMatch(matchId: string) {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    const ch = supabase
      .channel("match:" + matchId)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${matchId}` },
        (payload) => {
          const m = payload.new as any;
          setMatch(m);
          // Opponent joined → start countdown
          if (phaseRef.current === "queue" && m.status === "playing" && m.starts_at) {
            startCountdown(m);
          }
          if (m.status === "finished" && phaseRef.current !== "result") {
            endLocally();
          }
          if (m.status === "cancelled" && phaseRef.current !== "lobby") {
            toast({ title: "Match cancelled", description: "The other player left." });
            backToLobby();
          }
        })
      .subscribe();
    channelRef.current = ch;
  }

  async function startQueue() {
    setPhase("queue");
    try {
      const { match: m, role: r } = await quickMatch(game, guest);
      setMatch(m); setRole(r);
      subscribeToMatch(m.id);
      if (m.status === "playing" && m.starts_at) {
        startCountdown(m);
      }
    } catch (e: any) {
      toast({ title: "Could not join match", description: e.message });
      setPhase("lobby");
    }
  }

  function startCountdown(m: any) {
    setPhase("countdown");
    setScore(0); setCombo(0); scoreSyncRef.current = 0;
    const target = new Date(m.starts_at).getTime();
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((target - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) {
        if (cdRef.current) clearInterval(cdRef.current);
        startRound();
      }
    };
    tick();
    cdRef.current = window.setInterval(tick, 200);
  }

  function startRound() {
    const dur = GAME_META[game].duration;
    setTimeLeft(dur);
    setPhase("playing");
    const startedAt = Date.now();
    tickRef.current = window.setInterval(() => {
      const left = Math.max(0, dur - Math.floor((Date.now() - startedAt) / 1000));
      setTimeLeft(left);
      if (left <= 0) {
        if (tickRef.current) clearInterval(tickRef.current);
        finishLocally();
      }
    }, 250) as unknown as number;
  }

  async function finishLocally() {
    // Final score push
    if (matchRef.current) {
      await updateMyScore(matchRef.current.id, role, score);
      const finished = await finishMatch(matchRef.current.id);
      if (finished) setMatch(finished);
    }
    endLocally();
  }

  function endLocally() {
    if (tickRef.current) clearInterval(tickRef.current);
    setPhase("result");
    // Award ESG XP for participating
    const s = loadState();
    const xpGain = Math.max(2, Math.round(score / 10));
    s.xp += xpGain;
    s.scores.S += xpGain * 0.5;
    s.scores.G += xpGain * 0.5;
    saveState(s);
  }

  function backToLobby() {
    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
    if (tickRef.current) clearInterval(tickRef.current);
    if (cdRef.current) clearInterval(cdRef.current);
    setMatch(null); setPhase("lobby"); setScore(0); setCombo(0);
  }

  async function leaveQueue() {
    if (matchRef.current) await cancelMatch(matchRef.current.id);
    backToLobby();
  }

  // Tap handler shared across all 3 games (each game just visualizes differently)
  function tap() {
    if (phase !== "playing") return;
    const newCombo = combo + 1;
    setCombo(newCombo);
    let pts = 10;
    if (game === "boxing") pts = newCombo % 5 === 0 ? 30 : 12;
    if (game === "ecodrive") pts = 8 + Math.floor(Math.random() * 8);
    if (game === "tapbattle") pts = 5 + Math.min(15, Math.floor(newCombo / 2));
    const next = score + pts;
    setScore(next);
    // Throttled realtime score sync (every 250ms via diff check)
    const now = Date.now();
    if (now - scoreSyncRef.current > 250 && matchRef.current) {
      scoreSyncRef.current = now;
      updateMyScore(matchRef.current.id, role, next);
    }
  }

  // ─────── RENDER ───────
  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Swords className="text-primary" size={20} /> Versus Mode</h2>
          <p className="text-xs text-muted-foreground">Real-time 1v1 multiplayer · Quick Match</p>
        </div>
        <ProfileBadge guest={guest} onChange={(g) => { setGuest(g); saveGuest(g); upsertProfile(g); }} />
      </div>

      {phase === "lobby" && (
        <Lobby game={game} onPickGame={setGame} onStart={startQueue} />
      )}

      {phase === "queue" && (
        <QueueScreen onCancel={leaveQueue} game={game} />
      )}

      {(phase === "countdown" || phase === "playing" || phase === "result") && match && (
        <Arena
          game={game}
          phase={phase}
          countdown={countdown}
          timeLeft={timeLeft}
          score={score}
          combo={combo}
          match={match}
          role={role}
          onTap={tap}
          onPlayAgain={() => { backToLobby(); setTimeout(startQueue, 100); }}
          onExit={backToLobby}
          guestId={guest.guest_id}
        />
      )}
    </div>
  );
}

// ─────────── Sub-components ───────────

function ProfileBadge({ guest, onChange }: { guest: any; onChange: (g: any) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(guest.nickname);
  const [avatar, setAvatar] = useState(guest.avatar);
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-full bg-card border border-border px-3 py-1.5 hover:bg-muted transition">
        <span className="text-lg">{guest.avatar}</span>
        <span className="text-xs font-semibold truncate max-w-[100px]">{guest.nickname}</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">Your player</h3>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Nickname</label>
              <input value={name} onChange={(e) => setName(e.target.value.slice(0, 20))} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Avatar</label>
              <div className="mt-2 grid grid-cols-8 gap-1">
                {AVATARS.map((a) => (
                  <button key={a} onClick={() => setAvatar(a)}
                    className={`h-9 w-9 rounded-lg text-xl flex items-center justify-center transition ${avatar === a ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-muted"}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-border py-2 text-sm">Cancel</button>
              <button onClick={() => { onChange({ ...guest, nickname: name || "Player", avatar }); setOpen(false); }}
                className="flex-1 rounded-lg bg-primary text-primary-foreground py-2 text-sm font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Lobby({ game, onPickGame, onStart }: { game: GameKey; onPickGame: (g: GameKey) => void; onStart: () => void }) {
  const [waitingCounts, setWaitingCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    const fetchCounts = async () => {
      const { data } = await supabase.from("matches").select("game").eq("status", "waiting");
      if (!active || !data) return;
      const counts: Record<string, number> = {};
      data.forEach((m: any) => { counts[m.game] = (counts[m.game] || 0) + 1; });
      setWaitingCounts(counts);
    };
    fetchCounts();
    const ch = supabase.channel("lobby-counts")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, fetchCounts)
      .subscribe();
    return () => { active = false; supabase.removeChannel(ch); };
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Pick your battle</p>
        <div className="grid grid-cols-1 gap-2">
          {(Object.keys(GAME_META) as GameKey[]).map((k) => {
            const meta = GAME_META[k];
            const selected = game === k;
            const waiting = waitingCounts[k] || 0;
            return (
              <button key={k} onClick={() => onPickGame(k)}
                className={`relative overflow-hidden rounded-xl p-4 text-left transition border-2 ${selected ? "border-primary scale-[1.01]" : "border-transparent hover:border-border"} bg-gradient-to-r ${meta.gradient}`}>
                <div className="flex items-center gap-3 text-white">
                  <span className="text-3xl">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{meta.label}</p>
                    <p className="text-xs opacity-90">{meta.desc} · {meta.duration}s round</p>
                  </div>
                  {waiting > 0 && (
                    <span className="text-[10px] bg-white/25 backdrop-blur px-2 py-1 rounded-full font-semibold">
                      {waiting} waiting
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={onStart}
        className="w-full rounded-2xl bg-primary text-primary-foreground py-4 font-bold text-lg shadow-lg active:scale-95 transition flex items-center justify-center gap-2">
        <Swords size={20} /> Quick Match
      </button>
      <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1">
        <Users size={11} /> You'll be paired with the next player who joins
      </p>
    </div>
  );
}

function QueueScreen({ onCancel, game }: { onCancel: () => void; game: GameKey }) {
  const meta = GAME_META[game];
  return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center space-y-5">
      <div className="text-6xl">{meta.emoji}</div>
      <div>
        <h3 className="text-xl font-bold">Searching for opponent…</h3>
        <p className="text-sm text-muted-foreground mt-1">{meta.label} · {meta.duration}s round</p>
      </div>
      <Loader2 className="mx-auto animate-spin text-primary" size={32} />
      <button onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <X size={14} /> Cancel
      </button>
    </div>
  );
}

function Arena({ game, phase, countdown, timeLeft, score, combo, match, role, onTap, onPlayAgain, onExit, guestId }: any) {
  const meta = GAME_META[game as GameKey];
  const myScore = role === "player1" ? match.player1_score : match.player2_score;
  const oppScore = role === "player1" ? match.player2_score : match.player1_score;
  const oppName = role === "player1" ? match.player2_nickname : match.player1_nickname;
  const oppAvatar = role === "player1" ? match.player2_avatar : match.player1_avatar;
  const myName = role === "player1" ? match.player1_nickname : match.player2_nickname;
  const myAvatar = role === "player1" ? match.player1_avatar : match.player2_avatar;

  // Display score: prefer local for self (instant), DB for opponent
  const liveMyScore = phase === "playing" ? score : myScore;

  const won = match.winner_guest_id === guestId;
  const tied = phase === "result" && !match.winner_guest_id;

  return (
    <div className="space-y-3">
      {/* Versus header */}
      <div className="rounded-2xl border border-border bg-card p-3 flex items-center gap-3">
        <PlayerCell name={myName} avatar={myAvatar} score={liveMyScore} side="left" highlight />
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">VS</p>
          {phase === "playing" && <p className="text-sm font-bold tabular-nums">{timeLeft}s</p>}
        </div>
        <PlayerCell name={oppName || "..."} avatar={oppAvatar || "❓"} score={oppScore} side="right" />
      </div>

      {/* Game canvas */}
      <div className={`relative h-[420px] rounded-3xl overflow-hidden bg-gradient-to-br ${meta.gradient} shadow-2xl`}>
        {phase === "countdown" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div key={countdown} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-white text-8xl font-black drop-shadow-2xl">
              {countdown > 0 ? countdown : "GO!"}
            </motion.div>
          </div>
        )}

        {phase === "playing" && (
          <button onClick={onTap} onTouchStart={(e) => { e.preventDefault(); onTap(); }}
            className="absolute inset-0 w-full h-full active:brightness-110 select-none touch-none">
            <GameVisual game={game} combo={combo} score={score} />
          </button>
        )}

        {phase === "result" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white space-y-4 p-6">
            <div className="text-7xl">{won ? "🏆" : tied ? "🤝" : "💪"}</div>
            <h3 className="text-3xl font-black">{won ? "Victory!" : tied ? "Tie!" : "Good fight"}</h3>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-xs opacity-70">YOU</p>
                <p className="text-3xl font-bold">{myScore}</p>
              </div>
              <div className="text-3xl self-center opacity-50">·</div>
              <div>
                <p className="text-xs opacity-70">{oppName}</p>
                <p className="text-3xl font-bold">{oppScore}</p>
              </div>
            </div>
            <p className="text-xs opacity-70 flex items-center gap-1"><Zap size={12} /> ESG XP awarded</p>
            <div className="flex gap-2 pt-2">
              <button onClick={onExit} className="rounded-full bg-white/20 backdrop-blur px-5 py-2 text-sm font-semibold hover:bg-white/30">Lobby</button>
              <button onClick={onPlayAgain} className="rounded-full bg-white text-foreground px-5 py-2 text-sm font-bold hover:scale-105 transition">Play again</button>
            </div>
          </div>
        )}
      </div>

      {phase === "playing" && (
        <p className="text-center text-xs text-muted-foreground">
          Combo <span className="font-bold text-primary">x{combo}</span> · Score <span className="font-bold tabular-nums">{score}</span>
        </p>
      )}
    </div>
  );
}

function PlayerCell({ name, avatar, score, side, highlight }: { name: string; avatar: string; score: number; side: "left" | "right"; highlight?: boolean }) {
  return (
    <div className={`flex-1 flex items-center gap-2 ${side === "right" ? "flex-row-reverse text-right" : ""}`}>
      <div className={`text-2xl h-9 w-9 rounded-full flex items-center justify-center ${highlight ? "bg-primary/20 ring-2 ring-primary" : "bg-muted"}`}>
        {avatar}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold truncate">{name}</p>
        <p className="text-lg font-black tabular-nums leading-none">{score}</p>
      </div>
    </div>
  );
}

function GameVisual({ game, combo, score }: { game: GameKey; combo: number; score: number }) {
  if (game === "boxing") {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div key={score} initial={{ scale: 1 }} animate={{ scale: [1, 0.92, 1] }} transition={{ duration: 0.15 }}
          className="w-44 h-64 rounded-[3rem] bg-gradient-to-b from-rose-700 to-rose-950 border-4 border-rose-950 flex items-center justify-center shadow-2xl">
          <span className="text-6xl">🥊</span>
        </motion.div>
        {combo >= 5 && <div className="absolute top-6 left-1/2 -translate-x-1/2 text-amber-300 font-black text-2xl drop-shadow-lg">COMBO x{combo}!</div>}
      </div>
    );
  }
  if (game === "ecodrive") {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div key={score} initial={{ y: 0 }} animate={{ y: [0, -8, 0] }} transition={{ duration: 0.2 }}
          className="text-7xl drop-shadow-2xl">🚗</motion.div>
        <div className="absolute bottom-8 text-white/90 text-sm font-semibold">Tap to collect 🍃</div>
      </div>
    );
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div key={score} initial={{ scale: 1 }} animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 0.2 }}
        className="text-8xl drop-shadow-2xl">⚡</motion.div>
      <div className="absolute bottom-8 text-white/90 text-sm font-semibold">TAP TAP TAP!</div>
    </div>
  );
}
