import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { completeOnboarding } from "@/lib/esgPlay";

const AVATARS = ["🌱", "🦊", "🐝", "🦋", "🐢", "🌸", "🦜", "🐺"];
const INTERESTS = [
  { id: "env", label: "Environment", emoji: "🌍" },
  { id: "soc", label: "Community", emoji: "🤝" },
  { id: "gov", label: "Ethics", emoji: "🛡️" },
];

export default function PlayOnboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [avatar, setAvatar] = useState("🌱");
  const [interests, setInterests] = useState<string[]>([]);

  const next = () => setStep((s) => s + 1);
  const finish = () => {
    completeOnboarding(name, city, avatar, interests);
    onDone();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-violet-500/10">
      <motion.div
        layout
        className="w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="text-primary" size={18} />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">ESG Play</span>
        </div>

        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold">Welcome, eco-hero! 🌱</h2>
            <p className="text-sm text-muted-foreground mt-1">Tiny actions. Big planet wins. Let's set up your player.</p>
            <label className="block mt-5 text-xs font-semibold">Your name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
            <label className="block mt-3 text-xs font-semibold">Your city</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
            <button onClick={next} disabled={!name || !city} className="mt-5 w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold disabled:opacity-50">Continue</button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold">Pick your avatar</h2>
            <p className="text-sm text-muted-foreground mt-1">This shows on the leaderboard.</p>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {AVATARS.map((a) => (
                <button key={a} onClick={() => setAvatar(a)} className="aspect-square rounded-2xl text-3xl border-2 transition-all" style={{ borderColor: avatar === a ? "hsl(var(--primary))" : "hsl(var(--border))", background: avatar === a ? "hsl(var(--primary) / 0.1)" : "transparent" }}>{a}</button>
              ))}
            </div>
            <button onClick={next} className="mt-5 w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold">Continue</button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold">What excites you?</h2>
            <p className="text-sm text-muted-foreground mt-1">Pick any. We'll boost your starting score.</p>
            <div className="space-y-2 mt-4">
              {INTERESTS.map((i) => {
                const sel = interests.includes(i.id);
                return (
                  <button
                    key={i.id}
                    onClick={() => setInterests((p) => sel ? p.filter((x) => x !== i.id) : [...p, i.id])}
                    className="w-full flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all"
                    style={{ borderColor: sel ? "hsl(var(--primary))" : "hsl(var(--border))", background: sel ? "hsl(var(--primary) / 0.1)" : "transparent" }}
                  >
                    <span className="text-2xl">{i.emoji}</span>
                    <span className="font-semibold text-sm flex-1">{i.label}</span>
                    {sel && <span className="text-primary">✓</span>}
                  </button>
                );
              })}
            </div>
            <button onClick={finish} className="mt-5 w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold">Start playing 🚀</button>
          </motion.div>
        )}

        <div className="flex justify-center gap-1.5 mt-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-1.5 rounded-full transition-all" style={{ width: step === i ? 24 : 8, background: step >= i ? "hsl(var(--primary))" : "hsl(var(--border))" }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
