import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, FileSearch, Calendar, Table as TableIcon, Download, ChevronDown, TrendingUp, AlertCircle } from "lucide-react";
import AuditHeatmap from "./AuditHeatmap";
import { generateYear, ACTION_META, ACTION_TYPES, AVAILABLE_YEARS, AuditActionType, FRAMEWORKS } from "./auditData";

// Emerald Prestige tokens
const T = {
  bg: "#fbf9f1",          // warm parchment
  surface: "#ffffff",
  surfaceAlt: "#f5f0e0",
  ink: "#064e3b",         // deep emerald
  inkSoft: "#0d7a5f",
  gold: "#c9a84c",
  goldSoft: "#e3cf8c",
  border: "rgba(6,78,59,0.10)",
  borderStrong: "rgba(6,78,59,0.18)",
  muted: "#5f6f68",
  mutedSoft: "#8a9690",
};

const SERIF = "'Libre Baskerville', Georgia, serif";
const SANS = "'IBM Plex Sans', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', monospace";

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
    // peak month
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
    <div className="flex-1 overflow-auto" style={{ background: T.bg, fontFamily: SANS, color: T.ink }}>
      {/* Document header band */}
      <div style={{ borderBottom: `1px solid ${T.border}`, background: `linear-gradient(180deg, #ffffff 0%, ${T.bg} 100%)` }}>
        <div className="max-w-[1400px] mx-auto px-8 lg:px-12 pt-10 pb-7">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-3 text-[11px] tracking-[0.18em] uppercase" style={{ color: T.gold, fontFamily: MONO }}>
                <span className="h-px w-8" style={{ background: T.gold }} />
                Assurance · Section IV
                <span style={{ color: T.mutedSoft }}>·</span>
                <span style={{ color: T.muted }}>FY {year} · {framework}</span>
              </div>
              <h1 className="text-[44px] leading-[1.05] font-normal mb-3" style={{ fontFamily: SERIF, color: T.ink, letterSpacing: "-0.01em" }}>
                Audit <em style={{ color: T.gold, fontWeight: 400 }}>History</em> Ledger
              </h1>
              <p className="text-[14px] max-w-2xl leading-relaxed" style={{ color: T.muted }}>
                A chronological record of every disclosure, approval, and access event across your ESG reporting program — designed for regulators, internal auditors, and board-level review.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg px-4 py-2.5 flex items-center gap-3" style={{ background: T.surface, border: `1px solid ${T.borderStrong}` }}>
                <ShieldCheck size={18} style={{ color: T.inkSoft }} />
                <div>
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: T.muted, fontFamily: MONO }}>Integrity</div>
                  <div className="text-[15px] font-semibold" style={{ color: T.ink }}>
                    {integrityScore}<span className="text-xs" style={{ color: T.mutedSoft }}>/100</span>
                  </div>
                </div>
              </div>
              <button className="rounded-lg px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition-all hover:opacity-90" style={{ background: T.ink, color: T.surfaceAlt, fontFamily: SANS }}>
                <Download size={14} />
                Export ledger
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard body: filter rail + main canvas */}
      <div className="max-w-[1400px] mx-auto px-8 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">

        {/* LEFT: Filter rail */}
        <aside className="space-y-6">
          {/* Year */}
          <FilterSection title="Reporting Year">
            <div className="space-y-1">
              {AVAILABLE_YEARS.map((y) => {
                const active = year === y;
                return (
                  <button
                    key={y}
                    onClick={() => setYear(y)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all"
                    style={{
                      background: active ? T.ink : "transparent",
                      color: active ? T.surfaceAlt : T.ink,
                      fontFamily: SANS,
                      fontWeight: active ? 600 : 400,
                      border: `1px solid ${active ? T.ink : T.border}`,
                    }}
                  >
                    <span>FY {y}</span>
                    {active && <span className="text-[10px] tracking-wider" style={{ color: T.gold, fontFamily: MONO }}>● ACTIVE</span>}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* Framework */}
          <FilterSection title="Framework">
            <div className="relative">
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 pr-9 rounded-md text-sm cursor-pointer"
                style={{ background: T.surface, border: `1px solid ${T.borderStrong}`, color: T.ink, fontFamily: SANS }}
              >
                {FRAMEWORKS.map((f) => <option key={f}>{f}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.muted }} />
            </div>
          </FilterSection>

          {/* Event types */}
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
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all text-left group"
                    style={{
                      background: active ? meta.soft : "transparent",
                      border: `1px solid ${active ? meta.color : T.border}`,
                      opacity: active ? 1 : 0.55,
                    }}
                  >
                    <span className="h-3 w-3 rounded-sm shrink-0" style={{ background: meta.color, boxShadow: active ? `0 0 0 2px rgba(255,255,255,0.6), 0 0 0 3px ${meta.color}40` : "none" }} />
                    <span className="flex-1 text-[13px]" style={{ color: T.ink, fontFamily: SANS, fontWeight: active ? 500 : 400 }}>
                      {meta.short}
                    </span>
                    <span className="text-[11px] tabular-nums" style={{ color: T.muted, fontFamily: MONO }}>
                      {active ? count.toLocaleString() : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* Quick legend */}
          <FilterSection title="Intensity">
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: T.muted, fontFamily: MONO }}>
              <span>LOW</span>
              {[0.2, 0.4, 0.6, 0.8, 1].map((o) => (
                <span key={o} className="h-3 flex-1 rounded-sm" style={{ background: `rgba(13,122,95,${o})` }} />
              ))}
              <span>HIGH</span>
            </div>
          </FilterSection>
        </aside>

        {/* RIGHT: Main canvas */}
        <main className="space-y-6 min-w-0">
          {/* Tab strip */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex" style={{ borderBottom: `1px solid ${T.borderStrong}` }}>
              {[
                { k: "heatmap", label: "Activity Calendar", icon: Calendar },
                { k: "table", label: "Event Log", icon: TableIcon },
              ].map((t) => {
                const active = tab === t.k;
                return (
                  <button
                    key={t.k}
                    onClick={() => setTab(t.k as any)}
                    className="flex items-center gap-2 px-5 py-3 text-sm transition-all relative"
                    style={{
                      color: active ? T.ink : T.muted,
                      fontFamily: SANS,
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    <t.icon size={14} />
                    {t.label}
                    {active && (
                      <motion.span
                        layoutId="audit-tab"
                        className="absolute bottom-[-1px] left-0 right-0 h-[2px]"
                        style={{ background: T.gold }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 text-[11px]" style={{ color: T.muted, fontFamily: MONO }}>
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
              {/* KPI row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-lg overflow-hidden" style={{ background: T.borderStrong, border: `1px solid ${T.borderStrong}` }}>
                <Kpi label="Total events" value={stats.total.toLocaleString()} sub="logged this year" />
                <Kpi label="Active days" value={stats.activeDays.toString()} sub={`of ${isLeap(year) ? 366 : 365}`} />
                <Kpi label="Peak month" value={stats.peakLabel} sub={`${stats.peakCount.toLocaleString()} events`} accent />
                <Kpi label="Coverage" value={`${activeTypes.size}/${ACTION_TYPES.length}`} sub="event categories" />
              </div>

              {/* Heatmap card */}
              <div className="rounded-lg p-7" style={{ background: T.surface, border: `1px solid ${T.borderStrong}`, boxShadow: "0 1px 2px rgba(6,78,59,0.04), 0 8px 24px rgba(6,78,59,0.06)" }}>
                <div className="flex items-baseline justify-between mb-5">
                  <div>
                    <div className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: T.gold, fontFamily: MONO }}>Exhibit A</div>
                    <h2 className="text-[22px] font-normal" style={{ fontFamily: SERIF, color: T.ink }}>
                      Annual Activity Calendar
                    </h2>
                  </div>
                  <div className="text-[11px]" style={{ color: T.muted, fontFamily: MONO }}>
                    Each cell = one calendar day · color blends active event types
                  </div>
                </div>

                <AuditHeatmap year={year} events={events} activeTypes={activeTypes} />

                <div className="mt-6 pt-5 flex items-center justify-between text-[11px]" style={{ borderTop: `1px dashed ${T.borderStrong}`, color: T.muted, fontFamily: MONO }}>
                  <span>SOURCE · Internal audit ledger v2.1</span>
                  <span>LAST ATTESTED · {new Date().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </div>

              {/* Insights strip */}
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
            <div className="rounded-lg p-16 text-center" style={{ background: T.surface, border: `1px dashed ${T.borderStrong}` }}>
              <TableIcon size={32} className="mx-auto mb-3" style={{ color: T.gold }} />
              <h3 className="text-lg mb-1" style={{ fontFamily: SERIF, color: T.ink }}>Event log coming soon</h3>
              <p className="text-sm" style={{ color: T.muted }}>Detailed row-by-row ledger with search, filter, and CSV export.</p>
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
      <div className="text-[10px] tracking-[0.18em] uppercase mb-2.5 pb-2 flex items-center gap-2" style={{ color: T.gold, fontFamily: MONO, borderBottom: `1px solid ${T.border}` }}>
        <span className="h-px w-3" style={{ background: T.gold }} />
        {title}
      </div>
      {children}
    </div>
  );
}

function Kpi({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="px-5 py-4" style={{ background: accent ? "linear-gradient(135deg, #064e3b, #0d7a5f)" : T.surface }}>
      <div className="text-[10px] tracking-[0.15em] uppercase mb-1.5" style={{ color: accent ? T.goldSoft : T.muted, fontFamily: MONO }}>
        {label}
      </div>
      <div className="text-[24px] leading-tight mb-0.5 tabular-nums" style={{ fontFamily: SERIF, color: accent ? "#fff" : T.ink, fontWeight: 400 }}>
        {value}
      </div>
      <div className="text-[11px]" style={{ color: accent ? "rgba(255,255,255,0.7)" : T.mutedSoft, fontFamily: SANS }}>
        {sub}
      </div>
    </div>
  );
}

function InsightCard({ icon, title, body, warn }: { icon: React.ReactNode; title: string; body: string; warn?: boolean }) {
  return (
    <div className="rounded-lg p-4 flex gap-3" style={{ background: T.surface, border: `1px solid ${T.borderStrong}`, borderLeft: `3px solid ${warn ? T.gold : T.inkSoft}` }}>
      <div className="mt-0.5" style={{ color: warn ? T.gold : T.inkSoft }}>{icon}</div>
      <div>
        <div className="text-[13.5px] mb-1 font-semibold" style={{ fontFamily: SERIF, color: T.ink, fontWeight: 700 }}>{title}</div>
        <div className="text-[12.5px] leading-relaxed" style={{ color: T.muted, fontFamily: SANS }}>{body}</div>
      </div>
    </div>
  );
}

function isLeap(y: number) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}
