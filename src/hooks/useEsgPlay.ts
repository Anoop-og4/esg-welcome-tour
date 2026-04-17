import { useEffect, useState } from "react";
import { loadState, PlayerState } from "@/lib/esgPlay";

export function useEsgPlay() {
  const [state, setState] = useState<PlayerState>(() => loadState());
  useEffect(() => {
    const handler = () => setState(loadState());
    window.addEventListener("esgplay:update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("esgplay:update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return state;
}
