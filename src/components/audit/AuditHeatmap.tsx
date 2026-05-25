import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AuditEvent, ACTION_META, AuditActionType } from "./auditData";

interface Props {
  year: number;
  events: AuditEvent[];
  activeTypes: Set<AuditActionType>;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function blendColors(parts: { color: string; weight: number }[]) {
  const total = parts.reduce((s, p) => s + p.weight, 0);
  if (total === 0) return "transparent";
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

  const { weeks, monthLabels } = useMemo(() => {
    const jan1 = new Date(Date.UTC(year, 0, 1));
    const dec31 = new Date(Date.UTC(year, 11, 31));
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
  const gap = 4;
  const leftPad = 32;
  const topPad = 22;
  const width = weeks.length * (cell + gap) + leftPad;
  const height = 7 * (cell + gap) + topPad + 8;

  return (
    <div className="relative overflow-x-auto">
      <svg width={width} height={height} style={{ minWidth: width }}>
        {/* Month labels */}
        {monthLabels.map((m) => (
          <text
            key={m.col + m.label}
            x={m.col * (cell + gap) + leftPad}
            y={14}
            fill="#7a8a82"
            fontSize={10.5}
            fontFamily="'IBM Plex Mono', monospace"
            letterSpacing="0.05em"
          >
            {m.label.toUpperCase()}
          </text>
        ))}
        {/* Day labels */}
        {DAY_LABELS.map((d, i) => (
          d ? (
            <text
              key={i}
              x={0}
              y={topPad + i * (cell + gap) + 11}
              fill="#7a8a82"
              fontSize={10}
              fontFamily="'IBM Plex Mono', monospace"
            >
              {d}
            </text>
          ) : null
        ))}
        <g transform={`translate(${leftPad},${topPad})`}>
          {weeks.map((week, wi) =>
            week.map((date, di) => {
              if (!date) return null;
              const parts = byDate.get(date);
              const total = parts?.reduce((s, p) => s + p.count, 0) || 0;
              const hasData = !!parts;
              const fill = hasData
                ? blendColors(parts!.map(p => ({ color: ACTION_META[p.type].color, weight: p.count })))
                : "rgba(201, 168, 76, 0.05)";
              const opacity = hasData ? Math.min(1, 0.45 + total * 0.07) : 1;
              return (
                <motion.rect
                  key={date}
                  x={wi * (cell + gap)}
                  y={di * (cell + gap)}
                  width={cell}
                  height={cell}
                  rx={2.5}
                  fill={fill}
                  fillOpacity={opacity}
                  stroke={hasData ? "rgba(245,240,224,0.08)" : "rgba(201,168,76,0.07)"}
                  strokeWidth={0.5}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (wi * 7 + di) * 0.0006, duration: 0.18 }}
                  style={{ cursor: hasData ? "pointer" : "default" }}
                  onMouseEnter={() => {
                    setHover({
                      x: wi * (cell + gap) + leftPad + cell / 2,
                      y: di * (cell + gap) + topPad,
                      date,
                      parts: parts || [],
                    });
                  }}
                  onMouseLeave={() => setHover(null)}
                  whileHover={{ scale: 1.35 }}
                />
              );
            })
          )}
        </g>
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded-md px-3.5 py-2.5 text-xs shadow-2xl"
          style={{
            left: Math.min(hover.x + 20, 600),
            top: hover.y + 32,
            background: "linear-gradient(180deg, #f5f0e0, #ede4c8)",
            border: "1px solid #c9a84c",
            color: "#064e3b",
            minWidth: 200,
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        >
          <div className="font-semibold mb-2 pb-1.5" style={{ borderBottom: "1px solid rgba(6,78,59,0.15)", fontFamily: "'Libre Baskerville', serif" }}>
            {new Date(hover.date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
          </div>
          {hover.parts.length === 0 && <div style={{ opacity: 0.6 }}>No activity recorded</div>}
          {hover.parts.map((p) => (
            <div key={p.type} className="flex items-center gap-2 py-0.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: ACTION_META[p.type].color }} />
              <span className="flex-1">{ACTION_META[p.type].label}</span>
              <span className="font-mono font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{p.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
