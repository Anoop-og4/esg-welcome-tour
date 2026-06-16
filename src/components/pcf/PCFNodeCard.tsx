import { PCFNode } from "./pcfTypes";

/** Color resolved from node type and scope, used for the card header. */
export function colorForNode(node: PCFNode): string {
  if (node.type === "Product") return "#ef4444"; // red
  if (node.type === "Material" || node.type === "Component") return "#a855f7"; // purple
  if (node.type === "Transport") return "#f97316"; // orange
  if (node.type === "Waste") return "#6b7280"; // gray
  // fall back to scope colors
  if (node.scope === "Scope 1") return "#3b82f6"; // blue
  if (node.scope === "Scope 2") return "#22c55e"; // green
  return "#f59e0b"; // Scope 3 -> yellow/orange
}

function escapeHtml(s: string): string {
  return (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Returns the HTML string rendered inside each d3-org-chart node.
 * `branchTotal` is the rolled-up emissions for this node + descendants.
 */
export function renderNodeCardHTML(
  node: PCFNode,
  depth: number,
  branchTotal: number,
): string {
  const color = colorForNode(node);
  const nodeEm = node.calculatedEmissions.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
  const branch = branchTotal.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });

  return `
  <div data-pcf-id="${node.id}" draggable="true"
    class="pcf-card"
    style="width:248px;height:128px;font-family:inherit;border-radius:14px;overflow:hidden;
      background:hsl(var(--card));border:1px solid hsl(var(--border));
      box-shadow:0 6px 20px -8px rgba(0,0,0,0.45);cursor:grab;display:flex;flex-direction:column;">
    <div style="height:8px;background:${color};"></div>
    <div style="padding:8px 12px 0;display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
        color:hsl(var(--muted-foreground));">LEVEL ${depth}</span>
      <span style="font-size:9px;font-weight:700;padding:1px 7px;border-radius:999px;color:#fff;background:${color};">
        ${escapeHtml(node.scope)}
      </span>
    </div>
    <div style="padding:2px 12px 0;flex:1;min-height:0;">
      <div style="font-size:14px;font-weight:700;color:hsl(var(--foreground));
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(node.name)}</div>
      <div style="font-size:10px;color:hsl(var(--muted-foreground));margin-top:1px;">${escapeHtml(node.type)}</div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;
      padding:6px 12px;border-top:1px solid hsl(var(--border));">
      <div style="font-size:10px;color:hsl(var(--muted-foreground));">
        <span style="color:hsl(var(--foreground));font-weight:700;">${branch}</span> kgCO₂e
        <span style="opacity:.6;">(self ${nodeEm})</span>
      </div>
      <button data-pcf-add="${node.id}" title="Add child"
        style="width:22px;height:22px;border:none;border-radius:7px;background:#22c55e;color:#fff;
          font-size:15px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;">+</button>
    </div>
  </div>`;
}
