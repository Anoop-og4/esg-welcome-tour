import { useState } from "react";
import { motion } from "framer-motion";
import { buildLeaderboard } from "@/lib/esgPlay";
import { useEsgPlay } from "@/hooks/useEsgPlay";
import PlayHeader from "./PlayHeader";

const SCOPES = [
  { key: "global", label: "🌍 Global" },
  { key: "city", label: "🏙️ City" },
  { key: "friends", label: "👫 Friends" },
] as const;

export default function PlayLeaderboard() {
  const s = useEsgPlay();
  const [scope, setScope] = useState<"global" | "city" | "friends">("global");
  const list = buildLeaderboard(s, scope);
  const top3 = list.slice(0, 3);
  const rest = list.slice(3);

  return (
    <div className="space-y-4 pb-8">
      <PlayHeader />
      <div>
        <h3 className="text-lg font-bold">Leaderboard 🏆</h3>
        <p className="text-xs text-muted-foreground">Climb the ranks. Save the planet. Repeat.</p>
      </div>

      <div className="flex gap-2">
        {SCOPES.map((sc) => (
          <button
            key={sc.key}
            onClick={() => setScope(sc.key)}
            className="flex-1 rounded-full px-3 py-2 text-xs font-semibold border transition-all"
            style={{
              background: scope === sc.key ? "hsl(var(--primary))" : "transparent",
              color: scope === sc.key ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
              borderColor: scope === sc.key ? "hsl(var(--primary))" : "hsl(var(--border))",
            }}
          >
            {sc.label}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-2 items-end">
        {[1, 0, 2].map((idx) => {
          const p = top3[idx];
          if (!p) return <div key={idx} />;
          const heights = [88, 110, 72];
          const medals = ["🥇", "🥈", "🥉"];
          return (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="text-3xl">{p.avatar}</div>
              <p className="text-xs font-bold truncate w-full text-center mt-1">{p.name}</p>
              <p className="text-[10px] text-muted-foreground">{p.xp} XP</p>
              <div
                className="w-full mt-2 rounded-t-xl flex items-center justify-center text-2xl font-bold text-white"
                style={{
                  height: heights[idx],
                  background: idx === 0 ? "linear-gradient(180deg,#facc15,#ca8a04)" : idx === 1 ? "linear-gradient(180deg,#cbd5e1,#64748b)" : "linear-gradient(180deg,#fb923c,#c2410c)",
                }}
              >
                {medals[idx]}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Rest */}
      <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
        {rest.map((p, i) => (
          <motion.div
            key={p.name + p.rank}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-3 p-3"
            style={{ background: (p as any).isMe ? "hsl(var(--primary) / 0.08)" : "transparent" }}
          >
            <span className="w-6 text-center text-sm font-bold text-muted-foreground">{p.rank}</span>
            <span className="text-2xl">{p.avatar}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{p.name}</p>
              <p className="text-[10px] text-muted-foreground">{p.city}</p>
            </div>
            <span className="text-sm font-bold text-primary">{p.xp}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
