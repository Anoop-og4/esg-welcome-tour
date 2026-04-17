import { useState } from "react";
import { useEsgPlay } from "@/hooks/useEsgPlay";
import PlayOnboarding from "./PlayOnboarding";
import PlayHub from "./PlayHub";
import PlayActions from "./PlayActions";
import PlayChallenges from "./PlayChallenges";
import PlayLeaderboard from "./PlayLeaderboard";
import PlayTeams from "./PlayTeams";
import PlayBadges from "./PlayBadges";
import PlayRewards from "./PlayRewards";
import PlayProfile from "./PlayProfile";
import PlayEcoDrive from "./PlayEcoDrive";

interface Props {
  view: string;
  onNavigate: (v: string) => void;
}

export default function PlayApp({ view, onNavigate }: Props) {
  const s = useEsgPlay();
  const [, force] = useState(0);

  if (!s.onboarded) {
    return <PlayOnboarding onDone={() => force((n) => n + 1)} />;
  }

  const screen = (() => {
    switch (view) {
      case "play-actions": return <PlayActions />;
      case "play-challenges": return <PlayChallenges />;
      case "play-leaderboard": return <PlayLeaderboard />;
      case "play-teams": return <PlayTeams />;
      case "play-badges": return <PlayBadges />;
      case "play-rewards": return <PlayRewards />;
      case "play-profile": return <PlayProfile />;
      case "play-ecodrive": return <PlayEcoDrive />;
      default: return <PlayHub onNavigate={onNavigate} />;
    }
  })();

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-b from-background to-primary/5">
      <div className="mx-auto max-w-2xl px-4 py-6">
        {screen}
      </div>
    </div>
  );
}
