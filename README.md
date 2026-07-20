# r3f-production

> Production-grade governance for 3D web on **React Three Fiber + Three.js + Zustand + Next.js**. Treat the 3D canvas as a runtime GPU with explicit performance, accessibility and quality budgets — then audit them.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Skill](https://img.shields.io/badge/Codex%20Skill-r3f--production-orange.svg)](./SKILL.md)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

A 3D scene is a runtime with a GPU budget, not a decorative animation library.
The non-negotiable contract: 3D must be **progressive, observable, accessible,
and always replaceable by a 2D fallback**. `r3f-production` turns that
contract into concrete steps, hard rules, and an audit scorecard.

## Why this exists

Most R3F resources teach you how to build a *demo*. This skill teaches you how
to ship a *production* 3D experience the way award-winning studios
(Active Theory, Lusion, 14islands) and the enterprise discipline of explicit
budgets and deterministic state do — both already converged on the same
conclusion: **measure, then polish**.

It works as a [Codex CLI](https://github.com/openai/codex) / Claude Code skill,
so the rules are applied where the code is written, not in a separate wiki.

## What it enforces

- **DOM wins.** Data, forms, CTAs, navigation stay in the DOM. The `<Canvas>`
  is isolated, client-only, lazy.
- **Aesthetics over geometry.** An icosahedron with HDRI, ACESFilmic and bloom
  beats a 200k-triangle model lit wrong.
- **Lerp everything.** Framerate-independent damping
  `factor = 1 - Math.exp(-lambda * delta)` — identical at 30Hz and 144Hz.
- **Explicit GPU budgets.** Every experience declares draw calls, triangles,
  textures and max DPR; verified in QA, never left to chance.
- **State at three speeds.** Business state in server/cache, UI state in
  Zustand, transient per-frame state in refs. Never reactive state at 60 FPS.
- **Accessibility is non-negotiable.** `prefers-reduced-motion` honored, every
  critical function has a DOM equivalent, the canvas pauses off-viewport.

## Install as a skill

Copy (or symlink) this folder into your skills directory, e.g. for Codex CLI:

```sh
git clone https://github.com/ciroautuori/r3f-production.git ~/.codex/skills/r3f-production
```

Then reference it by name `r3f-production` from your agent. See `SKILL.md`
for the frontmatter and trigger description.

## Contents

- `SKILL.md` — the skill entrypoint. Philosophy, SOTA stack (July 2026),
  6-step workflow, 13 hard rules.
- `references/` — load-on-demand deep dives:
  - `canvas-architecture.md` — CanvasShell, adaptive quality, lifecycle, fallback
  - `state-management.md` — the three-speed model, Zustand slices, store-scene bridge
  - `polish-chain.md` — physical lighting, HDRI/Lightformer, post chain, hero materials, motion
  - `quality-governance.md` — GPU budgets, renderer.info thresholds, 88/100 audit scorecard
  - `anti-patterns.md` — WRONG / WHY / CORRECT + symptom -> cause -> fix diagnostic table
  - `performance-diagnosis.md` — diagnostic flowchart, instancing/BatchedMesh decision tree
  - `model-optimization.md` — 5-stage GLB pipeline, Draco vs Meshopt, LOD chain
  - `physics-rapier.md` — Rapier decision tree, verified gotchas
  - `webgpu-tsl.md` — when to migrate, canonical setup, hard rules
  - `webgpu-tsl-api.md` *(vendor ref + errata)* — full TSL/NodeMaterial table
  - `postprocessing-passes-api.md` *(vendor ref + errata)* — 27+ vanilla pass signatures
  - `three-migration-r170-r183.md` *(vendor ref)* — r170 -> r183 breaking changes
  - `shaders.md` — GLSL building blocks + production `onBeforeCompile` appendix
  - `procedural-geometry.md` — code-only geometry
  - `blender-pipeline.md` — Blender MCP recipes + optimized GLB export
- `scripts/export_glb.py` — headless Blender -> Draco GLB exporter (+ `--meshopt` flag)
- `CREDITS.md` — full upstream attribution and errata for vendor reference files
- `LICENSE` — MIT

## The 13 hard rules (short version)

1. No `setState` or store update in `useFrame`.
2. No per-frame allocations (`new Vector3()`, ...).
3. No `metalness > 0` without an environment map.
4. No uncapped DPR.
5. No uncompressed GLB.
6. No `OrbitControls` in production.
7. No frame-count animations — only `delta`.
8. No CSS scroll + JS scroll mix.
9. No per-frame raycast over the whole scene.
10. No mount/unmount of heavy scenes in transitions.
11. No Three.js objects in persisted Zustand.
12. No autoplay audio.
13. No 3D where an image suffices.

Full rules and rationale in `references/anti-patterns.md`.

## Audit scorecard (threshold: 88/100)

Before declaring a 3D experience done, every entry must have one line of
evidence. Below 88 you do not ship. Above 88 without per-entry evidence is just
as invalid. See `references/quality-governance.md` for the full table.

## Contributing

Contributions, corrections, and errata welcome. See
[CONTRIBUTING.md](./CONTRIBUTING.md). Attribution corrections are especially
welcome — see [CREDITS.md](./CREDITS.md).

## License

MIT © Ciro Autuori. Vendor reference files are preserved under their upstream
MIT licenses with attribution; see `CREDITS.md`.
