import { HeroCanvas } from "@/components/HeroCanvas";

export default function Page() {
  return (
    <main className="relative h-screen w-screen bg-[#0a0a0c] text-white overflow-hidden">
      {/* 3D layer: absolutely positioned, pointer events disabled so DOM text staysinteractive. */}
      <div className="absolute inset-0 pointer-events-none">
        <HeroCanvas />
      </div>

      {/* DOM overlay: accessible, indexable, no text baked into Canvas. */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          r3f-production
        </h1>
        <p className="max-w-xl text-balance text-base text-white/70">
          A production-grade governance skill for React Three Fiber, Three.js,
          Zustand and Next.js. This hero is an example output, not the skill itself.
        </p>
        <a
          href="https://github.com/ciroautuori/r3f-production"
          target="_blank"
          rel="noreferrer"
          className="mt-2 rounded-full border border-white/20 px-5 py-2 text-sm font-medium transition hover:bg-white/10"
        >
          View on GitHub
        </a>
      </div>
    </main>
  );
}
