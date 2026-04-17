import { motion } from "framer-motion";
import { TEAMS, joinTeam } from "@/lib/esgPlay";
import { useEsgPlay } from "@/hooks/useEsgPlay";
import { toast } from "@/hooks/use-toast";
import PlayHeader from "./PlayHeader";

export default function PlayTeams() {
  const s = useEsgPlay();
  return (
    <div className="space-y-4 pb-8">
      <PlayHeader />
      <div>
        <h3 className="text-lg font-bold">Teams 👥</h3>
        <p className="text-xs text-muted-foreground">Stronger together. Pick your tribe.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TEAMS.sort((a, b) => b.xp - a.xp).map((t, i) => {
          const joined = s.team === t.id;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border-2 bg-card p-4"
              style={{ borderColor: joined ? "hsl(var(--primary))" : "hsl(var(--border))" }}
            >
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">{t.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.members} members · #{i + 1}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Team XP</p>
                  <p className="text-lg font-extrabold text-primary">{t.xp.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => {
                    joinTeam(t.id);
                    toast({ title: `${t.emoji} Joined ${t.name}!`, description: "Team challenges unlocked." });
                  }}
                  disabled={joined}
                  className="rounded-full px-4 py-2 text-xs font-bold disabled:opacity-60"
                  style={{
                    background: joined ? "hsl(var(--secondary))" : "hsl(var(--primary))",
                    color: joined ? "hsl(var(--muted-foreground))" : "hsl(var(--primary-foreground))",
                  }}
                >
                  {joined ? "✓ Joined" : "Join"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-dashed border-border p-4 text-center">
        <p className="text-2xl">➕</p>
        <p className="text-sm font-bold mt-1">Create your own team</p>
        <p className="text-xs text-muted-foreground">Invite friends, set group goals, win together.</p>
        <button
          onClick={() => toast({ title: "Coming soon", description: "Custom teams launch at level 5+" })}
          className="mt-3 rounded-full bg-secondary px-4 py-2 text-xs font-bold"
        >
          Create team
        </button>
      </div>
    </div>
  );
}
