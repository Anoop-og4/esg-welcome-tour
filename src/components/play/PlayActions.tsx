import { useState } from "react";
import { motion } from "framer-motion";
import { ACTIONS, logAction, Pillar } from "@/lib/esgPlay";
import { toast } from "@/hooks/use-toast";
import PlayHeader from "./PlayHeader";

const FILTERS: { key: "all" | Pillar; label: string; emoji: string }[] = [
  { key: "all", label: "All", emoji: "✨" },
  { key: "E", label: "Env", emoji: "🌍" },
  { key: "S", label: "Social", emoji: "🤝" },
  { key: "G", label: "Gov", emoji: "🛡️" },
];

export default function PlayActions() {
  const [filter, setFilter] = useState<"all" | Pillar>("all");
  const list = filter === "all" ? ACTIONS : ACTIONS.filter((a) => a.pillars.includes(filter));

  return (
    <div className="space-y-4 pb-8">
      <PlayHeader />

      <div>
        <h3 className="text-lg font-bold">Daily Actions</h3>
        <p className="text-xs text-muted-foreground">Tap any action to log it. No forms. Just impact.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap border transition-all"
            style={{
              background: filter === f.key ? "hsl(var(--primary))" : "transparent",
              color: filter === f.key ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
              borderColor: filter === f.key ? "hsl(var(--primary))" : "hsl(var(--border))",
            }}
          >
            <span>{f.emoji}</span>
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {list.map((a, i) => (
          <motion.button
            key={a.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -2 }}
            onClick={() => {
              logAction(a.id);
              toast({ title: `${a.emoji} +${a.xp} XP`, description: a.title });
            }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all p-4 text-left"
          >
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
              {a.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{a.title}</p>
              <p className="text-[11px] text-muted-foreground">{a.category}</p>
              <div className="flex gap-1 mt-1">
                {a.pillars.map((p) => (
                  <span key={p} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-secondary">{p}</span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-base font-extrabold text-primary">+{a.xp}</p>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">XP</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
