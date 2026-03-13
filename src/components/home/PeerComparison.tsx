import { motion } from "framer-motion";
import { Building2, ArrowUp, ArrowDown, Minus } from "lucide-react";

const peers = [
  { name: "Siemens AG", sector: "Industrial", esg: 84, env: 88, soc: 78, gov: 86, rank: 1 },
  { name: "Schneider Electric", sector: "Industrial", esg: 81, env: 85, soc: 76, gov: 82, rank: 2 },
  { name: "Your Company", sector: "Industrial", esg: 75, env: 78, soc: 65, gov: 82, rank: 3, isYou: true },
  { name: "ABB Group", sector: "Industrial", esg: 72, env: 74, soc: 68, gov: 74, rank: 4 },
  { name: "Honeywell", sector: "Industrial", esg: 68, env: 70, soc: 63, gov: 71, rank: 5 },
];

const ScorePill = ({ value, reference }: { value: number; reference: number }) => {
  const diff = value - reference;
  const Icon = diff > 0 ? ArrowUp : diff < 0 ? ArrowDown : Minus;
  const color = diff > 0 ? "text-primary" : diff < 0 ? "text-destructive" : "text-muted-foreground";
  return (
    <div className="flex items-center gap-0.5">
      <span className="text-xs font-semibold text-foreground">{value}</span>
      <Icon size={9} className={color} />
    </div>
  );
};

export default function PeerComparison() {
  const you = peers.find((p) => p.isYou)!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card glow-border p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Peer Comparison</h2>
          <p className="text-xs text-muted-foreground">Anonymous sector benchmarking</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full border border-border/50">
          <Building2 size={10} /> {peers.length} companies
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[auto_1fr_repeat(4,48px)] gap-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
        <span>#</span>
        <span>Company</span>
        <span className="text-center">ESG</span>
        <span className="text-center">Env</span>
        <span className="text-center">Soc</span>
        <span className="text-center">Gov</span>
      </div>

      <div className="space-y-1.5">
        {peers.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.07 }}
            className={`grid grid-cols-[auto_1fr_repeat(4,48px)] gap-2 items-center rounded-lg px-2 py-2 transition-all ${
              p.isYou
                ? "bg-primary/10 border border-primary/25 shadow-[0_0_12px_hsl(var(--primary)/0.08)]"
                : "bg-secondary/20 border border-border/30 hover:bg-secondary/40"
            }`}
          >
            <span className={`text-xs font-bold w-4 text-center ${p.isYou ? "text-primary" : "text-muted-foreground"}`}>
              {p.rank}
            </span>
            <div>
              <div className={`text-xs font-semibold ${p.isYou ? "text-primary" : "text-foreground"}`}>
                {p.name} {p.isYou && <span className="text-[9px] font-normal text-primary/70">(you)</span>}
              </div>
              <div className="text-[9px] text-muted-foreground">{p.sector}</div>
            </div>
            <div className="flex justify-center">
              <ScorePill value={p.esg} reference={you.esg} />
            </div>
            <div className="flex justify-center">
              <ScorePill value={p.env} reference={you.env} />
            </div>
            <div className="flex justify-center">
              <ScorePill value={p.soc} reference={you.soc} />
            </div>
            <div className="flex justify-center">
              <ScorePill value={p.gov} reference={you.gov} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-3 text-[10px] text-muted-foreground text-center">
        Ranked <span className="text-foreground font-semibold">3rd of 5</span> peers · Improve Social score to reach <span className="text-primary font-semibold">#2</span>
      </div>
    </motion.div>
  );
}