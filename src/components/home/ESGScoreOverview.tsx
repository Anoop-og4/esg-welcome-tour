import { motion } from "framer-motion";
import { Leaf, Users, Building2 } from "lucide-react";

const pillars = [
  { label: "Environment", score: 78, icon: Leaf, color: "var(--esg-env)", bg: "hsl(142 70% 45% / 0.1)" },
  { label: "Social", score: 65, icon: Users, color: "var(--esg-social)", bg: "hsl(210 80% 55% / 0.1)" },
  { label: "Governance", score: 82, icon: Building2, color: "var(--esg-gov)", bg: "hsl(270 60% 55% / 0.1)" },
];

function ScoreRing({ score, size = 150 }: { score: number; size?: number }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <svg width={size} height={size} className="drop-shadow-lg">
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(142 70% 50%)" />
          <stop offset="100%" stopColor="hsl(180 80% 50%)" />
        </linearGradient>
        <filter id="scoreGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(220 18% 18%)" strokeWidth={10} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#scoreGrad)"
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        filter="url(#scoreGlow)"
      />
      <text x="50%" y="44%" textAnchor="middle" className="fill-foreground font-display text-4xl font-extrabold">
        {score}
      </text>
      <text x="50%" y="60%" textAnchor="middle" className="fill-muted-foreground text-xs font-medium">
        ESG Score
      </text>
    </svg>
  );
}

function MiniBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-secondary/60 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: `hsl(${color})` }}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
      />
    </div>
  );
}

export default function ESGScoreOverview() {
  const overall = Math.round(pillars.reduce((a, p) => a + p.score, 0) / pillars.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card glow-border p-6"
    >
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-10">
        <div className="flex flex-col items-center gap-1">
          <ScoreRing score={overall} />
          <span className="mt-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary shadow-glow-sm">
            Above Average
          </span>
        </div>

        <div className="flex-1 space-y-4 w-full">
          <h2 className="font-display text-lg font-bold text-foreground">ESG Performance</h2>
          <p className="text-sm text-muted-foreground">Company-wide sustainability health overview for FY 2025-26</p>

          <div className="space-y-3 pt-1">
            {pillars.map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: p.bg }}>
                  <p.icon size={18} style={{ color: `hsl(${p.color})` }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{p.label}</span>
                    <span className="text-sm font-bold text-foreground">{p.score}/100</span>
                  </div>
                  <MiniBar score={p.score} color={p.color} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
