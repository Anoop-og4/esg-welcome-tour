import { motion } from "framer-motion";
import { ACTIONS, BADGES, getLevel, resetState } from "@/lib/esgPlay";
import { useEsgPlay } from "@/hooks/useEsgPlay";
import PlayHeader from "./PlayHeader";
import { Share2, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function PlayProfile() {
  const s = useEsgPlay();
  const { level, next, progress } = getLevel(s.xp);

  const share = () => {
    const text = `I'm a ${level.name} ${level.emoji} on ESG Play with ${s.xp} XP! 🌍`;
    if (navigator.share) navigator.share({ title: "ESG Play", text }).catch(() => {});
    else {
      navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Profile link copied to clipboard" });
    }
  };

  return (
    <div className="space-y-4 pb-8">
      <PlayHeader />

      <div className="flex gap-2">
        <button onClick={share} className="flex-1 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-bold flex items-center justify-center gap-2">
          <Share2 size={14} /> Share profile
        </button>
        <button
          onClick={() => {
            if (confirm("Reset your ESG Play progress?")) {
              resetState();
              toast({ title: "Reset complete" });
            }
          }}
          className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold flex items-center gap-2"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-border bg-card p-3 text-center">
          <p className="text-2xl">🔥</p>
          <p className="text-lg font-bold">{s.streak}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Streak</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 text-center">
          <p className="text-2xl">🎖️</p>
          <p className="text-lg font-bold">{s.badges.length}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Badges</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3 text-center">
          <p className="text-2xl">⚡</p>
          <p className="text-lg font-bold">{s.log.length}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Actions</p>
        </div>
      </div>

      {s.badges.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Recent Badges</p>
          <div className="flex flex-wrap gap-2">
            {s.badges.map((id) => {
              const b = BADGES[id];
              if (!b) return null;
              return (
                <div key={id} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold flex items-center gap-1">
                  <span>{b.emoji}</span> {b.name}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Activity history</p>
        {s.log.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No actions yet. Start logging to build your story! 🌱</p>
        ) : (
          <div className="divide-y divide-border">
            {s.log.slice(0, 12).map((l) => {
              const a = ACTIONS.find((x) => x.id === l.actionId);
              if (!a) return null;
              return (
                <motion.div key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 py-2.5">
                  <span className="text-2xl">{a.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{a.title}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(l.date).toLocaleString()}</p>
                  </div>
                  <span className="text-xs font-bold text-primary">+{l.xp}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
