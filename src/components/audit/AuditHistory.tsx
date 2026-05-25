import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { History, Table as TableIcon, Calendar } from "lucide-react";
import AuditHeatmap from "./AuditHeatmap";
import { generateYear, ACTION_META, ACTION_TYPES, AVAILABLE_YEARS, AuditActionType } from "./auditData";

export default function AuditHistory() {
  const [tab, setTab] = useState<"heatmap" | "table">("heatmap");
  const [year, setYear] = useState<number>(AVAILABLE_YEARS[0]);
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
    return { totals, total, activeDays: days.size };
  }, [events, activeTypes]);

  const toggle = (t: AuditActionType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  };

  return (
    <div className="flex-1 overflow-auto p-6 lg:p-8" style={{ background: "linear-gradient(180deg,#070a0f,#0a0d12)" }}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
            <History size={20} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Audit History</h1>
            <p className="text-sm text-white/60">Track every action taken across your ESG platform</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg p-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {[
            { k: "heatmap", label: "Heatmap", icon: Calendar },
            { k: "table", label: "Table", icon: TableIcon },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as any)}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={{
                background: tab === t.k ? "rgba(59,130,246,0.18)" : "transparent",
                color: tab === t.k ? "#60a5fa" : "rgba(255,255,255,0.6)",
              }}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "heatmap" ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {/* Year + Stats */}
          <div className="mb-5 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
            <div className="flex items-center gap-2 rounded-xl p-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {AVAILABLE_YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: year === y ? "linear-gradient(135deg,#3b82f6,#6366f1)" : "transparent",
                    color: year === y ? "white" : "rgba(255,255,255,0.65)",
                    boxShadow: year === y ? "0 4px 14px rgba(59,130,246,0.4)" : "none",
                  }}
                >
                  {y}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Total events" value={stats.total.toLocaleString()} accent="#3b82f6" />
              <Stat label="Active days" value={stats.activeDays.toString()} accent="#22c55e" />
              <Stat label="Action types" value={`${activeTypes.size} / ${ACTION_TYPES.length}`} accent="#a855f7" />
              <Stat label="Year" value={year.toString()} accent="#eab308" />
            </div>
          </div>

          {/* Filter chips */}
          <div className="mb-4 flex flex-wrap gap-2">
            {ACTION_TYPES.map((t) => {
              const active = activeTypes.has(t);
              const meta = ACTION_META[t];
              return (
                <button
                  key={t}
                  onClick={() => toggle(t)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: active ? meta.soft : "rgba(255,255,255,0.03)",
                    border: `1px solid ${active ? meta.color : "rgba(255,255,255,0.08)"}`,
                    color: active ? "white" : "rgba(255,255,255,0.4)",
                    opacity: active ? 1 : 0.6,
                  }}
                >
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: meta.color }} />
                  {meta.label}
                  {active && stats.totals[t] ? <span className="opacity-70 font-mono ml-1">{stats.totals[t]}</span> : null}
                </button>
              );
            })}
          </div>

          {/* Heatmap */}
          <AuditHeatmap year={year} events={events} activeTypes={activeTypes} />

          {/* Legend */}
          <div className="mt-4 flex items-center justify-between text-xs text-white/50">
            <span>Cell color blends action types by frequency. Hover to inspect.</span>
            <div className="flex items-center gap-2">
              <span>Less</span>
              {[0.15, 0.35, 0.55, 0.75, 1].map((o) => (
                <span key={o} className="h-3 w-3 rounded-sm" style={{ background: `rgba(59,130,246,${o})` }} />
              ))}
              <span>More</span>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="rounded-xl p-12 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
          <TableIcon className="mx-auto mb-3 opacity-30" size={36} />
          <h3 className="text-white font-semibold mb-1">Table view coming soon</h3>
          <p className="text-sm text-white/50">Detailed audit log with filters, search, and export.</p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="text-[11px] uppercase tracking-wide text-white/50 mb-1">{label}</div>
      <div className="text-xl font-bold" style={{ color: accent }}>{value}</div>
    </div>
  );
}
