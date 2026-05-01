import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Plus, Loader2, Zap, TrendingDown, Leaf, Wind, Factory, Truck, Building2, Recycle } from "lucide-react";
import { Scenario, ScopeType, Feasibility } from "./dummyData";

interface Suggestion {
  id: string;
  icon: typeof Zap;
  title: string;
  scope: ScopeType;
  tco2eSaved: number;
  costDelta: number;
  payback: string;
  targetCovered: number;
  feasibility: Feasibility;
  reasoning: string;
  rationale: string; // short one-liner rendered in chip
}

interface Message {
  id: string;
  role: "user" | "assistant";
  text?: string;
  suggestions?: Suggestion[];
}

const STARTERS = [
  "Cut Scope 2 by 20% under ₹10L",
  "Quick wins for FY26",
  "Highest impact for supply chain",
  "Reduce fleet emissions fast",
];

// Knowledge base of suggestions, keyed by intent keywords
const KB: Suggestion[] = [
  {
    id: "kb-solar",
    icon: Wind,
    title: "Rooftop solar — 250 kWp at HQ",
    scope: "Scope 2",
    tco2eSaved: 312,
    costDelta: -2.4,
    payback: "4.1 yrs",
    targetCovered: 58,
    feasibility: "High impact",
    rationale: "Cuts grid draw by ~38% with 4-yr payback",
    reasoning: "Rooftop PV at the HQ campus offsets ~38% of grid electricity. Net-metering credits and avoided tariff escalation deliver a 4-year payback.",
  },
  {
    id: "kb-green-tariff",
    icon: Zap,
    title: "Green tariff — all offices",
    scope: "Scope 2",
    tco2eSaved: 240,
    costDelta: 2.8,
    payback: "No capex",
    targetCovered: 64,
    feasibility: "Quick win",
    rationale: "Zero capex, eliminates Scope 2 in 90 days",
    reasoning: "Open-access green tariff swap eliminates grid emissions across all office sites. Slightly higher tariff is offset by RECs and avoided carbon penalty.",
  },
  {
    id: "kb-fleet-ev",
    icon: Truck,
    title: "Electrify 50% last-mile fleet",
    scope: "Scope 1",
    tco2eSaved: 188,
    costDelta: -1.2,
    payback: "3.2 yrs",
    targetCovered: 42,
    feasibility: "Achievable",
    rationale: "Lower fuel + maintenance, 3-yr payback",
    reasoning: "Replacing 50% of the diesel last-mile fleet with EVs cuts direct combustion emissions and 28% of operating cost. Charging infra co-located at hubs.",
  },
  {
    id: "kb-cng",
    icon: Truck,
    title: "Switch 40% fleet to CNG",
    scope: "Scope 1",
    tco2eSaved: 142,
    costDelta: -1.8,
    payback: "2.4 yrs",
    targetCovered: 34,
    feasibility: "Achievable",
    rationale: "Fastest fleet move with proven savings",
    reasoning: "CNG retrofit on 40% of the diesel fleet reduces combustion emissions and delivers ₹1.8L/yr fuel savings. Pilot data confirms 12-15% efficiency gain.",
  },
  {
    id: "kb-travel",
    icon: TrendingDown,
    title: "Cut business air travel 30%",
    scope: "Scope 3",
    tco2eSaved: 58,
    costDelta: -4.5,
    payback: "Immediate",
    targetCovered: 12,
    feasibility: "Quick win",
    rationale: "Immediate ₹4.5L/yr saving, zero capex",
    reasoning: "Replace 30% of business air travel with virtual meetings. Immediate cost saving, no capex, productivity neutral based on internal pilot.",
  },
  {
    id: "kb-steel",
    icon: Factory,
    title: "Low-carbon steel supplier",
    scope: "Scope 3",
    tco2eSaved: 390,
    costDelta: 11,
    payback: "3.1 yrs",
    targetCovered: 78,
    feasibility: "High impact",
    rationale: "Largest single Scope 3 lever",
    reasoning: "Source steel from EAF-based low-carbon supplier. Cuts embodied emissions ~60%. Premium pricing offset by carbon credit value and brand premium.",
  },
  {
    id: "kb-hvac",
    icon: Building2,
    title: "HVAC retrofit — 8 sites",
    scope: "Scope 2",
    tco2eSaved: 96,
    costDelta: -0.6,
    payback: "2.8 yrs",
    targetCovered: 22,
    feasibility: "Quick win",
    rationale: "Fast payback, comfort co-benefits",
    reasoning: "Variable-frequency drives + smart controls on HVAC across 8 sites cut electricity use by 18%. Improved comfort and lower maintenance as co-benefits.",
  },
  {
    id: "kb-waste",
    icon: Recycle,
    title: "Zero-waste-to-landfill program",
    scope: "Scope 3",
    tco2eSaved: 74,
    costDelta: -0.4,
    payback: "1.6 yrs",
    targetCovered: 18,
    feasibility: "Quick win",
    rationale: "Compliance + brand value uplift",
    reasoning: "Segregation, composting, and circular partnerships divert 96% of waste from landfill. Reduces methane emissions and disposal cost.",
  },
  {
    id: "kb-supplier",
    icon: Leaf,
    title: "Top-20 supplier engagement",
    scope: "Scope 3",
    tco2eSaved: 220,
    costDelta: 1.5,
    payback: "Soft ROI",
    targetCovered: 48,
    feasibility: "Achievable",
    rationale: "Unlocks 60% of Scope 3 visibility",
    reasoning: "Mandate verified emissions data + reduction commitments from top-20 suppliers (60% of spend). Foundation for any credible Scope 3 reduction claim.",
  },
];

function rank(query: string): Suggestion[] {
  const q = query.toLowerCase();
  const score = (s: Suggestion) => {
    let v = 0;
    const hay = (s.title + " " + s.scope + " " + s.rationale).toLowerCase();
    if (q.includes("scope 1") && s.scope === "Scope 1") v += 5;
    if (q.includes("scope 2") && s.scope === "Scope 2") v += 5;
    if (q.includes("scope 3") && s.scope === "Scope 3") v += 5;
    if ((q.includes("quick") || q.includes("fast") || q.includes("immediate")) && s.feasibility === "Quick win") v += 4;
    if ((q.includes("high impact") || q.includes("biggest") || q.includes("largest")) && s.feasibility === "High impact") v += 4;
    if (q.includes("cheap") || q.includes("low cost") || q.includes("under")) { if (s.costDelta < 0 || s.payback === "No capex") v += 3; }
    if (q.includes("fleet") || q.includes("vehicle") || q.includes("truck")) { if (s.scope === "Scope 1") v += 3; }
    if (q.includes("electric") || q.includes("solar") || q.includes("energy")) { if (s.scope === "Scope 2") v += 3; }
    if (q.includes("supply") || q.includes("supplier") || q.includes("travel")) { if (s.scope === "Scope 3") v += 3; }
    ["solar","cng","ev","steel","hvac","waste","travel","tariff","supplier"].forEach(k => { if (q.includes(k) && hay.includes(k)) v += 4; });
    v += s.tco2eSaved / 200; // small tiebreaker
    return v;
  };
  return [...KB].sort((a, b) => score(b) - score(a)).slice(0, 3);
}

interface Props {
  onAdd: (s: Scenario) => void;
}

export default function ScenarioAssistant({ onAdd }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      role: "assistant",
      text: "Hi — I'm your scenario co-pilot. Describe what you want to achieve and I'll suggest reduction actions you can add with one tap.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || thinking) return;
    setInput("");
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setThinking(true);

    setTimeout(() => {
      const suggestions = rank(text);
      const summary =
        `Based on "${text}", here are 3 scenarios ranked by fit. Tap any to add it to your planner — I've sized them to your current footprint.`;
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", text: summary, suggestions }]);
      setThinking(false);
    }, 650);
  };

  const handleAddSuggestion = (s: Suggestion) => {
    if (added.has(s.id)) return;
    const scenario: Scenario = {
      id: `s-${Date.now()}`,
      action: s.title,
      scope: s.scope,
      tco2eSaved: s.tco2eSaved,
      costDelta: s.costDelta,
      costDeltaLabel: `${s.costDelta < 0 ? "−" : "+"}₹${Math.abs(s.costDelta).toFixed(1)}L/yr`,
      payback: s.payback,
      targetCovered: s.targetCovered,
      feasibility: s.feasibility,
      reasoning: s.reasoning,
    };
    onAdd(scenario);
    setAdded(prev => new Set(prev).add(s.id));
  };

  return (
    <Card className="border-border/50 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur overflow-hidden flex flex-col h-[680px]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3 bg-gradient-to-r from-teal-500/10 via-transparent to-transparent">
        <div className="relative">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-card animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            Scenario Co-pilot
            <span className="px-1.5 py-0.5 rounded-md bg-teal-500/15 text-teal-400 text-[9px] font-mono uppercase tracking-wider">AI</span>
          </h3>
          <p className="text-[11px] text-muted-foreground">Type your goal — get scenarios in seconds</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[88%] ${m.role === "user" ? "" : "w-full"}`}>
                {m.text && (
                  <div
                    className={
                      m.role === "user"
                        ? "px-3.5 py-2 rounded-2xl rounded-br-sm bg-teal-600 text-white text-sm shadow-sm"
                        : "px-3.5 py-2 rounded-2xl rounded-bl-sm bg-muted/60 border border-border/50 text-sm text-foreground/90"
                    }
                  >
                    {m.text}
                  </div>
                )}
                {m.suggestions && (
                  <div className="mt-2.5 space-y-2">
                    {m.suggestions.map((s, i) => {
                      const Icon = s.icon;
                      const isAdded = added.has(s.id);
                      return (
                        <motion.button
                          key={s.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.08 }}
                          onClick={() => handleAddSuggestion(s)}
                          disabled={isAdded}
                          className={`group w-full text-left rounded-xl border p-3 transition-all ${
                            isAdded
                              ? "bg-emerald-500/5 border-emerald-500/30 cursor-default"
                              : "bg-card/60 border-border/60 hover:border-teal-500/50 hover:bg-teal-500/5 hover:shadow-lg hover:shadow-teal-500/5 hover:-translate-y-0.5"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isAdded ? "bg-emerald-500/15 text-emerald-400" : "bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20"
                            }`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium leading-snug truncate">{s.title}</p>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50 shrink-0 font-mono">
                                  {s.scope}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{s.rationale}</p>
                              <div className="flex items-center gap-3 mt-2 text-[11px]">
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                                  <TrendingDown className="h-3 w-3" />
                                  −{s.tco2eSaved} tCO₂e/yr
                                </span>
                                <span className="text-muted-foreground">·</span>
                                <span className={s.costDelta < 0 ? "text-emerald-400" : "text-foreground/70"}>
                                  {s.costDelta < 0 ? "−" : "+"}₹{Math.abs(s.costDelta).toFixed(1)}L/yr
                                </span>
                                <span className="text-muted-foreground">·</span>
                                <span className="text-muted-foreground">{s.payback}</span>
                              </div>
                            </div>
                            <div className={`shrink-0 self-center h-7 w-7 rounded-full flex items-center justify-center transition ${
                              isAdded
                                ? "bg-emerald-500 text-white"
                                : "bg-muted text-muted-foreground group-hover:bg-teal-500 group-hover:text-white"
                            }`}>
                              {isAdded ? <span className="text-xs">✓</span> : <Plus className="h-4 w-4" />}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {thinking && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-muted/60 border border-border/50 inline-flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 text-teal-400 animate-spin" />
                <span className="text-xs text-muted-foreground">Modelling scenarios…</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Starters */}
      {messages.length <= 1 && (
        <div className="px-5 pb-2 flex flex-wrap gap-1.5">
          {STARTERS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-[11px] px-2.5 py-1 rounded-full border border-border/60 bg-muted/40 hover:bg-teal-500/10 hover:border-teal-500/40 hover:text-teal-300 transition text-muted-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-border/50 p-3 bg-card/50">
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 focus-within:border-teal-500/60 focus-within:ring-2 focus-within:ring-teal-500/20 px-3 py-2 transition">
          <Sparkles className="h-3.5 w-3.5 text-teal-400 shrink-0" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="e.g. cut Scope 2 by 20% under ₹10L"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
          />
          <Button
            size="sm"
            onClick={() => send()}
            disabled={!input.trim() || thinking}
            className="h-7 w-7 p-0 bg-teal-600 hover:bg-teal-500 text-white rounded-lg disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/70 mt-1.5 text-center">
          Suggestions are added directly to your scenario table
        </p>
      </div>
    </Card>
  );
}
