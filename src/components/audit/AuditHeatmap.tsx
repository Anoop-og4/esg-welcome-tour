import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AuditEvent, ACTION_META, AuditActionType } from "./auditData";

interface Props {
  year: number;
  events: AuditEvent[];
  activeTypes: Set<AuditActionType>;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export default function AuditHeatmap({ year, events, activeTypes }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hover, setHover] = useState<{ x: number; y: number; date: string; parts: { type: AuditActionType; count: number }[] } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setContainerWidth(e.contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const byDate = useMemo(() => {
    const m = new Map<string, { type: AuditActionType; count: number }[]>();
    for (const e of events) {
      if (!activeTypes.has(e.type)) continue;
      const arr = m.get(e.date) || [];
      arr.push({ type: e.type, count: e.count });
      m.set(e.date, arr);
    }
    // Sort each day's parts by count desc so dominant action leads
    for (const [, v] of m) v.sort((a, b) => b.count - a.count);
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

  const leftPad = 34;
  const topPad = 22;
  // Responsive cell size: fill the container width
  const available = Math.max(0, containerWidth - leftPad);
  const slot = weeks.length > 0 ? available / weeks.length : 0;
  const gap = Math.max(2, Math.min(5, slot * 0.18));
  const cell = Math.max(8, Math.min(22, slot - gap));
  const width = containerWidth || weeks.length * (cell + gap) + leftPad;
  const height = 7 * (cell + gap) + topPad + 8;

  return (
    <div ref={containerRef} className="relative w-full">
      <svg width={width} height={height}>
        {monthLabels.map((m) => (
          <text
            key={m.col + m.label}
            x={m.col * (cell + gap) + leftPad}
            y={14}
            fill="hsl(var(--muted-foreground))"
            fontSize={10.5}
            fontFamily="'IBM Plex Mono', monospace"
            letterSpacing="0.05em"
          >
            {m.label.toUpperCase()}
          </text>
        ))}
        {DAY_LABELS.map((d, i) => (
          d ? (
            <text
              key={i}
              x={0}
              y={topPad + i * (cell + gap) + cell * 0.7}
              fill="hsl(var(--muted-foreground))"
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
              const hasData = !!parts && parts.length > 0;
              const x = wi * (cell + gap);
              const y = di * (cell + gap);
              const rx = Math.max(1.5, cell * 0.18);

              if (!hasData) {
                return (
                  <rect
                    key={date}
                    x={x} y={y} width={cell} height={cell} rx={rx}
                    fill="hsl(var(--secondary) / 0.4)"
                    stroke="hsl(var(--border) / 0.6)"
                    strokeWidth={0.5}
                  />
                );
              }

              // Render proportional horizontal segments — one stripe per action type
              let offset = 0;
              const clipId = `clip-${date}`;
              const segs = parts!.map((p) => {
                const h = (p.count / total) * cell;
                const seg = { ...p, y: offset, h };
                offset += h;
                return seg;
              });
              const opacity = Math.min(1, 0.55 + total * 0.05);

              return (
                <motion.g
                  key={date}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (wi * 7 + di) * 0.0005, duration: 0.18 }}
                  style={{ cursor: "pointer", transformOrigin: `${x + cell / 2}px ${y + cell / 2}px` }}
                  whileHover={{ scale: 1.35 }}
                  onMouseEnter={() => {
                    setHover({
                      x: x + leftPad + cell / 2,
                      y: y + topPad,
                      date,
                      parts: parts!,
                    });
                  }}
                  onMouseLeave={() => setHover(null)}
                >
                  <defs>
                    <clipPath id={clipId}>
                      <rect x={x} y={y} width={cell} height={cell} rx={rx} />
                    </clipPath>
                  </defs>
                  <g clipPath={`url(#${clipId})`} opacity={opacity}>
                    {segs.map((s) => (
                      <rect
                        key={s.type}
                        x={x}
                        y={y + s.y}
                        width={cell}
                        height={s.h + 0.4}
                        fill={ACTION_META[s.type].color}
                      />
                    ))}
                  </g>
                  <rect
                    x={x} y={y} width={cell} height={cell} rx={rx}
                    fill="none"
                    stroke="rgba(6,78,59,0.15)"
                    strokeWidth={0.5}
                  />
                  {parts!.length >= 3 && (
                    <polygon
                      points={`${x + cell - cell * 0.28},${y} ${x + cell},${y} ${x + cell},${y + cell * 0.28}`}
                      fill="#fbf9f1"
                      opacity={0.85}
                    />
                  )}
                </motion.g>
              );
            })
          )}
        </g>
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded-md px-3.5 py-2.5 text-xs shadow-2xl"
          style={{
            left: Math.min(hover.x + 20, Math.max(0, width - 240)),
            top: hover.y + 32,
            background: "linear-gradient(180deg, #f5f0e0, #ede4c8)",
            border: "1px solid #c9a84c",
            color: "#064e3b",
            minWidth: 220,
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        >
          <div className="font-semibold mb-2 pb-1.5" style={{ borderBottom: "1px solid rgba(6,78,59,0.15)", fontFamily: "'Libre Baskerville', serif" }}>
            {new Date(hover.date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
          </div>
          {hover.parts.length === 0 && <div style={{ opacity: 0.6 }}>No activity recorded</div>}
          {hover.parts.map((p) => {
            const total = hover.parts.reduce((s, x) => s + x.count, 0);
            const pct = Math.round((p.count / total) * 100);
            return (
              <div key={p.type} className="flex items-center gap-2 py-0.5">
                <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: ACTION_META[p.type].color }} />
                <span className="flex-1">{ACTION_META[p.type].label}</span>
                <span className="font-mono font-semibold tabular-nums" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {p.count}
                  <span style={{ opacity: 0.55, marginLeft: 6 }}>{pct}%</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
