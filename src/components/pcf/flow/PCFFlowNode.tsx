import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Plus } from "lucide-react";
import { PCFNodeData } from "./pcfFlowTypes";

/** Header color resolved from node type, falling back to scope. */
function colorForNode(data: PCFNodeData): string {
  if (data.type === "Product") return "#ef4444";
  if (data.type === "Material" || data.type === "Component") return "#a855f7";
  if (data.type === "Transport") return "#f97316";
  if (data.type === "Energy") return "#0ea5e9";
  if (data.type === "Waste") return "#6b7280";
  if (data.scope === "Scope 1") return "#3b82f6";
  if (data.scope === "Scope 2") return "#22c55e";
  return "#f59e0b";
}

const fmt = (n: number | undefined) =>
  (n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

function PCFFlowNodeComponent({ data, selected, id }: NodeProps) {
  const d = data as PCFNodeData;
  const color = colorForNode(d);

  return (
    <div
      className="pcf-flow-card"
      style={{
        width: 248,
        minHeight: 128,
        borderRadius: 14,
        overflow: "hidden",
        background: "hsl(var(--card))",
        border: selected
          ? "2px solid hsl(var(--primary))"
          : "1px solid hsl(var(--border))",
        boxShadow: "0 6px 20px -8px rgba(0,0,0,0.45)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "inherit",
      }}
    >
      {/* incoming (parents) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ width: 12, height: 12, background: color, border: "2px solid #fff" }}
      />

      <div style={{ height: 8, background: color }} />

      <div
        style={{
          padding: "8px 12px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          LEVEL {d.depth ?? 0}
        </span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: "1px 7px",
            borderRadius: 999,
            color: "#fff",
            background: color,
          }}
        >
          {d.scope}
        </span>
      </div>

      <div style={{ padding: "2px 12px 0", flex: 1, minHeight: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "hsl(var(--foreground))",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {d.name}
        </div>
        <div
          style={{
            fontSize: 10,
            color: "hsl(var(--muted-foreground))",
            marginTop: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {d.type}
          {d.factorSource ? ` · ${d.factorSource} ${d.factorYear ?? ""}` : ""}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 12px",
          borderTop: "1px solid hsl(var(--border))",
        }}
      >
        <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>
          <span style={{ color: "hsl(var(--foreground))", fontWeight: 700 }}>
            {fmt(d.branchTotal)}
          </span>{" "}
          kgCO₂e
          <span style={{ opacity: 0.6 }}> (self {fmt(d.selfEmission)})</span>
        </div>
        <button
          className="pcf-add-child nodrag"
          data-pcf-add={id}
          title="Add child"
          style={{
            width: 22,
            height: 22,
            border: "none",
            borderRadius: 7,
            background: "#22c55e",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* outgoing (children) */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ width: 12, height: 12, background: color, border: "2px solid #fff" }}
      />
    </div>
  );
}

export default memo(PCFFlowNodeComponent);
