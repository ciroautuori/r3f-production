import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from "@react-three/drei";
import { Suspense, useState } from "react";
import { HeroScene } from "@/three/HeroScene";
import { QualityContext, type QualityTier } from "@/state/store";

// A self-contained R3F Canvas with the quality contract from SKILL.md:
// - dpr cap + adaptive degradation (AdaptiveDpr/AdaptiveEvents)
// - PerformanceMonitor flips quality down on sustained FPS dip
// - Suspense fallback is a DOM element, never baked text
// - frameloop demand-driven in real projects; kept "always" for a hero demo
export function HeroCanvas() {
  const [quality, setQuality] = useState<QualityTier>("balanced");
  const dpr: [number, number] =
    quality === "high" ? [1.5, 2] : quality === "balanced" ? [1, 1.5] : [0.75, 1];

  return (
    <QualityContext.Provider value={{ quality, setQuality }}>
      <Canvas
        dpr={dpr}
        gl={{ antialias: quality !== "low", powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 5], fov: 45 }}
      >
        <PerformanceMonitor
          onDecline={() => setQuality((q) => (q === "high" ? "balanced" : q === "balanced" ? "low" : "fallback"))}
          onIncline={() => setQuality((q) => (q === "fallback" ? "low" : q === "low" ? "balanced" : "high"))}
        />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </Canvas>
    </QualityContext.Provider>
  );
}
