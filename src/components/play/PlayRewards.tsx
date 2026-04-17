import { motion } from "framer-motion";
import { REWARDS, redeemReward } from "@/lib/esgPlay";
import { useEsgPlay } from "@/hooks/useEsgPlay";
import { toast } from "@/hooks/use-toast";
import PlayHeader from "./PlayHeader";

export default function PlayRewards() {
  const s = useEsgPlay();
  return (
    <div className="space-y-4 pb-8">
      <PlayHeader />
      <div>
        <h3 className="text-lg font-bold">Rewards Marketplace 🎁</h3>
        <p className="text-xs text-muted-foreground">Redeem your XP for real-world goodies</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {REWARDS.map((r, i) => {
          const can = s.xp >= r.cost;
          const has = s.redeemed.includes(r.id);
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border bg-card p-4 flex flex-col"
            >
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">{r.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground">by {r.partner}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-base font-extrabold text-primary">{r.cost} XP</span>
                <button
                  disabled={!can || has}
                  onClick={() => {
                    const res = redeemReward(r.id);
                    if (res.ok) toast({ title: `${r.emoji} Redeemed!`, description: r.name });
                  }}
                  className="rounded-full px-3 py-1.5 text-xs font-bold disabled:opacity-50"
                  style={{
                    background: has ? "hsl(var(--secondary))" : "hsl(var(--primary))",
                    color: has ? "hsl(var(--muted-foreground))" : "hsl(var(--primary-foreground))",
                  }}
                >
                  {has ? "✓ Owned" : can ? "Redeem" : "Locked"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">🏢 For Companies</p>
        <p className="text-sm font-bold mt-1">Sponsor a reward</p>
        <p className="text-xs text-muted-foreground">Reach engaged eco-conscious users. Track impact in real time.</p>
        <button onClick={() => toast({ title: "Talk to sales", description: "Company tier coming soon." })} className="mt-3 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-bold">Learn more</button>
      </div>
    </div>
  );
}
