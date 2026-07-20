# r3f-production — Next.js hero example

A minimal React Three Fiber hero scene that aims to pass the
[88/100 audit scorecard](../../references/quality-governance.md).

## What it demonstrates

- **DOM wins.** The hero text, headline, and CTA live in the DOM. The `<Canvas>` is isolated behind `next/dynamic` with `ssr: false`, so three.js never touches the server bundle and the page stays indexable.
- **Adaptive quality.** drei `<PerformanceMonitor>` + `<AdaptiveDpr>` move a `quality` tier up/down based on sustained FPS. The contract comes from [`SKILL.md`](../../SKILL.md).
- **Capped DPR.** `dpr` is driven by quality tier: high `[1.5, 2]`, balanced `[1, 1.5]`, low `[0.75, 1]`. Never uncapped.
- **Reduced-motion gate.** `prefers-reduced-motion` short-circuits ambient drift (`globals.css`).
- **Isolated state seam.** `QualityContext` lets downstream scenes (and tests) consume the quality tier without prop-drilling. The real skill steers you to Zustand for cross-component state; context keeps the example dependency-light.

## Run it

```sh
cd examples/nextjs-hero
npm install --no-audit --no-fund
npm run dev
# open http://localhost:3000
```

## Analyze the bundle (issue #6)

```sh
npm run analyze
```

Open the printed report. Target: **< 300 kB gz** JavaScript, with `react-devtools` and the drei inspector disabled in production.

## Audit the scene

Apply the [`references/quality-governance.md`](../../references/quality-governance.md) scorecard:

1. **Performance** — open Chrome DevTools > Performance. Verify the render loop is demand-driven under idle, the heaviest draw is the single `<Float>` + `<icosahedronGeometry>`, and `renderer.info` shows < 10 draw calls.
2. **DPR cap** — verify `window.devicePixelRatio` is not uncapped by toggling the `quality` value.
3. **Reduced motion** — toggle `prefers-reduced-motion: reduce` and confirm ambient drift stops.
4. **Accessibility** — the canvas lives behind `pointer-events: none`; the CTA is a real anchor. Inspect with Lighthouse; the hero text is in the DOM, not baked into a texture.
5. **Dispose** — navigate away (or toggle the surface); no WebGL context leak in `react-three-fiber`'s `onUnmounted` (`renderer.info.programs` should drop to 0).

## Related issues

- Closes #3.
- Bundle target tracked in #6.
