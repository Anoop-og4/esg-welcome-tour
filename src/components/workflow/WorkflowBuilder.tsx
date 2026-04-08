import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pause,
  Play,
  Copy,
  Trash2,
  XCircle,
  Users,
  Building2,
  GitBranch,
  Mail,
  MessageSquare,
  RefreshCw,
  Pencil,
  FlaskConical,
  Clock,
  Layers,
} from "lucide-react";

// ── Types ──────────────────────────────────────
interface WorkflowNode {
  id: string;
  type: "trigger" | "action" | "condition";
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  details?: Record<string, string>;
  description?: string;
  personas?: { name: string; extra?: string };
  children?: WorkflowNode[];
  branches?: { label: string; nodes: WorkflowNode[] }[];
}

// ── Dummy Data ─────────────────────────────────
const workflowData: WorkflowNode[] = [
  {
    id: "trigger-1",
    type: "trigger",
    label: "Contact and account found",
    icon: <GitBranch size={14} />,
    iconBg: "bg-amber-500/20 text-amber-400",
  },
  {
    id: "action-1",
    type: "action",
    label: "Update contact",
    icon: <RefreshCw size={14} />,
    iconBg: "bg-orange-500/20 text-orange-400",
    details: { "Run as": "Clarke Russell", Object: "Contact" },
  },
  {
    id: "condition-1",
    type: "condition",
    label: "Check if account has an owner",
    icon: <Users size={14} />,
    iconBg: "bg-emerald-500/20 text-emerald-400",
    branches: [
      {
        label: "Yes",
        nodes: [
          {
            id: "action-2",
            type: "action",
            label: "Slack message",
            icon: <MessageSquare size={14} />,
            iconBg: "bg-purple-500/20 text-purple-400",
            personas: { name: "Clarke Russell", extra: "+3" },
            description:
              "Slack message to #bot_lantern channel notifying the old company owner and success owner",
          },
          {
            id: "action-3",
            type: "action",
            label: "Send email",
            icon: <Mail size={14} />,
            iconBg: "bg-sky-500/20 text-sky-400",
            details: { "Run as": "Send email as Lantern", Column: "old_account_succ..." },
          },
        ],
      },
      {
        label: "Else",
        nodes: [
          {
            id: "action-4",
            type: "action",
            label: "Update record",
            icon: <RefreshCw size={14} />,
            iconBg: "bg-orange-500/20 text-orange-400",
            details: { "Run as": "Clarke Russell", Object: "Company" },
          },
          {
            id: "action-5",
            type: "action",
            label: "Slack message",
            icon: <MessageSquare size={14} />,
            iconBg: "bg-purple-500/20 text-purple-400",
            personas: { name: "Clarke Russell", extra: "+3" },
            description:
              "Slack message to #bot_lantern channel notifying the old company owner and success owner",
          },
        ],
      },
    ],
  },
];

const summaryItems = [
  { label: "Trigger", collapsible: false },
  { label: "Contact and account f...", collapsible: true },
  { label: "Account found but not...", collapsible: true },
  { label: "No contact or account...", collapsible: true },
];

// ── Connector Line ──────────────────────────────
function Connector({ height = 32 }: { height?: number }) {
  return (
    <div className="flex justify-center" style={{ height }}>
      <div className="w-px bg-border relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-border" />
      </div>
    </div>
  );
}

// ── Node Card ───────────────────────────────────
function NodeCard({
  node,
  selected,
  onSelect,
}: {
  node: WorkflowNode;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  if (node.type === "trigger") {
    return (
      <div className="flex flex-col items-center">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(node.id)}
          className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
            selected
              ? "border-primary bg-primary/10 text-primary"
              : "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
          }`}
        >
          {node.label}
        </motion.button>
      </div>
    );
  }

  if (node.type === "condition") {
    return (
      <div className="flex flex-col items-center">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(node.id)}
          className={`px-4 py-1.5 rounded-md text-xs font-medium border transition-colors ${
            selected
              ? "border-primary bg-primary/10 text-primary"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
          }`}
        >
          {node.label}
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={() => onSelect(node.id)}
      className={`w-72 rounded-lg border bg-card/80 backdrop-blur-sm cursor-pointer transition-colors ${
        selected ? "border-primary shadow-[0_0_12px_hsl(var(--primary)/0.15)]" : "border-border hover:border-muted-foreground/30"
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
        <span className={`flex items-center justify-center w-6 h-6 rounded ${node.iconBg}`}>
          {node.icon}
        </span>
        <span className="text-sm font-medium text-foreground">{node.label}</span>
      </div>
      <div className="px-3 py-2 space-y-1.5">
        {node.details &&
          Object.entries(node.details).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">{key}:</span>
              <span className="px-2 py-0.5 rounded bg-secondary/60 text-foreground text-xs">
                {value}
              </span>
            </div>
          ))}
        {node.personas && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Persona:</span>
            <span className="px-2 py-0.5 rounded bg-secondary/60 text-foreground text-xs">
              {node.personas.name}
            </span>
            {node.personas.extra && (
              <span className="px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground text-xs">
                {node.personas.extra}
              </span>
            )}
          </div>
        )}
        {node.description && (
          <p className="text-xs text-muted-foreground leading-relaxed pt-1">
            {node.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Branch Connector (curved lines) ─────────────
function BranchConnector() {
  return (
    <div className="flex justify-center py-2">
      <svg width="400" height="40" viewBox="0 0 400 40" className="text-border">
        <path d="M200 0 L200 10 Q200 20 100 20 L100 20 Q100 20 100 30 L100 40" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M200 0 L200 10 Q200 20 300 20 L300 20 Q300 20 300 30 L300 40" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="40" r="2" fill="currentColor" />
        <circle cx="300" cy="40" r="2" fill="currentColor" />
      </svg>
    </div>
  );
}

// ── Main Component ──────────────────────────────
export default function WorkflowBuilder() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [zoom, setZoom] = useState(100);

  return (
    <div className="flex-1 overflow-auto">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border bg-card/70 backdrop-blur-md px-6 py-2.5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-secondary/50 text-foreground transition-colors">
              <Users size={14} className="text-muted-foreground" />
              <span>People</span>
              <span className="text-xs text-muted-foreground ml-1">2.5k</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-secondary/50 text-foreground transition-colors">
              <Building2 size={14} className="text-muted-foreground" />
              <span>Companies</span>
              <span className="text-xs text-muted-foreground ml-1">987</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/50 text-foreground font-medium border-b-2 border-primary transition-colors">
              <GitBranch size={14} className="text-primary" />
              <span>Workflow</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 ml-1" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:bg-secondary/50 transition-colors">
            <Plus size={14} />
            Add action
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{isPaused ? "Paused" : "Active"}</span>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                isPaused ? "bg-muted" : "bg-primary"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${
                  isPaused ? "left-0.5" : "left-[22px]"
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar summary */}
        <aside className="w-52 border-r border-border bg-card/50 px-4 py-4 shrink-0">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Workflow summary
          </h3>
          <div className="space-y-1">
            {summaryItems.map((item, i) => (
              <button
                key={i}
                className="flex items-center justify-between w-full text-left px-2 py-1.5 rounded text-sm text-foreground hover:bg-secondary/50 transition-colors"
              >
                <span className="truncate">{item.label}</span>
                {item.collapsible && <ChevronDown size={14} className="text-muted-foreground shrink-0" />}
              </button>
            ))}
          </div>
        </aside>

        {/* Canvas */}
        <div className="flex-1 overflow-auto relative">
          {/* Zoom controls */}
          <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground mb-1">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(zoom + 10, 150))}
              className="w-8 h-8 rounded-md border border-border bg-card/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={() => setZoom(Math.max(zoom - 10, 50))}
              className="w-8 h-8 rounded-md border border-border bg-card/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              <span className="text-lg leading-none">−</span>
            </button>
          </div>

          {/* Right toolbar */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            {[
              { icon: <Pencil size={16} />, label: "LaternAI" },
              { icon: <Layers size={16} />, label: "Group" },
              { icon: <FlaskConical size={16} />, label: "Run test" },
              { icon: <Clock size={16} />, label: "History" },
            ].map((tool) => (
              <button
                key={tool.label}
                className="flex flex-col items-center gap-1 w-14 py-2 rounded-lg border border-border bg-card/80 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                {tool.icon}
                <span className="text-[10px]">{tool.label}</span>
              </button>
            ))}
          </div>

          {/* Workflow canvas */}
          <div
            className="flex flex-col items-center py-10 px-8 min-h-[600px]"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          >
            {/* Trigger node */}
            <NodeCard
              node={workflowData[0]}
              selected={selectedNode === workflowData[0].id}
              onSelect={setSelectedNode}
            />

            <Connector />

            {/* Update contact action */}
            <NodeCard
              node={workflowData[1]}
              selected={selectedNode === workflowData[1].id}
              onSelect={setSelectedNode}
            />

            <Connector />

            {/* Condition node */}
            <NodeCard
              node={workflowData[2]}
              selected={selectedNode === workflowData[2].id}
              onSelect={setSelectedNode}
            />

            {/* Branch lines */}
            <BranchConnector />

            {/* Branches */}
            <div className="flex gap-16 items-start">
              {workflowData[2].branches?.map((branch, bi) => (
                <div key={bi} className="flex flex-col items-center">
                  {/* Branch label */}
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded mb-3 ${
                      bi === 1
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {branch.label}
                  </span>

                  {branch.nodes.map((node, ni) => (
                    <div key={node.id} className="flex flex-col items-center">
                      {ni > 0 && <Connector />}
                      <NodeCard
                        node={node}
                        selected={selectedNode === node.id}
                        onSelect={setSelectedNode}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Bottom action bar */}
            <AnimatePresence>
              {selectedNode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-xl z-50"
                >
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-foreground hover:bg-secondary/50 transition-colors">
                    <Layers size={14} />
                    Group
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-foreground hover:bg-secondary/50 transition-colors">
                    <Copy size={14} />
                    Duplicate
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 size={14} />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-secondary/50 transition-colors"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
