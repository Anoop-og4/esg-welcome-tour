-- Profiles for guest players
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id TEXT NOT NULL UNIQUE,
  nickname TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '🌱',
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  total_score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can create a profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update profiles" ON public.profiles FOR UPDATE USING (true);

-- Matches for 1v1 multiplayer
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  player1_guest_id TEXT NOT NULL,
  player1_nickname TEXT NOT NULL,
  player1_avatar TEXT NOT NULL DEFAULT '🌱',
  player1_score INT NOT NULL DEFAULT 0,
  player1_ready BOOLEAN NOT NULL DEFAULT false,
  player2_guest_id TEXT,
  player2_nickname TEXT,
  player2_avatar TEXT,
  player2_score INT NOT NULL DEFAULT 0,
  player2_ready BOOLEAN NOT NULL DEFAULT false,
  winner_guest_id TEXT,
  starts_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_matches_game_status ON public.matches(game, status);
CREATE INDEX idx_matches_status ON public.matches(status);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches are public" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Anyone can create matches" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update matches" ON public.matches FOR UPDATE USING (true);

-- Auto update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_matches_updated BEFORE UPDATE ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Realtime
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;