import { motion } from "framer-motion";
import { Flame, Target, Trophy, UsersRound, Gift, Award, ChevronRight, Sparkles } from "lucide-react";
import PlayHeader from "./PlayHeader";
import { useEsgPlay } from "@/hooks/useEsgPlay";
import { ACTIONS, CHALLENGES, SPONSORED, challengeProgress, logAction } from "@/lib/esgPlay";
import { toast } from "@/hooks/use-toast";

const tiles = [
  { key: "play-actions", label: "Daily Actions", emoji: "⚡", color: "from-amber-400 to-orange-500" },
  { key: "play-challenges", label: "Challenges", emoji: "🎯", color: "from-rose-400 to-pink-500" },
  { key: "play-leaderboard", label: "Leaderboard", emoji: "🏆", color: "from-yellow-400 to-amber-500" },
  { key: "play-teams", label: "Teams", emoji: "👥", color: "from-sky-400 to-blue-500" },
  { key: "play-badges", label: "Badges", emoji: "🎖️", color: "from-violet-400 to-purple-500" },
  { key: "play-rewards", label: "Rewards", emoji: "🎁", color: "from-emerald-400 to-green-500" },
];

export default function PlayHub({ onNavigate }: { onNavigate: (v: string) => void }) {
  const s = useEsgPlay();
  const total = s.scores.E + s.scores.S + s.scores.G || 1;

  const quick = ACTIONS.slice(0, 4);

  return (
    <div className="space-y-4 pb-8">
      <PlayHeader />

      {/* ESG Pillar breakdown */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Your ESG Mix</p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { key: "E", label: "Environment", emoji: "🌍", color: "#22c55e" },
            { key: "S", label: "Social", emoji: "🤝", color: "#0ea5e9" },
            { key: "G", label: "Governance", emoji: "🛡️", color: "#8b5cf6" },
          ] as const).map((p) => {
            const v = Math.round(s.scores[p.key]);
            const pct = Math.round((v / total) * 100);
            return (
              <div key={p.key} className="rounded-xl p-3" style={{ background: `${p.color}15` }}>
                <div className="text-2xl">{p.emoji}</div>
                <p className="text-[10px] uppercase tracking-wider mt-1 opacity-70">{p.label}</p>
                <p className="text-lg font-bold" style={{ color: p.color }}>{v}</p>
                <p className="text-[10px] opacity-60">{pct}%</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick log */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick log</p>
            <h3 className="text-base font-bold">One tap. Earn XP. ✨</h3>
          </div>
          <button onClick={() => onNavigate("play-actions")} className="text-xs text-primary font-semibold flex items-center gap-1">All <ChevronRight size={12} /></button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {quick.map((a) => (
            <motion.button
              key={a.id}
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -2 }}
              onClick={() => {
                logAction(a.id);
                toast({ title: `${a.emoji} +${a.xp} XP`, description: a.title });
              }}
              className="flex items-center gap-2 rounded-xl bg-secondary/50 hover:bg-secondary p-3 text-left"
            >
              <span className="text-2xl">{a.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{a.title}</p>
                <p className="text-[10px] text-primary font-bold">+{a.xp} XP</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Game tiles */}
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t, i) => (
          <motion.button
            key={t.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -3 }}
            onClick={() => onNavigate(t.key)}
            className={`rounded-2xl p-4 text-left text-white bg-gradient-to-br ${t.color} shadow-lg`}
          >
            <div className="text-3xl">{t.emoji}</div>
            <p className="text-sm font-bold mt-2">{t.label}</p>
          </motion.button>
        ))}
      </div>

      {/* Active challenges preview */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold flex items-center gap-2"><Target size={16} className="text-primary" /> Active challenges</h3>
          <button onClick={() => onNavigate("play-challenges")} className="text-xs text-primary font-semibold">See all</button>
        </div>
        <div className="space-y-2">
          {CHALLENGES.slice(0, 2).map((c) => {
            const p = challengeProgress(c.id, s);
            const pct = Math.min(100, (p / c.goal) * 100);
            return (
              <div key={c.id} className="rounded-xl bg-secondary/40 p-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold">{c.title}</p>
                  <p className="text-xs font-bold text-primary">+{c.reward} XP</p>
                </div>
                <p className="text-[11px] text-muted-foreground">{c.desc}</p>
                <div className="mt-2 h-1.5 rounded-full bg-background overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{p}/{c.goal}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sponsored */}
      <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-primary" />
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Sponsored Quests</p>
        </div>
        <div className="space-y-2">
          {SPONSORED.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl bg-card p-3">
              <span className="text-2xl">{s.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{s.brand}</p>
                <p className="text-sm font-semibold truncate">{s.title}</p>
              </div>
              <span className="text-xs font-bold text-primary shrink-0">+{s.reward}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
