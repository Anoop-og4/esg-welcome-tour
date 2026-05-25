import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AuditEvent, ACTION_META, ACTION_TYPES, AuditActionType } from "./auditData";

interface Props {
  year: number;
  events: AuditEvent[];
  activeTypes: Set<AuditActionType>;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Mix multiple action colors weighted by count
function blendColors(parts: { color: string; weight: number }[]) {
  const total = parts.reduce((s, p) => s + p.weight, 0);
  if (total === 0) return "rgba(255,255,255,0.04)";
  let r = 0, g = 0, b = 0;
  for (const p of parts) {
    const hex = p.color.replace("#", "");
    const cr = parseInt(hex.slice(0, 2), 16);
    const cg = parseInt(hex.slice(2, 4), 16);
    const cb = parseInt(hex.slice(4, 6), 16);
    const w = p.weight / total;
    r += cr * w; g += cg * w; b += cb * w;
  }
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

export default function AuditHeatmap({ year, events, activeTypes }: Props) {
  const [hover, setHover] = useState<{ x: number; y: number; date: string; parts: { type: AuditActionType; count: number }[] } | null>(null);

  const byDate = useMemo(() => {
    const m = new Map<string, { type: AuditActionType; count: number }[]>();
    for (const e of events) {
      if (!activeTypes.has(e.type)) continue;
      const arr = m.get(e.date) || [];
      arr.push({ type: e.type, count: e.count });
      m.set(e.date, arr);
    }
    return m;
  }, [events, activeTypes]);

  // Build week columns. Each column = a week (Sun-Sat).
  const { weeks, monthLabels } = useMemo(() => {
    const jan1 = new Date(Date.UTC(year, 0, 1));
    const dec31 = new Date(Date.UTC(year, 11, 31));
    // start from the Sunday on or before Jan 1
    const start = new Date(jan1);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());
    const weeks: (string | null)[][] = [];
    const monthLabels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    let col = 0;
    for (let d = new Date(start); d <= dec31; d.setUTCDate(d.getUTCDate() + 7)) {
      const week: (string | null)[] = [];
      for (let i = 0; i < 7; i++) {
        const cur = new Date(d);
        cur.setUTCDate(d.getUTCDate() + i);
        if (cur.getUTCFullYear() !== year) week.push(null);
        else week.push(cur.toISOString().slice(0, 10));
      }
      const first = week.find(Boolean);
      if (first) {
        const m = new Date(first).getUTCMonth();
        if (m !== lastMonth) {
          monthLabels.push({ col, label: MONTHS[m] });
          lastMonth = m;
        }
      }
      weeks.push(week);
      col++;
    }
    return { weeks, monthLabels };
  }, [year]);

  const cell = 14;
  const gap = 3;
  const width = weeks.length * (cell + gap);
  const height = 7 * (cell + gap) + 20;

  return (
    <div className="relative overflow-x-auto rounded-xl p-5" style={{ background: "linear-gradient(180deg,#0f1419,#0a0d12)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <svg width={width} height={height} style={{ minWidth: width }}>
        {/* Month labels */}
        {monthLabels.map((m) => (
          <text key={m.col + m.label} x={m.col * (cell + gap)} y={10} fill="rgba(255,255,255,0.55)" fontSize={10} fontFamily="ui-sans-serif">
            {m.label}
          </text>
        ))}
        <g transform="translate(0,16)">
          {weeks.map((week, wi) =>
            week.map((date, di) => {
              if (!date) return null;
              const parts = byDate.get(date);
              const total = parts?.reduce((s, p) => s + p.count, 0) || 0;
              const fill = parts && parts.length
                ? blendColors(parts.map(p => ({ color: ACTION_META[p.type].color, weight: p.count })))
                : "rgba(255,255,255,0.05)";
              const opacity = parts ? Math.min(1, 0.35 + total * 0.08) : 1;
              return (
                <motion.rect
                  key={date}
                  x={wi * (cell + gap)}
                  y={di * (cell + gap)}
                  width={cell}
                  height={cell}
                  rx={3}
                  fill={fill}
                  fillOpacity={opacity}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (wi * 7 + di) * 0.0008, duration: 0.2 }}
                  style={{ cursor: parts ? "pointer" : "default" }}
                  onMouseEnter={(e) => {
                    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                    setHover({
                      x: wi * (cell + gap) + cell / 2,
                      y: di * (cell + gap),
                      date,
                      parts: parts || [],
                    });
                  }}
                  onMouseLeave={() => setHover(null)}
                  whileHover={{ scale: 1.25 }}
                />
              );
            })
          )}
        </g>
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg px-3 py-2 text-xs shadow-xl"
          style={{
            left: hover.x + 24,
            top: hover.y + 32,
            background: "#1a1f2a",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "white",
            minWidth: 180,
          }}
        >
          <div className="font-semibold mb-1.5">{new Date(hover.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</div>
          {hover.parts.length === 0 && <div className="opacity-60">No activity</div>}
          {hover.parts.map((p) => (
            <div key={p.type} className="flex items-center gap-2 py-0.5">
              <span className="h-2 w-2 rounded-sm" style={{ background: ACTION_META[p.type].color }} />
              <span className="flex-1">{ACTION_META[p.type].label}</span>
              <span className="font-mono opacity-80">{p.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
