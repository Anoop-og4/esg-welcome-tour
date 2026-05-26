import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, FileSearch, Calendar, Table as TableIcon, Download, ChevronDown, TrendingUp, AlertCircle } from "lucide-react";
import AuditHeatmap from "./AuditHeatmap";
import { generateYear, ACTION_META, ACTION_TYPES, AVAILABLE_YEARS, AuditActionType, FRAMEWORKS } from "./auditData";

export default function AuditHistory() {
  const [tab, setTab] = useState<"heatmap" | "table">("heatmap");
  const [year, setYear] = useState<number>(AVAILABLE_YEARS[0]);
  const [framework, setFramework] = useState<string>(FRAMEWORKS[0]);
  const [activeTypes, setActiveTypes] = useState<Set<AuditActionType>>(new Set(ACTION_TYPES));

  const events = useMemo(() => generateYear(year), [year]);

  const stats = useMemo(() => {
    const filtered = events.filter((e) => activeTypes.has(e.type));
    const totals: Record<string, number> = {};
    let total = 0;
    const days = new Set<string>();
    for (const e of filtered) {
      totals[e.type] = (totals[e.type] || 0) + e.count;
      total += e.count;
      days.add(e.date);
    }
    const monthMap: Record<number, number> = {};
    for (const e of filtered) {
      const m = new Date(e.date).getUTCMonth();
      monthMap[m] = (monthMap[m] || 0) + e.count;
    }
    const peakMonth = Object.entries(monthMap).sort((a, b) => b[1] - a[1])[0];
    const peakLabel = peakMonth ? new Date(Date.UTC(year, parseInt(peakMonth[0]), 1)).toLocaleString(undefined, { month: "long" }) : "—";
    return { totals, total, activeDays: days.size, peakLabel, peakCount: peakMonth ? peakMonth[1] : 0 };
  }, [events, activeTypes, year]);

  const toggle = (t: AuditActionType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  };

  const integrityScore = Math.min(100, 60 + Math.round(stats.activeDays / 3));

  return (
    <div className="flex-1 overflow-auto bg-background text-foreground intelligence-grid">
      {/* Header band */}
      <div className="border-b border-border/60 bg-gradient-to-b from-card/40 to-transparent">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-12 pt-10 pb-7">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-3 text-[11px] tracking-[0.18em] uppercase text-primary font-mono">
                <span className="h-px w-8 bg-primary" />
                Assurance · Section IV
                <span className="text-muted-foreground/50">·</span>
                <span className="text-muted-foreground">FY {year} · {framework}</span>
              </div>
              <h1 className="text-[40px] leading-[1.05] font-bold mb-3 tracking-tight">
                Audit <span className="text-primary">History</span> Ledger
              </h1>
              <p className="text-sm max-w-2xl leading-relaxed text-muted-foreground">
                A chronological record of every disclosure, approval, and access event across your ESG reporting program — designed for regulators, internal auditors, and board-level review.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="esg-card-elevated px-4 py-2.5 flex items-center gap-3">
                <ShieldCheck size={18} className="text-primary" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Integrity</div>
                  <div className="text-[15px] font-semibold text-foreground">
                    {integrityScore}<span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
              </div>
              <button className="rounded-lg px-4 py-2.5 text-sm font-medium flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 hover:shadow-glow-sm transition-all">
                <Download size={14} />
                Export ledger
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1400px] mx-auto px-8 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 relative z-10">

        {/* LEFT */}
        <aside className="space-y-6">
          <FilterSection title="Reporting Year">
            <div className="space-y-1">
              {AVAILABLE_YEARS.map((y) => {
                const active = year === y;
                return (
                  <button
                    key={y}
                    onClick={() => setYear(y)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all border ${
                      active
                        ? "bg-primary text-primary-foreground border-primary font-semibold shadow-glow-sm"
                        : "border-border/60 text-foreground hover:bg-secondary/50 hover:border-primary/30"
                    }`}
                  >
                    <span>FY {y}</span>
                    {active && <span className="text-[10px] tracking-wider font-mono opacity-80">● ACTIVE</span>}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          <FilterSection title="Framework">
            <div className="relative">
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 pr-9 rounded-md text-sm cursor-pointer bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {FRAMEWORKS.map((f) => <option key={f} className="bg-card">{f}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </FilterSection>

          <FilterSection title="Event Types">
            <div className="space-y-1.5">
              {ACTION_TYPES.map((t) => {
                const active = activeTypes.has(t);
                const meta = ACTION_META[t];
                const count = stats.totals[t] || 0;
                return (
                  <button
                    key={t}
                    onClick={() => toggle(t)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all text-left border"
                    style={{
                      background: active ? meta.soft : "transparent",
                      borderColor: active ? meta.color : "hsl(var(--border) / 0.6)",
                      opacity: active ? 1 : 0.55,
                    }}
                  >
                    <span
                      className="h-3 w-3 rounded-sm shrink-0"
                      style={{
                        background: meta.color,
                        boxShadow: active ? `0 0 0 2px hsl(var(--background)), 0 0 0 3px ${meta.color}66` : "none",
                      }}
                    />
                    <span className={`flex-1 text-[13px] text-foreground ${active ? "font-medium" : ""}`}>
                      {meta.short}
                    </span>
                    <span className="text-[11px] tabular-nums text-muted-foreground font-mono">
                      {active ? count.toLocaleString() : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          </FilterSection>

          <FilterSection title="Intensity">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
              <span>LOW</span>
              {[0.2, 0.4, 0.6, 0.8, 1].map((o) => (
                <span key={o} className="h-3 flex-1 rounded-sm" style={{ background: `hsl(var(--primary) / ${o})` }} />
              ))}
              <span>HIGH</span>
            </div>
          </FilterSection>
        </aside>

        {/* RIGHT */}
        <main className="space-y-6 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex border-b border-border">
              {[
                { k: "heatmap", label: "Activity Calendar", icon: Calendar },
                { k: "table", label: "Event Log", icon: TableIcon },
              ].map((t) => {
                const active = tab === t.k;
                return (
                  <button
                    key={t.k}
                    onClick={() => setTab(t.k as any)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm transition-all relative ${
                      active ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <t.icon size={14} />
                    {t.label}
                    {active && (
                      <motion.span
                        layoutId="audit-tab"
                        className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary"
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
              <FileSearch size={12} />
              CRYPTOGRAPHICALLY SIGNED · TAMPER-EVIDENT
            </div>
          </div>

          {tab === "heatmap" ? (
            <motion.div
              key={year}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-xl overflow-hidden border border-border bg-border">
                <Kpi label="Total events" value={stats.total.toLocaleString()} sub="logged this year" />
                <Kpi label="Active days" value={stats.activeDays.toString()} sub={`of ${isLeap(year) ? 366 : 365}`} />
                <Kpi label="Peak month" value={stats.peakLabel} sub={`${stats.peakCount.toLocaleString()} events`} accent />
                <Kpi label="Coverage" value={`${activeTypes.size}/${ACTION_TYPES.length}`} sub="event categories" />
              </div>

              <div className="esg-card-elevated p-7">
                <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
                  <div>
                    <div className="text-[10px] tracking-[0.2em] uppercase mb-1 text-primary font-mono">Exhibit A</div>
                    <h2 className="text-xl font-bold text-foreground">
                      Annual Activity Calendar
                    </h2>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    Each cell = one calendar day · color blends active event types
                  </div>
                </div>

                <AuditHeatmap year={year} events={events} activeTypes={activeTypes} />

                <div className="mt-6 pt-5 flex items-center justify-between text-[11px] text-muted-foreground font-mono border-t border-dashed border-border">
                  <span>SOURCE · Internal audit ledger v2.1</span>
                  <span>LAST ATTESTED · {new Date().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InsightCard
                  icon={<TrendingUp size={16} />}
                  title="Reporting season pattern detected"
                  body={`Activity peaks in ${stats.peakLabel}, consistent with disclosure submission windows under ${framework === "All frameworks" ? "major frameworks" : framework}.`}
                />
                <InsightCard
                  icon={<AlertCircle size={16} />}
                  title="Audit trail completeness"
                  body={`${stats.activeDays} active days recorded against ${ACTION_TYPES.length} event types. All entries are immutable and signed.`}
                  warn
                />
              </div>
            </motion.div>
          ) : (
            <div className="esg-card p-16 text-center border-dashed">
              <TableIcon size={32} className="mx-auto mb-3 text-primary" />
              <h3 className="text-lg mb-1 font-semibold text-foreground">Event log coming soon</h3>
              <p className="text-sm text-muted-foreground">Detailed row-by-row ledger with search, filter, and CSV export.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.18em] uppercase mb-2.5 pb-2 flex items-center gap-2 text-primary font-mono border-b border-border/60">
        <span className="h-px w-3 bg-primary" />
        {title}
      </div>
      {children}
    </div>
  );
}

function Kpi({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div
      className={`px-5 py-4 ${accent ? "" : "bg-card"}`}
      style={accent ? { background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" } : undefined}
    >
      <div className={`text-[10px] tracking-[0.15em] uppercase mb-1.5 font-mono ${accent ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
        {label}
      </div>
      <div className={`text-[24px] leading-tight mb-0.5 tabular-nums font-bold ${accent ? "text-primary-foreground" : "text-foreground"}`}>
        {value}
      </div>
      <div className={`text-[11px] ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
        {sub}
      </div>
    </div>
  );
}

function InsightCard({ icon, title, body, warn }: { icon: React.ReactNode; title: string; body: string; warn?: boolean }) {
  return (
    <div
      className="esg-card p-4 flex gap-3"
      style={{ borderLeft: `3px solid hsl(var(--${warn ? "warning" : "primary"}))` }}
    >
      <div className={`mt-0.5 ${warn ? "text-warning" : "text-primary"}`}>{icon}</div>
      <div>
        <div className="text-[13.5px] mb-1 font-semibold text-foreground">{title}</div>
        <div className="text-[12.5px] leading-relaxed text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}

function isLeap(y: number) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}
