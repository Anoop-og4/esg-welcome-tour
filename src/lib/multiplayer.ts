import { supabase } from "@/integrations/supabase/client";

export type GameKey = "boxing" | "ecodrive" | "tapbattle";

export const GAME_META: Record<GameKey, { label: string; emoji: string; duration: number; desc: string; gradient: string }> = {
  boxing:    { label: "Power Punch",  emoji: "🥊", duration: 30, desc: "Tap fastest. Build combos.",   gradient: "from-rose-500 to-red-700" },
  ecodrive:  { label: "Eco Drive",    emoji: "🚗", duration: 45, desc: "Collect green, dodge oil.",    gradient: "from-lime-400 to-emerald-600" },
  tapbattle: { label: "Tap Battle",   emoji: "⚡", duration: 20, desc: "Pure tap speed showdown.",    gradient: "from-amber-400 to-orange-600" },
};

const GUEST_KEY = "esgplay:guestProfile:v1";

export interface GuestProfile {
  guest_id: string;
  nickname: string;
  avatar: string;
}

export function getOrCreateGuest(): GuestProfile {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const profile: GuestProfile = {
    guest_id: crypto.randomUUID(),
    nickname: "Player " + Math.floor(1000 + Math.random() * 9000),
    avatar: "🌱",
  };
  localStorage.setItem(GUEST_KEY, JSON.stringify(profile));
  return profile;
}

export function saveGuest(p: GuestProfile) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(p));
}

export async function upsertProfile(p: GuestProfile) {
  // try update first, then insert
  const { data: existing } = await supabase.from("profiles").select("id").eq("guest_id", p.guest_id).maybeSingle();
  if (existing) {
    await supabase.from("profiles").update({ nickname: p.nickname, avatar: p.avatar }).eq("guest_id", p.guest_id);
  } else {
    await supabase.from("profiles").insert({ guest_id: p.guest_id, nickname: p.nickname, avatar: p.avatar });
  }
}

/** Quick-match: try to join an open match for the given game; if none, create one. */
export async function quickMatch(game: GameKey, me: GuestProfile) {
  // Find oldest waiting match for this game NOT created by me
  const { data: open } = await supabase
    .from("matches")
    .select("*")
    .eq("game", game)
    .eq("status", "waiting")
    .neq("player1_guest_id", me.guest_id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (open && open.length) {
    const m = open[0];
    const startsAt = new Date(Date.now() + 4000).toISOString();
    const { data: updated, error } = await supabase
      .from("matches")
      .update({
        player2_guest_id: me.guest_id,
        player2_nickname: me.nickname,
        player2_avatar: me.avatar,
        status: "playing",
        starts_at: startsAt,
      })
      .eq("id", m.id)
      .eq("status", "waiting") // race-condition guard
      .select()
      .single();
    if (!error && updated) return { match: updated, role: "player2" as const };
  }

  // Create new waiting match
  const { data: created, error } = await supabase
    .from("matches")
    .insert({
      game,
      status: "waiting",
      player1_guest_id: me.guest_id,
      player1_nickname: me.nickname,
      player1_avatar: me.avatar,
    })
    .select()
    .single();
  if (error) throw error;
  return { match: created, role: "player1" as const };
}

export async function updateMyScore(matchId: string, role: "player1" | "player2", score: number) {
  const col = role === "player1" ? "player1_score" : "player2_score";
  await supabase.from("matches").update({ [col]: score }).eq("id", matchId);
}

export async function setReady(matchId: string, role: "player1" | "player2") {
  const col = role === "player1" ? "player1_ready" : "player2_ready";
  await supabase.from("matches").update({ [col]: true }).eq("id", matchId);
}

export async function finishMatch(matchId: string) {
  // Decide winner based on current scores (server-of-record copy)
  const { data: m } = await supabase.from("matches").select("*").eq("id", matchId).single();
  if (!m || m.status === "finished") return m;
  let winner: string | null = null;
  if ((m.player1_score ?? 0) > (m.player2_score ?? 0)) winner = m.player1_guest_id;
  else if ((m.player2_score ?? 0) > (m.player1_score ?? 0)) winner = m.player2_guest_id ?? null;
  await supabase.from("matches").update({ status: "finished", winner_guest_id: winner }).eq("id", matchId);
  // bump stats
  if (winner) {
    const loserId = winner === m.player1_guest_id ? m.player2_guest_id : m.player1_guest_id;
    await bumpStats(winner, "win", Math.max(m.player1_score, m.player2_score));
    if (loserId) await bumpStats(loserId, "loss", Math.min(m.player1_score, m.player2_score));
  }
  const { data: refreshed } = await supabase.from("matches").select("*").eq("id", matchId).single();
  return refreshed;
}

async function bumpStats(guestId: string, kind: "win" | "loss", score: number) {
  const { data: p } = await supabase.from("profiles").select("*").eq("guest_id", guestId).maybeSingle();
  if (!p) return;
  await supabase.from("profiles").update({
    wins: kind === "win" ? p.wins + 1 : p.wins,
    losses: kind === "loss" ? p.losses + 1 : p.losses,
    total_score: p.total_score + score,
  }).eq("guest_id", guestId);
}

export async function cancelMatch(matchId: string) {
  await supabase.from("matches").update({ status: "cancelled" }).eq("id", matchId);
}
