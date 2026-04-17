import { motion } from "framer-motion";
import { CHALLENGES, SPONSORED, challengeProgress, claimChallenge } from "@/lib/esgPlay";
import { useEsgPlay } from "@/hooks/useEsgPlay";
import { toast } from "@/hooks/use-toast";
import PlayHeader from "./PlayHeader";

export default function PlayChallenges() {
  const s = useEsgPlay();
  return (
    <div className="space-y-4 pb-8">
      <PlayHeader />
      <div>
        <h3 className="text-lg font-bold">Challenges</h3>
        <p className="text-xs text-muted-foreground">Complete missions for bonus XP & badges.</p>
      </div>

      <div className="space-y-2">
        {CHALLENGES.map((c, i) => {
          const p = challengeProgress(c.id, s);
          const done = p >= c.goal;
          const claimed = s.completedChallenges.includes(c.id);
          const pct = Math.min(100, (p / c.goal) * 100);
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-base font-bold">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary shrink-0">+{c.reward} XP</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-gradient-to-r from-emerald-400 to-primary" />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{p}/{c.goal}</p>
                <button
                  disabled={!done || claimed}
                  onClick={() => {
                    claimChallenge(c.id);
                    toast({ title: "🏆 Challenge claimed!", description: `+${c.reward} XP` });
                  }}
                  className="rounded-full px-3 py-1.5 text-xs font-bold disabled:opacity-50"
                  style={{
                    background: claimed ? "hsl(var(--secondary))" : "hsl(var(--primary))",
                    color: claimed ? "hsl(var(--muted-foreground))" : "hsl(var(--primary-foreground))",
                  }}
                >
                  {claimed ? "✓ Claimed" : done ? "Claim" : "In progress"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div>
        <h3 className="text-base font-bold mt-4">🌟 Sponsored Quests</h3>
        <p className="text-xs text-muted-foreground">Powered by partner brands</p>
      </div>
      <div className="space-y-2">
        {SPONSORED.map((sp) => (
          <div key={sp.id} className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 flex items-center gap-3">
            <span className="text-3xl">{sp.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-primary font-bold">{sp.brand}</p>
              <p className="text-sm font-bold">{sp.title}</p>
              <p className="text-xs text-muted-foreground">{sp.desc}</p>
            </div>
            <span className="text-xs font-bold text-primary shrink-0">+{sp.reward}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
