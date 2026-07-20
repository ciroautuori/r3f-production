import { createContext, useContext } from "react";

// Quality tiers mirror the SKILL.md governance contract:
// high >= 55 FPS sustained, balanced >= 30, low >= 20, fallback disables heavy passes.
export type QualityTier = "high" | "balanced" | "low" | "fallback";

export interface QualityContextValue {
  quality: QualityTier;
  setQuality: (q: QualityTier) => void;
  // Allow React.Component setState-style updater for PerformanceMonitor
  setQualityUpdatable?: never;
}

// We use React context + a plain state lift rather than Zustand here to keep
// the example dependency-light. In a real R3F production app the skill steers
// you to Zustand for cross-component state (selections, camera, inventory).
export const QualityContext = createContext<QualityContextValue>({
  quality: "balanced",
  setQuality: () => {},
});

export function useQuality() {
  return useContext(QualityContext);
}
