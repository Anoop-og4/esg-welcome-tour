import { motion } from "framer-motion";
import { useEsgPlay } from "@/hooks/useEsgPlay";
import { getLevel } from "@/lib/esgPlay";

export default function PlayHeader() {
  const s = useEsgPlay();
  const { level, next, progress } = getLevel(s.xp);
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 text-white relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${level.color}, hsl(var(--primary)))` }}
    >
      <div className="absolute -right-8 -top-8 text-[120px] opacity-20 select-none">{level.emoji}</div>
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl shadow-inner">
          {s.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider opacity-80">{level.name}</p>
          <h2 className="text-xl font-bold truncate">{s.name}</h2>
          <p className="text-xs opacity-80">{s.city || "Add a city"} · 🔥 {s.streak} day streak</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold">{s.xp}</p>
          <p className="text-[10px] uppercase tracking-wider opacity-80">XP</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-[10px] opacity-80 mb-1">
          <span>{level.name}</span>
          <span>{next ? `${next.name} · ${next.min} XP` : "MAX"}</span>
        </div>
        <div className="h-2 rounded-full bg-white/20 overflow-hidden">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
