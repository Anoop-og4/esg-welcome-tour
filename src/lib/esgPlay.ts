// ESG Play - localStorage-backed gamification engine
export type Pillar = "E" | "S" | "G";

export interface EsgAction {
  id: string;
  title: string;
  emoji: string;
  xp: number;
  pillars: Pillar[];
  category: string;
}

export interface PlayerState {
  name: string;
  city: string;
  avatar: string;
  xp: number;
  scores: { E: number; S: number; G: number };
  streak: number;
  lastActionDate: string | null;
  log: { id: string; actionId: string; date: string; xp: number }[];
  badges: string[];
  team: string | null;
  completedChallenges: string[];
  redeemed: string[];
  onboarded: boolean;
}

const KEY = "esgplay:v1";

export const ACTIONS: EsgAction[] = [
  { id: "transit", title: "Used public transport", emoji: "🚌", xp: 15, pillars: ["E"], category: "Mobility" },
  { id: "bike", title: "Biked or walked", emoji: "🚴", xp: 20, pillars: ["E"], category: "Mobility" },
  { id: "lights", title: "Saved electricity", emoji: "💡", xp: 10, pillars: ["E"], category: "Energy" },
  { id: "water", title: "Saved water", emoji: "💧", xp: 10, pillars: ["E"], category: "Resources" },
  { id: "plastic", title: "Avoided plastic", emoji: "♻️", xp: 12, pillars: ["E"], category: "Waste" },
  { id: "veggie", title: "Plant-based meal", emoji: "🥗", xp: 15, pillars: ["E"], category: "Food" },
  { id: "volunteer", title: "Volunteered / helped", emoji: "🤝", xp: 25, pillars: ["S"], category: "Community" },
  { id: "donate", title: "Donated to a cause", emoji: "❤️", xp: 20, pillars: ["S"], category: "Community" },
  { id: "mentor", title: "Mentored someone", emoji: "🧑‍🏫", xp: 18, pillars: ["S"], category: "Community" },
  { id: "ethics", title: "Reported an ethics issue", emoji: "🛡️", xp: 22, pillars: ["G"], category: "Integrity" },
  { id: "learn", title: "Took ESG learning module", emoji: "📚", xp: 14, pillars: ["G", "S"], category: "Knowledge" },
  { id: "vote", title: "Voted / civic action", emoji: "🗳️", xp: 20, pillars: ["G"], category: "Civic" },
];

export const LEVELS = [
  { name: "Eco Rookie", min: 0, color: "#22c55e", emoji: "🌱" },
  { name: "Green Sprout", min: 100, color: "#16a34a", emoji: "🌿" },
  { name: "Eco Champ", min: 300, color: "#0ea5e9", emoji: "🌍" },
  { name: "Green Warrior", min: 700, color: "#8b5cf6", emoji: "⚔️" },
  { name: "ESG Hero", min: 1500, color: "#f59e0b", emoji: "🏆" },
  { name: "Planet Legend", min: 3000, color: "#ec4899", emoji: "🌟" },
];

export const BADGES: Record<string, { name: string; emoji: string; desc: string }> = {
  first_step: { name: "First Step", emoji: "👣", desc: "Logged your first action" },
  streak_3: { name: "On Fire", emoji: "🔥", desc: "3-day streak" },
  streak_7: { name: "Unstoppable", emoji: "⚡", desc: "7-day streak" },
  eco_50: { name: "Eco Friend", emoji: "🌱", desc: "50 environmental XP" },
  social_50: { name: "People Person", emoji: "🤝", desc: "50 social XP" },
  gov_50: { name: "Guardian", emoji: "🛡️", desc: "50 governance XP" },
  level_up: { name: "Level Up", emoji: "🚀", desc: "Reached a new level" },
};

export const CHALLENGES = [
  { id: "ch_daily", title: "Daily Eco", desc: "Log 1 action today", goal: 1, scope: "day" as const, reward: 20, badge: "first_step" },
  { id: "ch_5in3", title: "Eco Sprint", desc: "5 actions in 3 days", goal: 5, scope: "3day" as const, reward: 60, badge: "streak_3" },
  { id: "ch_week", title: "Weekly Warrior", desc: "10 actions this week", goal: 10, scope: "week" as const, reward: 120, badge: "streak_7" },
  { id: "ch_pillars", title: "All Pillars", desc: "1 action in E, S, and G", goal: 3, scope: "all" as const, reward: 80, badge: "level_up" },
];

export const TEAMS = [
  { id: "greenwave", name: "Green Wave", emoji: "🌊", members: 248, xp: 18420 },
  { id: "solarsquad", name: "Solar Squad", emoji: "☀️", members: 187, xp: 15230 },
  { id: "forestpack", name: "Forest Pack", emoji: "🌲", members: 312, xp: 22100 },
  { id: "oceanguard", name: "Ocean Guard", emoji: "🐋", members: 156, xp: 12800 },
];

export const REWARDS = [
  { id: "tree", name: "Plant a Tree", cost: 200, emoji: "🌳", partner: "OneTree" },
  { id: "coffee", name: "Eco Coffee Voucher", cost: 350, emoji: "☕", partner: "GreenBeans" },
  { id: "tote", name: "Reusable Tote", cost: 500, emoji: "👜", partner: "ZeroWaste Co." },
  { id: "bottle", name: "Steel Bottle", cost: 800, emoji: "🍶", partner: "Hydra" },
  { id: "shoes", name: "Recycled Sneakers", cost: 2500, emoji: "👟", partner: "EcoStep" },
];

export const SPONSORED = [
  { id: "sp1", brand: "Patagonia", title: "Repair, Don't Replace", desc: "Fix one item this week", reward: 100, emoji: "🧵" },
  { id: "sp2", brand: "Tesla", title: "Charge Smart", desc: "Use renewable energy 3 days", reward: 150, emoji: "⚡" },
  { id: "sp3", brand: "Lavazza", title: "Bring Your Cup", desc: "Skip 5 disposable cups", reward: 80, emoji: "☕" },
];

const defaultState: PlayerState = {
  name: "Player",
  city: "",
  avatar: "🌱",
  xp: 0,
  scores: { E: 0, S: 0, G: 0 },
  streak: 0,
  lastActionDate: null,
  log: [],
  badges: [],
  team: null,
  completedChallenges: [],
  redeemed: [],
  onboarded: false,
};

export function loadState(): PlayerState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaultState };
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return { ...defaultState };
  }
}

export function saveState(s: PlayerState) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("esgplay:update"));
}

export function resetState() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("esgplay:update"));
}

export function getLevel(xp: number) {
  let level = LEVELS[0];
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min) {
      level = LEVELS[i];
      idx = i;
    }
  }
  const next = LEVELS[idx + 1];
  const progress = next ? ((xp - level.min) / (next.min - level.min)) * 100 : 100;
  return { level, idx, next, progress: Math.min(100, Math.max(0, progress)) };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function logAction(actionId: string): PlayerState {
  const s = loadState();
  const action = ACTIONS.find((a) => a.id === actionId);
  if (!action) return s;
  const today = todayStr();
  s.xp += action.xp;
  const per = action.xp / action.pillars.length;
  action.pillars.forEach((p) => {
    s.scores[p] += per;
  });
  s.log.unshift({ id: crypto.randomUUID(), actionId, date: new Date().toISOString(), xp: action.xp });

  // streak
  if (s.lastActionDate) {
    const diff = daysBetween(s.lastActionDate, today);
    if (diff === 0) {
      // same day, no change
    } else if (diff === 1) {
      s.streak += 1;
    } else {
      s.streak = 1;
    }
  } else {
    s.streak = 1;
  }
  s.lastActionDate = today;

  // badges
  const earn = (id: string) => { if (!s.badges.includes(id)) s.badges.push(id); };
  if (s.log.length === 1) earn("first_step");
  if (s.streak >= 3) earn("streak_3");
  if (s.streak >= 7) earn("streak_7");
  if (s.scores.E >= 50) earn("eco_50");
  if (s.scores.S >= 50) earn("social_50");
  if (s.scores.G >= 50) earn("gov_50");

  saveState(s);
  return s;
}

export function claimChallenge(id: string) {
  const s = loadState();
  if (s.completedChallenges.includes(id)) return s;
  const ch = CHALLENGES.find((c) => c.id === id);
  if (!ch) return s;
  s.completedChallenges.push(id);
  s.xp += ch.reward;
  if (ch.badge && !s.badges.includes(ch.badge)) s.badges.push(ch.badge);
  saveState(s);
  return s;
}

export function challengeProgress(id: string, s: PlayerState): number {
  const ch = CHALLENGES.find((c) => c.id === id);
  if (!ch) return 0;
  const now = Date.now();
  const today = todayStr();
  if (ch.scope === "day") {
    return s.log.filter((l) => l.date.slice(0, 10) === today).length;
  }
  if (ch.scope === "3day") {
    return s.log.filter((l) => now - new Date(l.date).getTime() <= 3 * 86400000).length;
  }
  if (ch.scope === "week") {
    return s.log.filter((l) => now - new Date(l.date).getTime() <= 7 * 86400000).length;
  }
  if (ch.scope === "all") {
    const set = new Set<string>();
    s.log.forEach((l) => {
      const a = ACTIONS.find((x) => x.id === l.actionId);
      a?.pillars.forEach((p) => set.add(p));
    });
    return set.size;
  }
  return 0;
}

export function joinTeam(teamId: string) {
  const s = loadState();
  s.team = teamId;
  saveState(s);
  return s;
}

export function redeemReward(id: string) {
  const s = loadState();
  const r = REWARDS.find((x) => x.id === id);
  if (!r || s.xp < r.cost) return { ok: false, state: s };
  s.xp -= r.cost;
  s.redeemed.push(id);
  saveState(s);
  return { ok: true, state: s };
}

export function completeOnboarding(name: string, city: string, avatar: string, interests: string[]) {
  const s = loadState();
  s.name = name || "Player";
  s.city = city;
  s.avatar = avatar;
  s.onboarded = true;
  // starting score based on interests
  const starter = interests.length * 10;
  s.xp += starter;
  if (interests.includes("env")) s.scores.E += 20;
  if (interests.includes("soc")) s.scores.S += 20;
  if (interests.includes("gov")) s.scores.G += 20;
  saveState(s);
  return s;
}

// Synthetic global leaderboard merging player
export function buildLeaderboard(s: PlayerState, scope: "global" | "city" | "friends" = "global") {
  const base = [
    { name: "Aanya R.", city: "Mumbai", xp: 4820, avatar: "🦋" },
    { name: "Liam K.", city: "Berlin", xp: 4310, avatar: "🐺" },
    { name: "Sofia M.", city: "São Paulo", xp: 3990, avatar: "🦜" },
    { name: "Hiro T.", city: "Tokyo", xp: 3620, avatar: "🐯" },
    { name: "Zara N.", city: "Lagos", xp: 3210, avatar: "🦁" },
    { name: "Owen P.", city: "Toronto", xp: 2890, avatar: "🦊" },
    { name: "Maya S.", city: "Mumbai", xp: 2510, avatar: "🐝" },
    { name: "Noah B.", city: "Berlin", xp: 2150, avatar: "🦉" },
    { name: "Priya D.", city: "Mumbai", xp: 1820, avatar: "🌸" },
    { name: "Diego R.", city: "Madrid", xp: 1540, avatar: "🐢" },
  ];
  const friends = ["Maya S.", "Owen P.", "Diego R."];
  let pool = base;
  if (scope === "city" && s.city) pool = base.filter((p) => p.city.toLowerCase() === s.city.toLowerCase());
  if (scope === "friends") pool = base.filter((p) => friends.includes(p.name));
  const me = { name: s.name + " (You)", city: s.city || "—", xp: s.xp, avatar: s.avatar, isMe: true };
  return [...pool, me].sort((a, b) => b.xp - a.xp).map((p, i) => ({ ...p, rank: i + 1 }));
}
