import { motion } from "framer-motion";
import { BADGES } from "@/lib/esgPlay";
import { useEsgPlay } from "@/hooks/useEsgPlay";
import PlayHeader from "./PlayHeader";

export default function PlayBadges() {
  const s = useEsgPlay();
  const all = Object.entries(BADGES);
  return (
    <div className="space-y-4 pb-8">
      <PlayHeader />
      <div>
        <h3 className="text-lg font-bold">Badges 🎖️</h3>
        <p className="text-xs text-muted-foreground">{s.badges.length} of {all.length} unlocked</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {all.map(([id, b], i) => {
          const owned = s.badges.includes(id);
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border bg-card p-4 text-center"
              style={{ opacity: owned ? 1 : 0.5 }}
            >
              <div className="text-4xl" style={{ filter: owned ? "none" : "grayscale(1)" }}>{b.emoji}</div>
              <p className="text-sm font-bold mt-2">{b.name}</p>
              <p className="text-[10px] text-muted-foreground">{b.desc}</p>
              {owned && <p className="text-[10px] text-primary font-bold mt-1">✓ Unlocked</p>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
