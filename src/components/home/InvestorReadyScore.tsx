import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

const criteria = [
  { label: "SEBI ESG Fund Criteria", met: true, detail: "Score ≥ 70 required" },
  { label: "EU Taxonomy Alignment", met: true, detail: "45% aligned activities" },
  { label: "Net Zero Commitment", met: true, detail: "2040 target declared" },
  { label: "TCFD Disclosure", met: false, detail: "Report not submitted" },
  { label: "Supply Chain Due Diligence", met: false, detail: "Tier-2 data missing" },
  { label: "Board ESG Oversight", met: true, detail: "ESG committee active" },
];

const fundTypes = [
  { name: "ESG Equity Funds", eligible: true, count: 14 },
  { name: "Green Bonds", eligible: true, count: 8 },
  { name: "Impact Funds", eligible: false, count: 6 },
  { name: "Sustainability-Linked Loans", eligible: true, count: 11 },
];

export default function InvestorReadyScore() {
  const score = 72;
  const metCount = criteria.filter((c) => c.met).length;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="glass-card glow-border p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Investor-Ready Score</h2>
          <p className="text-xs text-muted-foreground">ESG fund eligibility & readiness</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
          <TrendingUp size={10} /> +8 pts this quarter
        </div>
      </div>

      <div className="flex items-center gap-6 mb-5">
        {/* Circular score */}
        <div className="relative shrink-0">
          <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
            <circle cx="45" cy="45" r="36" fill="none" stroke="hsl(var(--secondary))" strokeWidth="7" />
            <motion.circle
              cx="45" cy="45" r="36" fill="none"
              stroke="hsl(var(--neon-green))"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
              style={{ filter: "drop-shadow(0 0 6px hsl(var(--neon-green)/0.6))" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{score}</span>
            <span className="text-[9px] text-muted-foreground">/ 100</span>
          </div>
        </div>

        {/* Fund eligibility */}
        <div className="flex-1 grid grid-cols-2 gap-1.5">
          {fundTypes.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.06 }}
              className={`rounded-lg px-2 py-1.5 border text-[10px] ${
                f.eligible
                  ? "bg-primary/8 border-primary/20 text-primary"
                  : "bg-secondary/30 border-border/30 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-1 font-semibold">
                {f.eligible ? <ShieldCheck size={9} /> : <ShieldAlert size={9} />}
                <span>{f.eligible ? "Eligible" : "Ineligible"}</span>
              </div>
              <div className="mt-0.5 leading-tight">{f.name}</div>
              <div className="text-[9px] opacity-70">{f.count} funds</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Criteria checklist */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Criteria — {metCount}/{criteria.length} met
        </div>
        {criteria.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.75 + i * 0.06 }}
            className="flex items-center gap-2"
          >
            {c.met
              ? <CheckCircle2 size={13} className="text-primary shrink-0" />
              : <XCircle size={13} className="text-destructive shrink-0" />}
            <span className="text-xs text-foreground flex-1">{c.label}</span>
            <span className="text-[9px] text-muted-foreground">{c.detail}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}