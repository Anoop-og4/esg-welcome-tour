// ESG audit action taxonomy with semantic meaning
export type AuditActionType =
  | "disclosure"   // Disclosure published / data point recorded
  | "evidence"     // Evidence uploaded / attached
  | "approval"     // Approved by reviewer/auditor
  | "rejection"    // Rejected / sent back
  | "deletion"     // Record deleted / retracted
  | "access"       // Access / login / view sensitive data
  | "export";      // Report exported / downloaded

// All colors live within the Emerald Prestige range (deep emerald → sage → gold → copper)
export const ACTION_META: Record<AuditActionType, { label: string; short: string; color: string; soft: string; description: string }> = {
  disclosure: { label: "Disclosure recorded",  short: "Disclosure", color: "#22c55e", soft: "rgba(34,197,94,0.18)",  description: "ESG data point or disclosure entered" },
  evidence:   { label: "Evidence attached",    short: "Evidence",   color: "#06b6d4", soft: "rgba(6,182,212,0.18)",  description: "Supporting document uploaded" },
  approval:   { label: "Approved",             short: "Approval",   color: "#10b981", soft: "rgba(16,185,129,0.20)", description: "Reviewer / auditor sign-off" },
  rejection:  { label: "Sent back for review", short: "Rejection",  color: "#f59e0b", soft: "rgba(245,158,11,0.20)", description: "Returned to preparer" },
  deletion:   { label: "Record deleted",       short: "Deletion",   color: "#ef4444", soft: "rgba(239,68,68,0.20)",  description: "Retraction or removal" },
  access:     { label: "Sensitive access",     short: "Access",     color: "#a78bfa", soft: "rgba(167,139,250,0.20)",description: "Privileged data viewed" },
  export:     { label: "Report exported",      short: "Export",     color: "#14b8a6", soft: "rgba(20,184,166,0.20)", description: "Downloaded for regulator / board" },
};

export const ACTION_TYPES = Object.keys(ACTION_META) as AuditActionType[];

export interface AuditEvent {
  date: string;
  type: AuditActionType;
  count: number;
}

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
    const month = d.getUTCMonth();
    const weekendBias = day === 0 || day === 6 ? 0.22 : 1;
    // Reporting season spike (Mar–May, Sep–Oct)
    const seasonBias = (month >= 2 && month <= 4) || (month >= 8 && month <= 9) ? 1.4 : 1;
    if (rand() > 0.55 * weekendBias * seasonBias) continue;
    const numTypes = Math.floor(rand() * 3) + 1;
    for (let i = 0; i < numTypes; i++) {
      const t = ACTION_TYPES[Math.floor(rand() * ACTION_TYPES.length)];
      const count = Math.floor(rand() * 7 * weekendBias * seasonBias) + 1;
      events.push({ date: d.toISOString().slice(0, 10), type: t, count });
    }
  }
  return events;
}

export const AVAILABLE_YEARS = (() => {
  const y = new Date().getFullYear();
  return [y, y - 1, y - 2, y - 3];
})();

// Frameworks for filtering context
export const FRAMEWORKS = ["All frameworks", "GRI", "CSRD / ESRS", "TCFD", "SASB", "BRSR"] as const;
