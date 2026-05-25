export type AuditActionType = "create" | "update" | "delete" | "approve" | "reject" | "login" | "export";

export const ACTION_META: Record<AuditActionType, { label: string; color: string; soft: string }> = {
  create:  { label: "Create / Add",   color: "#22c55e", soft: "rgba(34,197,94,0.18)" },
  update:  { label: "Update / Edit",  color: "#3b82f6", soft: "rgba(59,130,246,0.18)" },
  delete:  { label: "Delete",         color: "#ef4444", soft: "rgba(239,68,68,0.18)" },
  approve: { label: "Approve",        color: "#14b8a6", soft: "rgba(20,184,166,0.18)" },
  reject:  { label: "Reject",         color: "#f97316", soft: "rgba(249,115,22,0.18)" },
  login:   { label: "Login / Access", color: "#a855f7", soft: "rgba(168,85,247,0.18)" },
  export:  { label: "Export / Report",color: "#eab308", soft: "rgba(234,179,8,0.18)" },
};

export const ACTION_TYPES = Object.keys(ACTION_META) as AuditActionType[];

export interface AuditEvent {
  date: string; // YYYY-MM-DD
  type: AuditActionType;
  count: number;
}

// Deterministic pseudo-random
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateYear(year: number): AuditEvent[] {
  const rand = seeded(year * 31 + 7);
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year, 11, 31));
  const today = new Date();
  const events: AuditEvent[] = [];
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    if (d > today) break;
    const day = d.getUTCDay();
    const weekendBias = day === 0 || day === 6 ? 0.25 : 1;
    if (rand() > 0.55 * weekendBias) continue;
    const numTypes = Math.floor(rand() * 3) + 1;
    for (let i = 0; i < numTypes; i++) {
      const t = ACTION_TYPES[Math.floor(rand() * ACTION_TYPES.length)];
      const count = Math.floor(rand() * 8 * weekendBias) + 1;
      events.push({ date: d.toISOString().slice(0, 10), type: t, count });
    }
  }
  return events;
}

export const AVAILABLE_YEARS = (() => {
  const y = new Date().getFullYear();
  return [y, y - 1, y - 2, y - 3];
})();
